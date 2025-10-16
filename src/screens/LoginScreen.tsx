import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput as RNTextInput,
  TouchableOpacity,
} from 'react-native';
import { connectToDatabase, authenticateUser } from '../services/database';

interface LoginScreenProps {
  onLoginSuccess: () => void;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleLogin = async () => {
    // Limpiar mensaje de error anterior
    setErrorMessage('');

    // Validar campos vacíos
    if (!email || !password) {
      setErrorMessage('Por favor completa todos los campos');
      return;
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      setErrorMessage('Por favor ingresa un email válido');
      return;
    }

    setLoading(true);
    try {
      const db = await connectToDatabase();
      const user = await authenticateUser(db, email, password);
      
      if (user) {
        console.log('Login exitoso:', user);
        onLoginSuccess();
      } else {
        console.log('Credenciales incorrectas');
        setErrorMessage('Email o contraseña incorrectos. Verifica tus credenciales.');
      }
    } catch (error) {
      console.error('Error de autenticación:', error);
      setErrorMessage('Error al conectar con el servidor. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <View style={styles.card}>
            <Text style={styles.title}>Tienda de Ropa</Text>
            <Text style={styles.subtitle}>
              Inicia sesión para continuar
            </Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <RNTextInput
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage(''); // Limpiar error al escribir
                }}
                style={styles.input}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholder="Ingresa tu email"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <RNTextInput
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(''); // Limpiar error al escribir
                }}
                style={styles.input}
                secureTextEntry
                placeholder="Ingresa tu contraseña"
              />
            </View>

            {/* Mensaje de error */}
            {errorMessage ? (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
              </View>
            ) : null}
            
            <TouchableOpacity
              onPress={handleLogin}
              style={[styles.button, loading && styles.buttonDisabled]}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Cargando...' : 'Iniciar Sesión'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#293540',
    minHeight: '100vh',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: '#6583a4',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6,
  },
  title: {
    textAlign: 'center',
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0c4aa9',
    marginBottom: 10,
  },
  subtitle: {
    textAlign: 'center',
    fontSize: 16,
    color: '#e8f4fd',
    marginBottom: 30,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#e8f4fd',
    marginBottom: 5,
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
  button: {
    backgroundColor: '#0c4aa9',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6583a4',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
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
});

export default LoginScreen;
