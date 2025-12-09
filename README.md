# Fundfeed

Product Hunt for startup fundraising - A Progressive Web App built with Next.js 14, Firebase, and TypeScript.

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Firebase project with Firestore, Authentication, and Storage enabled

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Copy `.env.example` to `.env.local` and fill in your Firebase credentials:

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
├── lib/                    # Firebase and utility functions
├── contexts/               # React Context providers
├── types/                  # TypeScript type definitions
└── public/                 # Static assets
```

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with dark mode
- **Authentication**: Firebase Auth
- **Database**: Firestore
- **Storage**: Firebase Storage
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
     - `NEXT_PUBLIC_FIREBASE_API_KEY`
     - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
     - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
     - `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
     - `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
     - `NEXT_PUBLIC_FIREBASE_APP_ID`

4. Deploy:
   ```bash
   vercel
   ```

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)

2. Enable the following services:
   - Authentication (Email/Password and Google providers)
   - Firestore Database
   - Storage

3. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```

4. Deploy Firestore indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

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

MIT
