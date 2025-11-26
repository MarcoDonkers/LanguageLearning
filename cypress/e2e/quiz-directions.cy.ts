describe('Quiz Direction Selection', () => {
  beforeEach(() => {
    cy.visit('/');

    // Setup: Create list and add words
    cy.createList('Direction Test', 'Testing quiz directions');
    cy.contains('Direction Test').click();

    cy.addWord('hallo', 'hello');
    cy.addWord('kat', 'cat');
    cy.addWord('hond', 'dog');
  });

  it('should default to Dutch→English direction', () => {
    // Verify Dutch→English is selected by default (has default variant class)
    cy.contains('button', /Dutch → English/i).should('exist');

    // Start quiz
    cy.contains('button', /start quiz/i).click();

    // Verify shows Dutch word and asks for English
    cy.contains(/translate to english/i).should('be.visible');

    // Check that one of the Dutch words is displayed
    cy.get('.text-5xl').invoke('text').then((text) => {
      expect(['hallo', 'kat', 'hond']).to.include(text.toLowerCase());
    });

    // Answer the first word correctly
    cy.get('.text-5xl').invoke('text').then((dutchWord) => {
      const answerMap: { [key: string]: string } = {
        'hallo': 'hello',
        'kat': 'cat',
        'hond': 'dog'
      };
      const answer = answerMap[dutchWord.toLowerCase()];

      cy.get('input[type="text"]').type(answer);
      cy.contains('button', /check answer/i).click();
      cy.contains(/correct/i).should('be.visible');
    });
  });

  it('should allow English→Dutch direction', () => {
    // Select English→Dutch
    cy.contains('button', /English → Dutch/i).click();

    // Start quiz
    cy.contains('button', /start quiz/i).click();

    // Verify shows English word and asks for Dutch
    cy.contains(/translate to dutch/i).should('be.visible');

    // Check that one of the English words is displayed
    cy.get('.text-5xl').invoke('text').then((text) => {
      expect(['hello', 'cat', 'dog']).to.include(text.toLowerCase());
    });

    // Answer the first word correctly
    cy.get('.text-5xl').invoke('text').then((englishWord) => {
      const answerMap: { [key: string]: string } = {
        'hello': 'hallo',
        'cat': 'kat',
        'dog': 'hond'
      };
      const answer = answerMap[englishWord.toLowerCase()];

      cy.get('input[type="text"]').type(answer);
      cy.contains('button', /check answer/i).click();
      cy.contains(/correct/i).should('be.visible');
    });
  });

  it('should handle mixed mode with random directions', () => {
    // Select Mixed mode
    cy.contains('button', /Mixed/i).click();

    // Start quiz
    cy.contains('button', /start quiz/i).click();

    // Answer all three words based on detected direction
    for (let i = 0; i < 3; i++) {
      cy.contains(/translate to/i).invoke('text').then((promptText) => {
        const isDutchToEnglish = promptText.toLowerCase().includes('english');

        // Get the displayed word
        cy.get('.text-5xl').invoke('text').then((displayedWord) => {
          const normalizedWord = displayedWord.trim().toLowerCase();

          // Determine the correct answer based on direction
          let answer: string;
          if (isDutchToEnglish) {
            // Dutch→English mapping
            const dutchToEnglish: { [key: string]: string } = {
              'hallo': 'hello',
              'kat': 'cat',
              'hond': 'dog'
            };
            answer = dutchToEnglish[normalizedWord] || '';
          } else {
            // English→Dutch mapping
            const englishToDutch: { [key: string]: string } = {
              'hello': 'hallo',
              'cat': 'kat',
              'dog': 'hond'
            };
            answer = englishToDutch[normalizedWord] || '';
          }

          // Type answer and submit
          cy.get('input[type="text"]').clear().type(answer);
          cy.contains('button', /check answer/i).click();
          cy.contains(/correct/i).should('be.visible');

          // Select difficulty to move to next word (or finish)
          cy.contains('button', /medium/i).click();
        });
      });
    }

    // After quiz completes, verify we're back at list page
    cy.url().should('match', /\/lists\/\d+$/);
  });

  it('should validate answers correctly for English→Dutch', () => {
    // Select English→Dutch
    cy.contains('button', /English → Dutch/i).click();
    cy.contains('button', /start quiz/i).click();

    // Submit wrong answer - use placeholder to find the right input
    cy.get('input[placeholder*="Type your answer"]').type('wrong');
    cy.contains('button', /check answer/i).click();

    // Should show incorrect feedback
    cy.contains(/not quite/i).should('be.visible');

    // Should show the correct answer (Dutch word)
    cy.contains(/correct answer/i).should('be.visible');
  });

  it('should complete full quiz in all three modes', () => {
    const modes = [
      { button: 'Dutch → English', count: 3 },
      { button: 'English → Dutch', count: 3 },
      { button: 'Mixed', count: 3 }
    ];

    modes.forEach((mode, modeIndex) => {
      if (modeIndex > 0) {
        // Go back home and recreate list with fresh words
        cy.visit('/');
        cy.contains('Direction Test').click();

        // Add new words for the next test
        cy.addWord(`word${modeIndex}a`, `translation${modeIndex}a`);
        cy.addWord(`word${modeIndex}b`, `translation${modeIndex}b`);
        cy.addWord(`word${modeIndex}c`, `translation${modeIndex}c`);
      }

      // Select mode
      cy.contains('button', mode.button).click();
      cy.contains('button', /start quiz/i).click();

      // Complete all words
      for (let i = 0; i < mode.count; i++) {
        // Detect direction and answer correctly
        cy.contains(/translate to/i).invoke('text').then((promptText) => {
          const isDutchToEnglish = promptText.toLowerCase().includes('english');

          cy.get('.text-5xl').invoke('text').then((displayedWord) => {
            const normalizedWord = displayedWord.trim().toLowerCase();

            let answer: string;
            if (isDutchToEnglish) {
              // Dutch to English mapping
              const dutchToEnglish: { [key: string]: string } = {
                'hallo': 'hello',
                'kat': 'cat',
                'hond': 'dog',
                'word1a': 'translation1a',
                'word1b': 'translation1b',
                'word1c': 'translation1c',
                'word2a': 'translation2a',
                'word2b': 'translation2b',
                'word2c': 'translation2c'
              };
              answer = dutchToEnglish[normalizedWord] || 'test';
            } else {
              // English to Dutch mapping
              const englishToDutch: { [key: string]: string } = {
                'hello': 'hallo',
                'cat': 'kat',
                'dog': 'hond',
                'translation1a': 'word1a',
                'translation1b': 'word1b',
                'translation1c': 'word1c',
                'translation2a': 'word2a',
                'translation2b': 'word2b',
                'translation2c': 'word2c'
              };
              answer = englishToDutch[normalizedWord] || 'test';
            }

            cy.get('input[placeholder*="Type your answer"]').clear().type(answer);
            cy.contains('button', /check answer/i).click();
            cy.contains('button', /medium/i).click();
          });
        });
      }

      // Should redirect back to list
      cy.url().should('match', /\/lists\/\d+$/);
    });
  });

  it('should show correct prompt text for each direction', () => {
    // Test Dutch → English
    cy.contains('button', /start quiz/i).click();
    cy.contains(/translate to english/i).should('be.visible');
    cy.visit('/');
    cy.contains('Direction Test').click();

    // Test English → Dutch
    cy.contains('button', /English → Dutch/i).click();
    cy.contains('button', /start quiz/i).click();
    cy.contains(/translate to dutch/i).should('be.visible');
    cy.visit('/');
    cy.contains('Direction Test').click();

    // Test Mixed (should show one or the other)
    cy.contains('button', /Mixed/i).click();
    cy.contains('button', /start quiz/i).click();
    cy.contains(/translate to (english|dutch)/i).should('be.visible');
  });
});
