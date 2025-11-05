# Verificación de Variables de Entorno en Vercel

## Variables Requeridas para el Frontend (Vite)

Para que Vite pueda usar las variables de entorno en el frontend, **DEBEN tener el prefijo `VITE_`**.

### ✅ Variables que DEBES tener en Vercel:

```
VITE_SUPABASE_URL=https://ekatcdsvknlecasylrcr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXRjZHN2a25sZWNhc3lscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzY0MjYsImV4cCI6MjA3Nzk1MjQyNn0.xR4KMcn8ZFVDbCVHsyXeCidU421QBj6oK_FrvTHbnuw
GEMINI_API_KEY=tu_api_key_aqui
```

### ⚠️ Importante:

- `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` son para Next.js
- Para Vite necesitas `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
- Las otras variables de PostgreSQL son para backend/serverless, no para el frontend

## Pasos para Agregar las Variables Correctas:

1. Ve a tu proyecto en Vercel Dashboard
2. Settings → Environment Variables
3. Agrega estas dos variables:
   - **Name**: `VITE_SUPABASE_URL`
     **Value**: `https://ekatcdsvknlecasylrcr.supabase.co`
     **Environment**: Production, Preview, Development (marca todas)
   
   - **Name**: `VITE_SUPABASE_ANON_KEY`
     **Value**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrYXRjZHN2a25sZWNhc3lscmNyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNzY0MjYsImV4cCI6MjA3Nzk1MjQyNn0.xR4KMcn8ZFVDbCVHsyXeCidU421QBj6oK_FrvTHbnuw`
     **Environment**: Production, Preview, Development (marca todas)

4. Si ya tienes `GEMINI_API_KEY`, verifica que esté configurada
5. Después de agregar las variables, **redespliega** el proyecto (o haz un nuevo commit)

## Verificación:

Una vez agregadas, el código en `lib/supabase.ts` podrá acceder a:
- `import.meta.env.VITE_SUPABASE_URL`
- `import.meta.env.VITE_SUPABASE_ANON_KEY`

Si no las agregas, el cliente de Supabase usará los valores por defecto (fallback) que están en el código.

