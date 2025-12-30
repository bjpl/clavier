# Clavier - Music Theory Learning Tool

An interactive music theory learning application built with Next.js, TypeScript, and Tailwind CSS.

## Features

- Interactive music theory exercises
- Ear training modules
- Sight-reading practice
- Chord and scale exploration
- Voice part training (Soprano, Alto, Tenor, Bass)

## Getting Started

### Prerequisites

- Node.js 18.0.0 or higher
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env
```

3. Set up the database:

```bash
npm run db:generate
npm run db:push
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Tech Stack

- **Framework**: Next.js 14+
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **State Management**: Zustand
- **Data Fetching**: TanStack Query
- **Audio Engine**: Tone.js
- **Music Notation**: OpenSheetMusicDisplay
- **Database**: Prisma

## Project Structure

```
clavier/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/       # React components
│   ├── lib/             # Utility functions and libraries
│   ├── hooks/           # Custom React hooks
│   └── types/           # TypeScript type definitions
├── prisma/              # Database schema and migrations
├── public/              # Static assets
└── tests/               # Test files
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio

## License

MIT
