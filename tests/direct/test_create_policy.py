from genlayer import *
from contracts.brevita import Brevita, STATUS_ACTIVE


def test_create_policy_basic():
    contract = Brevita()
    sources = DynArray(["https://weather.com/data"])
    pid = contract.create_policy(
        "drought",
        "California",
        "Rainfall below 50mm for 30 consecutive days",
        sources,
        1000,
        90,
    )
    assert pid == 1
    policy = contract.get_policy(pid)
    assert policy.holder != Address.zero()
    assert policy.event_type == "drought"
    assert policy.payout == 1000
    assert policy.status == STATUS_ACTIVE


def test_create_policy_invalid_event_type():
    contract = Brevita()
    sources = DynArray(["https://weather.com/data"])
    try:
        contract.create_policy("volcano", "Iceland", "Eruption", sources, 1000, 90)
        assert False, "Should have raised"
    except Exception:
        pass


def test_create_policy_empty_location():
    contract = Brevita()
    sources = DynArray(["https://weather.com/data"])
    try:
        contract.create_policy("flood", "", "River overflow", sources, 1000, 90)
        assert False, "Should have raised"
    except Exception:
        pass


def test_create_policy_no_sources():
    contract = Brevita()
    try:
        contract.create_policy("hurricane", "Miami", "Cat 4+", DynArray(), 1000, 90)
        assert False, "Should have raised"
    except Exception:
        pass


def test_create_policy_zero_payout():
    contract = Brevita()
    sources = DynArray(["https://weather.com/data"])
    try:
        contract.create_policy("flood", "Texas", "Flooding", sources, 0, 90)
        assert False, "Should have raised"
    except Exception:
        pass


def test_multiple_policies():
    contract = Brevita()
    sources = DynArray(["https://weather.com/data"])
    pid1 = contract.create_policy("hurricane", "Miami", "Cat 3+", sources, 2000, 180)
    pid2 = contract.create_policy("earthquake", "San Francisco", "Mag 6+", sources, 5000, 365)
    assert pid1 == 1
    assert pid2 == 2
    assert contract.get_policy_count() == 2


def test_policy_count():
    contract = Brevita()
    assert contract.get_policy_count() == 0
    sources = DynArray(["https://weather.com/data"])
    contract.create_policy("wildfire", "Oregon", "Large fire", sources, 1500, 60)
    assert contract.get_policy_count() == 1
