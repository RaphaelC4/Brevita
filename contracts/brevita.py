# { "Depends": "py-genlayer:test" }

import datetime
from dataclasses import dataclass
from genlayer import *

STATUS_ACTIVE = 0
STATUS_TRIGGERED = 1
STATUS_PAID_OUT = 2
STATUS_EXPIRED = 3
STATUS_CANCELLED = 4
STATUS_DISPUTED = 5


@allow_storage
@dataclass
class Policy:
    id: u256
    holder: Address
    event_type: str
    location: str
    trigger_condition: str
    data_sources: str
    payout: u256
    premium: u256
    status: u256
    created_at: u256
    expires_at: u256


class Brevita(gl.Contract):
    policies: DynArray[Policy]
    holder_policy_ids: TreeMap[Address, DynArray[u256]]
    policy_count: u256
    owner: Address
    accumulated_revenue: u256

    def __init__(self):
        self.policy_count = 0
        self.owner = gl.message.sender_address
        self.accumulated_revenue = 0

    def _validate_event_type(self, event_type: str) -> bool:
        return event_type in [
            "drought", "hurricane", "flood", "wildfire", "earthquake",
            "pandemic", "heatwave", "civil-unrest", "war", "terrorism"
        ]

    @gl.public.write.payable
    def create_policy(
        self,
        event_type: str,
        location: str,
        trigger_condition: str,
        data_sources: DynArray[str],
        payout: u256,
        expires_after_days: u256,
    ) -> u256:
        assert self._validate_event_type(event_type), "Invalid event type"
        assert location != "", "Location required"
        assert trigger_condition != "", "Trigger condition required"
        assert len(data_sources) > 0, "At least one data source required"
        assert payout > 0, "Payout must be > 0"
        assert gl.message.value >= payout, "Insufficient funds"

        self.policy_count += 1
        policy_id = self.policy_count
        premium = gl.message.value - payout
        now_ts = u256(int(datetime.datetime.now().timestamp()))
        sender = gl.message.sender_address

        policy = Policy(
            id=policy_id,
            holder=sender,
            event_type=event_type,
            location=location,
            trigger_condition=trigger_condition,
            data_sources="\n".join(data_sources),
            payout=payout,
            premium=premium,
            status=STATUS_ACTIVE,
            created_at=now_ts,
            expires_at=now_ts + (expires_after_days * 86400),
        )
        self.policies.append(policy)

        holder_ids = self.holder_policy_ids.get_or_insert_default(sender)
        holder_ids.append(policy_id)

        return policy_id

    @gl.public.write
    def check_and_trigger(self, policy_id: u256) -> str:
        assert policy_id > 0 and policy_id <= self.policy_count, "Policy does not exist"

        idx = policy_id - 1
        policy = self.policies[idx]
        assert policy.status == STATUS_ACTIVE, "Policy not active"
        now_ts = u256(int(datetime.datetime.now().timestamp()))
        assert now_ts <= policy.expires_at, "Policy has expired"

        event_type = policy.event_type
        location = policy.location
        trigger_condition = policy.trigger_condition
        data_sources_str = policy.data_sources

        def nondet_verdict() -> str:
            combined_data = ""
            sources = data_sources_str.split("\n")
            for i in range(len(sources)):
                url = sources[i]
                try:
                    page_text = gl.nondet.web.render(url, mode="text")
                    combined_data += f"\n--- Source {i+1}: {url} ---\n{page_text[:5000]}\n"
                except Exception:
                    combined_data += f"\n--- Source {i+1}: {url} ---\n[Failed to fetch]\n"

            prompt = (
                f"You are a parametric insurance claims adjudicator. "
                f"Determine if the trigger condition has been met based on the provided data.\n\n"
                f"Event type: {event_type}\n"
                f"Location: {location}\n"
                f"Trigger condition: {trigger_condition}\n\n"
                f"Data:\n{combined_data}\n\n"
                f"Answer ONLY with 'YES' if met, 'NO' if not met, or 'UNDECIDED' if data is insufficient.\n"
                f"Answer:"
            )

            llm_output = gl.nondet.exec_prompt(prompt)
            text = llm_output.strip().upper()
            if "YES" in text:
                return "YES"
            if "NO" in text:
                return "NO"
            return "UNDECIDED"

        verdict = gl.eq_principle.strict_eq(nondet_verdict)

        if verdict == "YES":
            policy.status = STATUS_TRIGGERED
            self.policies[idx] = policy
            gl.get_contract_at(policy.holder).emit_transfer(value=policy.payout)
            policy.status = STATUS_PAID_OUT
            self.policies[idx] = policy
            self.accumulated_revenue += policy.premium
        elif verdict in ("NO", "UNDECIDED"):
            policy.status = STATUS_DISPUTED
            self.policies[idx] = policy

        return verdict

    @gl.public.write
    def cancel_policy(self, policy_id: u256) -> bool:
        assert policy_id > 0 and policy_id <= self.policy_count, "Policy does not exist"

        idx = policy_id - 1
        policy = self.policies[idx]
        assert policy.status == STATUS_ACTIVE, "Policy not active"
        assert gl.message.sender_address == policy.holder, "Only holder can cancel"

        policy.status = STATUS_CANCELLED
        self.policies[idx] = policy
        gl.get_contract_at(policy.holder).emit_transfer(value=policy.payout)
        self.accumulated_revenue += policy.premium
        return True

    @gl.public.write
    def resolve_dispute(self, policy_id: u256) -> str:
        """
        Sends a disputed policy back through GenLayer's own validator
        network for a final, decisive ruling - a second, stricter AI
        vote than the first check_and_trigger pass. The first round can
        return UNDECIDED; this appeal round must land on TRUE or FALSE.
        Fully self-contained - no external oracle or third-party
        contract dependency.
        """
        assert policy_id > 0 and policy_id <= self.policy_count, "Policy does not exist"
        idx = policy_id - 1
        policy = self.policies[idx]
        assert policy.status == STATUS_DISPUTED, "Policy not in dispute"

        event_type = policy.event_type
        location = policy.location
        trigger_condition = policy.trigger_condition
        data_sources_str = policy.data_sources

        def nondet_verdict() -> str:
            combined_data = ""
            sources = data_sources_str.split("\n")
            for i in range(len(sources)):
                url = sources[i]
                try:
                    page_text = gl.nondet.web.render(url, mode="text")
                    combined_data += f"\n--- Source {i+1}: {url} ---\n{page_text[:5000]}\n"
                except Exception:
                    combined_data += f"\n--- Source {i+1}: {url} ---\n[Failed to fetch]\n"

            prompt = (
                f"You are the final court of appeal for a parametric insurance claim. "
                f"A first review could not reach a confident verdict. You MUST now reach "
                f"a final, decisive ruling - 'insufficient data' is not an acceptable answer. "
                f"Weigh the available evidence and rule in favor of the interpretation the "
                f"evidence more strongly supports.\n\n"
                f"Event type: {event_type}\n"
                f"Location: {location}\n"
                f"Trigger condition: {trigger_condition}\n\n"
                f"Data:\n{combined_data}\n\n"
                f"Answer ONLY with 'TRUE' if the trigger condition was met, or 'FALSE' if it was not.\n"
                f"Answer:"
            )

            llm_output = gl.nondet.exec_prompt(prompt)
            text = llm_output.strip().upper()
            if "TRUE" in text:
                return "TRUE"
            return "FALSE"

        verdict = gl.eq_principle.strict_eq(nondet_verdict)

        if verdict == "TRUE":
            policy.status = STATUS_TRIGGERED
            self.policies[idx] = policy
            gl.get_contract_at(policy.holder).emit_transfer(value=policy.payout)
            policy.status = STATUS_PAID_OUT
            self.policies[idx] = policy
            self.accumulated_revenue += policy.premium
        else:
            policy.status = STATUS_EXPIRED
            self.policies[idx] = policy
            self.accumulated_revenue += policy.payout + policy.premium

        return verdict

    @gl.public.write
    def withdraw_revenue(self, amount: u256) -> bool:
        assert gl.message.sender_address == self.owner, "Only owner can withdraw"
        assert amount > 0, "Amount must be > 0"
        assert amount <= self.accumulated_revenue, "Amount exceeds withdrawable revenue"

        self.accumulated_revenue -= amount
        gl.get_contract_at(self.owner).emit_transfer(value=amount)
        return True

    @gl.public.view
    def get_policy(self, policy_id: u256) -> Policy:
        assert policy_id > 0 and policy_id <= self.policy_count, "Policy not found"
        return self.policies[policy_id - 1]

    @gl.public.view
    def get_policies_by_holder(self, holder: Address) -> DynArray[Policy]:
        holder = Address(holder) if not isinstance(holder, Address) else holder
        result: list[Policy] = []
        if holder in self.holder_policy_ids:
            for pid in self.holder_policy_ids[holder]:
                result.append(self.policies[pid - 1])
        return result

    @gl.public.view
    def get_policy_count(self) -> u256:
        return self.policy_count

    @gl.public.view
    def get_accumulated_revenue(self) -> u256:
        return self.accumulated_revenue
