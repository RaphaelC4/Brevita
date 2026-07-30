import pytest
import re
from gltest.direct.loader import create_address

CONTRACT = "contracts/brevita.py"
STATUS_ACTIVE = 0
STATUS_PAID_OUT = 2
STATUS_EXPIRED = 3
STATUS_DISPUTED = 5


def _create_policy(contract, direct_vm, holder, **overrides):
    direct_vm.sender = holder
    direct_vm.value = overrides.pop("value", 2000)
    return contract.create_policy(
        overrides.pop("event_type", "hurricane"),
        overrides.pop("location", "Miami"),
        overrides.pop("trigger_condition", "Cat 4+"),
        overrides.pop("data_sources", ["https://weather.gov/hurricane"]),
        overrides.pop("payout", 2000),
        overrides.pop("expires_after_days", 90),
    )


def test_trigger_payout_yes(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice)

    direct_vm.mock_web(r"weather\.gov", {"method": "GET", "status": 200, "body": "Cat 4 hurricane hits Miami"})
    direct_vm.mock_llm(r".*", "YES")

    verdict = contract.check_and_trigger(pid)

    assert verdict == "YES"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_PAID_OUT


def test_trigger_payout_no(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice)

    direct_vm.mock_web(r"weather\.gov", {"method": "GET", "status": 200, "body": "No storms this week"})
    direct_vm.mock_llm(r".*", "NO")

    verdict = contract.check_and_trigger(pid)

    assert verdict == "NO"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_DISPUTED


def test_trigger_payout_undecided(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )

    direct_vm.mock_web(r"weather\.gov", {"method": "GET", "status": 200, "body": "Mostly cloudy"})
    direct_vm.mock_llm(r".*", "UNDECIDED")

    verdict = contract.check_and_trigger(pid)

    assert verdict == "UNDECIDED"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_DISPUTED


def test_trigger_inactive_policy(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="flood", location="Venice", trigger_condition="Acqua alta",
        data_sources=["https://weather.com"], payout=1000,
    )

    direct_vm.sender = direct_alice
    contract.cancel_policy(pid)

    direct_vm.mock_web(r"weather\.com", {"method": "GET", "status": 200, "body": "Flooding reported"})
    direct_vm.mock_llm(r".*", "YES")

    with pytest.raises(AssertionError, match=re.escape("Policy not active")):
        contract.check_and_trigger(pid)


def test_trigger_expired_policy(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="flood", location="Venice", trigger_condition="Acqua alta",
        data_sources=["https://weather.com"], payout=1000, expires_after_days=1,
    )

    # Warp the VM clock well past expiry
    direct_vm.warp("2099-01-01T00:00:00Z")

    direct_vm.mock_web(r"weather\.com", {"method": "GET", "status": 200, "body": "Flooding reported"})
    direct_vm.mock_llm(r".*", "YES")

    with pytest.raises(AssertionError, match=re.escape("Policy has expired")):
        contract.check_and_trigger(pid)


def test_cancel_before_trigger(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="earthquake", location="Tokyo", trigger_condition="Mag 7+",
        data_sources=["https://weather.com"], payout=5000, expires_after_days=365, value=6000,
    )

    direct_vm.sender = direct_alice
    result = contract.cancel_policy(pid)
    assert result is True

    policy = contract.get_policy(pid)
    assert policy.status != STATUS_ACTIVE


def test_cancel_by_non_holder_fails(direct_deploy, direct_vm, direct_alice, direct_bob):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice)

    direct_vm.sender = direct_bob
    with pytest.raises(AssertionError, match=re.escape("Only holder can cancel")):
        contract.cancel_policy(pid)


def _dispute_policy(contract, direct_vm, pid):
    """Get a policy into STATUS_DISPUTED via check_and_trigger returning NO."""
    direct_vm.mock_web(r"weather\.gov", {"method": "GET", "status": 200, "body": "Mostly cloudy"})
    direct_vm.mock_llm(r".*", "NO")
    contract.check_and_trigger(pid)
    direct_vm.clear_mocks()


def _mock_oracle_hook(state: dict):
    """
    Simulates a deployed Intelligent Oracle contract by intercepting
    cross-contract calls (CallContract) and responding to get_status()/
    get_dict() the way a real oracle contract would - this is a direct
    on-chain contract-to-contract call, not an HTTP mock.
    """
    from genlayer.py import calldata

    def hook(vm, request):
        if "CallContract" not in request:
            return None
        method = request["CallContract"]["calldata"].get("method")
        if method == "get_status":
            return bytes([0]) + calldata.encode(state["status"])
        if method == "get_dict":
            return bytes([0]) + calldata.encode(state)
        return None
    return hook


def test_open_dispute_links_valid_oracle(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    oracle_addr = create_address("oracle-valid")
    direct_vm._gl_call_hook = _mock_oracle_hook({
        "title": "Did a drought occur in Texas?",
        "description": f"policy #{pid} appeal",
        "status": "Active",
        "outcome": "",
    })

    result = contract.open_dispute(pid, oracle_addr)
    assert result is True

    policy = contract.get_policy(pid)
    assert policy.oracle_address == oracle_addr


def test_open_dispute_rejects_mismatched_oracle(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    oracle_addr = create_address("oracle-wrong")
    direct_vm._gl_call_hook = _mock_oracle_hook({
        "title": "Unrelated market",
        "description": "policy #999 appeal",  # wrong policy id
        "status": "Active",
        "outcome": "",
    })

    with pytest.raises(AssertionError, match=re.escape("Oracle description does not reference this policy")):
        contract.open_dispute(pid, oracle_addr)


def test_resolve_dispute_requires_linked_oracle(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    with pytest.raises(AssertionError, match=re.escape("No oracle linked - call open_dispute first")):
        contract.resolve_dispute(pid)


def test_resolve_dispute_yes(direct_deploy, direct_vm, direct_alice, direct_bob):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days",
        payout=1000, value=1500,  # premium = 500
    )
    _dispute_policy(contract, direct_vm, pid)

    oracle_addr = create_address("oracle-yes")
    direct_vm._gl_call_hook = _mock_oracle_hook({
        "title": "Did a drought occur in Texas?",
        "description": f"policy #{pid} appeal",
        "status": "Resolved",
        "outcome": "Yes",
    })
    contract.open_dispute(pid, oracle_addr)

    # Resolution is permissionless - anyone (e.g. Bob) can trigger it
    direct_vm.sender = direct_bob
    verdict = contract.resolve_dispute(pid)

    assert verdict == "Yes"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_PAID_OUT
    assert contract.get_accumulated_revenue() == 500  # premium retained


def test_resolve_dispute_no(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    oracle_addr = create_address("oracle-no")
    direct_vm._gl_call_hook = _mock_oracle_hook({
        "title": "Did a drought occur in Texas?",
        "description": f"policy #{pid} appeal",
        "status": "Resolved",
        "outcome": "No",
    })
    contract.open_dispute(pid, oracle_addr)
    verdict = contract.resolve_dispute(pid)

    assert verdict == "No"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_EXPIRED
    # rejected claim: whole deposit (payout reserve + premium) becomes revenue
    assert contract.get_accumulated_revenue() == 2000


def test_resolve_dispute_still_active_reverts(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    oracle_addr = create_address("oracle-active")
    direct_vm._gl_call_hook = _mock_oracle_hook({
        "title": "Did a drought occur in Texas?",
        "description": f"policy #{pid} appeal",
        "status": "Active",  # earliest_resolution_date hasn't passed yet, or resolve() not called
        "outcome": "",
    })
    contract.open_dispute(pid, oracle_addr)

    with pytest.raises(AssertionError, match=re.escape("Oracle has not reached a final verdict yet")):
        contract.resolve_dispute(pid)


def test_resolve_dispute_oracle_error_reverts(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    oracle_addr = create_address("oracle-error")
    direct_vm._gl_call_hook = _mock_oracle_hook({
        "title": "Did a drought occur in Texas?",
        "description": f"policy #{pid} appeal",
        "status": "Error",  # validators picked an outcome outside potential_outcomes
        "outcome": "",
    })
    contract.open_dispute(pid, oracle_addr)

    with pytest.raises(AssertionError, match=re.escape("Oracle resolution failed (Error)")):
        contract.resolve_dispute(pid)


def test_resolve_dispute_requires_disputed_status(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice)  # still STATUS_ACTIVE

    with pytest.raises(AssertionError, match=re.escape("Policy not in dispute")):
        contract.resolve_dispute(pid)


def test_cancel_retains_premium_as_revenue(direct_deploy, direct_vm, direct_alice):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice, payout=2000, value=2500)  # premium = 500

    direct_vm.sender = direct_alice
    contract.cancel_policy(pid)

    assert contract.get_accumulated_revenue() == 500


def test_withdraw_revenue_by_owner(direct_deploy, direct_vm, direct_alice, direct_owner):
    contract = direct_deploy(CONTRACT)  # deployer (default sender) is owner
    pid = _create_policy(contract, direct_vm, direct_alice, payout=2000, value=2500)  # premium = 500

    direct_vm.sender = direct_alice
    contract.cancel_policy(pid)

    direct_vm.sender = direct_owner
    result = contract.withdraw_revenue(300)
    assert result is True
    assert contract.get_accumulated_revenue() == 200


def test_withdraw_revenue_requires_owner(direct_deploy, direct_vm, direct_alice, direct_bob):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice, payout=2000, value=2500)

    direct_vm.sender = direct_alice
    contract.cancel_policy(pid)

    direct_vm.sender = direct_bob
    with pytest.raises(AssertionError, match=re.escape("Only owner can withdraw")):
        contract.withdraw_revenue(100)


def test_withdraw_revenue_exceeds_balance(direct_deploy, direct_vm, direct_alice, direct_owner):
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(contract, direct_vm, direct_alice, payout=2000, value=2500)

    direct_vm.sender = direct_alice
    contract.cancel_policy(pid)

    direct_vm.sender = direct_owner
    with pytest.raises(AssertionError, match=re.escape("Amount exceeds withdrawable revenue")):
        contract.withdraw_revenue(9999)
