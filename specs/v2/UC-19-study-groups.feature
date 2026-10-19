@UC-19 @v2
Feature: Find a study group

  @UC-19.1
  Scenario: See study groups
    Given I am in the app
    When I open the menu at the top right and tap "Study groups"
    Then I see a button for the Inner Enlightenment Spiritist Society in NYC, the Tri-State Spiritist Federation and the United States Spiritist Federation
    And each says it holds in-person and online meetings

  @UC-19.2
  Scenario: Open an organization
    Given I am on "Study groups"
    When I tap an organization
    Then its website opens in the browser

  # Edge cases

  @UC-19.3
  Scenario: In Portuguese
    Given messages are shown in Portuguese
    When I open the menu at the top right and tap "Grupos de estudo"
    Then the screen is titled "Grupos de estudo" and says the organizations meet in person and online

  @UC-19.4
  Scenario: Back to the message
    Given I am on "Study groups"
    When I tap "Back"
    Then the message I was reading is shown again

  @UC-19.5
  Scenario: The menu is at the top right of this screen too
    Given I am on "Study groups"
    When I tap the menu at the top right and then "Settings"
    Then the "Settings" screen is shown
