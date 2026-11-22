"""Bounded, shell-free, local-only verification runner."""
from __future__ import annotations

from datetime import datetime, timezone
from pathlib import Path
import json
import subprocess
import sys
import time

from .config import Workflow, WorkflowError

LOG_LIMIT = 6000


def command_for(kind: str, target: str) -> list[str]:
    if kind == "syntax":
        return [sys.executable, "-m", "compileall", "-q", target]
    if kind == "unittest":
        return [sys.executable, "-m", "unittest", "discover", "-s", target, "-v"]
    if kind == "pytest":
        return [sys.executable, "-m", "pytest", target, "-q"]
    raise WorkflowError(f"Unknown kind: {kind}")


def run_workflow(workflow: Workflow, workspace: str | Path) -> dict:
    root = Path(workspace).resolve(strict=True)
    if not root.is_dir():
        raise WorkflowError("Workspace is not a directory")
    results: list[dict] = []
    halt = False
    for check in workflow.checks:
        destination = (root / check.target).resolve()
        if not destination.is_relative_to(root) or not destination.exists():
            raise WorkflowError(f"Check {check.id}: missing or out-of-workspace path {check.target}")
        if halt:
            results.append({"id": check.id, "status": "skipped", "required": check.required})
            continue
        start = time.monotonic()
        args = command_for(check.kind, check.target)
        try:
            completed = subprocess.run(
                args, cwd=root, capture_output=True, text=True, timeout=check.timeout_seconds,
                check=False, stdin=subprocess.DEVNULL, errors="replace", env=None,
            )
            status = "passed" if completed.returncode == 0 else "failed"
            code = completed.returncode
            stdout, stderr = completed.stdout[-LOG_LIMIT:], completed.stderr[-LOG_LIMIT:]
        except subprocess.TimeoutExpired as exc:
            status, code = "timeout", None
            stdout = str(exc.stdout or b"")[-LOG_LIMIT:]
            stderr = f"Timed out after {check.timeout_seconds}s"
        elapsed = round(time.monotonic() - start, 3)
        results.append({
            "id": check.id, "kind": check.kind, "status": status, "required": check.required,
            "exit_code": code, "duration_seconds": elapsed, "stdout": stdout, "stderr": stderr,
        })
        if status != "passed" and check.required and workflow.fail_fast:
            halt = True
    failed_required = any(r["status"] in {"failed", "timeout"} and r.get("required") for r in results)
    return {
        "schema_version": "1", "workflow": workflow.name,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "status": "failed" if failed_required else "passed",
        "summary": {"passed": sum(r["status"] == "passed" for r in results),
                    "failed": sum(r["status"] == "failed" for r in results),
                    "timed_out": sum(r["status"] == "timeout" for r in results),
                    "skipped": sum(r["status"] == "skipped" for r in results)},
        "checks": results,
        "notes": "Local verification only: no Devin sessions, PR merges or costs are inferred.",
    }


def save_json(report: dict, destination: str | Path) -> Path:
    path = Path(destination)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(report, indent=2, sort_keys=True) + "\n", encoding="utf-8")
    return path
