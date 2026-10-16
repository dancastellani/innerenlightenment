@UC-19 @v2
Feature: Find a study group

  @UC-19.1
  Scenario: See study groups
    Given I am in the app
    When I open "Study groups"
    Then I see links to innerenlightenment.com, spiritist.us and tssfederation.org
    And each says it holds in-person and online meetings

  @UC-19.2
  Scenario: Open an organization
    Given I am on "Study groups"
    When I tap an organization
    Then its website opens in the browser
