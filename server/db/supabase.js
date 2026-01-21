import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
// console.log("hi yha pr aa gye");

// console.log(supabaseUrl, supabaseKey);

if (!supabaseUrl || !supabaseKey) {
    console.error('Supabase URL or Key is missing in environment variables.');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
