@UC-20 @v1
Feature: Browse the messages by book
  The same index as the website's language page (OP-05.5): the books first, then each book's messages.

  @UC-20.1
  Scenario: Open the index
    Given I am viewing a message
    When I open the menu at the top right and tap "Index"
    Then I see the four books at the top: "Caminho Verdade e Vida", "Fonte Viva", "Pao Nosso" and "Vinha de Luz"

  @UC-20.8
  Scenario: The menu closes without opening anything
    Given I am viewing a message
    When I open the menu at the top right
    Then I see "Index" and "Settings"
    When I tap outside the menu, or press the phone's Back button
    Then the menu closes and I still see the message

  @UC-20.2
  Scenario: Pick a book
    Given I am on the index
    When I tap "Fonte Viva"
    Then I see the titles of the 181 messages of "Fonte Viva" in their book order

  @UC-20.3
  Scenario: Open a message from the index
    Given I see the messages of "Fonte Viva"
    When I tap a title
    Then that message is shown

  @UC-20.4
  Scenario: Go back
    Given I see the messages of "Fonte Viva"
    When I tap "Back"
    Then I see the books again
    And tapping "Back" again shows the message I was viewing

  @UC-20.9
  Scenario: Random message from one book
    Given I see the messages of "Fonte Viva"
    When I tap "Random message from this book"
    Then a message of "Fonte Viva" is shown

  # Edge cases

  @UC-20.5
  Scenario: Works offline
    Given the device has no network connection
    When I open the index and pick a book
    Then its messages are listed and open

  @UC-20.6
  Scenario: Another message after opening one from the index
    Given I opened message A from the index
    When I tap "Another message"
    Then a message other than A is shown

  @UC-20.7
  Scenario: The index does not change today's message
    Given I opened message A from the index
    When I open the app again later that day from today's notification
    Then today's message is shown, not A

  @UC-20.10
  Scenario: The random message never comes from another book
    Given I tap "Random message from this book" on "Fonte Viva" 50 times
    Then every message shown belongs to "Fonte Viva"
