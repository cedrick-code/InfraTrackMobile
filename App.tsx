import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import SplashScreen from './screens/citizen/splash';
import LoginScreen from './screens/citizen/login';
import RegisterScreen from './screens/citizen/register';
import CitizenTabs from './screens/citizen/tabs';
import FieldEngineerTabs from './screens/field-engineer/tabs';

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showRegister, setShowRegister] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('');
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem('auth_token');
        const savedFirstName = await AsyncStorage.getItem('first_name');
        const savedLastName = await AsyncStorage.getItem('last_name');
        const savedRole = await AsyncStorage.getItem('role');

        if (token && savedFirstName && savedLastName && savedRole) {
          setFirstName(savedFirstName);
          setLastName(savedLastName);
          setRole(savedRole);
          setIsLoggedIn(true);
        }
      } catch (error) {
        console.log('Error checking login:', error);
      } finally {
        setIsCheckingLogin(false);
      }
    };

    checkLogin();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (isCheckingLogin) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const handleLogout = async () => {
    await AsyncStorage.removeItem('auth_token');
    await AsyncStorage.removeItem('first_name');
    await AsyncStorage.removeItem('last_name');
    await AsyncStorage.removeItem('role');

    setIsLoggedIn(false);
    setFirstName('');
    setLastName('');
    setRole('');
  };

  if (isLoggedIn) {
    if (role === 'field_engineer') {
      return (
        <FieldEngineerTabs
          firstName={firstName}
          lastName={lastName}
          onLogout={handleLogout}
        />
      );
    }

    // default: citizen
    return (
      <CitizenTabs
        firstName={firstName}
        lastName={lastName}
        onLogout={handleLogout}
      />
    );
  }

  if (showRegister) {
    return <RegisterScreen onLogin={() => setShowRegister(false)} />;
  }

  return (
    <LoginScreen
      onRegister={() => setShowRegister(true)}
      onLogin={(userFirstName, userLastName, userRole) => {
        setFirstName(userFirstName);
        setLastName(userLastName);
        setRole(userRole);
        setIsLoggedIn(true);
      }}
    />
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});