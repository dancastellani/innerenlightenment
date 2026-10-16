@UC-18 @v2
Feature: Compare with the original

  @UC-18.1
  Scenario: Show the Portuguese original
    Given I am viewing a message in a language other than Portuguese
    When I tap "Original"
    Then the Portuguese text of the same message is shown next to the translation

  @UC-18.2
  Scenario: Hide the original again
    Given the Portuguese original is shown next to the translation
    When I tap "Original" again
    Then only the translation is shown

  @UC-18.3
  Scenario: Not offered in Portuguese
    Given I am viewing a message in Portuguese
    Then there is no "Original" button
