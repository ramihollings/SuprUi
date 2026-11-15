import { registerRootComponent } from 'expo';
import App from './App';

// Expo entry point: register the root component (no expo-router —
// navigation is a hand-rolled state stack in App.tsx, see README.md).
registerRootComponent(App);
