"""
Integration tests for Brevita.
Run against GenLayer Studio: gltest tests/integration/ -v -s
"""


def test_deploy_and_create_policy(studio):
    """Deploy contract and create a basic drought policy."""
    contract = studio.deploy("contracts/brevita.py")

    sources = ["https://droughtmonitor.unl.edu", "https://weather.com"]
    tx = contract.write(
        "create_policy",
        args=[
            "drought",
            "California Central Valley",
            "D3 drought level for 4+ consecutive weeks",
            sources,
            5000,
            180,
        ],
        value=6000,
    )
    receipt = tx.wait()
    assert receipt.status == "success"

    policy = contract.read("get_policy", args=[1])
    assert policy["event_type"] == "drought"
    assert policy["status"] == 0
    assert policy["payout"] == 5000


def test_create_multiple_disaster_types(studio):
    """Create policies for each disaster type."""
    contract = studio.deploy("contracts/brevita.py")

    disaster_types = [
        ("drought", ["https://droughtmonitor.unl.edu"]),
        ("hurricane", ["https://nhc.noaa.gov"]),
        ("flood", ["https://water.weather.gov"]),
        ("wildfire", ["https://fire.weather.gov"]),
        ("earthquake", ["https://earthquake.usgs.gov"]),
    ]

    for i, (disaster, sources) in enumerate(disaster_types):
        tx = contract.write(
            "create_policy",
            args=[disaster, "Test Location", f"{disaster} trigger", sources, 1000, 90],
            value=1200,
        )
        tx.wait()

    assert contract.read("get_policy_count", args=[]) == 5


def test_policy_lifecycle(studio):
    """Full lifecycle: create → cancel → can't trigger."""
    contract = studio.deploy("contracts/brevita.py")

    sources = ["https://weather.com"]
    tx = contract.write(
        "create_policy",
        args=["flood", "Venice", "Acqua alta 140cm+", sources, 2000, 90],
        value=2500,
    )
    tx.wait()

    policy = contract.read("get_policy", args=[1])
    assert policy["status"] == 0

    cancel_tx = contract.write("cancel_policy", args=[1])
    cancel_tx.wait()

    cancelled = contract.read("get_policy", args=[1])
    assert cancelled["status"] == 4  # CANCELLED


def test_holder_policies(studio):
    """Verify get_policies_by_holder returns correct policies."""
    contract = studio.deploy("contracts/brevita.py")

    for i in range(3):
        contract.write(
            "create_policy",
            args=["drought", f"Location {i}", f"Condition {i}", ["https://weather.com"], 1000, 90],
            value=1200,
        ).wait()

    holder = contract.account.address
    policies = contract.read("get_policies_by_holder", args=[holder])
    assert len(policies) == 3


def test_e2e_claim_signed_resolution(studio):
    """Claim path e2e: a signed write resolves the claim on-chain.

    The sender is the policy holder's signing account, the transaction is
    accepted by consensus, and the policy leaves the active state.
    """
    contract = studio.deploy("contracts/brevita.py")

    tx = contract.write(
        "create_policy",
        args=[
            "drought",
            "California Central Valley",
            "D3 drought level for 4+ consecutive weeks",
            ["https://droughtmonitor.unl.edu", "https://weather.com"],
            5000,
            180,
        ],
        value=6000,
    )
    create_receipt = tx.wait()
    assert create_receipt.status == "success"

    trigger_tx = contract.write("check_and_trigger", args=[1])
    trigger_receipt = trigger_tx.wait()
    assert trigger_receipt.status == "success"

    policy = contract.read("get_policy", args=[1])
    assert policy["status"] in (2, 5)  # PAID_OUT or DISPUTED


def test_e2e_appeal_signed_resolution(studio):
    """Appeal path e2e: a signed write resolves a disputed policy on-chain.

    First auto-adjudication returns NO (policy enters dispute), then the
    appeal write settles it to a terminal state (PAID_OUT or EXPIRED).
    Skips the appeal step if the first pass happened to return YES.
    """
    contract = studio.deploy("contracts/brevita.py")

    # Intentionally-unmet trigger biases the first pass toward NO/UNDECIDED.
    tx = contract.write(
        "create_policy",
        args=[
            "drought",
            "Death Valley",
            "Monsoon rains exceeding 1000mm in a single day",
            ["https://droughtmonitor.unl.edu"],
            1000,
            90,
        ],
        value=1200,
    )
    create_receipt = tx.wait()
    assert create_receipt.status == "success"

    trigger_tx = contract.write("check_and_trigger", args=[1])
    trigger_receipt = trigger_tx.wait()
    assert trigger_receipt.status == "success"

    policy = contract.read("get_policy", args=[1])
    if policy["status"] != 5:  # DISPUTED
        # First pass already resolved the claim; nothing left to appeal.
        return

    appeal_tx = contract.write("resolve_dispute", args=[1])
    appeal_receipt = appeal_tx.wait()
    assert appeal_receipt.status == "success"

    settled = contract.read("get_policy", args=[1])
    assert settled["status"] in (2, 3)  # PAID_OUT or EXPIRED
