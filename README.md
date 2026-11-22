# DevinStack

**A small, working proof of concept for more reliable AI-generated pull requests.**

DevinStack is an experimental, provider-agnostic **PR regression gate + paired
benchmark harness**. The long-term goal is a reusable reliability layer around
Devin's existing engineering agents: verify changes, compare playbook outcomes,
and publish reproducible evidence instead of trusting a green-looking PR.

> **Scope honesty:** v0.1 is a real local CLI with automated tests. It **does not**
> connect to Devin's API, orchestrate agents, read GitHub PRs, or produce real
> Devin performance benchmarks. The playbook YAML is a **DevinStack proposal**,
> not a native Devin Skills definition.

## What works today

- **Typed YAML gate:** checks for syntax, unittest, and pytest with strict schema
  validation, duplicate detection, path restrictions, fail-fast and required flags.
- **Execution evidence:** subprocess exit codes, durations, bounded logs, timeout
  handling and machine-readable JSON reports; nonzero exit for a failed gate.
- **Paired benchmark comparison:** stable task IDs, pass/regress lists,
  successful-task rates, and cost-per-success **when real costs are provided**.
- **Tests + CI:** includes positive/negative path checks and GitHub Actions
  matrix for Python 3.10, 3.12 and 3.13.
- **Security boundaries:** intentionally rejects arbitrary YAML shell commands;
  documents why untrusted test code still requires stronger isolation.

## Try it in under a minute

```bash
python -m pip install -e '.[dev]'
python -m pytest -q

devinstack validate playbooks/pr-regression.yaml
devinstack run playbooks/pr-regression.yaml \
  --workspace examples/calculator --out artifacts/gate.json

devinstack compare \
  --baseline benchmarks/fictional-baseline.jsonl \
  --candidate benchmarks/fictional-candidate.jsonl \
  --out artifacts/comparison.json
```

Expected gate outcome: 2 checks pass. The comparison dataset is **fictional
fixture data** strictly for demonstrating evaluation output, **not** empirical
Devin results. Inspect the JSON files in `artifacts/` after running.

To see a failing gate, deliberately change `subtotal()` to return an incorrect
value, rerun `devinstack run`, and then revert the change. The CLI exits 1 when
a required check fails and writes the failing test's evidence to JSON.

## Repository map

| Path | Purpose |
| --- | --- |
| [`src/devinstack/config.py`](src/devinstack/config.py) | Strict workflow schema / validation |
| [`src/devinstack/runner.py`](src/devinstack/runner.py) | Safe-argv checks + JSON evidence |
| [`src/devinstack/compare.py`](src/devinstack/compare.py) | Paired task evaluation |
| [`playbooks/pr-regression.yaml`](playbooks/pr-regression.yaml) | Executable sample gate |
| [`examples/calculator/`](examples/calculator/) | Toy regression fixture |
| [`tests/`](tests/) | Automated test suite |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Actual vs planned architecture |
| [`docs/SECURITY.md`](docs/SECURITY.md) | Trust boundaries / limitations |

## Roadmap

1. **v0.2:** verify a GitHub PR checkout in an isolated environment, capture
   SHA and CI evidence; add reproducible issue fixtures.
2. **v0.3:** optional Devin API session-tracking adapter with explicit human
   approval, rate/budget limits and secret isolation.
3. **v0.4:** compare native Devin workflow outcomes vs enhanced verification on
   publicly specified task sets; release results, failures and raw metadata.

Benchmarks should report repeated runs, task selection, baselines, successful
merges, reviewer interventions, and costs. No unsupported improvement or cost
claims should be used to market the project.

## License

MIT. See [LICENSE](LICENSE). Contributions and constructive technical critiques welcome.
