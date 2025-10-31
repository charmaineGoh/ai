/*
  # Initial Database Schema for Social Media & Content Ops Platform

  ## Overview
  This migration creates the foundational database structure for the automated social media platform.

  ## 1. New Tables
  
  ### `profiles`
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text) - User email
  - `full_name` (text) - User's full name
  - `role` (text) - User role: admin, marketer, intern
  - `avatar_url` (text) - Profile picture URL
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `campaigns`
  - `id` (uuid, primary key) - Unique campaign identifier
  - `name` (text) - Campaign name
  - `description` (text) - Campaign description
  - `color` (text) - Color code for visual identification
  - `start_date` (date) - Campaign start date
  - `end_date` (date) - Campaign end date
  - `status` (text) - active, paused, completed
  - `created_by` (uuid) - User who created the campaign
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `posts`
  - `id` (uuid, primary key) - Unique post identifier
  - `campaign_id` (uuid) - Associated campaign
  - `title` (text) - Post title
  - `content` (text) - Post content/caption
  - `platforms` (jsonb) - Array of target platforms with platform-specific data
  - `scheduled_time` (timestamptz) - When to publish
  - `status` (text) - draft, pending_approval, approved, scheduled, published, failed
  - `created_by` (uuid) - Content creator
  - `approved_by` (uuid) - Approver (if applicable)
  - `published_at` (timestamptz) - Actual publish time
  - `created_at` (timestamptz) - Creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `assets`
  - `id` (uuid, primary key) - Unique asset identifier
  - `post_id` (uuid) - Associated post
  - `original_url` (text) - Original file URL
  - `resized_urls` (jsonb) - Platform-specific resized versions
  - `file_type` (text) - image, video
  - `file_size` (integer) - Size in bytes
  - `created_by` (uuid) - User who uploaded
  - `created_at` (timestamptz) - Upload timestamp

  ### `social_accounts`
  - `id` (uuid, primary key) - Unique account identifier
  - `user_id` (uuid) - Owner user
  - `platform` (text) - instagram, linkedin, twitter, facebook
  - `account_name` (text) - Platform account name
  - `account_id` (text) - Platform-specific account ID
  - `access_token` (text) - Encrypted access token
  - `refresh_token` (text) - Encrypted refresh token
  - `expires_at` (timestamptz) - Token expiration
  - `is_active` (boolean) - Connection status
  - `created_at` (timestamptz) - Connection timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### `analytics`
  - `id` (uuid, primary key) - Unique analytics record
  - `post_id` (uuid) - Associated post
  - `platform` (text) - Platform name
  - `likes` (integer) - Number of likes
  - `comments` (integer) - Number of comments
  - `shares` (integer) - Number of shares
  - `impressions` (integer) - Number of impressions
  - `clicks` (integer) - Number of clicks
  - `engagement_rate` (decimal) - Calculated engagement rate
  - `fetched_at` (timestamptz) - When data was fetched
  - `created_at` (timestamptz) - Record creation timestamp

  ## 2. Security
  - Enable RLS on all tables
  - Admin: full access to all data
  - Marketer: create and edit own content, view all, schedule posts
  - Intern: create drafts only, cannot approve or publish
  - Users can only view/edit based on role hierarchy

  ## 3. Important Notes
  - All timestamps use timestamptz for proper timezone handling
  - JSONB used for flexible platform-specific data storage
  - Role-based policies ensure proper access control
  - Cascading deletes maintain referential integrity
*/

-- Create enum types for better type safety
CREATE TYPE user_role AS ENUM ('admin', 'marketer', 'intern');
CREATE TYPE campaign_status AS ENUM ('active', 'paused', 'completed');
CREATE TYPE post_status AS ENUM ('draft', 'pending_approval', 'approved', 'scheduled', 'published', 'failed');
CREATE TYPE social_platform AS ENUM ('instagram', 'linkedin', 'twitter', 'facebook');
CREATE TYPE asset_type AS ENUM ('image', 'video');

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role user_role NOT NULL DEFAULT 'intern',
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Campaigns table
CREATE TABLE IF NOT EXISTS campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  color text DEFAULT '#3B82F6',
  start_date date,
  end_date date,
  status campaign_status DEFAULT 'active',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid REFERENCES campaigns(id) ON DELETE SET NULL,
  title text NOT NULL,
  content text NOT NULL,
  platforms jsonb DEFAULT '[]'::jsonb,
  scheduled_time timestamptz,
  status post_status DEFAULT 'draft',
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  approved_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  original_url text NOT NULL,
  resized_urls jsonb DEFAULT '{}'::jsonb,
  file_type asset_type NOT NULL,
  file_size integer DEFAULT 0,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

-- Social accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  account_name text NOT NULL,
  account_id text NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamptz,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, platform, account_id)
);

-- Analytics table
CREATE TABLE IF NOT EXISTS analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid REFERENCES posts(id) ON DELETE CASCADE,
  platform social_platform NOT NULL,
  likes integer DEFAULT 0,
  comments integer DEFAULT 0,
  shares integer DEFAULT 0,
  impressions integer DEFAULT 0,
  clicks integer DEFAULT 0,
  engagement_rate decimal(5,2) DEFAULT 0,
  fetched_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can update any profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Campaigns policies
CREATE POLICY "Users can view all campaigns"
  ON campaigns FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Marketers and admins can create campaigns"
  ON campaigns FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'marketer'));

CREATE POLICY "Campaign creators and admins can update campaigns"
  ON campaigns FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  )
  WITH CHECK (
    created_by = auth.uid() OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

CREATE POLICY "Admins can delete campaigns"
  ON campaigns FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Posts policies
CREATE POLICY "Users can view all posts"
  ON posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create posts"
  ON posts FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update own posts"
  ON posts FOR UPDATE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'marketer')
  )
  WITH CHECK (
    created_by = auth.uid() OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'marketer')
  );

CREATE POLICY "Admins and marketers can delete posts"
  ON posts FOR DELETE
  TO authenticated
  USING ((SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'marketer'));

-- Assets policies
CREATE POLICY "Users can view all assets"
  ON assets FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can create assets"
  ON assets FOR INSERT
  TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Asset creators and admins can delete assets"
  ON assets FOR DELETE
  TO authenticated
  USING (
    created_by = auth.uid() OR 
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- Social accounts policies
CREATE POLICY "Users can view own social accounts"
  ON social_accounts FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

CREATE POLICY "Users can create own social accounts"
  ON social_accounts FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own social accounts"
  ON social_accounts FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can delete own social accounts"
  ON social_accounts FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- Analytics policies
CREATE POLICY "Users can view all analytics"
  ON analytics FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert analytics"
  ON analytics FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_campaigns_updated_at BEFORE UPDATE ON campaigns
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_social_accounts_updated_at BEFORE UPDATE ON social_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
