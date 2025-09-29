// Mom i want the db schemas
// okay sweetie here it is
/*
-- Create new table with UUID primary key
CREATE TABLE images (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    data text NOT NULL,
    mimetype text NOT NULL
);

CREATE TABLE post_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id uuid NOT NULL REFERENCES images(id) ON DELETE CASCADE,
    ip_hash text NOT NULL,
    country text DEFAULT 'Unknown',
    created_at timestamp DEFAULT NOW()
);

CREATE TABLE banned_ips (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    ip_hash text NOT NULL UNIQUE,
    country text DEFAULT 'Unknown',
    banned_at timestamp DEFAULT NOW(),
    banned_by text DEFAULT 'admin'
);


CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE INDEX idx_post_ips_post_id ON post_ips(post_id);
CREATE INDEX idx_post_ips_ip_hash ON post_ips(ip_hash);
CREATE INDEX idx_banned_ips_ip_hash ON banned_ips(ip_hash);

-- Create admin sessions table
CREATE TABLE admin_sessions (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    session_token text NOT NULL UNIQUE,
    created_at timestamp DEFAULT NOW(),
    expires_at timestamp NOT NULL,
    ip_hash text,
    user_agent text,
    is_active boolean DEFAULT true
);

-- Create index for fast session lookups
CREATE INDEX idx_admin_sessions_token ON admin_sessions(session_token);
CREATE INDEX idx_admin_sessions_expires ON admin_sessions(expires_at);

-- Create admin users table (in case you want multiple admins later)
CREATE TABLE admin_users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    username text NOT NULL UNIQUE,
    password_hash text NOT NULL,
    created_at timestamp DEFAULT NOW(),
    is_active boolean DEFAULT true
);

-- Insert default admin user (you should change this password!)
-- Password is 'admin123' - CHANGE THIS IMMEDIATELY!
INSERT INTO admin_users (username, password_hash) 
VALUES ('admin', '$2b$10$Ym9yzES/c/HMvuGN93/Dzu/4ZwWg2RWFtX8CATIR3bcOQzN4Vr43C');

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess JSONB NOT NULL,
    expire TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Add index for expired sessions cleanup
CREATE INDEX IF NOT EXISTS IDX_sessions_expire ON sessions (expire);

-- Create discord_users table
create table discord_users (
    id text primary key,
    username text not null,
    discriminator text,
    avatar text,
    access_token text,
    refresh_token text,
    last_login timestamp with time zone default now()
);

-- Create banned_discord_users table
create table banned_discord_users (
    discord_id text primary key references discord_users(id),
    banned_by text not null,
    reason text,
    banned_at timestamp with time zone default now()
);

ALTER TABLE post_ips ADD COLUMN IF NOT EXISTS discord_user_id TEXT;
ALTER TABLE post_ips ADD COLUMN IF NOT EXISTS discord_username TEXT;
ALTER TABLE post_ips ADD COLUMN IF NOT EXISTS discord_discriminator TEXT;
ALTER TABLE post_ips ADD COLUMN IF NOT EXISTS discord_avatar TEXT;

Thank you mom
no problem sweetie */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

module.exports = {
  supabase
};