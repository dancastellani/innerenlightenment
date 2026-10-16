@OP-03 @ops
Feature: Run common tasks with run.sh
  run.sh is the shortcut for the commands used most during development.

  @OP-03.1
  Scenario: Without a command it lists the commands
    When I run "./run.sh"
    Then it lists the commands "test", "specs" and "export"

  @OP-03.2
  Scenario: Node older than 24 is refused
    Given the installed Node is version 22
    When I run "./run.sh test"
    Then it fails with "Node 24 or newer is required"

  @OP-03.3
  Scenario: The test command runs the tests
    When I run "./run.sh test"
    Then it succeeds
    And it reports that no test failed
