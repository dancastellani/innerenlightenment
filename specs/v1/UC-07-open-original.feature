@UC-07 @v1
Feature: Open the original on fonteviva.org

  @UC-07.1
  Scenario: Link to the source page
    Given I am viewing a message
    When I tap "Open on fonteviva.org"
    Then the message's original page opens in the browser
