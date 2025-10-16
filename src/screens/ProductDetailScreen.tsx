import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
  Text,
  Image,
  TouchableOpacity,
} from 'react-native';
import { addToCart } from '../services/database';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  size: string;
  color: string;
  stock?: number;
}

interface ProductDetailScreenProps {
  product: Product;
  userId?: string;
}

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ product, userId }) => {
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.size || 'M');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleSizeSelect = (size: string) => {
    setSelectedSize(size);
    setSuccessMessage('');
    setErrorMessage('');
  };

  const handleAddToCart = async () => {
    //console.log('handleAddToCart llamado');
    //console.log('userId:', userId);
    //console.log('product._id:', product._id);
    //console.log('selectedSize:', selectedSize);
    
    setSuccessMessage('');
    setErrorMessage('');
    
    if (!userId) {
      console.log('No hay userId, mostrando error');
      setErrorMessage('Usuario no identificado');
      return;
    }
    
    //console.log('Iniciando proceso de agregar al carrito...');
    setLoading(true);
    try {
      //console.log('Llamando a addToCart...');
      const result = await addToCart(userId, product._id, selectedSize);
      //console.log('Resultado de addToCart:', result);
      
      if (result.success) {
        setSuccessMessage('¡Producto agregado al carrito exitosamente!');
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        setErrorMessage(result.message || 'No se pudo agregar el producto al carrito');
      }
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      setErrorMessage('Error de conexión. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        {/* Sección de imagen - Lado izquierdo */}
        <View style={styles.imageSection}>
          <View style={styles.imageCard}>
            <Image 
              source={{ uri: product.image || 'https://via.placeholder.com/400x300' }}
              style={styles.productImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Sección de detalles - Lado derecho */}
        <View style={styles.detailsSection}>
          <ScrollView style={styles.detailsScrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.detailsCard}>
              <Text style={styles.productTitle}>{product.name}</Text>
              <Text style={styles.productPrice}>${product.price}</Text>
              
              <View style={styles.divider} />
              
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{product.description}</Text>
              
              <Text style={styles.sectionTitle}>Información del Producto</Text>
              <View style={styles.infoContainer}>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>Categoría: {product.category}</Text>
                </View>
                <View style={styles.infoChip}>
                  <Text style={styles.infoChipText}>Color: {product.color}</Text>
                </View>
                {product.stock && (
                  <View style={styles.infoChip}>
                    <Text style={styles.infoChipText}>Stock: {product.stock}</Text>
                  </View>
                )}
              </View>
              
              <Text style={styles.sectionTitle}>Talla</Text>
              <View style={styles.sizesContainer}>
                {sizes.map((size) => (
                  <TouchableOpacity
                    key={size}
                    onPress={() => handleSizeSelect(size)}
                    style={[
                      styles.sizeChip,
                      selectedSize === size && styles.selectedSizeChip
                    ]}
                  >
                    <Text style={[
                      styles.sizeChipText,
                      selectedSize === size && styles.selectedSizeChipText
                    ]}>
                      {size}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              {/* Mensajes de estado */}
              {successMessage ? (
                <View style={styles.successMessage}>
                  <Text style={styles.successMessageText}>✓ {successMessage}</Text>
                </View>
              ) : null}
              
              {errorMessage ? (
                <View style={styles.errorMessage}>
                  <Text style={styles.errorMessageText}>⚠ {errorMessage}</Text>
                </View>
              ) : null}
              
              <TouchableOpacity
                onPress={handleAddToCart}
                style={[styles.addToCartButton, loading && styles.buttonDisabled]}
                disabled={loading}
              >
                <Text style={styles.addToCartButtonText}>
                  {loading ? 'Agregando...' : 'Agregar al Carrito'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293540',
    minHeight: '100%' as any,
  },
  contentContainer: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 50,
    height: 'calc(100vh - 50px)',
  },
  imageSection: {
    flex: 1,
    padding: 15,
    paddingRight: 8,
  },
  imageCard: {
    backgroundColor: '#6583a4',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
    height: '100%',
    minHeight: 500,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  detailsSection: {
    flex: 1,
    padding: 15,
    paddingLeft: 8,
  },
  detailsScrollView: {
    flex: 1,
  },
  detailsCard: {
    backgroundColor: '#6583a4',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    minHeight: '100%',
  },
  productTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#e8f4fd',
  },
  productPrice: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0c4aa9',
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#0c4aa9',
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    marginTop: 16,
    color: '#e8f4fd',
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#e8f4fd',
    marginBottom: 16,
  },
  infoContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  infoChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#0c4aa9',
    borderRadius: 16,
  },
  infoChipText: {
    fontSize: 14,
    color: '#fff',
  },
  sizesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  sizeChip: {
    marginRight: 8,
    marginBottom: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#e8f4fd',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0c4aa9',
  },
  selectedSizeChip: {
    backgroundColor: '#0c4aa9',
    borderColor: '#0c4aa9',
  },
  sizeChipText: {
    fontSize: 14,
    color: '#293540',
  },
  selectedSizeChipText: {
    color: '#fff',
  },
  addToCartButton: {
    backgroundColor: '#0c4aa9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6583a4',
  },
  addToCartButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successMessage: {
    backgroundColor: '#d4edda',
    borderColor: '#c3e6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successMessageText: {
    color: '#155724',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
  errorMessage: {
    backgroundColor: '#f8d7da',
    borderColor: '#f5c6cb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorMessageText: {
    color: '#721c24',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
  },
});

export default ProductDetailScreen;
