import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import { addProduct } from '../services/database';

interface AddProductScreenProps {
  onProductAdded: () => void;
  onCancel: () => void;
}

const AddProductScreen: React.FC<AddProductScreenProps> = ({ onProductAdded, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    category: '',
    image: '',
    size: '',
    color: '',
    stock: ''
  });
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const categories = ['Camisetas', 'Pantalones', 'Vestidos', 'Zapatos', 'Accesorios'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Limpiar mensaje de error cuando el usuario empiece a escribir
    if (errorMessage) {
      setErrorMessage('');
    }
  };

  const validateForm = () => {
    setErrorMessage(''); // Limpiar mensaje de error anterior
    
    if (!formData.name.trim()) {
      setErrorMessage('El nombre del producto es requerido');
      return false;
    }
    if (!formData.price.trim() || isNaN(Number(formData.price))) {
      setErrorMessage('El precio debe ser un número válido');
      return false;
    }
    if (!formData.description.trim()) {
      setErrorMessage('La descripción es requerida');
      return false;
    }
    if (!formData.category) {
      setErrorMessage('Selecciona una categoría');
      return false;
    }
    if (!formData.size) {
      setErrorMessage('Selecciona una talla');
      return false;
    }
    if (!formData.color.trim()) {
      setErrorMessage('El color es requerido');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const productData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
        category: formData.category,
        image: formData.image.trim() || 'https://picsum.photos/300/200?random=7',
        size: formData.size,
        color: formData.color.trim(),
        stock: formData.stock ? Number(formData.stock) : 0
      };

      console.log('Agregando producto:', productData);
      
      // Llamada real a la API
      const result = await addProduct(productData);
      
      if (result.success) {
        Alert.alert(
          'Éxito', 
          'Producto agregado correctamente',
          [{ text: 'OK', onPress: onProductAdded }]
        );
      } else {
        Alert.alert('Error', result.message || 'No se pudo agregar el producto');
      }
    } catch (error) {
      console.error('Error agregando producto:', error);
      Alert.alert('Error', 'No se pudo agregar el producto. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Agregar Nuevo Producto</Text>
        
        <View style={styles.form}>
          {/* Nombre del producto */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Nombre del Producto *</Text>
            <RNTextInput
              value={formData.name}
              onChangeText={(text) => handleInputChange('name', text)}
              style={styles.input}
              placeholder="Ej: Camiseta Básica"
            />
          </View>

          {/* Precio */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Precio *</Text>
            <RNTextInput
              value={formData.price}
              onChangeText={(text) => handleInputChange('price', text)}
              style={styles.input}
              placeholder="0.00"
              keyboardType="numeric"
            />
          </View>

          {/* Descripción */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Descripción *</Text>
            <RNTextInput
              value={formData.description}
              onChangeText={(text) => handleInputChange('description', text)}
              style={[styles.input, styles.textArea]}
              placeholder="Describe el producto..."
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Categoría */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Categoría *</Text>
            <View style={styles.categoryContainer}>
              {categories.map((category) => (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    formData.category === category && styles.selectedCategoryChip
                  ]}
                  onPress={() => handleInputChange('category', category)}
                >
                  <Text style={[
                    styles.categoryChipText,
                    formData.category === category && styles.selectedCategoryChipText
                  ]}>
                    {category}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Talla */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Talla *</Text>
            <View style={styles.sizeContainer}>
              {sizes.map((size) => (
                <TouchableOpacity
                  key={size}
                  style={[
                    styles.sizeChip,
                    formData.size === size && styles.selectedSizeChip
                  ]}
                  onPress={() => handleInputChange('size', size)}
                >
                  <Text style={[
                    styles.sizeChipText,
                    formData.size === size && styles.selectedSizeChipText
                  ]}>
                    {size}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Color */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Color *</Text>
            <RNTextInput
              value={formData.color}
              onChangeText={(text) => handleInputChange('color', text)}
              style={styles.input}
              placeholder="Ej: Azul, Rojo, Negro..."
            />
          </View>

          {/* Stock */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Stock</Text>
            <RNTextInput
              value={formData.stock}
              onChangeText={(text) => handleInputChange('stock', text)}
              style={styles.input}
              placeholder="0"
              keyboardType="numeric"
            />
          </View>

          {/* URL de imagen */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>URL de Imagen</Text>
            <RNTextInput
              value={formData.image}
              onChangeText={(text) => handleInputChange('image', text)}
              style={styles.input}
              placeholder="https://ejemplo.com/imagen.jpg"
            />
          </View>

          {/* Mensaje de error */}
          {errorMessage ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
            </View>
          ) : null}

          {/* Botones */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={onCancel}
              style={styles.cancelButton}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              onPress={handleSubmit}
              style={[styles.submitButton, loading && styles.submitButtonDisabled]}
              disabled={loading}
            >
              <Text style={styles.submitButtonText}>
                {loading ? 'Agregando...' : 'Agregar Producto'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293540',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#e8f4fd',
    marginBottom: 20,
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#6583a4',
    borderRadius: 10,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e8f4fd',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#0c4aa9',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#e8f4fd',
    color: '#293540',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#293540',
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
    fontWeight: 'bold',
  },
  sizeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sizeChip: {
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
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 10,
    marginBottom: 10,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#6583a4',
    borderWidth: 1,
    borderColor: '#0c4aa9',
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#e8f4fd',
    fontSize: 16,
    fontWeight: '500',
  },
  submitButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#0c4aa9',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#6583a4',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default AddProductScreen;
