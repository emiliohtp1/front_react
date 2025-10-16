# 🚀 Despliegue en Render.com

## Configuración del Proyecto

Este proyecto está configurado para desplegarse como una aplicación web estática en Render.com.

### Archivos de Configuración

- `render.yaml` - Configuración específica para Render.com
- `vite.config.js` - Configuración de Vite para el build
- `package.json` - Scripts de build y dependencias

### Scripts Disponibles

```bash
# Desarrollo local
npm run web

# Build para producción
npm run build-web

# Verificar build localmente
npm run build-web && npx serve dist
```

### Variables de Entorno

El proyecto se conecta a la API desplegada en:
- **API URL**: `https://tienda-ropa-api.onrender.com/api`

### Estructura de Build

Después del build, los archivos estáticos se generan en:
- `dist/` - Archivos estáticos listos para producción

## Despliegue en Render.com

1. **Conectar Repositorio**: Conecta tu repositorio de GitHub
2. **Tipo de Servicio**: Selecciona "Static Site"
3. **Build Command**: `npm install && npm run build-web`
4. **Publish Directory**: `dist`
5. **Node Version**: 18.x (recomendado)

## URLs de Producción

- **Frontend**: https://tienda-ropa-frontend.onrender.com
- **API**: https://tienda-ropa-api.onrender.com
