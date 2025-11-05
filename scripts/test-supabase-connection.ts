/**
 * Script de prueba para verificar la conexión con Supabase
 * Ejecutar con: npx tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ekatcdsvknlecasylrcr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXRjZHN2a25sZWNhc3lscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzY0MjYsImV4cCI6MjA3Nzk1MjQyNn0.xR4KMcn8ZFVDbCVHsyXeCidU421QBj6oK_FrvTHbnuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('🔍 Probando conexión con Supabase...\n');
  console.log('URL:', supabaseUrl);
  console.log('Key:', supabaseAnonKey.substring(0, 20) + '...\n');

  try {
    // Test 1: Verificar que la tabla careers existe
    console.log('1️⃣ Verificando tabla careers...');
    const { data: careers, error: careersError } = await supabase
      .from('careers')
      .select('*')
      .limit(1);
    
    if (careersError) {
      console.error('❌ Error en careers:', careersError.message);
    } else {
      console.log('✅ Tabla careers OK -', careers?.length || 0, 'registros encontrados');
    }

    // Test 2: Verificar tabla users
    console.log('\n2️⃣ Verificando tabla users...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (usersError) {
      console.error('❌ Error en users:', usersError.message);
    } else {
      console.log('✅ Tabla users OK');
    }

    // Test 3: Verificar tabla subjects
    console.log('\n3️⃣ Verificando tabla subjects...');
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .limit(1);
    
    if (subjectsError) {
      console.error('❌ Error en subjects:', subjectsError.message);
    } else {
      console.log('✅ Tabla subjects OK -', subjects?.length || 0, 'registros encontrados');
    }

    // Test 4: Verificar tabla attendance_records
    console.log('\n4️⃣ Verificando tabla attendance_records...');
    const { data: attendance, error: attendanceError } = await supabase
      .from('attendance_records')
      .select('count')
      .limit(1);
    
    if (attendanceError) {
      console.error('❌ Error en attendance_records:', attendanceError.message);
    } else {
      console.log('✅ Tabla attendance_records OK');
    }

    console.log('\n✨ Prueba de conexión completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('   - Si todas las tablas están OK, puedes empezar a migrar datos');
    console.log('   - Actualiza App.tsx para usar Supabase en lugar de estado local');
    console.log('   - Configura las políticas RLS en Supabase Dashboard');

  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

testConnection();

