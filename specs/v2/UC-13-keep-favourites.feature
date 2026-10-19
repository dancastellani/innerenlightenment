@UC-13 @v2
Feature: Keep favourites

  @UC-13.1
  Scenario: Mark a message as favourite
    Given I am viewing a message that is not a favourite
    When I tap the star next to the message title
    Then the star is filled and its label says "Remove from favourites"
    And the message is saved on the device

  @UC-13.2
  Scenario: Find a favourite later
    Given I have marked two messages as favourites
    When I open the menu at the top right and tap "Favourites"
    Then I see the titles of both, in the order I added them
    When I tap a title
    Then that message is shown

  @UC-13.3
  Scenario: Remove a favourite
    Given I am viewing a message that is a favourite
    When I tap the filled star next to the message title
    Then the star is empty and its label says "Add to favourites"
    And the message is no longer in the "Favourites" list

  @UC-13.4
  Scenario: On the website
    Given I am reading a message on the website
    When I tap the star next to the title and open "Favourites" from the menu
    Then the message is listed, and the list is saved in the browser, not on a server

  # Edge cases

  @UC-13.5
  Scenario: No favourites yet
    Given I have no favourites
    When I open "Favourites"
    Then I am told there are no favourites yet and how to add one

  @UC-13.6
  Scenario: Favourites stay after the app is closed and opened again
    Given I have marked a message as favourite
    When I close the app and open it again
    Then the message is still in the "Favourites" list

  @UC-13.7
  Scenario: Favourites in another language
    Given I have marked a message as favourite in English
    When I switch to Portuguese
    Then the "Favourites" list shows its title in Portuguese

  @UC-13.8
  Scenario: A favourite whose translation is missing
    Given a favourite has no translation in the chosen language
    Then the "Favourites" list shows its English title, in the app and on the website
    And on the website the title links to the English page

  @UC-13.9
  Scenario: Favourites cannot be saved
    Given the device or the browser refuses to save data
    When I tap the star
    Then I am told "Could not save. Try again later."
    And the star stays as it was, and the page keeps working
