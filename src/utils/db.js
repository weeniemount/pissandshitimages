// Database schema definitions
/*
-- Required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Core tables
CREATE TABLE images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data text NOT NULL,
    mimetype text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW()
);

CREATE TABLE discord_users (
    id text PRIMARY KEY,
    username text NOT NULL,
    discriminator text,
    avatar text,
    access_token text,
    refresh_token text,
    last_login timestamp with time zone DEFAULT now()
);

CREATE TABLE post_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    ip_hash text NOT NULL,
    country text DEFAULT 'Unknown',
    created_at timestamp with time zone DEFAULT NOW(),
    discord_user_id TEXT REFERENCES discord_users(id),
    discord_username TEXT,
    discord_discriminator TEXT,
    discord_avatar TEXT
);

-- Security tables
CREATE TABLE banned_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash text NOT NULL UNIQUE,
    country text DEFAULT 'Unknown',
    banned_at timestamp with time zone DEFAULT NOW(),
    banned_by text NOT NULL DEFAULT 'admin',
    reason text
);

CREATE TABLE banned_discord_users (
    discord_id text PRIMARY KEY REFERENCES discord_users(id),
    banned_by text NOT NULL,
    reason text,
    banned_at timestamp with time zone DEFAULT now()
);

-- Admin tables
CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp with time zone DEFAULT NOW(),
    is_active boolean DEFAULT true
);

CREATE TABLE admin_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token text NOT NULL UNIQUE,
    created_at timestamp with time zone DEFAULT NOW(),
    expires_at timestamp with time zone NOT NULL,
    ip_hash text NOT NULL,
    user_agent text,
    is_active boolean DEFAULT true
);

-- Session management
CREATE TABLE sessions (
    sid TEXT PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Indexes
CREATE INDEX idx_post_ips_post_id ON post_ips(post_id);
CREATE INDEX idx_post_ips_ip_hash ON post_ips(ip_hash);
CREATE INDEX idx_post_ips_discord_user ON post_ips(discord_user_id);
CREATE INDEX idx_banned_ips_ip_hash ON banned_ips(ip_hash);
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);
CREATE INDEX idx_sessions_expire ON sessions(expire);

-- Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY sessions_service_role_policy ON sessions
    FOR ALL
    USING (true)
    WITH CHECK (true);

-- Initial admin user (CHANGE PASSWORD IMMEDIATELY!)
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$Ym9yzES/c/HMvuGN93/Dzu/4ZwWg2RWFtX8CATIR3bcOQzN4Vr43C')
ON CONFLICT (username) DO NOTHING;

Thank you mom
no problem sweetie */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = {
  supabase
};