# ScanApp operating instructions

## Scope and persistence

The owner authorized ongoing product, SEO, implementation, verification and
deployment work on ScanApp on November 22, 2026. Continue useful authorized work
without requesting approval for each routine reversible release. Publish tested,
bounded changes to the existing deployment branch. GitHub Pages settings were
verified as `main`, root directory, at `https://scanapp.org/`; the owner's reference
to `master` meant this deployment path. Never create a replacement branch or change
hosting settings merely to match that wording. Recheck the remote before releases.

The owner handles AdSense account setup. Track the dependency and follow up with
specific remaining actions. Do not represent pending approval as serving, or
forecast income from unmeasured RPM. Access to GA4 and GSC in signed-in Chrome has
been verified. Google Cloud project/access and a durable API data connection have
not been verified; do not assume them or introduce billed resources.

## Operating records

Read the private `_operations/operating-plan.md`, `_operations/state.json` and
`_operations/experiments.md` before selecting work. Read current TaiWiki context
`scanapp/scanapp-latest-context.md` when available. Private evidence and the local
context mirror are in `_reports/`. Preserve dates, measurement boundaries,
limitations and the difference between observations and proposals.

Keep private reports, backups, financial targets, account data and credentials out
of commits and deployed output. Stage explicit files; never `git add .` or force
push. Preserve unrelated user changes. Credentials are not a backup input.

## Work cycle

1. Inspect local/remote state, open experiments and production health.
2. Run `python3 scripts/backup-scanapp.py` once per active operating day and
   `python3 scripts/backup-scanapp.py --label before-release` before publishing.
   Verify the manifest. Backups are local; do not claim off-device resilience.
3. Choose work by expected useful outcomes, evidence, effort and maintenance load.
   Ship no change when evidence favors observing an existing experiment.
4. Explain the hypothesis, baseline, primary measure, guardrails and decision date
   in the private experiment ledger. SEO observation usually needs weeks, not a
   daily before/after comparison. Avoid competing changes on the same cohort.
5. Implement, run appropriate checks, inspect generated output, and publish a
   small explicit commit. Verify deployment and the actual live behavior; a push
   or a green build alone is not proof of a useful outcome. Record rollback SHA.
6. Update state, experiment results and TaiWiki with meaningful changes. Report
   what shipped, observed results, uncertainty, blockers and the next decision.

## Validation

This is a Jekyll static site. Check `Gemfile`, available Ruby/Bundler and the local
dependency runtime before building. Build into an ignored local directory and
confirm private operating records are absent. Use
`node scripts/test-blog-analytics.js` for blog instrumentation changes.
Scanner TypeScript is under `scanapp-js`; generated bundles and inline includes
must remain consistent when changed. Read the build scripts before running the
root build because its pre/post hooks clean generated files.

Protect scanner/file completion, accessibility and mobile speed. Do not add
unsubstantiated authenticity/price claims, fabricated SEO pages or fake reviews.
Validate user intent and willingness to pay before adding persistent hosting,
accounts, inventory integrations or support-heavy products. Revenue, profit and
owner time are separate measures. Repeated requests to expand the business do not
authorize spending, contracts, outbound messages, public sharing of private data
or changes to account access, payouts or security settings.
