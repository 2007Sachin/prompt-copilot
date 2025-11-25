-- ============================================
-- Supabase Database Setup for PromptCopilot
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Table: prompts
-- Stores user-generated prompts
-- ============================================

-- Safely handle existing tables to fix schema mismatches
-- WARNING: This ensures the schema is correct but backups are recommended for production data
DROP TABLE IF EXISTS prompts CASCADE;

CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    use_case JSONB,
    technique JSONB,
    persona TEXT,
    length_mode JSONB,
    output_format JSONB,
    context TEXT,
    final_prompt TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_prompts_user_id ON prompts(user_id);
CREATE INDEX idx_prompts_created_at ON prompts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;

-- RLS Policy for Clerk Authentication
-- Since we are using Clerk, we rely on the application to send the correct user_id.
-- For true DB-level security, you must configure Supabase to accept Clerk JWTs.
-- This policy allows authenticated users (via anon key) to perform actions.
CREATE POLICY "Enable access for authenticated users"
ON prompts FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- Table: usage_stats
-- Tracks API usage and costs
-- ============================================

DROP TABLE IF EXISTS usage_stats CASCADE;

CREATE TABLE usage_stats (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    prompt_tokens INTEGER DEFAULT 0,
    response_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER NOT NULL,
    cost DECIMAL(10, 6) DEFAULT 0,
    quality_score INTEGER DEFAULT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_usage_stats_user_id ON usage_stats(user_id);
CREATE INDEX idx_usage_stats_created_at ON usage_stats(created_at DESC);
CREATE INDEX idx_usage_stats_provider ON usage_stats(provider);

-- Enable Row Level Security
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- RLS Policy for Clerk Authentication
CREATE POLICY "Enable access for authenticated users"
ON usage_stats FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================
-- Verification Queries
-- ============================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('prompts', 'usage_stats');

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('prompts', 'usage_stats');

-- Check policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE tablename IN ('prompts', 'usage_stats');

-- ============================================
-- Sample Queries for Testing
-- ============================================

-- Count prompts per user
SELECT user_id, COUNT(*) as prompt_count
FROM prompts
GROUP BY user_id;

-- Total tokens used per user
SELECT 
    user_id,
    SUM(total_tokens) as total_tokens,
    SUM(cost) as total_cost,
    COUNT(*) as api_calls
FROM usage_stats
GROUP BY user_id;

-- Usage by provider
SELECT 
    provider,
    COUNT(*) as calls,
    SUM(total_tokens) as total_tokens,
    AVG(quality_score) as avg_quality
FROM usage_stats
GROUP BY provider;

-- ============================================
-- Optional: Add constraints
-- ============================================

-- Ensure tokens are non-negative
ALTER TABLE usage_stats 
ADD CONSTRAINT check_tokens_positive 
CHECK (total_tokens >= 0 AND prompt_tokens >= 0 AND response_tokens >= 0);

-- Ensure cost is non-negative
ALTER TABLE usage_stats 
ADD CONSTRAINT check_cost_positive 
CHECK (cost >= 0);

-- ============================================
-- Optional: Create views for analytics
-- ============================================

-- Daily usage summary
CREATE OR REPLACE VIEW daily_usage AS
SELECT 
    user_id,
    DATE(created_at) as date,
    provider,
    COUNT(*) as api_calls,
    SUM(total_tokens) as total_tokens,
    SUM(cost) as total_cost,
    AVG(quality_score) as avg_quality
FROM usage_stats
GROUP BY user_id, DATE(created_at), provider
ORDER BY date DESC;

-- User summary
CREATE OR REPLACE VIEW user_summary AS
SELECT 
    user_id,
    COUNT(DISTINCT DATE(created_at)) as active_days,
    COUNT(*) as total_api_calls,
    SUM(total_tokens) as total_tokens,
    SUM(cost) as total_cost,
    AVG(quality_score) as avg_quality,
    MAX(created_at) as last_activity
FROM usage_stats
GROUP BY user_id;

-- ============================================
-- Cleanup (if needed)
-- ============================================

-- CAUTION: These commands will delete all data!
-- Only uncomment if you need to reset the database

-- DROP TABLE IF EXISTS prompts CASCADE;
-- DROP TABLE IF NOT EXISTS usage_stats CASCADE;
-- DROP VIEW IF EXISTS daily_usage;
-- DROP VIEW IF EXISTS user_summary;
