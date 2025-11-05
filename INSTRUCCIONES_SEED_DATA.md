# Instrucciones para Poblar Datos Iniciales en Supabase

## Problema

Si ves el error: `insert or update on table "users" violates foreign key constraint "users_career_id_fkey"`, significa que las tablas base (carreras y materias) no están pobladas en la base de datos.

## Solución

### Paso 1: Ejecutar el Script SQL

1. Ve a tu proyecto en **Supabase Dashboard**: https://supabase.com/dashboard
2. Abre tu proyecto
3. Ve a **SQL Editor** en el menú lateral
4. Abre el archivo `supabase/seed-data.sql` de este proyecto
5. Copia **TODO** el contenido del archivo
6. Pégalo en el editor SQL de Supabase
7. Haz clic en **Run** para ejecutar el script

### Paso 2: Verificar

El script mostrará al final:
- Cantidad de carreras insertadas (debe ser 2)
- Cantidad de materias insertadas (debe ser 18)
- Cantidad de horarios insertados (debe ser 18)

### Paso 3: Probar de Nuevo

Después de ejecutar el script, intenta crear un estudiante nuevamente desde el dashboard del preceptor.

## Qué hace el script

El script `seed-data.sql` inserta:

1. **Carreras**:
   - `dev`: Tecnicatura Superior en Desarrollo de Software
   - `design`: Tecnicatura Superior en Diseño, Imagen y Sonido

2. **Materias** (18 en total):
   - 9 materias de Desarrollo (3 por año)
   - 9 materias de Diseño (3 por año)

3. **Horarios de Clase**:
   - Horarios para todas las materias

## Nota Importante

- El script usa `ON CONFLICT DO UPDATE` para evitar duplicados
- Puedes ejecutarlo múltiples veces sin problemas
- Si quieres empezar desde cero, descomenta las líneas `TRUNCATE` al inicio del script

## Si el error persiste

1. Verifica que las carreras existan:
   ```sql
   SELECT * FROM careers;
   ```
   Debe mostrar 2 carreras.

2. Verifica que el preceptor tenga un `career_id` válido:
   ```sql
   SELECT id, name, career_id FROM users WHERE role = 'Preceptor';
   ```
   El `career_id` debe ser `'dev'` o `'design'`.

3. Si el preceptor no tiene `career_id`, actualízalo:
   ```sql
   UPDATE users 
   SET career_id = 'dev' 
   WHERE role = 'Preceptor' AND career_id IS NULL;
   ```

