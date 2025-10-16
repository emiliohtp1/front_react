import { isWeb } from '../utils/platform';
import { mockUsers, mockProducts } from './mockData';

const MONGODB_URI = 'mongodb+srv://emiliohtp_db_user:PUyvTLcwWKOQ4wwM@cluster0.cvdcchr.mongodb.net/';
const DB_NAME = 'login';

interface Db {
  collection: (name: string) => any;
}

const API_BASE_URL = 'https://tienda-ropa-api.onrender.com/api';

export const connectToDatabase = async (): Promise<Db> => {
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
            role: result.user.role || 'usuario',
            created_at: result.user.created_at
          };
        } else {
          console.log('Error de autenticación:', result.message);
          return null;
        }
      } catch (apiError) {
        console.log('Error conectando a la API, usando datos mock:', apiError);
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

// ==================== FUNCIONES DEL CARRITO ====================

export const addToCart = async (userId: string, productId: string, size: string = "M", quantity: number = 1) => {
  try {
    if (isWeb) {
      try {
        //console.log(`Agregando producto ${productId} al carrito del usuario ${userId}`);
        const response = await fetch(`${API_BASE_URL}/cart/add?user_id=${userId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            size: size,
            quantity: quantity
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          //console.log('Producto agregado al carrito:', result);
          return result;
        } else {
          console.log('Error agregando al carrito:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    //console.log(`Agregando producto ${productId} con talla ${size} al carrito del usuario ${userId}`);
    return { success: true};
  } catch (error) {
    console.error('Error agregando al carrito:', error);
    throw error;
  }
};

export const getCart = async (userId: string) => {
  try {
    if (isWeb) {
      try {
        //console.log(`Obteniendo carrito del usuario ${userId}`);
        const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
        
        if (response.status === 404) {
          //console.log('Carrito no encontrado, devolviendo carrito vacío');
          return {
            id: null,
            user_id: userId,
            items: [],
            total_items: 0,
            total_price: 0,
            created_at: null,
            updated_at: null
          };
        }
        
        const result = await response.json();
        
        if (result.success) {
          //console.log('Carrito obtenido:', result);
          return result.cart;
        } else {
          console.log('Error obteniendo carrito:', result.message);
          return {
            id: null,
            user_id: userId,
            items: [],
            total_items: 0,
            total_price: 0,
            created_at: null,
            updated_at: null
          };
        }
      } catch (apiError) {
        console.log('Error conectando a la API, devolviendo carrito vacío:', apiError);
        return {
          id: null,
          user_id: userId,
          items: [],
          total_items: 0,
          total_price: 0,
          created_at: null,
          updated_at: null
        };
      }
    }
    
    return {
      id: null,
      user_id: userId,
      items: [],
      total_items: 0,
      total_price: 0,
      created_at: null,
      updated_at: null
    };
  } catch (error) {
    console.error('Error obteniendo carrito:', error);
    return {
      id: null,
      user_id: userId,
      items: [],
      total_items: 0,
      total_price: 0,
      created_at: null,
      updated_at: null
    };
  }
};

export const updateCartItem = async (userId: string, productId: string, size: string, quantity: number) => {
  try {
    if (isWeb) {
      try {
        //console.log(`Actualizando item ${productId} en carrito del usuario ${userId}`);
        const response = await fetch(`${API_BASE_URL}/cart/update?user_id=${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            size: size,
            quantity: quantity
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          //console.log('Item actualizado:', result);
          return result;
        } else {
          console.log('Error actualizando item:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    //console.log(`Actualizando item ${productId} en carrito del usuario ${userId}`);
    return { success: true, message: "Item actualizado (modo offline)" };
  } catch (error) {
    console.error('Error actualizando item del carrito:', error);
    throw error;
  }
};

export const removeFromCart = async (userId: string, productId: string, size: string) => {
  try {
    if (isWeb) {
      try {
        //console.log(`Eliminando producto ${productId} del carrito del usuario ${userId}`);
        const response = await fetch(`${API_BASE_URL}/cart/remove?user_id=${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product_id: productId,
            size: size
          })
        });
        
        const result = await response.json();
        
        if (result.success) {
          //console.log('Producto eliminado del carrito:', result);
          return result;
        } else {
          console.log('Error eliminando del carrito:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    console.log(`Eliminando producto ${productId} del carrito del usuario ${userId}`);
    return { success: true, message: "Producto eliminado del carrito (modo offline)" };
  } catch (error) {
    console.error('Error eliminando del carrito:', error);
    throw error;
  }
};

export const clearCart = async (userId: string) => {
  try {
    if (isWeb) {
      try {
        console.log(`Vaciando carrito del usuario ${userId}`);
        const response = await fetch(`${API_BASE_URL}/cart/clear/${userId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Carrito vaciado:', result);
          return result;
        } else {
          console.log('Error vaciando carrito:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    console.log(`Vaciando carrito del usuario ${userId}`);
    return { success: true, message: "Carrito vaciado (modo offline)" };
  } catch (error) {
    console.error('Error vaciando carrito:', error);
    throw error;
  }
};

export const processCheckout = async (userId: string, cartItems: any[]) => {
  try {
    //console.log('processCheckout iniciado');
    //console.log('userId:', userId);
    //console.log('cartItems:', cartItems);
    //console.log('isWeb:', isWeb);
    //console.log('API_BASE_URL:', API_BASE_URL);
    
    if (isWeb) {
      try {
        //console.log(`Procesando checkout para usuario ${userId}`, cartItems);
        //console.log('Enviando request a:', `${API_BASE_URL}/checkout`);
        
        const response = await fetch(`${API_BASE_URL}/checkout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            cart_items: cartItems
          })
        });
        
        //console.log('Response status:', response.status);
        //console.log('Response ok:', response.ok);
        
        const result = await response.json();
        //console.log('Response result:', result);
        
        if (result.success) {
          //console.log('Checkout procesado exitosamente:', result);
          return result;
        } else {
          console.log('Error procesando checkout:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    console.log(`Procesando checkout para usuario ${userId}`, cartItems);
    return { 
      success: true, 
      message: "Checkout procesado (modo offline)",
      stock_updates: cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        quantity: item.quantity,
        result: { success: true, action: "updated" }
      })),
      cart_cleared: true
    };
  } catch (error) {
    console.error('Error procesando checkout:', error);
    throw error;
  }
};

export const createSampleData = async (db: Db) => {
  try {
    const users = db.collection('users');
    await users.insertOne({
      email: 'admin@tienda.com',
      password: 'admin123',
      name: 'Administrador',
      role: 'admin'
    });

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

export const addProduct = async (productData: any) => {
  try {
    if (isWeb) {
      try {
        console.log('Enviando producto a la API:', productData);
        const response = await fetch(`${API_BASE_URL}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Producto agregado exitosamente:', result);
          return result;
        } else {
          console.log('Error agregando producto:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    const db = await connectToDatabase();
    const products = db.collection('products');
    const result = await products.insertOne(productData);
    return { success: true, product_id: result.insertedId };
  } catch (error) {
    console.error('Error agregando producto:', error);
    throw error;
  }
};

export const updateProduct = async (productId: string, productData: any) => {
  try {
    if (isWeb) {
      try {
        console.log('Actualizando producto:', productId, productData);
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(productData)
        });
        
        if (response.status === 405) {
          console.log('Endpoint PUT no disponible, usando fallback temporal');
          return { 
            success: true, 
            message: 'Producto actualizado (modo offline - los cambios se perderán al recargar)' 
          };
        }
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Producto actualizado exitosamente:', result);
          return result;
        } else {
          console.log('Error actualizando producto:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API, usando fallback temporal:', apiError);
        return { 
          success: true, 
          message: 'Producto actualizado (modo offline - los cambios se perderán al recargar)' 
        };
      }
    }
    
    const db = await connectToDatabase();
    const products = db.collection('products');
    const result = await products.updateOne({ _id: productId }, { $set: productData });
    return { success: true, modified_count: result.modifiedCount };
  } catch (error) {
    console.error('Error actualizando producto:', error);
    throw error;
  }
};

export const deleteProduct = async (productId: string) => {
  try {
    if (isWeb) {
      try {
        console.log('Eliminando producto:', productId);
        const response = await fetch(`${API_BASE_URL}/products/${productId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        const result = await response.json();
        
        if (result.success) {
          console.log('Producto eliminado exitosamente:', result);
          return result;
        } else {
          console.log('Error eliminando producto:', result.message);
          throw new Error(result.message);
        }
      } catch (apiError) {
        console.log('Error conectando a la API:', apiError);
        throw apiError;
      }
    }
    
    const db = await connectToDatabase();
    const products = db.collection('products');
    const result = await products.deleteOne({ _id: productId });
    return { success: true, deleted_count: result.deletedCount };
  } catch (error) {
    console.error('Error eliminando producto:', error);
    throw error;
  }
};
