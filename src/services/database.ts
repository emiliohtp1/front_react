import { isWeb } from '../utils/platform';
import { mockUsers, mockProducts } from './mockData';

// Configuración de MongoDB
const MONGODB_URI = 'mongodb+srv://emiliohtp_db_user:PUyvTLcwWKOQ4wwM@cluster0.cvdcchr.mongodb.net/';
const DB_NAME = 'login';

// Tipos para compatibilidad
interface Db {
  collection: (name: string) => any;
}

// Para web, usamos la API REST desplegada en Render.com
const API_BASE_URL = 'https://tienda-ropa-api.onrender.com/api';

export const connectToDatabase = async (): Promise<Db> => {
  // Para web, usamos datos mock por ahora (se puede cambiar a API REST)
  if (isWeb) {
    return {
      collection: (name: string) => ({
        find: () => ({
          toArray: () => Promise.resolve(name === 'products' ? mockProducts : mockUsers)
        }),
        findOne: (query: any) => {
          if (name === 'users') {
            return Promise.resolve(mockUsers.find(user => 
              user.email === query.email && user.password === query.password
            ) || null);
          }
          return Promise.resolve(null);
        },
        insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
        insertMany: () => Promise.resolve({ insertedIds: ['mock-id-1', 'mock-id-2'] })
      })
    };
  }

  // Para móvil, aquí iría la conexión real a MongoDB
  // Por ahora usamos datos mock también
  return {
    collection: (name: string) => ({
      find: () => ({
        toArray: () => Promise.resolve(name === 'products' ? mockProducts : mockUsers)
      }),
      findOne: (query: any) => {
        if (name === 'users') {
          return Promise.resolve(mockUsers.find(user => 
            user.email === query.email && user.password === query.password
          ) || null);
        }
        return Promise.resolve(null);
      },
      insertOne: () => Promise.resolve({ insertedId: 'mock-id' }),
      insertMany: () => Promise.resolve({ insertedIds: ['mock-id-1', 'mock-id-2'] })
    })
  };
};

export const authenticateUser = async (db: Db, email: string, password: string) => {
  try {
    if (isWeb) {
      // Para web, usamos la API REST
      try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username: email,
            password: password
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          return {
            _id: result.user.id,
            email: result.user.username,
            name: result.user.username,
            created_at: result.user.created_at
          };
        } else {
          console.log('Error de autenticación:', result.message);
          return null;
        }
      } catch (apiError) {
        console.log('Error conectando a la API, usando datos mock:', apiError);
        // Fallback a datos mock si la API no está disponible
        return mockUsers.find(user => user.email === email && user.password === password) || null;
      }
    }
    
    const users = db.collection('users');
    const user = await users.findOne({ email, password });
    return user;
  } catch (error) {
    console.error('Error autenticando usuario:', error);
    throw error;
  }
};

export const getProducts = async (db: Db) => {
  try {
    if (isWeb) {
      // Para web, usamos la API REST
      try {
        console.log('Obteniendo productos de la API...');
        const response = await fetch(`${API_BASE_URL}/products`);
        const result = await response.json();
        
        if (result.success) {
          console.log('Productos obtenidos de la API:', result.products.length);
          return result.products;
        } else {
          console.log('Error obteniendo productos:', result.message);
          return mockProducts; // Fallback a datos mock
        }
      } catch (apiError) {
        console.log('Error conectando a la API, usando datos mock:', apiError);
        return mockProducts; // Fallback a datos mock
      }
    }
    
    const products = db.collection('products');
    const productsList = await products.find({}).toArray();
    return productsList;
  } catch (error) {
    console.error('Error obteniendo productos:', error);
    throw error;
  }
};

export const getProductsByCategory = async (db: Db, category: string) => {
  try {
    if (isWeb) {
      // Para web, filtramos los datos mock
      return mockProducts.filter(product => product.category === category);
    }
    
    const products = db.collection('products');
    const productsList = await products.find({ category }).toArray();
    return productsList;
  } catch (error) {
    console.error('Error obteniendo productos por categoría:', error);
    throw error;
  }
};

export const getProductById = async (db: Db, productId: string) => {
  try {
    if (isWeb) {
      // Para web, buscamos en datos mock
      return mockProducts.find(product => product._id === productId) || null;
    }
    
    const products = db.collection('products');
    const product = await products.findOne({ _id: productId });
    return product;
  } catch (error) {
    console.error('Error obteniendo producto:', error);
    throw error;
  }
};

export const addToCart = async (productId: string, size: string) => {
  try {
    // Simulamos la operación para ambas plataformas
    console.log(`Agregando producto ${productId} con talla ${size} al carrito`);
    return true;
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    throw error;
  }
};

export const createSampleData = async (db: Db) => {
  try {
    // Crear usuario de prueba
    const users = db.collection('users');
    await users.insertOne({
      email: 'admin@tienda.com',
      password: 'admin123',
      name: 'Administrador',
      role: 'admin'
    });

    // Crear productos de muestra
    const products = db.collection('products');
    const sampleProducts = [
      {
        name: 'Camiseta Básica Blanca',
        price: 25.99,
        description: 'Camiseta de algodón 100% de alta calidad, perfecta para el día a día.',
        category: 'Camisetas',
        image: 'https://via.placeholder.com/300x200/6200ea/ffffff?text=Camiseta+Blanca',
        size: 'M',
        color: 'Blanco',
        stock: 50
      },
      {
        name: 'Jeans Clásicos Azules',
        price: 59.99,
        description: 'Jeans de corte clásico en denim azul, cómodos y duraderos.',
        category: 'Pantalones',
        image: 'https://via.placeholder.com/300x200/1976d2/ffffff?text=Jeans+Azules',
        size: 'L',
        color: 'Azul',
        stock: 30
      },
      {
        name: 'Vestido Elegante Negro',
        price: 89.99,
        description: 'Vestido elegante para ocasiones especiales, corte A-line.',
        category: 'Vestidos',
        image: 'https://via.placeholder.com/300x200/424242/ffffff?text=Vestido+Negro',
        size: 'M',
        color: 'Negro',
        stock: 20
      },
      {
        name: 'Zapatos Deportivos',
        price: 79.99,
        description: 'Zapatos deportivos cómodos para caminar y hacer ejercicio.',
        category: 'Zapatos',
        image: 'https://via.placeholder.com/300x200/ff9800/ffffff?text=Zapatos+Deportivos',
        size: '42',
        color: 'Negro',
        stock: 25
      },
      {
        name: 'Collar de Plata',
        price: 45.99,
        description: 'Collar elegante de plata 925, perfecto para complementar cualquier outfit.',
        category: 'Accesorios',
        image: 'https://via.placeholder.com/300x200/9e9e9e/ffffff?text=Collar+Plata',
        size: 'Único',
        color: 'Plata',
        stock: 15
      },
      {
        name: 'Sudadera con Capucha',
        price: 49.99,
        description: 'Sudadera cómoda con capucha, ideal para días frescos.',
        category: 'Camisetas',
        image: 'https://via.placeholder.com/300x200/4caf50/ffffff?text=Sudadera+Verde',
        size: 'L',
        color: 'Verde',
        stock: 35
      }
    ];

    await products.insertMany(sampleProducts);
    console.log('Datos de muestra creados exitosamente');
  } catch (error) {
    console.error('Error creando datos de muestra:', error);
    throw error;
  }
};
