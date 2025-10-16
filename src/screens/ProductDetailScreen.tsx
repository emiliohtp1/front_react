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
}

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC<ProductDetailScreenProps> = ({ product }) => {
  const [loading, setLoading] = useState(false);
  const [selectedSize, setSelectedSize] = useState(product.size || 'M');

  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleAddToCart = async () => {
    setLoading(true);
    try {
      await addToCart(product._id, selectedSize);
      Alert.alert('Éxito', 'Producto agregado al carrito');
    } catch (error) {
      console.error('Error agregando al carrito:', error);
      Alert.alert('Error', 'No se pudo agregar el producto al carrito');
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
                    onPress={() => setSelectedSize(size)}
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
});

export default ProductDetailScreen;
