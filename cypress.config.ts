import { defineConfig } from 'cypress';
import path from 'path';
import fs from 'fs';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3001',
    setupNodeEvents(on, config) {
      // Database reset task
      on('task', {
        async resetDatabase() {
          // Instead of deleting the database file (which causes locks on Windows),
          // we'll make an API call to reset it
          try {
            const response = await fetch('http://localhost:3001/api/test/reset', {
              method: 'POST',
            });

            if (!response.ok) {
              throw new Error(`Failed to reset database: ${response.statusText}`);
            }

            return null;
          } catch (error) {
            console.error('Database reset error:', error);
            throw error;
          }
        },
      });
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.ts',
  },
  env: {
    TEST_DB_PATH: './data/test.db',
  },
  video: false,
  screenshotOnRunFailure: true,
  defaultCommandTimeout: 10000,
  viewportWidth: 1280,
  viewportHeight: 720,
});
