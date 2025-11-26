# Dutch Learning App 🐱🧋

A cute, cat and bubble tea themed language learning web application designed to help learn Dutch vocabulary using spaced repetition.

## Features

- **Word List Management**: Create and organize multiple word lists
- **CRUD Operations**: Add, edit, delete, and search words
- **Smart Quiz System**: Quiz yourself on words that are due for review
- **Spaced Repetition**: Intelligent algorithm with custom intervals
  - Hard: 5 minutes
  - Medium: 30 minutes
  - Easy: 1 hour (with 4x multiplier for future reviews)
- **Progress Tracking**: See your statistics and mastery level
- **Cute Design**: Cat and bubble tea themed UI
- **Mobile Responsive**: Works on all devices

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: SQLite with better-sqlite3
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Creating a Word List

1. Click "Create New List" on the home page
2. Enter a name and optional description
3. Click "Create List"

### Adding Words

1. Click on a word list to open it
2. Click "Add Word"
3. Enter the Dutch word and English translation
4. Click "Add Word"

### Taking a Quiz

1. Open a word list
2. Click "Start Quiz" (only visible if words are due)
3. Type the English translation
4. Select difficulty: Hard, Medium, or Easy
   - **Easy**: Multiplies future intervals by 4x
5. Continue until all due words are reviewed

### Spaced Repetition

The app uses a custom spaced repetition algorithm:

- **Initial intervals**: Based on difficulty selected
- **Progressive difficulty**: Selecting "Easy" multiplies all future intervals by 4
- **Exponential growth**: Words you've mastered appear less and less frequently
- **Smart scheduling**: Words appear again based on your performance

## Database

The database is stored locally in `data/database.db`. It contains:

- `word_lists`: Your word lists
- `words`: All words with spaced repetition tracking

## Build for Production

```bash
npm run build
npm start
```

## Development

The project structure:

```
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── lists/             # List pages
│   └── page.tsx           # Home page
├── components/            # React components
│   └── ui/                # UI components
├── lib/                   # Utilities
│   ├── db/                # Database layer
│   └── spaced-repetition/ # SR algorithm
└── types/                 # TypeScript types
```

## License

Created with love for language learning 💕

## Contributing

This is a personal project, but feel free to fork and adapt for your own use!
