@UC-18 @v2
Feature: Compare with the original

  @UC-18.1
  Scenario: Show the Portuguese original
    Given I am viewing a message in a language other than Portuguese
    When I tap "Original"
    Then the Portuguese title is shown under the translated title
    And each translated paragraph is followed by the same paragraph in Portuguese

  @UC-18.2
  Scenario: Hide the original again
    Given the Portuguese original is shown next to the translation
    When I tap "Original" again
    Then only the translation is shown

  @UC-18.3
  Scenario: Reading the original
    Given I am viewing a message in Portuguese
    Then the message is marked as the original language
    And there is no "Original" button

  # Edge cases

  @UC-18.4
  Scenario: The translation and the original have a different number of paragraphs
    Given the translation has 2 paragraphs and the original has 3
    When I tap "Original"
    Then the third Portuguese paragraph is shown at the end

  @UC-18.5
  Scenario: A message missing from the translation
    Given messages are shown in English
    And today's message has no English translation, so it is shown in Portuguese
    Then the message is marked as the original language
    And there is no "Original" button
