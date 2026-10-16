@UC-07 @v1
Feature: Open the original on fonteviva.org

  @UC-07.1
  Scenario: Portuguese opens the original page
    Given the app language is Portuguese
    And I am viewing the message at "https://fonteviva.org/caminho-verdade-e-vida/filhos-e-servos/"
    When I tap "Open on fonteviva.org"
    Then "https://fonteviva.org/caminho-verdade-e-vida/filhos-e-servos/" opens in the browser

  @UC-07.2
  Scenario: English opens the page through Google Translate
    Given the app language is English
    And I am viewing the message at "https://fonteviva.org/caminho-verdade-e-vida/filhos-e-servos/"
    When I tap "Open on fonteviva.org"
    Then "https://fonteviva-org.translate.goog/caminho-verdade-e-vida/filhos-e-servos/?_x_tr_sl=pt&_x_tr_tl=en&_x_tr_hl=en&_x_tr_pto=wapp" opens in the browser
