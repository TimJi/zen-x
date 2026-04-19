## Purpose

Define the GitHub Actions workflow that monitors X.com DOM compatibility daily — scheduling, failure-to-issue conversion, and recovery-to-close behavior.

## Requirements

### Requirement: Daily scheduled GitHub Action
The CI workflow SHALL run the test suite once per day on a cron schedule. It SHALL also be triggerable manually via workflow_dispatch.

#### Scenario: Daily cron execution
- **WHEN** the cron schedule triggers (once per day)
- **THEN** the workflow SHALL install Playwright, run all tests, and report results

#### Scenario: Manual trigger
- **WHEN** a developer triggers the workflow manually
- **THEN** the workflow SHALL run the same test suite immediately

### Requirement: Auto-create Issue on failure
When tests fail, the workflow SHALL search for an existing open Issue with title containing `[ZenX Monitor]`. If none exists, it SHALL create a new Issue with the failure details. If one already exists, it SHALL add a comment with the latest failure details.

#### Scenario: First failure (no existing Issue)
- **WHEN** tests fail and no open `[ZenX Monitor]` Issue exists
- **THEN** the workflow SHALL create a new Issue titled `[ZenX Monitor] DOM compatibility check failed` with the list of failing selectors/tests

#### Scenario: Repeated failure (existing Issue)
- **WHEN** tests fail and an open `[ZenX Monitor]` Issue already exists
- **THEN** the workflow SHALL add a comment to the existing Issue with the latest failure details and date

### Requirement: Auto-close Issue on recovery
When tests pass after a previous failure, the workflow SHALL search for open `[ZenX Monitor]` Issues and close them with a comment indicating recovery.

#### Scenario: Tests recover
- **WHEN** tests pass and an open `[ZenX Monitor]` Issue exists
- **THEN** the workflow SHALL close the Issue with a comment: "Recovered — all selectors and injection tests passing"
