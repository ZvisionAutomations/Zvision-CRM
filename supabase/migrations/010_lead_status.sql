-- Add status, last_contact_at, interactions_count to leads table
ALTER TABLE leads ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'active'
  CHECK (status IN ('active', 'won', 'lost'));
ALTER TABLE leads ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMPTZ;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS interactions_count INTEGER DEFAULT 0;
