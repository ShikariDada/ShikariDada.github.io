# Security and limitations

**This is a local proof of concept, not a production execution sandbox.**

- YAML defines only known check types, not shell scripts or arbitrary argv.
- Targets are restricted to existing paths within the workspace. Paths using
  `..`, absolute paths, leading flags, and resolved symlink escapes are denied.
- Commands use `subprocess.run(..., shell=False, stdin=DEVNULL)` with timeouts;
  logs are truncated. The `pytest` and `unittest` check kinds nonetheless run
  arbitrary test code present in the checkout: **only verify trusted code**.
- A workspace containing malicious Python code can still access local files,
  network and environment secrets. For untrusted PRs, use ephemeral locked-down
  containers or VMs, token minimization, pinned dependencies and network policy.
- Don't place GitHub or Devin API keys in workflows or committed files.
- No GitHub authentication, Devin credentials, PR auto-merge or cloud billing
  appears in the POC. All these need separate audited implementation.
- CI runs on the repository itself; do not blindly grant elevated token rights
  to PR-originated code.

To report a security issue, open a GitHub issue without including secrets.
