from genlayer import *
from contracts.brevita import Brevita, STATUS_ACTIVE


def test_get_policy_nonexistent():
    contract = Brevita()
    try:
        contract.get_policy(99)
        assert False, "Should have raised"
    except Exception:
        pass


def test_get_policies_by_holder_empty():
    contract = Brevita()
    policies = contract.get_policies_by_holder(Address("0x0"))
    assert len(policies) == 0


def test_get_policies_by_holder():
    contract = Brevita()
    sources = DynArray(["https://weather.com"])
    pid1 = contract.create_policy("drought", "Texas", "Dry", sources, 1000, 90)
    pid2 = contract.create_policy("flood", "Louisiana", "Wet", sources, 2000, 90)

    holder = contract.get_policy(pid1).holder
    policies = contract.get_policies_by_holder(holder)
    assert len(policies) == 2
    ids = [p.id for p in policies]
    assert pid1 in ids
    assert pid2 in ids


def test_policy_has_required_fields():
    contract = Brevita()
    sources = DynArray(["https://weather.com"])
    pid = contract.create_policy("earthquake", "Japan", "Mag 6+", sources, 5000, 180)
    policy = contract.get_policy(pid)

    assert hasattr(policy, "id")
    assert hasattr(policy, "holder")
    assert hasattr(policy, "event_type")
    assert hasattr(policy, "location")
    assert hasattr(policy, "trigger_condition")
    assert hasattr(policy, "data_sources")
    assert hasattr(policy, "payout")
    assert hasattr(policy, "premium")
    assert hasattr(policy, "status")
    assert hasattr(policy, "created_at")
    assert hasattr(policy, "expires_at")


def test_policy_sequence():
    contract = Brevita()
    sources1 = DynArray(["https://weather.com"])
    sources2 = DynArray(["https://usgs.gov"])

    pid1 = contract.create_policy("hurricane", "Florida", "Cat 3+", sources1, 2000, 90)
    pid2 = contract.create_policy("earthquake", "California", "Mag 6+", sources2, 3000, 365)
    pid3 = contract.create_policy("flood", "Netherlands", "Sea level", sources1, 4000, 30)

    assert pid1 == 1
    assert pid2 == 2
    assert pid3 == 3

    assert contract.get_policy_count() == 3
