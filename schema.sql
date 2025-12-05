-- =====================================================
-- PromptCopilot Database Schema Upgrade
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Add support for Workflows (Prompt Chaining)
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'single'; -- 'single' or 'workflow'

ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS chain_config JSONB; -- Stores the array of ChainStep objects

-- 2. Add support for Test Suites (Evals)
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS test_config JSONB; -- Stores { cases: string[] }

-- 3. Add model configuration storage
ALTER TABLE prompts 
ADD COLUMN IF NOT EXISTS model_config JSONB; -- Stores ModelConfig object

-- 4. Create index for faster queries on type
CREATE INDEX IF NOT EXISTS idx_prompts_type ON prompts(type);

-- 5. Verify the changes
SELECT column_name, data_type, column_default
FROM information_schema.columns 
WHERE table_name = 'prompts'
ORDER BY ordinal_position;
