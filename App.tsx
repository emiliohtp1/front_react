import React, { useState } from 'react';
// Sistema de roles implementado
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';
import AddProductScreen from './src/screens/AddProductScreen';
import DrawerMenu from './src/components/DrawerMenu';

type Screen = 'login' | 'home' | 'productDetail' | 'addProduct';

const App = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProductsCount, setFilteredProductsCount] = useState(0);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const categories = ['Todas', 'Camisetas', 'Pantalones', 'Vestidos', 'Zapatos', 'Accesorios'];

  const navigateToScreen = (screen: Screen, product?: any) => {
    if (product) {
      setSelectedProduct(product);
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

  const handleOpenDrawer = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    handleCloseDrawer();
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
            <View style={styles.header}>
              <TouchableOpacity onPress={handleOpenDrawer} style={styles.menuButton}>
                <Text style={styles.menuButtonText}>☰</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Tienda de Ropa</Text>
              <View style={styles.headerActions}>
                {hasPermission('editor') && (
                  <TouchableOpacity onPress={() => navigateToScreen('addProduct')} style={styles.addProductButton}>
                    <Text style={styles.addProductButtonText}>+</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>⎗</Text>
                </TouchableOpacity>
              </View>
            </View>
            <HomeScreen 
              onProductSelect={(product) => navigateToScreen('productDetail', product)} 
              selectedCategory={selectedCategory}
              onCategorySelect={setSelectedCategory}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onFilteredProductsCountChange={setFilteredProductsCount}
              currentUser={currentUser}
              hasPermission={hasPermission}
            />
          </View>
        );
      case 'productDetail':
        return (
          <View style={styles.container}>
            <View style={styles.header}>
              <TouchableOpacity onPress={() => navigateToScreen('home')} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Volver</Text>
              </TouchableOpacity>
              <Text style={styles.headerTitle}>Detalles del Producto</Text>
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>⎗</Text>
              </TouchableOpacity>
            </View>
            <ProductDetailScreen product={selectedProduct} />
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
              <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutButtonText}>⎗</Text>
              </TouchableOpacity>
            </View>
            <AddProductScreen 
              onProductAdded={() => navigateToScreen('home')}
              onCancel={() => navigateToScreen('home')}
            />
          </View>
        );
      default:
        return <LoginScreen onLoginSuccess={() => navigateToScreen('home')} />;
    }
  };

  return (
    <View style={styles.appContainer}>
      {renderScreen()}
      {/* Drawer Menu - Solo se muestra en la pantalla home */}
      {currentScreen === 'home' && (
        <DrawerMenu
          isOpen={isDrawerOpen}
          onClose={handleCloseDrawer}
          categories={categories}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
          filteredProductsCount={filteredProductsCount}
        />
      )}
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
        paddingVertical: 12,
        paddingTop: 10, // Para el status bar en web
      },
  headerTitle: {
    color: '#fff',
    fontSize: 40,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  addProductButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  menuButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  menuButtonText: {
    color: '#fff',
    fontSize: 40,
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
  logoutButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 40,
    fontWeight: 'bold',
  },
});

export default App;
