import React, { useState, useEffect } from 'react';
// Sistema de roles implementado
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import EditProductScreen from './src/screens/EditProductScreen';
import UserProductsScreen from './src/screens/UserProductsScreen';
import DrawerMenu from './src/components/DrawerMenu';
import { getCart } from './src/services/database';

type Screen = 'login' | 'home' | 'productDetail' | 'addProduct' | 'editProduct' | 'userProducts';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<any[]>([]);
  const [cartTotal, setCartTotal] = useState(0);

  const categories = ['Todas', 'Camisetas', 'Pantalones', 'Vestidos', 'Zapatos', 'Accesorios'];

  // Cargar carrito cuando el usuario inicia sesión
  useEffect(() => {
    if (currentUser) {
      loadCart();
    } else {
      setCartItems([]);
      setCartTotal(0);
    }
  }, [currentUser]);

  const navigateToScreen = (screen: Screen, product?: any) => {
    if (product) {
      if (screen === 'editProduct') {
        setEditingProduct(product);
      } else {
        setSelectedProduct(product);
      }
    }
    setCurrentScreen(screen);
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('userToken');
      setCurrentUser(null);
      setCurrentScreen('login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };

  const handleProductEdit = (product: any) => {
    navigateToScreen('editProduct', product);
  };

  const loadCart = async () => {
    if (!currentUser) return;
    
    try {
      const cart = await getCart(currentUser._id);
      setCartItems(cart.items || []);
      setCartTotal(cart.total_items || 0);
    } catch (error) {
      console.error('Error cargando carrito:', error);
    }
  };

  const handleCartPress = () => {
    if (!currentUser) {
      alert('Debes iniciar sesión para ver tu carrito');
      return;
    }
    
    //console.log('Navegando a UserProducts para usuario:', currentUser._id);
    navigateToScreen('userProducts');
  };

  const hasPermission = (requiredRole: string) => {
    if (!currentUser) {
      console.log('No hay usuario logueado');
      return false;
    }
    
    const roleLevels = {
      'usuario': 1,
      'editor': 2,
      'administrador': 3
    };
    
    const userLevel = roleLevels[currentUser.role as keyof typeof roleLevels] || 1;
    const requiredLevel = roleLevels[requiredRole as keyof typeof roleLevels] || 1;
    
    //console.log('Verificando permisos:', {
      //userRole: currentUser.role,
      //userLevel,
      //requiredRole,
      //requiredLevel,
      //hasPermission: userLevel >= requiredLevel
    //});
    
    return userLevel >= requiredLevel;
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'login':
        return <LoginScreen onLoginSuccess={(user) => {
          setCurrentUser(user);
          navigateToScreen('home');
        }} />;
      case 'home':
        return (
          <View style={styles.container}>
            {/* Header fijo */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Tienda de Ropa</Text>
              <View style={styles.headerActions}>
                {hasPermission('editor') && (
                  <TouchableOpacity onPress={() => navigateToScreen('addProduct')} style={styles.addProductButton}>
                    <Text style={styles.addProductButtonText}>+</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
                  <Text style={styles.cartButtonText}>🛒</Text>
                  {cartTotal > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartTotal}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutButtonText}>⎗</Text>
                </TouchableOpacity>
              </View>
            </View>
            
            {/* Layout principal con sidebar fijo */}
            <View style={styles.mainLayout}>
              {/* Sidebar fijo */}
              <View style={styles.fixedSidebar}>
                <DrawerMenu
                  isOpen={true}
                  onClose={() => {}}
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onCategorySelect={handleCategorySelect}
                  filteredProductsCount={filteredProductsCount}
                />
              </View>
              
              {/* Área de contenido principal */}
              <View style={styles.contentArea}>
                <HomeScreen 
                  onProductSelect={(product) => navigateToScreen('productDetail', product)} 
                  onProductEdit={handleProductEdit}
                  selectedCategory={selectedCategory}
                  onCategorySelect={setSelectedCategory}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onFilteredProductsCountChange={setFilteredProductsCount}
                  currentUser={currentUser}
                  hasPermission={hasPermission}
                />
              </View>
            </View>
          </View>
        );
      case 'productDetail':
        //console.log('Renderizando ProductDetailScreen');
        //console.log('currentUser:', currentUser);
        //console.log('currentUser?._id:', currentUser?._id);
        //console.log('selectedProduct:', selectedProduct);
        
        return (
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigateToScreen('home')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalles del Producto</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
                  <Text style={styles.cartButtonText}>🛒</Text>
                  {cartTotal > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartTotal}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutButtonText}>⎗</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ProductDetailScreen 
              product={selectedProduct} 
              userId={currentUser?._id} 
            />
          </View>
        );
      case 'addProduct':
        return (
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigateToScreen('home')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Agregar Producto</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
                  <Text style={styles.cartButtonText}>🛒</Text>
                  {cartTotal > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartTotal}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutButtonText}>⎗</Text>
                </TouchableOpacity>
              </View>
            </View>
            <AddProductScreen 
              onProductAdded={() => navigateToScreen('home')}
              onCancel={() => navigateToScreen('home')}
            />
          </View>
        );
      case 'editProduct':
        return (
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigateToScreen('home')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Editar Producto</Text>
              <View style={styles.headerActions}>
                <TouchableOpacity onPress={handleCartPress} style={styles.cartButton}>
                  <Text style={styles.cartButtonText}>🛒</Text>
                  {cartTotal > 0 && (
                    <View style={styles.cartBadge}>
                      <Text style={styles.cartBadgeText}>{cartTotal}</Text>
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                  <Text style={styles.logoutButtonText}>⎗</Text>
                </TouchableOpacity>
              </View>
            </View>
            <EditProductScreen 
              product={editingProduct}
              onProductUpdated={() => navigateToScreen('home')}
              onCancel={() => navigateToScreen('home')}
            />
          </View>
        );
      case 'userProducts':
        return (
          <UserProductsScreen 
            userId={currentUser?._id || ''}
            onBack={() => navigateToScreen('home')}
          />
        );
      default:
        return <LoginScreen onLoginSuccess={() => navigateToScreen('home')} />;
    }
  };

      return (
        <View style={styles.appContainer}>
          {renderScreen()}
        </View>
      );
};

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: '#293540',
    minHeight: '100%' as any, // Asegurar altura mínima de viewport
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0c4aa9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8, // Para el status bar en web
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 50, // Altura fija del header
  },
  mainLayout: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 50, // Altura del header
    height: 'calc(100vh - 50px)', // Altura total menos header
  },
  fixedSidebar: {
    width: '14%',
    minWidth: 180,
    backgroundColor: '#6583a4',
    position: 'fixed',
    left: 0,
    top: 50, // Debajo del header
    bottom: 0,
    zIndex: 999,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#293540',
    marginLeft: '15%', // Espacio para el sidebar fijo
    minWidth: '85%',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addProductButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 36,
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '500',
  },
  cartButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    minWidth: 36,
  },
  cartButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ff4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoutButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default App;
