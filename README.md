<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1w1C2sTgpYgRrw9dSirkTDQXCgRsCLgB_

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Deploy

### Opción 1: Vercel (Recomendado)

1. **Instalar Vercel CLI** (si no lo tienes):
   ```bash
   npm i -g vercel
   ```

2. **Hacer deploy**:
   ```bash
   vercel
   ```
   Sigue las instrucciones en la terminal. La primera vez te pedirá:
   - Iniciar sesión en Vercel
   - Conectar con tu cuenta de GitHub (opcional)
   - Configurar el proyecto

3. **Configurar variables de entorno**:
   - Ve a tu proyecto en Vercel Dashboard
   - Settings → Environment Variables
   - Agrega: `GEMINI_API_KEY` con tu API key

4. **Deploy automático**:
   - Vercel se conecta automáticamente con GitHub
   - Cada push a `master` hace deploy automático

### Opción 2: Netlify

1. **Instalar Netlify CLI**:
   ```bash
   npm i -g netlify-cli
   ```

2. **Hacer deploy**:
   ```bash
   netlify deploy --prod
   ```

3. **Configurar variables de entorno** en Netlify Dashboard

### Opción 3: GitHub Pages

1. **Build del proyecto**:
   ```bash
   npm run build
   ```

2. **Instalar gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

3. **Agregar script al package.json**:
   ```json
   "scripts": {
     "deploy": "gh-pages -d dist"
   }
   ```

4. **Deploy**:
   ```bash
   npm run deploy
   ```

**Nota**: Para GitHub Pages, necesitarás configurar la base URL en `vite.config.ts` si el repo no está en la raíz.
