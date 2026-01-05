-- Migration: Add preview_image_url to PromptTemplate and create TemplateUsage table
-- Date: 2026-01-05
-- Feature: v3.5.0 Dashboard Templates

-- 1. Add preview_image_url column to prompttemplate if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'prompttemplate' AND column_name = 'preview_image_url') THEN
        ALTER TABLE prompttemplate ADD COLUMN preview_image_url TEXT;
    END IF;
END $$;

-- 2. Create templateusage table if not exists (SQLModel create_all handles this usually, but this is for manual run)
CREATE TABLE IF NOT EXISTS templateusage (
    id UUID NOT NULL,
    user_id UUID,
    template_id UUID NOT NULL,
    action_type VARCHAR NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT now(),
    PRIMARY KEY (id),
    FOREIGN KEY(user_id) REFERENCES "user" (id),
    FOREIGN KEY(template_id) REFERENCES prompttemplate (id)
);
