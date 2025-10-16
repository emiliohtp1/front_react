import { Platform } from 'react-native';

export const isWeb = Platform.OS === 'web';
export const isAndroid = Platform.OS === 'android';
export const isIOS = Platform.OS === 'ios';

// Configuración específica para web
export const webConfig = {
  baseURL: isWeb ? window.location.origin : 'http://localhost:3000',
  apiURL: isWeb ? '/api' : 'http://localhost:3000/api',
};
