/// <reference types="cypress" />

// Custom commands for the language learning app

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to create a word list
       * @example cy.createList('My List', 'Description')
       */
      createList(name: string, description?: string): Chainable<void>;

      /**
       * Custom command to add a word to the current list
       * @example cy.addWord('hallo', 'hello')
       */
      addWord(dutchWord: string, englishTranslation: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('createList', (name: string, description?: string) => {
  cy.contains('button', /create new list/i).click();
  cy.get('input[placeholder*="List name"]').type(name);
  if (description) {
    cy.get('input[placeholder*="Description"]').type(description);
  }
  cy.contains('button', /^create list$/i).click();
});

Cypress.Commands.add('addWord', (dutchWord: string, englishTranslation: string) => {
  cy.contains('button', /add word/i).first().click();
  cy.get('input[placeholder*="Dutch word"]').type(dutchWord);
  cy.get('input[placeholder*="English translation"]').type(englishTranslation);
  cy.contains('button', /^add word$/i).click();
});

export {};
