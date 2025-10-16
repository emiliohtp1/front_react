import { AppRegistry } from 'react-native';
import App from './App';

// Registrar la aplicación para web
AppRegistry.registerComponent('tiendaRopaRn', () => App);

// Para web, necesitamos ejecutar la aplicación
AppRegistry.runApplication('tiendaRopaRn', {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
