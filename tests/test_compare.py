import json
import pytest
from devinstack.compare import load_observations, compare, BenchmarkError


def test_paired_comparison_reports_success_changes():
    a = {"a": {"success": False, "cost_usd": 1}, "b": {"success": True, "cost_usd": 2}}
    b = {"a": {"success": True, "cost_usd": 3}, "b": {"success": True, "cost_usd": 4}}
    report = compare(a, b)
    assert report["delta_success_rate_points"] == 50.0
    assert report["candidate_improved_tasks"] == ["a"]
    assert report["baseline"]["cost_per_success_usd"] == 3.0


def test_missing_cost_stays_unknown():
    report = compare({"a": {"success": True}}, {"a": {"success": True}})
    assert report["baseline"]["total_cost_usd"] is None


def test_rejects_unmatched_tasks():
    with pytest.raises(BenchmarkError):
        compare({"a": {"success": True}}, {"b": {"success": True}})


def test_duplicate_rows_rejected(tmp_path):
    path = tmp_path / "obs.jsonl"
    path.write_text(json.dumps({"task_id": "x", "success": True}) + "\n" + json.dumps({"task_id": "x", "success": False}))
    with pytest.raises(BenchmarkError, match="duplicate"):
        load_observations(path)
