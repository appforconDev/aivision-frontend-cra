// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://mqitarnnqtdivkghpxnz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xaXRhcm5ucXRkaXZrZ2hweG56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk2NTQwOTEsImV4cCI6MjA1NTIzMDA5MX0.wprhft9HdvOhDFbsgMn-3nM7JNZhAdD0KmrxK3xM2lQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);