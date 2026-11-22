"""CLI with explicit error handling and machine-readable artifacts."""
from __future__ import annotations

import argparse
from pathlib import Path
import sys

from .config import load_workflow, WorkflowError
from .runner import run_workflow, save_json
from .compare import load_observations, compare, BenchmarkError


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="devinstack", description="Local PR verification and paired agent-workflow evaluation")
    sub = parser.add_subparsers(dest="action", required=True)
    validate = sub.add_parser("validate", help="Validate a DevinStack YAML workflow")
    validate.add_argument("workflow", type=Path)
    run = sub.add_parser("run", help="Run bounded local regression checks")
    run.add_argument("workflow", type=Path)
    run.add_argument("--workspace", type=Path, required=True)
    run.add_argument("--out", type=Path, default=Path("artifacts/report.json"))
    bench = sub.add_parser("compare", help="Compare paired task result JSONL files")
    bench.add_argument("--baseline", required=True, type=Path)
    bench.add_argument("--candidate", required=True, type=Path)
    bench.add_argument("--out", type=Path, default=Path("artifacts/comparison.json"))
    args = parser.parse_args(argv)
    try:
        if args.action == "validate":
            workflow = load_workflow(args.workflow)
            print(f"Valid: {workflow.name} ({len(workflow.checks)} checks)")
            return 0
        if args.action == "run":
            workflow = load_workflow(args.workflow)
            report = run_workflow(workflow, args.workspace)
            save_json(report, args.out)
            for check in report["checks"]:
                print(f"{check['status']:>7}  {check['id']}")
            print(f"Status: {report['status']}; JSON: {args.out}")
            return 0 if report["status"] == "passed" else 1
        if args.action == "compare":
            report = compare(load_observations(args.baseline), load_observations(args.candidate))
            save_json(report, args.out)
            print(f"Paired tasks: {len(report['paired_task_ids'])}; delta success rate: {report['delta_success_rate_points']:+.2f} pp")
            print(f"JSON: {args.out}")
            return 0
    except (WorkflowError, BenchmarkError, OSError, ValueError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 2
    return 2
