/**
 * Script para migrar datos iniciales desde constants.ts a Supabase
 * Ejecutar con: npx tsx scripts/migrate-initial-data.ts
 * 
 * IMPORTANTE: Este script migra usuarios con contraseñas en texto plano.
 * En producción, deberías usar Supabase Auth en su lugar.
 */

import { createClient } from '@supabase/supabase-js';
import { CAREERS, SUBJECTS, INITIAL_USERS } from '../constants';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://ekatcdsvknlecasylrcr.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXRjZHN2a25sZWNhc3lscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzY0MjYsImV4cCI6MjA3Nzk1MjQyNn0.xR4KMcn8ZFVDbCVHsyXeCidU421QBj6oK_FrvTHbnuw';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function migrateCareers() {
  console.log('📚 Migrando carreras...');
  for (const career of CAREERS) {
    const { error } = await supabase
      .from('careers')
      .upsert({
        id: career.id,
        name: career.name,
        years: career.years,
        theme: career.theme
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error migrando carrera ${career.id}:`, error.message);
    } else {
      console.log(`✅ Carrera ${career.name} migrada`);
    }
  }
}

async function migrateSubjects() {
  console.log('\n📖 Migrando materias...');
  for (const subject of SUBJECTS) {
    const { error } = await supabase
      .from('subjects')
      .upsert({
        id: subject.id,
        name: subject.name,
        career_id: subject.careerId,
        year: subject.year
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error migrando materia ${subject.id}:`, error.message);
    } else {
      console.log(`✅ Materia ${subject.name} migrada`);
    }
  }
}

async function migrateUsers() {
  console.log('\n👥 Migrando usuarios...');
  console.log('⚠️  ADVERTENCIA: Las contraseñas se migran en texto plano.');
  console.log('   En producción, usa Supabase Auth en su lugar.\n');
  
  for (const user of INITIAL_USERS) {
    const { error } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        name: user.name,
        email: user.email,
        password: user.password, // ⚠️ En texto plano - solo para desarrollo
        role: user.role,
        career_id: user.careerId || null,
        year: user.year || null,
        assigned_subjects: user.assignedSubjects || null
      }, { onConflict: 'id' });
    
    if (error) {
      console.error(`❌ Error migrando usuario ${user.name}:`, error.message);
    } else {
      console.log(`✅ Usuario ${user.name} (${user.role}) migrado`);
    }
  }
}

async function main() {
  console.log('🚀 Iniciando migración de datos iniciales...\n');
  
  try {
    await migrateCareers();
    await migrateSubjects();
    await migrateUsers();
    
    console.log('\n✨ Migración completada!');
    console.log('\n📝 Próximos pasos:');
    console.log('   - Verifica los datos en Supabase Dashboard');
    console.log('   - Considera implementar Supabase Auth para autenticación');
    console.log('   - Configura políticas RLS según tus necesidades de seguridad');
    
  } catch (error) {
    console.error('❌ Error en la migración:', error);
  }
}

main();

