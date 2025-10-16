# Tienda de Ropa - React Native

Una aplicación móvil de tienda de ropa desarrollada con React Native que incluye autenticación con MongoDB, catálogo de productos y navegación con menú lateral.

## Características

- 🔐 **Autenticación**: Login con validación desde MongoDB Cluster
- 🛍️ **Catálogo de Productos**: Visualización de productos en grid con filtros
- 🔍 **Búsqueda**: Búsqueda de productos por nombre y descripción
- 🏷️ **Filtros**: Filtrado por categorías (Camisetas, Pantalones, Vestidos, etc.)
- 📱 **Navegación**: Menú lateral desplegable para navegación
- 📄 **Detalles**: Página de detalles del producto con información completa
- 🛒 **Carrito**: Funcionalidad para agregar productos al carrito

## Tecnologías Utilizadas

- **React Native** 0.72.6
- **React Navigation** 6.x (Stack y Drawer)
- **React Native Paper** (UI Components)
- **MongoDB** (Base de datos)
- **TypeScript** (Tipado estático)

## Instalación

1. **Clona el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd tienda-ropa-rn
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Configura MongoDB**
   - Crea un cluster en MongoDB Atlas
   - Actualiza la URI de conexión en `src/services/database.ts`
   - Ejecuta el script para crear datos de muestra

4. **Ejecuta la aplicación**
   
   Para Android:
   ```bash
   npm run android
   ```
   
   Para iOS:
   ```bash
   npm run ios
   ```

## Configuración de la Base de Datos

### 🐍 Usando Python (Recomendado)

1. **Instalar dependencias:**
   ```bash
   cd python_db
   pip install -r requirements.txt
   ```

2. **Configurar la base de datos:**
   ```bash
   python install_and_setup.py
   ```

3. **Probar la conexión:**
   ```bash
   python test_connection.py
   ```

### 📊 Gestión de Usuarios

- **Agregar usuario:** `python add_user.py`
- **Ver todos los usuarios:** `python test_integration.py`

### 🔐 Usuario por Defecto

- **Email:** `admin@tienda.com`
- **Contraseña:** `admin123`

## Estructura del Proyecto

```
src/
├── components/                    # Componentes reutilizables
├── screens/                       # Pantallas de la aplicación
│   ├── LoginScreen.tsx            # Pantalla de login
│   ├── HomeScreen.tsx             # Pantalla principal con productos
│   └── ProductDetailScreen.tsx    # Detalles del producto
├── services/
│   └── database.ts                # Servicios de base de datos
└── utils/
    └── platform.ts                # Utilidades de plataforma

python_db/                         # Scripts de Python para MongoDB
├── database_manager.py            # Gestor de base de datos
├── add_user.py                    # Agregar usuarios
├── setup_database.py              # Configurar datos iniciales
├── test_connection.py             # Probar conexión
└── requirements.txt               # Dependencias de Python
```

## Funcionalidades Principales

### Autenticación
- Login con email y contraseña
- Validación contra MongoDB
- Navegación automática tras login exitoso

### Catálogo de Productos
- Grid de productos con imágenes
- Información básica (nombre, precio, descripción)
- Chips de categoría y talla

### Filtros y Búsqueda
- Barra de búsqueda por texto
- Filtros por categoría
- Actualización en tiempo real

### Detalles del Producto
- Imagen del producto
- Información completa
- Selector de tallas
- Botón para agregar al carrito

### Navegación
- Menú lateral desplegable
- Navegación por stack entre pantallas
- Opción de cerrar sesión

## Datos de Prueba

El sistema incluye datos de muestra que se pueden crear ejecutando la función `createSampleData()` en el servicio de base de datos.

**Usuario de prueba:**
- Email: admin@tienda.com
- Contraseña: admin123

## Próximas Mejoras

- [ ] Implementar carrito de compras completo
- [ ] Sistema de favoritos
- [ ] Notificaciones push
- [ ] Integración con pasarela de pagos
- [ ] Modo offline
- [ ] Gestión de perfil de usuario

## Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.
