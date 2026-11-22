# Architecture: from a reproducible gate to a Devin reliability layer

## Working v0.1 boundary

```text
                    local checkout
                         |
       proposed YAML -> strict config parser
                         |
             safe check runner (no shell)
                /         |         \
             syntax    unittest    pytest
                \         |         /
                   JSON evidence
                         |
                  human approval
```

The Python CLI is provider-agnostic. It never starts a Devin session, merges a PR,
or authorizes repository writes. Each check has a fixed runner implementation,
a 1–300 second timeout, bounded output, and a declared required flag.

The evaluation module compares **paired tasks** with equal task IDs and reports
success changes, regressions, human interventions, and *only costs actually
supplied by the evaluator*. It doesn't infer billing data or claim statistical
significance for a handful of samples.

## Planned layers — not implemented

1. **DevOps integrations:** GitHub App/webhook verifies PR SHA and target branch;
   checks run in an isolated container for that exact SHA.
2. **Devin connector:** separately authenticate to official Devin APIs, create or
   track sessions with rate and budget limits, correlate PRs with session IDs.
3. **Repair policy:** at most two retries; never automatically merge; human approval
   required for all repository writes. Guard against webhook replays and loops.
4. **Evaluation registry:** fixed issue snapshots, deterministic test oracles,
   repeat runs and independent review. Compare with an unchanged baseline.
5. **Cost attribution:** ingest observed usage records and attribute them to task
   and session; mark missing costs as unknown rather than zero.

No claim is made that any planned integration is implemented or that DevinStack
already improves Devin performance.

## Why this complements Devin

Devin provides agents and its own workflows. This layer aims to measure the
reliability of changes and make failures reproducible. The YAML schema in this
repository is **not** the native Devin Skills or playbooks format.
