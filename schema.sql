
-- Create the prompts table
CREATE TABLE prompts (
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

-- Create the usage_stats table
CREATE TABLE usage_stats (
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

-- Enable Row Level Security for both tables
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_stats ENABLE ROW LEVEL SECURITY;

-- Create policies for the prompts table
CREATE POLICY "Users can insert their own prompts" ON prompts FOR INSERT WITH CHECK (auth.uid()::text = owner_id);
CREATE POLICY "Users can view their own prompts" ON prompts FOR SELECT USING (auth.uid()::text = owner_id);
CREATE POLICY "Users can update their own prompts" ON prompts FOR UPDATE USING (auth.uid()::text = owner_id);
CREATE POLICY "Users can delete their own prompts" ON prompts FOR DELETE USING (auth.uid()::text = owner_id);

-- Create policies for the usage_stats table
CREATE POLICY "Users can insert their own usage stats" ON usage_stats FOR INSERT WITH CHECK (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own usage stats" ON usage_stats FOR SELECT USING (auth.uid()::text = user_id);

