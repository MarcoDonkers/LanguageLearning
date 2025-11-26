// Import commands
import './commands';

// Add custom Cypress configuration or global hooks here
beforeEach(() => {
  // Reset database before each test
  cy.task('resetDatabase');
});
