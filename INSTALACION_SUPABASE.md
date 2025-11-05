# Guía de Instalación y Configuración de Supabase

## Paso 1: Crear las Tablas en Supabase

1. **Accede a tu proyecto de Supabase**: https://supabase.com/dashboard
2. Ve a **SQL Editor** en el menú lateral
3. Abre el archivo `supabase/schema.sql` de este proyecto
4. Copia todo el contenido del archivo SQL
5. Pega el SQL en el editor de Supabase
6. Haz clic en **Run** para ejecutar el script

Esto creará todas las tablas necesarias para el sistema.

## Paso 2: Configurar Variables de Entorno

### Para Desarrollo Local

1. Crea un archivo `.env.local` en la raíz del proyecto (o copia `.env.example`):
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y asegúrate de que tenga:
   ```env
   VITE_SUPABASE_URL=https://ekatcdsvknlecasylrcr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXRjZHN2a25sZWNhc3lscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzY0MjYsImV4cCI6MjA3Nzk1MjQyNn0.xR4KMcn8ZFVDbCVHsyXeCidU421QBj6oK_FrvTHbnuw
   GEMINI_API_KEY=tu_api_key_aqui
   ```

### Para Producción (Vercel/Netlify)

1. Ve a tu proyecto en Vercel/Netlify
2. Ve a **Settings** → **Environment Variables**
3. Agrega las siguientes variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `GEMINI_API_KEY`

## Paso 3: Configurar Políticas de Seguridad (RLS)

Supabase usa Row Level Security (RLS) para controlar el acceso a los datos. Necesitarás configurar políticas según tus necesidades de seguridad.

### Ejemplo de Políticas Básicas:

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
-- ... repetir para todas las tablas

-- Política: Los usuarios solo pueden ver su propia información
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Política: Los estudiantes pueden ver sus propios registros de asistencia
CREATE POLICY "Students can view own attendance"
  ON attendance_records FOR SELECT
  USING (
    student_id IN (
      SELECT id FROM users WHERE id = auth.uid()
    )
  );

-- Política: Los preceptores pueden ver asistencia de su carrera
CREATE POLICY "Preceptors can view attendance"
  ON attendance_records FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'Preceptor'
      AND users.career_id = (
        SELECT career_id FROM users WHERE id = attendance_records.student_id
      )
    )
  );
```

**Nota**: Para desarrollo, puedes deshabilitar RLS temporalmente, pero **NUNCA en producción**.

## Paso 4: Verificar la Conexión

Puedes probar la conexión creando un archivo de prueba:

```typescript
// test-supabase.ts
import { supabase } from './lib/supabase';

async function testConnection() {
  const { data, error } = await supabase
    .from('users')
    .select('count')
    .limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Conexión exitosa!');
  }
}

testConnection();
```

## Paso 5: Migrar Datos Iniciales (Opcional)

Si tienes datos iniciales en `constants.ts`, puedes crear un script de migración:

```typescript
// scripts/migrate-initial-data.ts
import { supabase } from '../lib/supabase';
import { INITIAL_USERS, SUBJECTS, CAREERS } from '../constants';

async function migrateInitialData() {
  // Migrar carreras
  for (const career of CAREERS) {
    await supabase.from('careers').upsert({
      id: career.id,
      name: career.name,
      years: career.years,
      theme: career.theme
    });
  }

  // Migrar materias
  for (const subject of SUBJECTS) {
    await supabase.from('subjects').upsert({
      id: subject.id,
      name: subject.name,
      career_id: subject.careerId,
      year: subject.year
    });
  }

  // Migrar usuarios (sin contraseñas en texto plano)
  // IMPORTANTE: Hashear contraseñas antes de migrar
  // ...
}
```

## Estructura de Base de Datos

### Tablas Principales:

- **careers**: Carreras disponibles
- **subjects**: Materias por carrera
- **users**: Usuarios del sistema
- **attendance_records**: Registros de asistencia
- **grades**: Calificaciones
- **notifications**: Notificaciones
- **forum_threads / forum_replies**: Foros de estudiantes
- **student_rep_events**: Eventos del Centro de Estudiantes
- **materials**: Material didáctico
- **planificaciones**: Planificaciones de materias
- **daily_tasks**: Tareas diarias (Staff)
- **incidents**: Incidentes (Staff)
- **student_rep_claims**: Reclamos/Sugerencias

Ver `supabase/schema.sql` para la estructura completa.

## Próximos Pasos

1. ✅ Crear tablas en Supabase
2. ✅ Configurar variables de entorno
3. ⬜ Configurar políticas RLS
4. ⬜ Migrar datos iniciales (opcional)
5. ⬜ Actualizar `App.tsx` para usar Supabase en lugar de estado local
6. ⬜ Implementar autenticación con Supabase Auth

## Notas Importantes

- **Seguridad**: Nunca expongas `SUPABASE_SERVICE_ROLE_KEY` en el frontend
- **RLS**: Siempre configura Row Level Security en producción
- **Contraseñas**: En producción, usa Supabase Auth en lugar de almacenar contraseñas en texto plano
- **Backups**: Configura backups automáticos en Supabase

## Recursos

- [Documentación de Supabase](https://supabase.com/docs)
- [Guía de RLS](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript/introduction)

