import { createClient } from '@supabase/supabase-js';
import { NextApiRequest } from 'next';

export async function getUserIdFromRequest(req: NextApiRequest) {
  // Create Supabase client with hardcoded credentials
  const supabase = createClient(
    'https://jpmnecaxaxbtstiyjwbl.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpwbW5lY2F4YXhidHN0aXlqd2JsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MTM2MTcsImV4cCI6MjA2ODE4OTYxN30.LTwPt7tW6fqmDf3fBSh3-guOBvpWgS4BlgtX5zP2q-A'
  );
  
  // Get the auth token from cookies
  const authToken = req.cookies['sb-access-token'] || req.cookies['supabase-auth-token'];
  
  if (!authToken) {
    return null;
  }
  
  // Set the auth token
  supabase.auth.setSession({ access_token: authToken, refresh_token: '' });
  
  const { data, error } = await supabase.auth.getUser();
  if (error || !data.user) return null;
  return data.user.id;
} 