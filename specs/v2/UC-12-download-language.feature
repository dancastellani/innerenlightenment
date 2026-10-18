@UC-12 @v2
Feature: Download another language

  @UC-12.1
  Scenario: See every language
    When I open the language choice in settings
    Then I see English, Português, Español and Français
    And the languages that are not in the app say they will be downloaded

  @UC-12.2
  Scenario: Choose a language that is not in the app
    Given messages are shown in English
    When I choose "Español" in settings
    Then the Spanish messages are downloaded once and saved on the phone
    And the current message is shown in Spanish
    And scheduled notifications are rescheduled in Spanish with the same messages

  @UC-12.3
  Scenario: A downloaded language works offline
    Given Spanish was downloaded
    And the device has no network connection
    When I open the app or choose "Español" again
    Then messages are shown in Spanish without downloading them again

  # Edge cases

  @UC-12.4
  Scenario: No network when choosing a language
    Given messages are shown in English
    And the device has no network connection
    When I choose "Español" in settings
    Then I am told the language could not be downloaded and to try again when online
    And messages are still shown in English

  @UC-12.5
  Scenario: The download is cut off
    Given the Spanish download stops before it finishes
    Then nothing broken is saved and messages are still shown in English
    And choosing "Español" again downloads it again

  @UC-12.6
  Scenario: Built-in languages need no download
    Given the device has no network connection
    When I choose "English" or "Português" in settings
    Then the language changes without downloading anything

  @UC-12.7
  Scenario: A downloaded language that is missing a message
    Given messages are shown in Spanish
    And today's message has no Spanish translation
    When I open the app
    Then today's message is shown in Portuguese

  @UC-12.8
  Scenario: The saved language file is gone
    Given messages were shown in Spanish
    And the saved Spanish file was removed from the phone
    When I open the app offline
    Then messages are shown in English

  @UC-12.9
  Scenario: A downloaded language brings its own menu, buttons and notices
    Given Spanish is downloaded
    When I choose it and open the menu and settings
    Then they are in Spanish, and a text its file lacks is in English (UC-05.9)
