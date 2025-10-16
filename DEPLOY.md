# 🚀 Despliegue en Render.com

## Configuración del Proyecto

Este proyecto está configurado para desplegarse en Render.com como una aplicación web estática.

### Archivos de Configuración

- `render.yaml` - Configuración de Render.com
- `public/_redirects` - Redirecciones para SPA
- `vite.config.js` - Configuración optimizada para producción

### Comandos de Build

```bash
# Instalar dependencias
npm install

# Build para producción
npm run build-web

# Servir localmente (opcional)
npm run web
```

### Variables de Entorno

El frontend se conecta automáticamente a la API desplegada en:
- **API URL**: `https://tienda-ropa-api.onrender.com/api`

### Estructura de Despliegue

```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   └── index-[hash].css
└── _redirects
```

## Pasos para Desplegar

1. **Conectar con GitHub**:
   - Ve a [Render.com](https://render.com)
   - Conecta tu cuenta de GitHub
   - Selecciona el repositorio `front_react`

2. **Configurar el Servicio**:
   - Tipo: **Static Site**
   - Build Command: `npm install && npm run build-web`
   - Publish Directory: `dist`

3. **Variables de Entorno** (opcional):
   - `NODE_ENV=production`

4. **Desplegar**:
   - Click en "Create Web Service"
   - Render construirá y desplegará automáticamente

## URLs

- **Frontend**: `https://tienda-ropa-frontend.onrender.com`
- **API**: `https://tienda-ropa-api.onrender.com`

## Troubleshooting

### Error de Build
- Verifica que todas las dependencias estén en `package.json`
- Revisa los logs de build en Render Dashboard

### Error de Routing
- Asegúrate de que `public/_redirects` esté presente
- Verifica que el build genere la carpeta `dist/`

### Error de API
- Verifica que la API esté desplegada y funcionando
- Revisa la URL de la API en `src/services/database.ts`
