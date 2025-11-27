describe('Sort Words in List', () => {
    beforeEach(() => {
        cy.visit('/');
    });

    it('should sort words by different columns', () => {
        const listName = 'Sorting Test List ' + Date.now();

        // Create a list
        cy.contains('Create New List').click();
        cy.get('input[placeholder*="List name"]').type(listName);
        cy.contains('button', 'Create List').click();

        // Open the list
        cy.contains(listName).click();

        // Add words
        // Word A: Apple (English: Apple)
        cy.contains('Add Word').click();
        cy.get('input[placeholder="Dutch word"]').type('Appel');
        cy.get('input[placeholder="English translation"]').type('Apple');
        cy.contains('button', 'Add Word').click();

        // Word B: Banana (English: Banaan)
        cy.contains('Add Word').click();
        cy.get('input[placeholder="Dutch word"]').type('Banaan');
        cy.get('input[placeholder="English translation"]').type('Banana');
        cy.contains('button', 'Add Word').click();

        // Word C: Cherry (English: Kers)
        cy.contains('Add Word').click();
        cy.get('input[placeholder="Dutch word"]').type('Kers');
        cy.get('input[placeholder="English translation"]').type('Cherry');
        cy.contains('button', 'Add Word').click();

        // Verify default order (Dutch Ascending): Appel, Banaan, Kers
        cy.get('tbody tr').should('have.length', 3);
        cy.get('tbody tr').eq(0).should('contain', 'Appel');
        cy.get('tbody tr').eq(1).should('contain', 'Banaan');
        cy.get('tbody tr').eq(2).should('contain', 'Kers');

        // Sort by Dutch Descending
        cy.contains('th', 'Dutch').click();
        // Wait for sort to apply (checking first item changes is usually enough)
        cy.get('tbody tr').eq(0).should('contain', 'Kers');
        cy.get('tbody tr').eq(1).should('contain', 'Banaan');
        cy.get('tbody tr').eq(2).should('contain', 'Appel');

        // Sort by English Ascending
        cy.contains('th', 'English').click();
        cy.get('tbody tr').eq(0).should('contain', 'Apple'); // Appel
        cy.get('tbody tr').eq(1).should('contain', 'Banana'); // Banaan
        cy.get('tbody tr').eq(2).should('contain', 'Cherry'); // Kers

        // Sort by English Descending
        cy.contains('th', 'English').click();
        cy.get('tbody tr').eq(0).should('contain', 'Cherry');
        cy.get('tbody tr').eq(1).should('contain', 'Banana');
        cy.get('tbody tr').eq(2).should('contain', 'Apple');
    });
});
