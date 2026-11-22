"""Strict, intentionally small workflow contract. YAML cannot define shell commands."""
from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
import re
import yaml

KINDS = {"syntax", "unittest", "pytest"}
ID_PATTERN = re.compile(r"^[a-z][a-z0-9-]{0,62}$")


class WorkflowError(ValueError):
    """A workflow is malformed or attempts an unsupported operation."""


@dataclass(frozen=True)
class Check:
    id: str
    kind: str
    target: str
    required: bool
    timeout_seconds: int


@dataclass(frozen=True)
class Workflow:
    name: str
    checks: tuple[Check, ...]
    fail_fast: bool


def _only_keys(value: dict, allowed: set[str], label: str) -> None:
    unknown = set(value) - allowed
    if unknown:
        raise WorkflowError(f"Unsupported {label} fields: {', '.join(sorted(map(str, unknown)))}")


def parse_workflow(raw: object) -> Workflow:
    if not isinstance(raw, dict):
        raise WorkflowError("Workflow must be a mapping")
    _only_keys(raw, {"api_version", "kind", "metadata", "validation"}, "workflow")
    if raw.get("api_version") != "devinstack.dev/v1alpha1" or raw.get("kind") != "RegressionWorkflow":
        raise WorkflowError("Expected devinstack.dev/v1alpha1 RegressionWorkflow")
    metadata, validation = raw.get("metadata"), raw.get("validation")
    if not isinstance(metadata, dict) or not isinstance(validation, dict):
        raise WorkflowError("metadata and validation must be mappings")
    _only_keys(metadata, {"name", "description"}, "metadata")
    _only_keys(validation, {"checks", "fail_fast"}, "validation")
    name = metadata.get("name")
    if not isinstance(name, str) or not ID_PATTERN.fullmatch(name):
        raise WorkflowError("metadata.name must be a lowercase slug")
    fail_fast = validation.get("fail_fast", True)
    if not isinstance(fail_fast, bool):
        raise WorkflowError("validation.fail_fast must be boolean")
    incoming = validation.get("checks")
    if not isinstance(incoming, list) or not incoming or len(incoming) > 30:
        raise WorkflowError("validation.checks needs 1–30 checks")
    checks, seen = [], set()
    for item in incoming:
        if not isinstance(item, dict):
            raise WorkflowError("Each check must be a mapping")
        _only_keys(item, {"id", "kind", "target", "required", "timeout_seconds"}, "check")
        identifier, kind, target = item.get("id"), item.get("kind"), item.get("target")
        if not isinstance(identifier, str) or not ID_PATTERN.fullmatch(identifier) or identifier in seen:
            raise WorkflowError(f"Invalid or duplicate check ID: {identifier}")
        seen.add(identifier)
        if kind not in KINDS:
            raise WorkflowError(f"Unsupported check kind for {identifier}: {kind}")
        if not isinstance(target, str) or not target or target.startswith(("/", "~")):
            raise WorkflowError(f"Invalid target for {identifier}")
        # Reject attempts to pass CLI flags or escape a working tree.
        segments = Path(target).parts
        if any(seg in {"..", "."} for seg in segments) or target.startswith("-") or "\\" in target or "\x00" in target:
            raise WorkflowError(f"Unsafe target for {identifier}")
        required, timeout = item.get("required", True), item.get("timeout_seconds", 45)
        if not isinstance(required, bool) or type(timeout) is not int or not (1 <= timeout <= 300):
            raise WorkflowError(f"Invalid required/timeout for {identifier}")
        checks.append(Check(identifier, kind, target, required, timeout))
    return Workflow(name, tuple(checks), fail_fast)


def load_workflow(path: str | Path) -> Workflow:
    try:
        return parse_workflow(yaml.safe_load(Path(path).read_text(encoding="utf-8")))
    except yaml.YAMLError as exc:
        raise WorkflowError(f"Invalid YAML: {exc}") from exc
