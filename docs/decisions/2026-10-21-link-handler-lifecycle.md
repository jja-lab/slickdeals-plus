# F05 — One redirect handler per anchor

Status: decided-in-flight, 2026-10-21. JJ authorized F05 with the previous fix/test/review/live verification/local commit workflow, and requested judgment on sequencing the Gold Tier/Glitch settings issue.

Choice: on each actual link-processing pass, remove the previously registered capture listener using the existing WeakMap, clear its stored resolved destination, then resolve the current href and register at most one replacement. A link that becomes ordinary or unresolvable loses the old bypass handler. The current bypass setting is still checked at click time. Preserve destination parsing, click behavior, processing order, and noopener,noreferrer.

Rationale: directly fixes reproduced duplicate open requests and stale destinations during forced processing. Existing processed flags continue to skip unchanged cards. No new storage or dependency.

Alternative/runner-up: install a single permanent handler and resolve href at click time. This handles changes even without reprocessing but alters resolution timing and broadens the behavioral scope. It is unnecessary for the audited forced-processing defect. Adding stopImmediatePropagation would mask duplicate ownership and could suppress other site handlers; rejected.

Consequence: one listener replacement per revisited anchor; no measured performance claim. Href changes without a processing pass remain outside this fix, as does F10 decoding behavior. No change to Gold Tier or Glitch settings semantics.

Reversal: revert the focused commit, no migration; duplicate listeners return on repeated forced passes. Review checkpoint: real-browser fixed/baseline fixture, independent review, installed-source verification and bounded B smoke check before local commit. Human acceptance pending.

## JJ review — accepted, 2026-10-21

Current status: accepted. Original in-flight reasoning above is preserved as history.

Provenance: after the debrief explicitly listed the F05 choices and follow-up sequencing, JJ stated, “approve the decisions and sequencing”.

Accepted decisions: remove/replace the previous capture handler on each actual reprocessing pass; clear stale resolved destinations before checking the current URL; preserve URL parsing and click behavior, leaving F10 and URL changes without a processing pass outside F05. Implementation commit: 0f952b9.

Accepted sequencing: address Gold Tier/Glitch settings synchronization as the next separate fix immediately after F05, before other feature work. The reproduced stale-tab overwrite is evidence for that work, not proof of the cause of the historical live settings drift. Detailed synchronization semantics remain to be designed and verified; this approval does not imply acceptance of an unreviewed implementation.

No supersession, push, or release is included. Future debriefs must explicitly enumerate in-flight decisions needing JJ ratification, per JJ's stated preference.
