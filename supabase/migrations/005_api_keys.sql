-- API_KEYS — per-company API key management
-- key_hash: bcrypt hash of the raw key — never stored raw
-- key_preview: last 4 chars shown in UI (e.g. ****A2E6)
-- expires_at: NULL = never expires (enterprise default)
-- is_active: soft-revoke without delete

CREATE TABLE api_keys (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  user_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  label        TEXT NOT NULL,
  key_hash     TEXT NOT NULL,
  key_preview  TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT TRUE,
  expires_at   TIMESTAMPTZ DEFAULT NULL,
  last_used_at TIMESTAMPTZ DEFAULT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "api_keys_company_isolation" ON api_keys
  USING (company_id = (
    SELECT company_id FROM users WHERE id = auth.uid()
  ));

CREATE INDEX idx_api_keys_company_id ON api_keys(company_id);
CREATE INDEX idx_api_keys_user_id    ON api_keys(user_id);
