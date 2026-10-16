@UC-06 @v1
Feature: Share a message

  @UC-06.1
  Scenario: Share sheet
    Given I am viewing a message
    When I tap "Share"
    Then the system share sheet opens
    And the shared text contains the message title, body, signature and its fonteviva.org link

  # Edge cases

  @UC-06.2
  Scenario: Message without a signature
    Given I am viewing a message that has no signature
    When I tap "Share"
    Then the shared text has the title, body and link, with no empty line or "null" for the signature

  @UC-06.3
  Scenario: Share cancelled
    Given the share sheet is open
    When I close it without choosing an app
    Then I am back on the same message and nothing else changes
