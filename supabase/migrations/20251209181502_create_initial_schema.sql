/*
  # Create Initial FundFeed Schema

  ## Overview
  This migration creates the complete database schema for the FundFeed application,
  including tables for user profiles, fundraising rounds, and introduction requests.

  ## 1. New Tables

  ### `users`
  - `id` (uuid, primary key) - References auth.users.id
  - `email` (text) - User email address
  - `display_name` (text) - User's display name
  - `photo_url` (text, nullable) - User profile photo URL
  - `role` (text) - User role: 'founder', 'investor', or 'both'
  - `followed_rounds` (text[]) - Array of round IDs the user follows
  - `created_at` (timestamptz) - Account creation timestamp

  ### `fundraising_rounds`
  - `id` (uuid, primary key) - Unique round identifier
  - `company_name` (text) - Name of the company raising funds
  - `logo_url` (text) - Company logo image URL
  - `raising_amount` (numeric) - Amount being raised
  - `currency` (text) - Currency code (USD, EUR, etc.)
  - `description` (text) - Round description
  - `deck_url` (text) - URL to pitch deck PDF
  - `founder_id` (uuid) - References users.id
  - `follower_count` (integer) - Number of followers
  - `intro_request_count` (integer) - Number of intro requests
  - `created_at` (timestamptz) - Round creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `intro_requests`
  - `id` (uuid, primary key) - Unique request identifier
  - `investor_id` (uuid) - References users.id
  - `round_id` (uuid) - References fundraising_rounds.id
  - `startup_name` (text) - Name of the startup
  - `status` (text) - Status: 'pending', 'accepted', or 'declined'
  - `message` (text, nullable) - Optional message from investor
  - `created_at` (timestamptz) - Request creation timestamp

  ## 2. Security

  All tables have Row Level Security (RLS) enabled with the following policies:

  ### Users Table
  - Users can read all user profiles
  - Users can insert their own profile
  - Users can update only their own profile

  ### Fundraising Rounds Table
  - Anyone can read all fundraising rounds
  - Authenticated users can insert new rounds
  - Users can update only their own rounds
  - Users can delete only their own rounds

  ### Intro Requests Table
  - Users can read requests where they are the investor
  - Users can read requests for rounds they created
  - Authenticated users can create intro requests
  - Investors can update their own requests

  ## 3. Indexes

  Performance indexes are created for frequently queried columns:
  - fundraising_rounds: founder_id, created_at, follower_count
  - intro_requests: investor_id, round_id, status

  ## 4. Important Notes

  - All timestamps use timestamptz for timezone awareness
  - Default values prevent null issues
  - Foreign key constraints ensure data integrity
  - RLS policies restrict access appropriately
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  display_name text NOT NULL,
  photo_url text,
  role text NOT NULL DEFAULT 'founder' CHECK (role IN ('founder', 'investor', 'both')),
  followed_rounds text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create fundraising_rounds table
CREATE TABLE IF NOT EXISTS fundraising_rounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name text NOT NULL,
  logo_url text NOT NULL,
  raising_amount numeric NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  description text NOT NULL,
  deck_url text NOT NULL,
  founder_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  follower_count integer DEFAULT 0,
  intro_request_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create intro_requests table
CREATE TABLE IF NOT EXISTS intro_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  investor_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  round_id uuid NOT NULL REFERENCES fundraising_rounds(id) ON DELETE CASCADE,
  startup_name text NOT NULL,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined')),
  message text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(investor_id, round_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_fundraising_rounds_founder_id ON fundraising_rounds(founder_id);
CREATE INDEX IF NOT EXISTS idx_fundraising_rounds_created_at ON fundraising_rounds(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fundraising_rounds_follower_count ON fundraising_rounds(follower_count DESC);
CREATE INDEX IF NOT EXISTS idx_intro_requests_investor_id ON intro_requests(investor_id);
CREATE INDEX IF NOT EXISTS idx_intro_requests_round_id ON intro_requests(round_id);
CREATE INDEX IF NOT EXISTS idx_intro_requests_status ON intro_requests(status);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fundraising_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE intro_requests ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can read all profiles"
  ON users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Fundraising rounds policies
CREATE POLICY "Anyone can read fundraising rounds"
  ON fundraising_rounds FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create rounds"
  ON fundraising_rounds FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can update own rounds"
  ON fundraising_rounds FOR UPDATE
  TO authenticated
  USING (auth.uid() = founder_id)
  WITH CHECK (auth.uid() = founder_id);

CREATE POLICY "Users can delete own rounds"
  ON fundraising_rounds FOR DELETE
  TO authenticated
  USING (auth.uid() = founder_id);

-- Intro requests policies
CREATE POLICY "Investors can read own requests"
  ON intro_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = investor_id);

CREATE POLICY "Founders can read requests for their rounds"
  ON intro_requests FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM fundraising_rounds
      WHERE fundraising_rounds.id = intro_requests.round_id
      AND fundraising_rounds.founder_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create intro requests"
  ON intro_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Investors can update own requests"
  ON intro_requests FOR UPDATE
  TO authenticated
  USING (auth.uid() = investor_id)
  WITH CHECK (auth.uid() = investor_id);
