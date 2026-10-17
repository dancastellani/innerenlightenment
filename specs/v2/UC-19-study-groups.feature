@UC-19 @v2
Feature: Find a study group

  @UC-19.1
  Scenario: See study groups
    Given I am in the app
    When I tap "Study groups" under the message
    Then I see links to innerenlightenment.com, spiritist.us and tssfederation.org
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
    When I tap "Grupos de estudo" under the message
    Then the screen is titled "Grupos de estudo" and says the organizations meet in person and online

  @UC-19.4
  Scenario: Back to the message
    Given I am on "Study groups"
    When I tap "Back"
    Then the message I was reading is shown again
