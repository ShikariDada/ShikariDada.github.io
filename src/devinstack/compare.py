"""Paired comparison of observed task outcomes; no fabricated cost estimates."""
from __future__ import annotations

from pathlib import Path
import json


class BenchmarkError(ValueError):
    pass


def load_observations(path: str | Path) -> dict[str, dict]:
    observations = {}
    for line_no, line in enumerate(Path(path).read_text(encoding="utf-8").splitlines(), 1):
        if not line.strip():
            continue
        try:
            entry = json.loads(line)
        except json.JSONDecodeError as exc:
            raise BenchmarkError(f"Line {line_no}: invalid JSON") from exc
        if not isinstance(entry, dict):
            raise BenchmarkError(f"Line {line_no}: expected object")
        task = entry.get("task_id")
        if not isinstance(task, str) or not task or task in observations:
            raise BenchmarkError(f"Line {line_no}: missing or duplicate task_id")
        if type(entry.get("success")) is not bool:
            raise BenchmarkError(f"Line {line_no}: success must be boolean")
        for key in ("duration_seconds", "cost_usd", "human_interventions"):
            if key in entry and (type(entry[key]) not in (float, int) or entry[key] < 0):
                raise BenchmarkError(f"Line {line_no}: invalid {key}")
        observations[task] = entry
    if not observations:
        raise BenchmarkError("No observations")
    return observations


def compare(baseline: dict[str, dict], candidate: dict[str, dict]) -> dict:
    if set(baseline) != set(candidate):
        raise BenchmarkError("For a paired comparison, task IDs must match exactly")
    tasks = sorted(baseline)

    def summarize(data: dict[str, dict]) -> dict:
        observations = [data[t] for t in tasks]
        wins = sum(o["success"] for o in observations)
        costs_available = all("cost_usd" in o for o in observations)
        intervention_available = all("human_interventions" in o for o in observations)
        return {
            "tasks": len(tasks), "successes": wins, "success_rate": round(wins / len(tasks), 4),
            "total_cost_usd": round(sum(o["cost_usd"] for o in observations), 4) if costs_available else None,
            "cost_per_success_usd": round(sum(o["cost_usd"] for o in observations) / wins, 4) if costs_available and wins else None,
            "human_interventions": sum(o["human_interventions"] for o in observations) if intervention_available else None,
        }

    a, b = summarize(baseline), summarize(candidate)
    return {
        "schema_version": "1", "paired_task_ids": tasks, "baseline": a, "candidate": b,
        "delta_success_rate_points": round((b["success_rate"] - a["success_rate"]) * 100, 2),
        "candidate_improved_tasks": [t for t in tasks if not baseline[t]["success"] and candidate[t]["success"]],
        "candidate_regressed_tasks": [t for t in tasks if baseline[t]["success"] and not candidate[t]["success"]],
        "warning": "Descriptive comparison only; not statistical proof. Example data, if used, are fictional.",
    }
