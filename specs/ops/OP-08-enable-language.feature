@OP-08 @ops
Feature: Enable a language
  A language folder content/<lang>/ is only checked, built into the website and offered in the app once it is
  in content/languages.json. "./run.sh enable <lang> <name>" adds it there, but only if the checks pass.

  Background:
    Given a content folder where only "pt" and "en" are enabled and "es" is ready

  @OP-08.1
  Scenario: A language that passes the checks is enabled
    When I enable "es" as "Español"
    Then it succeeds
    And languages.json lists "es" with the name "Español"

  @OP-08.2
  Scenario: A language with a problem is not enabled
    Given the "es" folder is missing its last message
    When I enable "es" as "Español"
    Then it fails
    And languages.json does not list "es"

  @OP-08.3
  Scenario: A language folder that is not enabled does not fail the checks
    Given the "es" folder is missing its last message
    When I run the translation check on the content folder
    Then it succeeds

  @OP-08.4
  Scenario: A language without a folder is refused
    When I enable "it" as "Italiano"
    Then it fails with "it/messages.json does not exist"

  @OP-08.5
  Scenario: A language that is already enabled is refused
    When I enable "en" as "English"
    Then it fails with "en is already enabled"

  @OP-08.6
  Scenario: A language folder that is not enabled is left out of the website
    Given the "es" folder is missing its last message
    When I build the website from the content folder
    Then it succeeds
    And the website has no "es" pages
