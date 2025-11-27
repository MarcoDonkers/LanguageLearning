describe('Delete Word List', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should allow creating and then deleting a list', () => {
        const listName = 'List to Delete ' + Date.now();

        // Create a list
        cy.contains('Create New List').click();
        cy.get('input[placeholder*="List name"]').type(listName);
        cy.contains('button', 'Create List').click();

        // Verify list exists
        cy.contains(listName).should('be.visible');

        // Find the delete button for this specific list
        // The delete button is hidden until hover, but we can force click it or hover
        cy.contains(listName)
            .parents('.group')
            .find('button[aria-label="Delete list"]')
            .click({ force: true }); // force: true because it might be hidden by opacity-0

        // Verify confirmation modal appears
        cy.contains('Delete List?').should('be.visible');
        cy.contains('Are you sure you want to delete').should('be.visible');
        cy.contains(listName).should('be.visible');

        // Click Cancel
        cy.contains('button', 'Cancel').click();

        // Verify modal is gone and list still exists
        cy.contains('Delete List?').should('not.exist');
        cy.contains(listName).should('be.visible');

        // Click delete again
        cy.contains(listName)
            .parents('.group')
            .find('button[aria-label="Delete list"]')
            .click({ force: true });

        // Click Delete List
        cy.contains('button', 'Delete List').click();

        // Verify list is gone
        cy.contains(listName).should('not.exist');
    });
});
