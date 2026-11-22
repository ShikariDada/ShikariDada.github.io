# Contributing

For an actionable issue, include Python version, reproducible commands, expected
versus actual output, and a minimal workflow YAML. Prefer focused PRs with a
test that fails before the fix. Run `python -m pytest -q` and the sample gate.
Never submit API keys or private repository content. For new provider adapters,
keep provider-specific API calls separate from the local runner and retain
human approval before merges.
