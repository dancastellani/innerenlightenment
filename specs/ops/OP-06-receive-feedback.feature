@OP-06 @v2 @pending
Feature: Receive feedback and turn translation reports into fixes

  @OP-06.1
  Scenario: A valid report opens an issue
    Given the backend receives feedback of type "translation" with language, message id and comment
    Then an issue labelled "feedback" and "feedback:translation" is opened with those details

  @OP-06.2
  Scenario: Missing or oversized fields
    Given feedback with no comment, a comment over 1000 characters, an unknown type, or a translation report with an unknown language
    Then the backend refuses it and opens no issue

  @OP-06.3
  Scenario: Too many reports
    Given one address sends more reports than the limit in a minute
    Then the extra ones are refused

  @OP-06.4
  Scenario: The token never leaves the backend
    Given the app, website and repository
    Then none of them contains the GitHub token

  @OP-06.5
  Scenario: A valid translation report is fixed
    Given a "feedback:translation" issue is right about a translation
    When the message is corrected in content/<lang>/messages.json
    Then the data-only PR says "Fixes" the issue

  @OP-06.6
  Scenario: A report about Portuguese
    Given a report is about a Portuguese message
    Then pt/messages.json is not edited

  @OP-06.7
  Scenario: A fix survives re-translation
    Given a message was corrected by hand
    When the translate script runs again
    Then the corrected message is kept

  @OP-06.8
  Scenario: A new type is added
    Given the backend's list of types gets a new type
    Then feedback of that type opens an issue labelled "feedback:<type>" with no other backend change
