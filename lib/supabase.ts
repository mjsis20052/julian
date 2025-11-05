import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase desde variables de entorno
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://ekatcdsvknlecasylrcr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXRjZHN2a25sZWNhc3lscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzY0MjYsImV4cCI6MjA3Nzk1MjQyNn0.xR4KMcn8ZFVDbCVHsyXeCidU421QBj6oK_FrvTHbnuw';

// Crear cliente de Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Tipos para las tablas (puedes generar estos automáticamente con Supabase CLI)
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: number;
          name: string;
          email: string;
          password: string;
          role: string;
          career_id: string | null;
          year: number[] | null;
          assigned_subjects: string[] | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['users']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['users']['Insert']>;
      };
      // Agregar más tipos según sea necesario
    };
  };
};

