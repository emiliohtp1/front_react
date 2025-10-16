import React from 'react';
import {
  View,
  StyleSheet,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  categories: string[];
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  filteredProductsCount: number;
}

const { width } = Dimensions.get('window');
const DRAWER_WIDTH = width * 0.2; // 20% del ancho de la pantalla

const DrawerMenu: React.FC<DrawerMenuProps> = ({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategorySelect,
  filteredProductsCount,
}) => {
  const translateX = new Animated.Value(isOpen ? 0 : -DRAWER_WIDTH);

  React.useEffect(() => {
    Animated.timing(translateX, {
      toValue: isOpen ? 0 : -DRAWER_WIDTH,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Overlay para cerrar el drawer */}
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      />
      
      {/* Drawer */}
      <Animated.View
        style={[
          styles.drawer,
          {
            transform: [{ translateX }],
          },
        ]}
      >
        <View style={styles.drawerHeader}>
          <Text style={styles.drawerTitle}>Filtros</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.drawerContent}>
          {/* Filtros de categoría */}
          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>Categorías</Text>
            <View style={styles.categoriesList}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  onPress={() => onCategorySelect(category)}
                  style={[
                    styles.categoryItem,
                    selectedCategory === category && styles.selectedCategoryItem,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      selectedCategory === category && styles.selectedCategoryText,
                    ]}
                  >
                    {category}
                  </Text>
                  {selectedCategory === category && (
                    <Text style={styles.checkmark}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Información de resultados */}
          <View style={styles.resultsSection}>
            <Text style={styles.resultsText}>
              {filteredProductsCount} producto{filteredProductsCount !== 1 ? 's' : ''} encontrado{filteredProductsCount !== 1 ? 's' : ''}
            </Text>
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 998,
    height: '100vh' as any,
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: DRAWER_WIDTH,
    height: '100vh' as any,
    backgroundColor: '#6583a4',
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 15,
    paddingTop: 50, // Para el status bar
    backgroundColor: '#0c4aa9',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f4fd',
  },
  drawerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: 'bold',
  },
  drawerContent: {
    flex: 1,
    padding: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#e8f4fd',
    marginBottom: 10,
  },
  categoriesSection: {
    marginBottom: 30,
  },
  categoriesList: {
    gap: 8,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#293540',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#0c4aa9',
  },
  selectedCategoryItem: {
    backgroundColor: '#0c4aa9',
    borderColor: '#0c4aa9',
  },
  categoryText: {
    fontSize: 12,
    color: '#e8f4fd',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#0c4aa9',
  },
  resultsText: {
    fontSize: 14,
    color: '#e8f4fd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DrawerMenu;
