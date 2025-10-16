import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  ScrollView,
  RefreshControl,
  Alert,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
} from 'react-native';
import { connectToDatabase, getProducts } from '../services/database';

interface Product {
  _id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  image: string;
  size: string;
  color: string;
}

interface HomeScreenProps {
  onProductSelect: (product: Product) => void;
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFilteredProductsCountChange: (count: number) => void;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ 
  onProductSelect, 
  selectedCategory, 
  onCategorySelect, 
  searchQuery, 
  onSearchChange, 
  onFilteredProductsCountChange 
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');

  const categories = ['Todas', 'Camisetas', 'Pantalones', 'Vestidos', 'Zapatos', 'Accesorios'];

  useEffect(() => {
    loadProducts();
  }, []);

  // Debounce para la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (products.length > 0) {
      filterProducts();
    }
  }, [products, debouncedSearchQuery, selectedCategory]);

  // Actualizar el contador de productos filtrados
  useEffect(() => {
    onFilteredProductsCountChange(filteredProducts.length);
  }, [filteredProducts, onFilteredProductsCountChange]);

  const loadProducts = async () => {
    try {
      // Para web, llamamos directamente a la API sin usar connectToDatabase
      if (typeof window !== 'undefined') {
        console.log('Cargando productos desde la API...');
        const response = await fetch('https://tienda-ropa-api.onrender.com/api/products');
        const result = await response.json();
        
          if (result.success) {
            console.log('Productos cargados desde API:', result.products.length, 'productos');
            console.log('Primeros 3 productos:', result.products.slice(0, 3));
            console.log('Todos los productos de la API:', result.products);
            
            // Normalizar los productos para usar _id consistentemente
            const normalizedProducts = result.products.map(product => ({
              ...product,
              _id: product.id || product._id || `product-${Math.random()}`
            }));
            
            console.log('Productos normalizados:', normalizedProducts.length);
            setProducts(normalizedProducts);
        } else {
          console.log('Error en la API, usando datos mock');
          const db = await connectToDatabase();
          const productsData = await getProducts(db);
          setProducts(productsData);
        }
      } else {
        // Para móvil, usar la función original
        const db = await connectToDatabase();
        const productsData = await getProducts(db);
        setProducts(productsData);
      }
    } catch (error) {
      console.error('Error cargando productos:', error);
      Alert.alert('Error', 'No se pudieron cargar los productos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadProducts();
    setRefreshing(false);
  };

  const filterProducts = useCallback(() => {
    if (products.length === 0) {
      setFilteredProducts([]);
      return;
    }

    let filtered = [...products]; // Crear una copia para evitar mutaciones
    console.log('Filtrando productos. Total:', products.length, 'Búsqueda:', searchQuery, 'Categoría:', selectedCategory);

    // Aplicar filtro de búsqueda
    if (debouncedSearchQuery && debouncedSearchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
      console.log('Después de búsqueda:', filtered.length, 'productos');
    }

    // Aplicar filtro de categoría
    if (selectedCategory && selectedCategory !== 'Todas') {
      filtered = filtered.filter(product => product.category === selectedCategory);
      console.log('Después de categoría:', filtered.length, 'productos');
    } else if (selectedCategory === 'Todas') {
      console.log('Mostrando todas las categorías');
    }

    // Eliminar duplicados por ID
    const uniqueFiltered = filtered.filter((product, index, self) => 
      index === self.findIndex(p => p._id === product._id)
    );

    console.log('Productos filtrados finales (únicos):', uniqueFiltered.length);
    setFilteredProducts(uniqueFiltered);
  }, [products, debouncedSearchQuery, selectedCategory]);

  const renderProduct = ({ item }: { item: Product }) => {
    console.log('Renderizando producto:', item.name, 'URL:', item.image);
    return (
      <TouchableOpacity 
        style={styles.productCard} 
        onPress={() => onProductSelect(item)}
      >
        <Image 
          source={{ uri: item.image || 'https://picsum.photos/300/200?random=8' }} 
          style={styles.productImage as any}
        />
      <View style={styles.productContent}>
        <Text style={styles.productTitle}>{item.name}</Text>
        <Text style={styles.productPrice}>${item.price}</Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        <View style={styles.productInfo}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.category}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipText}>{item.size}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Barra de búsqueda */}
      <TextInput
        placeholder="Buscar productos..."
        onChangeText={onSearchChange}
        value={searchQuery}
        style={styles.searchBar}
      />

      {/* Indicador de filtros activos */}
      {(selectedCategory !== 'Todas' || debouncedSearchQuery) && (
        <View style={styles.filterIndicator}>
          <Text style={styles.filterText}>
            {selectedCategory && selectedCategory !== 'Todas' && `Categoría: ${selectedCategory}`}
            {selectedCategory && selectedCategory !== 'Todas' && debouncedSearchQuery && ' | '}
            {debouncedSearchQuery && `Búsqueda: "${debouncedSearchQuery}"`}
            {' - '}
            {filteredProducts.length} producto{filteredProducts.length !== 1 ? 's' : ''}
          </Text>
        </View>
      )}

      <ScrollView
        contentContainerStyle={styles.productsList}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
        style={styles.flatListContainer}
      >
        <View style={styles.productsGrid}>
          {filteredProducts.map((item) => (
            <View key={item._id} style={styles.productWrapper}>
              {renderProduct({ item })}
            </View>
          ))}
        </View>
      </ScrollView>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293540',
    minHeight: '100%' as any,
  },
  flatListContainer: {
    flex: 1,
    backgroundColor: '#293540',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#0c4aa9',
  },
  searchBar: {
    margin: 10,
    padding: 12,
    backgroundColor: '#e8f4fd',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#0c4aa9',
    fontSize: 16,
    color: '#293540',
  },
  categoriesContainer: {
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  categoryChip: {
    marginRight: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#6583a4',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#0c4aa9',
  },
  selectedCategoryChip: {
    backgroundColor: '#0c4aa9',
    borderColor: '#0c4aa9',
  },
  categoryChipText: {
    fontSize: 14,
    color: '#e8f4fd',
  },
  selectedCategoryChipText: {
    color: '#fff',
  },
  productsList: {
    padding: 10,
    flexGrow: 1,
    backgroundColor: '#293540',
  },
  productsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  productWrapper: {
    width: '33.33%', // Para 3 columnas (100% / 3)
    padding: 5,
  },
  productCard: {
    backgroundColor: '#6583a4',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
    height: 300,
    margin: 0, // El padding se maneja en productWrapper
  },
  productImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  productContent: {
    padding: 12,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#e8f4fd',
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c4aa9',
    marginBottom: 8,
  },
  productDescription: {
    fontSize: 12,
    color: '#e8f4fd',
    marginBottom: 8,
  },
  productInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chip: {
    marginRight: 4,
    marginBottom: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#0c4aa9',
    borderRadius: 12,
  },
  chipText: {
    fontSize: 12,
    color: '#fff',
  },
  filterIndicator: {
    backgroundColor: '#0c4aa9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginHorizontal: 10,
    marginBottom: 10,
    borderRadius: 8,
  },
  filterText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});

export default HomeScreen;
