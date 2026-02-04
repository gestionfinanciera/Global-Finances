
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpouidyamgggfngwqvgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3VpZHlhbWdnZ2ZuZ3dxdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzcwODgsImV4cCI6MjA4NTgxMzA4OH0.TvYE2FfrheyJz5WdAyIFDNY9FoV9czE4g_5DUEeHHSc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Obtiene la sesión actual de forma asíncrona.
 */
export const getCurrentSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
};
