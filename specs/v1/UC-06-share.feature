@UC-06 @v1
Feature: Share a message

  @UC-06.1
  Scenario: Share sheet
    Given I am viewing a message
    When I tap "Share"
    Then the system share sheet opens
    And the shared text contains the message title, body, signature and its fonteviva.org link
