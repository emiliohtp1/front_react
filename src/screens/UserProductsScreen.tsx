import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  RefreshControl,
} from 'react-native';

// Declarar window para TypeScript
declare const window: any;
import { getCart, removeFromCart, updateCartItem, processCheckout } from '../services/database';

interface CartItem {
  product_id: string;
  product_name: string;
  product_price: number;
  product_image: string;
  size: string;
  quantity: number;
  added_at: string;
}

interface Cart {
  id: string | null;
  user_id: string;
  items: CartItem[];
  total_items: number;
  total_price: number;
  created_at: string | null;
  updated_at: string | null;
}

interface UserProductsScreenProps {
  userId: string;
  onBack: () => void;
  onCartUpdated?: () => void;
}

const UserProductsScreen: React.FC<UserProductsScreenProps> = ({ userId, onBack, onCartUpdated }) => {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const loadCart = async (forceRefresh = false) => {
    try {
      //console.log('Cargando carrito para usuario:', userId, forceRefresh ? '(forzado)' : '');
      
      // Si es una actualización forzada, mostrar loading
      if (forceRefresh) {
        setLoading(true);
      }
      
      const cartData = await getCart(userId);
      //console.log('Carrito cargado desde BD:', cartData);
      
      // Si el carrito está vacío o no existe, crear un carrito vacío
      if (!cartData || !cartData.items || cartData.items.length === 0) {
        const emptyCart = {
          id: null,
          user_id: userId,
          items: [],
          total_items: 0,
          total_price: 0,
          created_at: null,
          updated_at: null
        };
        //console.log('Estableciendo carrito vacío:', emptyCart);
        setCart(emptyCart);
      } else {
        //console.log('Estableciendo carrito con items:', cartData);
        setCart(cartData);
      }
    } catch (error) {
      console.error('Error cargando carrito:', error);
      // En caso de error, mostrar carrito vacío
      const emptyCart = {
        id: null,
        user_id: userId,
        items: [],
        total_items: 0,
        total_price: 0,
        created_at: null,
        updated_at: null
      };
      console.log('Error - estableciendo carrito vacío:', emptyCart);
      setCart(emptyCart);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  // Efecto para actualizar la UI cuando cambie el carrito
  useEffect(() => {
    if (cart) {
      //console.log('Carrito actualizado en UI:', cart);
    }
  }, [cart]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadCart(true);
  };

  const handleUpdateQuantity = async (productId: string, size: string, newQuantity: number) => {
    try {
      //console.log('Actualizando cantidad:', { productId, size, newQuantity });
      const result = await updateCartItem(userId, productId, size, newQuantity);
      
      if (result.success) {
        //console.log('Cantidad actualizada exitosamente:', result);
        
        // Forzar actualización completa del carrito
        await loadCart(true);
        
        // Actualizar el carrito en el componente padre (App.tsx)
        if (onCartUpdated) {
          onCartUpdated();
        }
      } else {
        console.error('Error actualizando cantidad:', result.message);
        Alert.alert('Error', result.message || 'No se pudo actualizar la cantidad');
      }
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      Alert.alert('Error', 'No se pudo actualizar la cantidad');
    }
  };

  const handleRemoveItem = async (productId: string, size: string) => {
    try {
      //console.log('Eliminando item:', { productId, size });
      const result = await removeFromCart(userId, productId, size);
      
      if (result.success) {
        //console.log('Item eliminado exitosamente:', result);
        
        // Forzar actualización completa del carrito
        await loadCart(true);
        
        // Actualizar el carrito en el componente padre (App.tsx)
        if (onCartUpdated) {
          onCartUpdated();
        }
        
        // Mostrar mensaje de confirmación
        Alert.alert('Éxito', 'Producto eliminado del carrito');
      } else {
        console.error('Error eliminando item:', result.message);
        Alert.alert('Error', result.message || 'No se pudo eliminar el producto');
      }
    } catch (error) {
      console.error('Error eliminando item:', error);
      Alert.alert('Error', 'No se pudo eliminar el producto');
    }
  };

  const handleCheckout = async () => {
    //console.log('handleCheckout llamado');
    //console.log('cart:', cart);
    //console.log('cart.items.length:', cart?.items?.length);
    //console.log('userId:', userId);
    
    if (!cart || cart.items.length === 0) {
      //console.log('Carrito vacío, mostrando alert');
      Alert.alert('Error', 'No hay productos en el carrito');
      return;
    }

    // Usar confirm de la web en lugar de Alert
    const confirmed = window.confirm(
      `¿Estás seguro de que quieres proceder con la compra de ${cart.total_items} productos por un total de $${cart.total_price.toFixed(2)}?`
    );
    
    if (confirmed) {
      //console.log('Usuario confirmó la compra, iniciando checkout...');
      setCheckoutLoading(true);
      try {
        //console.log('Iniciando checkout...');
        const result = await processCheckout(userId, cart.items);
        
        if (result.success) {
          //console.log('Checkout exitoso:', result);
          
          // Mostrar resumen de la compra
          let message = '¡Compra realizada exitosamente!\n\n';
          
          if (result.stock_updates) {
            result.stock_updates.forEach((update: any) => {
              if (update.result.action === 'deleted') {
                message += `• ${update.product_name}: Eliminado (sin stock)\n`;
              } else {
                message += `• ${update.product_name}: Stock actualizado\n`;
              }
            });
          }
          
          message += `\nTotal pagado: $${cart.total_price.toFixed(2)}`;
          
          // Mostrar mensaje de éxito y navegar de regreso
          alert(message);
          
          // Recargar carrito (debería estar vacío)
          await loadCart(true);
          
          // Actualizar el carrito en el componente padre (App.tsx)
          if (onCartUpdated) {
            onCartUpdated();
          }
          
          // Navegar de regreso a HomeScreen después de un breve delay
          setTimeout(() => {
            onBack();
          }, 1000);
        } else {
          console.error('Error en checkout:', result.message);
          alert(`Error: ${result.message || 'No se pudo procesar la compra'}`);
        }
      } catch (error) {
        console.error('Error en checkout:', error);
        alert('Error: No se pudo procesar la compra. Intenta nuevamente.');
      } finally {
        setCheckoutLoading(false);
      }
    } else {
      console.log('Usuario canceló la compra');
    }
  };

  const renderCartItem = (item: CartItem, index: number) => (
    <View key={`${item.product_id}_${item.size}_${index}`} style={styles.cartItem}>
      <Image 
        source={{ uri: item.product_image || 'https://via.placeholder.com/100x100' }}
        style={styles.productImage}
        resizeMode="cover"
      />
      
      <View style={styles.itemDetails}>
        <Text style={styles.productName}>{item.product_name}</Text>
        <Text style={styles.productPrice}>${item.product_price.toFixed(2)}</Text>
        <Text style={styles.productSize}>Talla: {item.size}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            onPress={() => {
              if (item.quantity > 1) {
                handleUpdateQuantity(item.product_id, item.size, item.quantity - 1);
              }
            }}
            style={[
              styles.quantityButton,
              item.quantity <= 1 && styles.quantityButtonDisabled
            ]}
            disabled={item.quantity <= 1}
          >
            <Text style={[
              styles.quantityButtonText,
              item.quantity <= 1 && styles.quantityButtonTextDisabled
            ]}>-</Text>
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            onPress={() => handleUpdateQuantity(item.product_id, item.size, item.quantity + 1)}
            style={styles.quantityButton}
          >
            <Text style={styles.quantityButtonText}>+</Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.itemTotal}>
          Total: ${(item.product_price * item.quantity).toFixed(2)}
        </Text>
      </View>
      
      <TouchableOpacity
        onPress={() => handleRemoveItem(item.product_id, item.size)}
        style={styles.removeButton}
      >
        <Text style={styles.removeButtonText}>✕</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Volver</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Mi Carrito</Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>
            {refreshing ? 'Actualizando carrito...' : 'Cargando carrito...'}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Volver</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {cart && cart.items.length > 0 ? (
          <>
            {cart.items.map((item, index) => renderCartItem(item, index))}
            
            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Total de productos:</Text>
                <Text style={styles.summaryValue}>{cart.total_items}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Precio total:</Text>
                <Text style={styles.summaryTotal}>${cart.total_price.toFixed(2)}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={[styles.checkoutButton, checkoutLoading && styles.checkoutButtonDisabled]}
              onPress={() => {
                //console.log('Botón Proceder al pago presionado');
                handleCheckout();
              }}
              disabled={checkoutLoading}
            >
              <Text style={styles.checkoutButtonText}>
                {checkoutLoading ? 'Procesando...' : 'Proceder al Pago'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.emptyCart}>
            <Text style={styles.emptyCartText}>🛒</Text>
            <Text style={styles.emptyCartTitle}>Tu carrito está vacío</Text>
            <Text style={styles.emptyCartSubtitle}>
              Agrega algunos productos para comenzar
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293540',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0c4aa9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingTop: 8,
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    height: 50,
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
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 60, // Para balancear el layout
  },
  content: {
    flex: 1,
    marginTop: 50,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#e8f4fd',
    fontSize: 16,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: '#6583a4',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e8f4fd',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    color: '#0c4aa9',
    fontWeight: '600',
    marginBottom: 4,
  },
  productSize: {
    fontSize: 12,
    color: '#e8f4fd',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  quantityButton: {
    backgroundColor: '#0c4aa9',
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  quantityButtonDisabled: {
    backgroundColor: '#666',
    opacity: 0.6,
  },
  quantityButtonTextDisabled: {
    color: '#ccc',
  },
  quantityText: {
    color: '#e8f4fd',
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  itemTotal: {
    fontSize: 14,
    color: '#0c4aa9',
    fontWeight: 'bold',
  },
  removeButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ff4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  summary: {
    backgroundColor: '#6583a4',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#e8f4fd',
  },
  summaryValue: {
    fontSize: 16,
    color: '#e8f4fd',
    fontWeight: 'bold',
  },
  summaryTotal: {
    fontSize: 18,
    color: '#0c4aa9',
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#0c4aa9',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  checkoutButtonDisabled: {
    backgroundColor: '#6583a4',
    opacity: 0.6,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyCartText: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e8f4fd',
    marginBottom: 8,
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#e8f4fd',
    textAlign: 'center',
    opacity: 0.7,
  },
});

export default UserProductsScreen;
