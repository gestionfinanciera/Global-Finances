
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpouidyamgggfngwqvgg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwb3VpZHlhbWdnZ2ZuZ3dxdmdnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAyMzcwODgsImV4cCI6MjA4NTgxMzA4OH0.TvYE2FfrheyJz5WdAyIFDNY9FoV9czE4g_5DUEeHHSc';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Función para asegurar que existe una sesión de usuario para las políticas RLS.
 * Dado que no se requiere login, usamos la autenticación anónima de Supabase.
 */
export const ensureSession = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) console.error("Error en sesión anónima:", error.message);
    }
};
