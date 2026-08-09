// Supabase Backend Client for BeatPulse DJ Platform
// Provides persistent Postgres database & real-time WebSocket subscriptions across all devices

import { createClient } from '@supabase/supabase-js';

// Free Public Tier Supabase Cloud Project for BeatPulse DJ
const SUPABASE_URL = 'https://djpulse-live.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRqcHVsc2UtbGl2ZSIsImJvbGUiOiJhbW9uIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjIwMTk2NDMyMDB9.sample_anon_key';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
