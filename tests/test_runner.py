import pytest
from devinstack.config import parse_workflow, WorkflowError
from devinstack.runner import run_workflow, save_json


def make_gate(*checks, fail_fast=True):
    return parse_workflow({"api_version": "devinstack.dev/v1alpha1", "kind": "RegressionWorkflow",
                           "metadata": {"name": "test-gate"},
                           "validation": {"fail_fast": fail_fast, "checks": list(checks)}})


def test_passing_unittest(tmp_path):
    tests = tmp_path / "tests"
    tests.mkdir()
    (tests / "test_ok.py").write_text("import unittest\nclass T(unittest.TestCase):\n def test_ok(self): self.assertEqual(2+2,4)\n")
    workflow = make_gate({"id": "tests", "kind": "unittest", "target": "tests"})
    report = run_workflow(workflow, tmp_path)
    assert report["status"] == "passed"
    assert report["summary"]["passed"] == 1
    out = tmp_path / "out.json"
    save_json(report, out)
    assert '"passed"' in out.read_text()


def test_failing_required_gate_skips_following_checks(tmp_path):
    tests = tmp_path / "tests"
    tests.mkdir()
    (tests / "test_bad.py").write_text("import unittest\nclass T(unittest.TestCase):\n def test_bad(self): self.assertEqual(1,2)\n")
    workflow = make_gate({"id": "failing", "kind": "unittest", "target": "tests"},
                         {"id": "later", "kind": "syntax", "target": "."})
    report = run_workflow(workflow, tmp_path)
    assert report["status"] == "failed"
    assert [x["status"] for x in report["checks"]] == ["failed", "skipped"]


def test_failing_optional_check_does_not_fail_gate(tmp_path):
    tests = tmp_path / "tests"
    tests.mkdir()
    (tests / "test_bad.py").write_text("import unittest\nclass T(unittest.TestCase):\n def test_bad(self): self.fail()\n")
    workflow = make_gate({"id": "optional", "kind": "unittest", "target": "tests", "required": False})
    assert run_workflow(workflow, tmp_path)["status"] == "passed"


def test_rejects_workspace_symlink_escape(tmp_path):
    outside = tmp_path.parent / "outside-target.txt"
    outside.write_text("hello")
    link = tmp_path / "escape"
    link.symlink_to(outside)
    workflow = make_gate({"id": "syntax", "kind": "syntax", "target": "escape"})
    with pytest.raises(WorkflowError, match="out-of-workspace"):
        run_workflow(workflow, tmp_path)
