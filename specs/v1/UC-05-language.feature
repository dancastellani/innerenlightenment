@UC-05 @v1
Feature: Read the message in English or Portuguese

  @UC-05.1
  Scenario: English by default
    Given the phone language is not Portuguese
    When I open the app for the first time
    Then messages are shown in English

  @UC-05.2
  Scenario: Portuguese phone
    Given the phone language is Portuguese
    When I open the app for the first time
    Then messages are shown in Portuguese

  @UC-05.3
  Scenario: Switch language
    Given messages are shown in English
    When I choose "Português" in settings
    Then the current message is shown in Portuguese
    And scheduled notifications are rescheduled in Portuguese with the same messages

  @UC-05.4
  Scenario: Both bundled languages work offline
    Given the device has no network connection
    When I switch between English and Portuguese
    Then both languages are available
