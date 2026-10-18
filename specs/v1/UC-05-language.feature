@UC-05 @v1
Feature: Read the message in English or Portuguese

  @UC-05.1
  Scenario: English by default
    Given I have not chosen a language
    When I open the app for the first time
    Then messages are shown in English

  @UC-05.2
  Scenario: A saved choice is kept
    Given I chose "Português" in settings
    When I open the app again
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

  @UC-05.8
  Scenario: Translations say they were made by AI, without guarantee, in the one disclaimer
    Given messages are shown in English
    Then the message has one disclaimer, in English: the messages come from fonteviva.org and the project is not liable for them
    And the disclaimer adds that the message was translated from the Portuguese original by AI and is provided without guarantee
    And a message shown in Portuguese has the disclaimer without the translation part

  @UC-05.9
  Scenario: The selected language is shown
    Given messages are shown in English
    When I open the language choice in settings
    Then "English" is marked as the selected language
    And tapping it again keeps the current screen

  @UC-05.8
  Scenario: The app's text follows the language
    Given messages are shown in Portuguese
    When I open the menu and settings
    Then the menu, buttons and notices are in Portuguese

  # Edge cases

  @UC-05.5
  Scenario: A Portuguese phone
    Given the phone language is Portuguese ("pt-PT" or "pt-BR")
    When I open the app for the first time
    Then messages are shown in English
    And "Português" is one tap away in settings

  @UC-05.6
  Scenario: A language the app does not have yet
    Given the phone language is Spanish
    When I open the app for the first time
    Then messages are shown in English

  @UC-05.7
  Scenario: A message missing from the translation
    Given messages are shown in English
    And today's message has no English translation
    When I open the app
    Then today's message is shown in Portuguese

  @UC-05.9
  Scenario: A text missing from the language package
    Given the language package lacks the text of a button
    When I open the screen with that button
    Then the button shows its English text

  @UC-05.10
  Scenario: Book names are shown in the selected language (#115)
    Given messages are shown in English
    When I open the index, and a message
    Then the books are named "The Way, the Truth and the Life", "Living Spring", "Our Daily Bread" and "Vineyard of Light"
    And the message shows its book name in English above its chapter
    And in Portuguese they are "Caminho Verdade e Vida", "Fonte Viva", "Pao Nosso" and "Vinha de Luz"

  @UC-05.11
  Scenario: A book without a translated name is shown in Portuguese
    Given a new book is in content/pt.json but its name is not translated yet
    When messages are shown in English
    Then that book is shown with its Portuguese name, and never without a name
