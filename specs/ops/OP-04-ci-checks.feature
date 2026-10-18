@OP-04 @ops
Feature: Checks and jobs on GitHub Actions
  The workflows in .github/workflows check every change and update the content.

  @OP-04.1
  Scenario: Every pull request runs the tests and the specs
    Then the "Test" workflow runs on every pull request and every push to main
    And it runs "./run.sh test"

  @OP-04.3
  Scenario: The test report is shown on the workflow run's page
    Then the "Test" workflow writes the test output to the run's summary, also when a test failed

  @OP-04.4
  Scenario: Every test is listed in the pull request's Checks tab
    Then the "Test" workflow publishes the JUnit reports as a "Test report" check, also when a test failed

  @OP-04.5
  Scenario: The translation check report is shown on the workflow run's page
    Then the "Test" workflow writes the translation check report to the run's summary, also when a test failed

  @OP-04.2
  Scenario: The export is started by hand and proposes a pull request
    Then the "Export messages" workflow is started by hand
    And it opens a pull request that changes only "content/pt/messages.json"

  @OP-04.6
  Scenario: Every translated message is listed in the pull request's Checks tab
    Then the "Test" workflow publishes the translation checks as a "Translation report" check, also when a test failed
