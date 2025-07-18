import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://jpmnecaxaxbtstiyjwbl.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbW5lY2F4YXhidHN0aXlqd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM2MTcsImV4cCI6MjA2ODE4OTYxN30.LTwPt7tW6fqmDf3fBSh3-guOBvpWgS4BlgtX5zP2q-A';
 
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 