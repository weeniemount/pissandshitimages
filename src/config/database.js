// Mom i want the db schemas
// okay sweetie here it is
/*
-- Create new table with UUID primary key
CREATE TABLE images (
	id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	data text NOT NULL,
	mimetype text NOT NULL
);

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

Thank you mom
no problem sweetie */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

// Supabase connection - the holy grail of chaos storage
export const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)

// Helper function to convert base64 to buffer
export function base64ToBytes(base64) {
    return Buffer.from(base64, 'base64')
}
