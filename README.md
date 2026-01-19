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
- `npm run test` - Run unit tests
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Prisma Studio
- `npm run db:seed` - Seed the database with initial data
- `npm run music:setup` - Download and setup music files

## Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables in Vercel dashboard:
   - `DATABASE_URL` - PostgreSQL connection string
   - `DIRECT_URL` - Direct PostgreSQL connection (same as DATABASE_URL for most providers)
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Your production URL (e.g., https://your-app.vercel.app)
   - `CRON_SECRET` - Secret for cron job authentication (generate with `openssl rand -base64 32`)
3. Optional environment variables:
   - `ANTHROPIC_API_KEY` - For AI content generation features
   - `NEXT_PUBLIC_ELEVENLABS_API_KEY` - For high-quality TTS
   - `NEXT_PUBLIC_OPENAI_API_KEY` - For OpenAI TTS

### Railway

1. Create a new project and add a PostgreSQL service
2. Railway auto-injects `DATABASE_URL`
3. Add the remaining environment variables listed above
4. Deploy with: `npm run railway:seed` (runs migrations and seeds data)

### Post-Deployment Steps

1. Run database migrations: `npx prisma migrate deploy`
2. Seed the database: `npm run db:seed`
3. Import music content: `npm run content:import:all`
4. Verify health endpoint: `GET /api/health`

## License

MIT
