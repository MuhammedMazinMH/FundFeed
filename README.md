# Fundfeed

Product Hunt for startup fundraising - A Progressive Web App built with Next.js 14, Supabase, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase project with Authentication and Storage enabled

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

4. Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
fundfeed/
├── app/                    # Next.js 14 App Router pages
├── components/             # React components
├── lib/                    # Supabase and utility functions
├── contexts/               # React Context providers
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage
- **Deployment**: Vercel
- **Testing**: Jest, fast-check (property-based testing)

## Features

- 🚀 Launch fundraising rounds
- 👀 Browse trending startups
- 💼 Request introductions to founders
- 👤 User authentication (Email/Password, Google)
- 🌙 Dark mode support
- 📱 Progressive Web App (installable)
- 🎉 Confetti animations

## Deployment

### Vercel Deployment

1. Push your code to a GitHub repository

2. Connect your repository to Vercel:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository

3. Configure environment variables in Vercel:
   - Go to Project Settings > Environment Variables
   - Add the following variables:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. Deploy:
   ```bash
   vercel
   ```

### Supabase Setup

1. Create a Supabase project at [supabase.com](https://supabase.com)

2. Enable the following services:
   - Authentication (Email/Password and Google providers)
   - Database (PostgreSQL)
   - Storage

3. Run the database migrations in `supabase/migrations/`

4. Configure Storage buckets for logos and decks

## Testing

Run all tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm test -- --watch
```

## License

See LICENSE file for details.
