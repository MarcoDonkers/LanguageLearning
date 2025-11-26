describe('Happy Path - Complete User Journey', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Complete flow: create list, add words, take quiz, verify progress', () => {
    // 1. Visit homepage (empty state)
    cy.contains(/no word lists yet/i).should('be.visible');

    // 2. Create a new word list
    cy.createList('Basic Phrases', 'Essential everyday phrases');

    // Verify list appears on homepage
    cy.contains('Basic Phrases').should('be.visible');

    // 3. Navigate to list details
    cy.contains('Basic Phrases').click();
    cy.url().should('match', /\/lists\/\d+/);
    cy.contains('h1', 'Basic Phrases').should('be.visible');

    // 4. Add first word: hallo/hello
    cy.addWord('hallo', 'hello');

    // Verify word appears in table
    cy.contains('td', 'hallo').should('be.visible');
    cy.contains('td', 'hello').should('be.visible');

    // 5. Add second word: kat/cat
    cy.addWord('kat', 'cat');

    // 6. Add third word: hond/dog
    cy.addWord('hond', 'dog');

    // Verify all three words are displayed
    cy.contains('td', 'hallo').should('be.visible');
    cy.contains('td', 'kat').should('be.visible');
    cy.contains('td', 'hond').should('be.visible');

    // 7. Verify statistics show 3 words due for review
    cy.contains(/3/i).should('be.visible');

    // 8. Start quiz
    cy.contains('button', /start quiz/i).click();
    cy.url().should('match', /\/quiz$/);

    // 9-11. Answer all three words
    const answerMap: { [key: string]: string } = {
      'hallo': 'hello',
      'kat': 'cat',
      'hond': 'dog'
    };

    const difficulties = ['easy', 'medium', 'hard'];

    for (let i = 0; i < 3; i++) {
      // Find which Dutch word is being displayed
      cy.get('.text-5xl').invoke('text').then((dutchWord) => {
        const normalizedWord = dutchWord.trim().toLowerCase();
        const answer = answerMap[normalizedWord];

        // Type the answer
        cy.get('input[type="text"]').clear().type(answer);
        cy.contains('button', /check answer/i).click();

        // Verify correct feedback
        cy.contains(/correct/i).should('be.visible');

        // Select difficulty based on iteration
        cy.contains('button', new RegExp(difficulties[i], 'i')).click();
      });
    }

    // 12. Quiz completes and redirects to list
    cy.url().should('match', /\/lists\/\d+$/);

    // 13. Verify statistics have updated
    cy.contains(/total/i).should('be.visible');

    // 14. Return to homepage
    cy.contains('button', /back to lists/i).click();
    cy.url().should('eq', Cypress.config().baseUrl + '/');

    // Verify list still exists
    cy.contains('Basic Phrases').should('be.visible');
  });
});
