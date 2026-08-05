import pytest
import re

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


def test_resolve_dispute_true_end_to_end(direct_deploy, direct_vm, direct_alice, direct_bob):
    """
    Full authorized path: dispute a policy, then resolve it via GenLayer's
    own second-round consensus (no external oracle). Confirms the write is
    tied to a real sender and that a successful resolution is correctly
    reflected in on-chain state.
    """
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days",
        payout=1000, value=1500,  # premium = 500
    )
    _dispute_policy(contract, direct_vm, pid)

    # Appeal resolution is permissionless - anyone (e.g. Bob) can call it -
    # but it must still be a real, authorized sender (not a bypass of
    # signing), which direct_vm.sender models.
    direct_vm.sender = direct_bob
    direct_vm.clear_mocks()
    direct_vm.mock_web(r"weather\.gov", {"method": "GET", "status": 200, "body": "cloudy"})
    direct_vm.mock_llm(r".*", "TRUE")

    verdict = contract.resolve_dispute(pid)

    assert verdict == "TRUE"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_PAID_OUT
    assert contract.get_accumulated_revenue() == 500  # premium retained


def test_resolve_dispute_false_end_to_end(direct_deploy, direct_vm, direct_alice):
    """
    Same path, opposite verdict: confirms a FALSE ruling correctly settles
    the policy as expired and forfeits the full deposit to revenue.
    """
    contract = direct_deploy(CONTRACT)
    pid = _create_policy(
        contract, direct_vm, direct_alice,
        event_type="drought", location="Texas", trigger_condition="No rain 30 days", payout=1000,
    )
    _dispute_policy(contract, direct_vm, pid)

    direct_vm.clear_mocks()
    direct_vm.mock_web(r"weather\.gov", {"method": "GET", "status": 200, "body": "cloudy"})
    direct_vm.mock_llm(r".*", "FALSE")

    verdict = contract.resolve_dispute(pid)

    assert verdict == "FALSE"
    policy = contract.get_policy(pid)
    assert policy.status == STATUS_EXPIRED
    assert contract.get_accumulated_revenue() == 2000  # full deposit forfeited


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
