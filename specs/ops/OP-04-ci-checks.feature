@OP-04 @ops
Feature: Checks and jobs on GitHub Actions
  The workflows in .github/workflows check every change and update the content.

  @OP-04.1
  Scenario: Every pull request runs the tests and the specs
    Then the "Test" workflow runs on every pull request and every push to main
    And it runs "./run.sh test" and "./run.sh specs"

  @OP-04.2
  Scenario: The export is started by hand and proposes a pull request
    Then the "Export messages" workflow is started by hand
    And it opens a pull request that changes only "content/pt.json"
