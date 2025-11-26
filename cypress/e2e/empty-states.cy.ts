describe('Empty States', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('Homepage shows empty state when no lists exist', () => {
    // Should show empty state message
    cy.contains(/no word lists yet/i).should('be.visible');
    cy.contains(/create your first list/i).should('be.visible');

    // Should show create button
    cy.contains('button', /create new list/i).should('be.visible');
  });

  it('List detail shows empty state when no words exist', () => {
    // Create a list
    cy.createList('Empty List');

    // Navigate to the list
    cy.contains('Empty List').click();

    // Should show empty words state
    cy.contains(/no words yet/i).should('be.visible');
    cy.contains(/add your first word/i).should('be.visible');

    // Should show add word button
    cy.contains('button', /add word/i).should('be.visible');
  });

  it('Quiz button hidden when no words due', () => {
    // Create a list
    cy.createList('Test List');

    // Navigate to the list (empty)
    cy.contains('Test List').click();

    // Should not show quiz button when no words
    cy.contains('button', /start quiz/i).should('not.exist');

    // Should show 0 due for review
    cy.contains(/0/i).should('be.visible');
  });
});
