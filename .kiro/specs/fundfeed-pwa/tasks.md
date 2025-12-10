# Implementation Plan

- [x] 1. Initialize Next.js 14 project with TypeScript and dependencies

  - Create Next.js 14 app with App Router and TypeScript
  - Install dependencies: Supabase SDK, Tailwind CSS, canvas-confetti, fast-check
  - Configure Tailwind with dark mode support
  - Set up project folder structure (app, components, lib, contexts, types)
  - _Requirements: 8.4, 6.5_

- [x] 2. Set up Supabase configuration and TypeScript types

  - Create Supabase project configuration in lib/supabase.ts
  - Define TypeScript interfaces for FundraisingRound, User, IntroRequest
  - Create environment variable template for Supabase credentials
  - _Requirements: 4.1, 9.2_

- [x] 3. Implement authentication system

- [x] 3.1 Create Supabase Auth helpers and AuthContext

  - Implement Supabase Auth initialization in lib/auth.ts
  - Create AuthContext with sign-in, sign-out, and session management
  - Implement email/password and Google OAuth sign-in methods
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.2 Write property test for session persistence

  - **Property 9: Session persistence across refreshes**
  - **Validates: Requirements 4.3**

- [x] 3.3 Create AuthButton component

  - Build sign-in/sign-out button with user profile display
  - Handle authentication state changes
  - _Requirements: 4.1, 4.2, 4.4_

- [x] 3.4 Write property test for authentication requirement

  - **Property 3: Authentication requirement for protected actions**
  - **Validates: Requirements 3.2, 4.5, 10.1**

- [x] 4. Implement theme system with dark mode

- [x] 4.1 Create ThemeContext and ThemeToggle component

  - Implement theme detection from system preferences
  - Create theme toggle functionality with localStorage persistence
  - Apply Tailwind dark mode classes
  - _Requirements: 6.1, 6.2, 6.3, 6.5_

- [x] 4.2 Write property test for theme persistence

  - **Property 6: Theme persistence and restoration**
  - **Validates: Requirements 6.1, 6.3, 6.4**

- [x] 5. Create database helpers and data layer

- [x] 5.1 Implement database CRUD operations

  - Create functions for reading/writing fundraising rounds
  - Implement user profile management functions
  - Create intro request storage functions
  - Add trending algorithm query (sort by recency and engagement)
  - _Requirements: 1.1, 1.3, 2.5, 3.3, 10.2_

- [x] 5.2 Write property test for trending algorithm sorting

  - **Property 12: Trending algorithm sorting**
  - **Validates: Requirements 1.3**

- [x] 5.3 Implement Supabase Storage helpers

  - Create upload functions for logos and PDF decks
  - Implement file validation (type and size checks)
  - Generate storage paths (/logos/{roundId}/, /decks/{roundId}/)
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 5.4 Write property test for file upload validation

  - **Property 2: File upload validation**
  - **Validates: Requirements 2.3, 2.4**

- [x] 6. Build TrendingCard component

- [x] 6.1 Create TrendingCard with all required fields

  - Display logo using Next.js Image component
  - Show company name, raising amount, and currency
  - Integrate FollowButton component
  - Implement responsive design for mobile and desktop
  - _Requirements: 1.2, 8.1, 8.2, 8.4_

- [x] 6.2 Write property test for trending card completeness

  - **Property 1: Trending cards display completeness**
  - **Validates: Requirements 1.2**

- [x] 7. Implement Follow functionality

- [x] 7.1 Create FollowButton component

  - Display Follow/Following state based on user's followed list
  - Require authentication before allowing follow action
  - Update user document on follow/unfollow
  - Handle optimistic UI updates
  - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

- [x] 7.2 Write property test for follow state consistency

  - **Property 5: Follow state consistency**
  - **Validates: Requirements 10.2, 10.3, 10.4, 10.5**

- [x] 8. Build homepage with trending cards grid

- [x] 8.1 Create homepage (app/page.tsx)

  - Fetch fundraising rounds from database
  - Render grid of TrendingCard components
  - Implement empty state for no rounds
  - Add responsive grid layout
  - _Requirements: 1.1, 1.2, 1.5, 8.1, 8.2_

- [x] 8.2 Integrate AuthButton and ThemeToggle in layout

  - Add navigation header with auth and theme controls
  - Apply global styles and dark mode support
  - _Requirements: 4.1, 6.2_

- [x] 9. Implement LaunchForm component

- [x] 9.1 Create launch form with validation

  - Build form with inputs for company name, raising amount, description
  - Add file inputs for logo and PDF deck
  - Implement client-side validation for required fields
  - Add file type and size validation
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 9.2 Write property test for form validation completeness

  - **Property 10: Form validation completeness**
  - **Validates: Requirements 2.2**

- [x] 9.3 Implement form submission with file uploads

  - Upload logo and deck to Supabase Storage
  - Create database record with round data
  - Handle upload progress and errors
  - Redirect to homepage on success
  - _Requirements: 2.5_

- [x] 9.4 Add confetti animation on successful launch

  - Integrate canvas-confetti library
  - Trigger confetti on successful form submission
  - Implement auto-cleanup after 3 seconds
  - Ensure non-blocking behavior
  - _Requirements: 7.1, 7.3, 7.4_

- [x] 9.5 Write property test for confetti animation behavior

  - **Property 8: Confetti animation behavior**
  - **Validates: Requirements 7.1, 7.3, 7.4**

- [x] 10. Create /launch page

  - Build launch page route (app/launch/page.tsx)
  - Integrate LaunchForm component
  - Require authentication to access page
  - _Requirements: 2.1, 4.5_

- [x] 11. Implement Request Intro functionality

- [x] 11.1 Create RequestIntroButton component

  - Display "Request Intro" or "Intro Requested" based on state
  - Require authentication before allowing request
  - Call API route to store intro request
  - Show success message on completion
  - _Requirements: 3.1, 3.2, 3.4, 3.5_

- [x] 11.2 Write property test for intro request idempotency

  - **Property 4: Intro request idempotency**
  - **Validates: Requirements 3.5**

- [x] 11.3 Write property test for intro request data completeness

  - **Property 11: Intro request data completeness**
  - **Validates: Requirements 3.3**

- [x] 11.4 Create API route for intro requests

  - Build API route at app/api/intro-request/route.ts
  - Validate authentication
  - Check for existing requests (idempotency)
  - Store request in database with all required fields
  - _Requirements: 3.3, 3.5_

- [x] 11.5 Integrate RequestIntroButton in TrendingCard

  - Add Request Intro button to card component
  - Fetch user's existing intro requests
  - Display correct button state
  - _Requirements: 3.1, 3.5_

- [x] 12. Implement PWA features

- [x] 12.1 Create PWA manifest

  - Generate app icons (192x192, 512x512)
  - Create manifest.json with required fields
  - Configure display mode as standalone
  - Set theme colors for light and dark modes
  - _Requirements: 5.1, 5.3_

- [x] 12.2 Write property test for PWA manifest

  - **Property 7: PWA manifest and service worker registration**
  - **Validates: Requirements 5.1, 5.2**

- [x] 12.3 Set up service worker with next-pwa

  - Install and configure next-pwa plugin
  - Configure caching strategies (network-first for API, cache-first for assets)
  - Implement offline fallback
  - Add service worker update notification
  - _Requirements: 5.2, 5.4, 5.5_

- [x] 13. Configure Supabase Security Policies

  - Write Row Level Security (RLS) policies for fundraising_rounds, users, intro_requests
  - Write Storage policies for logos and decks with size/type validation
  - Test policies to ensure proper access control
  - _Requirements: 2.3, 2.4, 9.2_

- [x] 14. Set up Vercel deployment configuration

  - Create vercel.json with build configuration
  - Document environment variables needed for deployment
  - Create README with deployment instructions
  - Add .env.example file
  - _Requirements: 9.1, 9.2, 9.5_

- [x] 15. Checkpoint - Ensure all tests pass

  - Ensure all tests pass, ask the user if questions arise.

- [x] 16. Polish and optimize

  - Add loading states and skeletons for async operations
  - Implement error boundaries for graceful error handling
  - Add toast notifications for user feedback
  - Optimize images and implement lazy loading
  - Test responsive design on various screen sizes
  - _Requirements: 8.1, 8.2, 8.4_

- [x] 17. Final testing and validation

  - Test complete user flows (sign in, launch round, follow, request intro)
  - Verify PWA installation on mobile and desktop
  - Test dark mode across all pages
  - Verify Supabase security policies
  - Test offline functionality
  - _Requirements: 5.1, 5.2, 5.4, 6.5_
