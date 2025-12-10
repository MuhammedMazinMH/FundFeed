# Requirements Document

## Introduction

Fundfeed is a Progressive Web App (PWA) that serves as "Product Hunt for startup fundraising." The platform enables startups to showcase their fundraising rounds and allows investors to discover and connect with promising ventures. Built with Next.js 14, Supabase, and designed for deployment on Vercel, Fundfeed provides an installable, mobile-first experience for both founders and investors.

## Glossary

- **Fundfeed System**: The complete Progressive Web App including frontend, backend services, and Supabase integration
- **Fundraising Round**: A startup's capital raising campaign with associated details (logo, deck, amount, description)
- **Trending Card**: A visual component displaying a fundraising round's key information on the homepage
- **Launch Page**: The interface where founders submit new fundraising rounds
- **Investor**: A user who browses fundraising rounds and requests introductions to startups
- **Founder**: A user who creates and manages fundraising round listings
- **Request Intro**: An action allowing investors to express interest in connecting with a startup
- **PWA Manifest**: Configuration file enabling the app to be installed on devices
- **Service Worker**: Background script enabling offline functionality and app-like behavior
- **Supabase Auth**: Authentication service managing user identity and sessions
- **Supabase Database**: PostgreSQL database storing fundraising rounds and user data
- **Supabase Storage**: Cloud storage service for logos and PDF pitch decks
- **Dark Mode**: Alternative color scheme with dark backgrounds for reduced eye strain

## Requirements

### Requirement 1

**User Story:** As a visitor, I want to view trending fundraising rounds on the homepage, so that I can quickly discover startups currently raising capital.

#### Acceptance Criteria

1. WHEN a user navigates to the homepage THEN the Fundfeed System SHALL display a grid of trending cards showing active fundraising rounds
2. WHEN displaying a trending card THEN the Fundfeed System SHALL show the startup logo, company name, raising amount, and a Follow button
3. WHEN trending cards are loaded THEN the Fundfeed System SHALL sort them by a trending algorithm based on recency and engagement
4. WHEN the homepage loads THEN the Fundfeed System SHALL fetch fundraising round data from Supabase within 2 seconds
5. WHEN no fundraising rounds exist THEN the Fundfeed System SHALL display an empty state message encouraging users to launch the first round

### Requirement 2

**User Story:** As a founder, I want to launch a new fundraising round, so that I can attract potential investors to my startup.

#### Acceptance Criteria

1. WHEN a founder navigates to the /launch page THEN the Fundfeed System SHALL display a form to submit fundraising round details
2. WHEN a founder submits the launch form THEN the Fundfeed System SHALL require company name, logo image, raising amount, and PDF pitch deck
3. WHEN a founder uploads a logo THEN the Fundfeed System SHALL accept image files in PNG, JPG, or WEBP format under 5MB
4. WHEN a founder uploads a pitch deck THEN the Fundfeed System SHALL accept PDF files under 10MB
5. WHEN a founder submits valid form data THEN the Fundfeed System SHALL upload files to Supabase Storage, create a database record, and redirect to the homepage with success confirmation

### Requirement 3

**User Story:** As an investor, I want to request introductions to startups, so that I can explore investment opportunities.

#### Acceptance Criteria

1. WHEN an investor views a fundraising round THEN the Fundfeed System SHALL display a Request Intro button
2. WHEN an investor clicks Request Intro THEN the Fundfeed System SHALL require the investor to be authenticated via Supabase Auth
3. WHEN an authenticated investor requests an intro THEN the Fundfeed System SHALL store the request in the database with investor ID, startup ID, and timestamp
4. WHEN an intro request is submitted THEN the Fundfeed System SHALL display a success message confirming the request
5. WHEN an investor has already requested an intro for a startup THEN the Fundfeed System SHALL disable the Request Intro button and show "Intro Requested" status

### Requirement 4

**User Story:** As a user, I want to authenticate with my account, so that I can access personalized features and perform actions like launching rounds or requesting intros.

#### Acceptance Criteria

1. WHEN a user clicks a sign-in button THEN the Fundfeed System SHALL display Supabase Auth authentication options including email/password and Google sign-in
2. WHEN a user successfully authenticates THEN the Fundfeed System SHALL store the user session and display the user's profile information
3. WHEN an authenticated user refreshes the page THEN the Fundfeed System SHALL maintain the user session without requiring re-authentication
4. WHEN a user signs out THEN the Fundfeed System SHALL clear the session and redirect to the homepage
5. WHEN an unauthenticated user attempts a protected action THEN the Fundfeed System SHALL prompt for authentication before proceeding

### Requirement 5

**User Story:** As a user, I want to install Fundfeed on my device, so that I can access it like a native app without opening a browser.

#### Acceptance Criteria

1. WHEN a user visits Fundfeed on a compatible browser THEN the Fundfeed System SHALL provide a PWA manifest enabling installation prompts
2. WHEN a user installs the PWA THEN the Fundfeed System SHALL register a service worker for offline functionality
3. WHEN the PWA is installed THEN the Fundfeed System SHALL display with a standalone window without browser UI elements
4. WHEN the PWA is opened offline THEN the Fundfeed System SHALL display cached content and show an offline indicator
5. WHEN the service worker updates THEN the Fundfeed System SHALL prompt the user to reload for the latest version

### Requirement 6

**User Story:** As a user, I want to toggle between light and dark modes, so that I can use the app comfortably in different lighting conditions.

#### Acceptance Criteria

1. WHEN a user first visits Fundfeed THEN the Fundfeed System SHALL detect the user's system color scheme preference and apply the corresponding theme
2. WHEN a user clicks the theme toggle button THEN the Fundfeed System SHALL switch between light and dark modes immediately
3. WHEN a user changes the theme THEN the Fundfeed System SHALL persist the preference in local storage
4. WHEN a user returns to Fundfeed THEN the Fundfeed System SHALL apply the previously selected theme preference
5. WHEN dark mode is active THEN the Fundfeed System SHALL apply dark backgrounds and light text throughout all pages

### Requirement 7

**User Story:** As a founder, I want to see celebratory confetti when I successfully launch a fundraising round, so that I feel accomplished and motivated.

#### Acceptance Criteria

1. WHEN a founder successfully submits a fundraising round THEN the Fundfeed System SHALL trigger a confetti animation on the screen
2. WHEN the confetti animation plays THEN the Fundfeed System SHALL display colorful particles falling from the top of the viewport
3. WHEN the confetti animation completes THEN the Fundfeed System SHALL automatically clean up the animation after 3 seconds
4. WHEN confetti is triggered THEN the Fundfeed System SHALL not block user interaction with the interface
5. WHEN multiple success actions occur THEN the Fundfeed System SHALL handle confetti animations without performance degradation

### Requirement 8

**User Story:** As a user, I want the app to be responsive and performant, so that I have a smooth experience on any device.

#### Acceptance Criteria

1. WHEN a user accesses Fundfeed on mobile devices THEN the Fundfeed System SHALL display a responsive layout optimized for screen sizes from 320px to 768px width
2. WHEN a user accesses Fundfeed on desktop devices THEN the Fundfeed System SHALL display a responsive layout optimized for screen sizes above 768px width
3. WHEN a page loads THEN the Fundfeed System SHALL achieve a Lighthouse performance score above 90
4. WHEN images are loaded THEN the Fundfeed System SHALL use Next.js Image optimization for automatic resizing and format conversion
5. WHEN a user navigates between pages THEN the Fundfeed System SHALL use client-side routing for instant transitions without full page reloads

### Requirement 9

**User Story:** As a developer, I want the application deployed on Vercel, so that it benefits from automatic deployments, edge functions, and global CDN distribution.

#### Acceptance Criteria

1. WHEN the repository is connected to Vercel THEN the Fundfeed System SHALL automatically deploy on every push to the main branch
2. WHEN environment variables are configured THEN the Fundfeed System SHALL securely access Supabase credentials without exposing them in client code
3. WHEN the app is deployed THEN the Fundfeed System SHALL serve static assets from Vercel's global CDN
4. WHEN API routes are called THEN the Fundfeed System SHALL execute them as serverless functions on Vercel's edge network
5. WHEN a deployment completes THEN the Fundfeed System SHALL be accessible via a production URL with HTTPS enabled

### Requirement 10

**User Story:** As a user, I want to follow startups I'm interested in, so that I can track their fundraising progress.

#### Acceptance Criteria

1. WHEN a user clicks the Follow button on a trending card THEN the Fundfeed System SHALL require authentication
2. WHEN an authenticated user clicks Follow THEN the Fundfeed System SHALL add the startup to the user's followed list in the database
3. WHEN a user follows a startup THEN the Fundfeed System SHALL update the button to show "Following" status
4. WHEN a user clicks the Following button THEN the Fundfeed System SHALL unfollow the startup and update the button to "Follow"
5. WHEN a user views a trending card THEN the Fundfeed System SHALL display the correct follow status based on the user's followed list
