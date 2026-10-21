# Development changelog and release workflow

Status: accepted by JJ, 2026-10-21.

Provenance: JJ approved the proposed approach with “approve that approach” and instructed: “for now, after task runs like F06 or F05 you can give me an push command i need to do to push these to git remote”.

Accepted approach: maintain Unreleased entries in the central changelog and a concise in-script summary as fixes land; use synchronized version labels and changelogs for every published release, including bug-fix releases. Finish the separate settings synchronization fix before preparing the coherent release. The existing unrecorded menu/F06/F05 changes must be included in that Unreleased update. Original individual fix reports remain the detailed verification evidence.

After completed task runs, provide an exact command for JJ to push the local task branch. JJ performs the push; this is not authorization for automatic pushing, merging, tagging or publication. Local commits and installed B development builds are distinct from remote branches and released auto-update assets.

Verified current remote: origin = git@github.com:jja-lab/slickdeals-plus.git. Current branch: astra/20261005-200544-slickdeals-fix1-49854f8c. Existing script update URLs and release.sh instead target rehire-shriek/slickdeals-plus. Resolve the intended publication destination before release; do not silently change update URLs or release targets.

Next implementation checkpoint: settings synchronization with focused stale-tab regressions, preserving unrelated newer settings and explicit bulk actions; maintain Unreleased documentation with that task. Detailed synchronization behavior needs its own decision record and verification. No release version selected here.
