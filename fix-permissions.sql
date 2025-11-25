-- 1. Create the prompts table if it doesn't exist
CREATE TABLE IF NOT EXISTS prompts (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    owner_id VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    use_case JSONB,
    technique JSONB,
    persona VARCHAR(255),
    length_mode JSONB,
    output_format JSONB,
    context TEXT,
    final_prompt TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create the usage_stats table if it doesn't exist
CREATE TABLE IF NOT EXISTS usage_stats (
    id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    model VARCHAR(255),
    prompt_tokens INTEGER NOT NULL DEFAULT 0,
    response_tokens INTEGER NOT NULL DEFAULT 0,
    total_tokens INTEGER NOT NULL DEFAULT 0,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    metadata JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Now that tables definitely exist, disable RLS
ALTER TABLE prompts DISABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats DISABLE ROW LEVEL SECURITY;
