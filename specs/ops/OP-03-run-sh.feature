@OP-03 @ops
Feature: Run common tasks with run.sh
  run.sh is the shortcut for the commands used most during development.

  @OP-03.1
  Scenario: Without a command it lists the commands
    When I run "./run.sh"
    Then it lists the commands "test", "export", "translate" and "app"

  @OP-03.2
  Scenario: Node older than 24 is refused
    Given the installed Node is version 22
    When I run "./run.sh test"
    Then it fails with "Node 24 or newer is required"

  @OP-03.3
  Scenario: The test command runs the tests and the specs
    Given Cucumber is replaced by a stand-in, so these specs don't start themselves
    When I run "./run.sh test"
    Then it succeeds
    And it reports that no test failed
    And it starts Cucumber on "specs/ops"

  @OP-03.4
  Scenario: The build command builds the Android preview by default
    Given npm and Expo are replaced by stand-ins, so nothing is installed or built
    When I run "./run.sh build"
    Then it succeeds
    And it starts an Expo build of the Android app with the "preview" profile

  @OP-03.5
  Scenario: The build command builds the Play Store version when asked
    Given npm and Expo are replaced by stand-ins, so nothing is installed or built
    When I run "./run.sh build production"
    Then it succeeds
    And it starts an Expo build of the Android app with the "production" profile
