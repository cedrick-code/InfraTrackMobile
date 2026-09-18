import { useState } from 'react';
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

type Props = {
  onRegister: () => void;
  onLogin: (firstName: string, lastName: string, role: string) => void;
};

export default function LoginScreen({
  onRegister,
  onLogin,
}: Props) {
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert(
        'Missing Information',
        'Please enter your username/email and password.'
      );
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/login/`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            username_or_email: usernameOrEmail,
            password: password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        const errorMessage =
          data?.non_field_errors?.[0] ||
          'Login failed. Please check your credentials.';

        Alert.alert('Login Failed', errorMessage);
        return;
      }

      // Save login token
      await AsyncStorage.setItem('auth_token', data.token);
      await AsyncStorage.setItem('first_name', data.user.first_name);
      await AsyncStorage.setItem('last_name', data.user.last_name);
      await AsyncStorage.setItem('role', data.user.role);

      onLogin(
        data.user.first_name,
        data.user.last_name,
        data.user.role
      );

    } catch (error) {
      Alert.alert(
        'Connection Error',
        'Unable to connect to the server. Make sure Django is running.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    Alert.alert(
      'Forgot Password',
      'Please contact DPWH Iligan City support to reset your password.'
    );
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
    >
      {/* Header with background image */}
      <View style={styles.header}>
        <Image
          source={require('../../assets/background.jpg')}
          style={styles.headerImage}
          resizeMode="cover"
        />
        <View style={styles.headerOverlay} />

        <View style={styles.headerContent}>
          <Text style={styles.headerTag}>
            DPWH  •  ILIGAN CITY
          </Text>

          <Text style={styles.logo}>InfraTrack</Text>

          <Text style={styles.headerSubtitle}>
            Report and track infrastructure issues across Iligan City.
          </Text>
        </View>
      </View>

      {/* Form card */}
      <View style={styles.card}>
        <Text style={styles.title}>Welcome!</Text>
        <Text style={styles.subtitle}>Login to continue</Text>

        <Text style={styles.label}>USERNAME/EMAIL</Text>
        <TextInput
          style={styles.input}
          placeholder="username or email"
          placeholderTextColor="#999"
          value={usernameOrEmail}
          onChangeText={setUsernameOrEmail}
          autoCapitalize="none"
        />

        <Text style={styles.label}>PASSWORD</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder="Enter your password"
            placeholderTextColor="#999"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={styles.showPasswordButton}
            onPress={() => setShowPassword(!showPassword)}
            activeOpacity={0.7}
          >
            <Text style={styles.showPasswordText}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.rowBetween}>
          <TouchableOpacity
            style={styles.rememberRow}
            onPress={() => setRememberMe(!rememberMe)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.checkbox,
                rememberMe && styles.checkboxChecked,
              ]}
            >
              {rememberMe && <Text style={styles.checkboxTick}>✓</Text>}
            </View>
            <Text style={styles.rememberText}>Remember me</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleForgotPassword}>
            <Text style={styles.forgotText}>Forgot Password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Logging in...' : 'Log In'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.orText}>or</Text>

        <TouchableOpacity
          style={styles.createButton}
          onPress={onRegister}
        >
          <Text style={styles.createButtonText}>Create Account</Text>
        </TouchableOpacity>

        <Text style={styles.footerText}>
          Your reports help DPWH prioritize safer roads, bridges, and drainage.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  scrollContent: {
    flexGrow: 1,
  },

  header: {
    height: 210,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  headerImage: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },

  headerOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 30, 60, 0.55)',
  },

  headerContent: {
    paddingHorizontal: 25,
    paddingBottom: 55,
  },

  headerTag: {
    color: '#E0E6F0',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 8,
  },

  logo: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 6,
  },

  headerSubtitle: {
    fontSize: 13,
    color: '#DCE3EE',
    lineHeight: 18,
  },

  card: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    marginTop: -20,
    paddingHorizontal: 25,
    paddingTop: 28,
    paddingBottom: 24,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 4,
  },

  subtitle: {
    fontSize: 15,
    color: '#8A8A8A',
    marginBottom: 24,
  },

  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    letterSpacing: 0.3,
    marginBottom: 8,
  },

  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 15,
    marginBottom: 18,
    color: '#222222',
    backgroundColor: '#FAFAFA',
  },

  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },

  rememberRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  checkbox: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: '#BBBBBB',
    borderRadius: 4,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  checkboxChecked: {
    backgroundColor: '#1A56DB',
    borderColor: '#1A56DB',
  },

  checkboxTick: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },

  rememberText: {
    fontSize: 13,
    color: '#555555',
  },

  forgotText: {
    fontSize: 13,
    color: '#1A56DB',
    fontWeight: '600',
  },

  loginButton: {
    height: 52,
    backgroundColor: '#1A56DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  orText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 13,
    marginVertical: 16,
  },

  createButton: {
    height: 52,
    backgroundColor: '#1A56DB',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },

  createButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  footerText: {
    textAlign: 'center',
    color: '#999999',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 22,
  },
  passwordContainer: {
    height: 50,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    borderRadius: 10,
    backgroundColor: '#FAFAFA',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },

  passwordInput: {
    flex: 1,
    height: '100%',
    paddingHorizontal: 15,
    fontSize: 15,
    color: '#222222',
  },

  showPasswordButton: {
    paddingHorizontal: 15,
    height: '100%',
    justifyContent: 'center',
  },

  showPasswordText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1A56DB',
  },
});