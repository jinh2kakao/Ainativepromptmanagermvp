-- Create WithdrawnUser table
CREATE TABLE IF NOT EXISTS withdrawnuser (
    id UUID PRIMARY KEY,
    email VARCHAR NOT NULL,
    migrated_email VARCHAR,
    original_joined_at TIMESTAMP WITHOUT TIME ZONE NOT NULL,
    withdrawn_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (now() at time zone 'utc'),
    reason VARCHAR,
    prompt_count INTEGER DEFAULT 0,
    project_count INTEGER DEFAULT 0,
    backup_data JSON
);

-- Add is_deleted and is_public flags to Prompt if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompt' AND column_name = 'is_deleted') THEN
        ALTER TABLE prompt ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add is_deleted to Project if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'project' AND column_name = 'is_deleted') THEN
        ALTER TABLE project ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Make Project.owner_id nullable
ALTER TABLE project ALTER COLUMN owner_id DROP NOT NULL;
