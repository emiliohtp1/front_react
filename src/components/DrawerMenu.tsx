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
  return (
    <View style={styles.fixedSidebar}>

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
    </View>
  );
};

const styles = StyleSheet.create({
  fixedSidebar: {
    flex: 1,
    backgroundColor: '#6583a4',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  sidebarHeader: {
    paddingHorizontal: 10,
    paddingVertical: 12,
    backgroundColor: '#0c4aa9',
    borderBottomWidth: 1,
    borderBottomColor: '#e8f4fd',
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  drawerContent: {
    flex: 1,
    padding: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#e8f4fd',
    marginBottom: 8,
  },
  categoriesSection: {
    marginBottom: 20,
  },
  categoriesList: {
    gap: 6,
  },
  categoryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
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
    fontSize: 11,
    color: '#e8f4fd',
    fontWeight: '500',
  },
  selectedCategoryText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkmark: {
    fontSize: 14,
    color: '#fff',
    fontWeight: 'bold',
  },
  resultsSection: {
    marginTop: 'auto',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#0c4aa9',
  },
  resultsText: {
    fontSize: 10,
    color: '#e8f4fd',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

export default DrawerMenu;
