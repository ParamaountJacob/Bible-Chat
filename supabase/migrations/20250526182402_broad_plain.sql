/*
  # Initial Schema for Bible Chat App

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key)
      - `email` (text)
      - `current_streak` (integer)
      - `last_engaged_date` (date)
      - `created_at` (timestamptz)
    - `messages`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles.id)
      - `content` (text)
      - `role` (text, 'system', 'user', or 'assistant')
      - `conversation_date` (date)
      - `created_at` (timestamptz)
  
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to read/write their own data
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  current_streak INTEGER DEFAULT 0,
  last_engaged_date DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can read own profile" 
  ON profiles 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles 
  FOR UPDATE 
  TO authenticated 
  USING (auth.uid() = id);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('system', 'user', 'assistant')),
  conversation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS for messages
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own messages
CREATE POLICY "Users can read own messages" 
  ON messages 
  FOR SELECT 
  TO authenticated 
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own messages
CREATE POLICY "Users can insert own messages" 
  ON messages 
  FOR INSERT 
  TO authenticated 
  WITH CHECK (auth.uid() = user_id);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_messages_user_id ON messages(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_date ON messages(conversation_date);
CREATE INDEX IF NOT EXISTS idx_profiles_last_engaged_date ON profiles(last_engaged_date);