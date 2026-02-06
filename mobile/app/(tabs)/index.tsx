import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; 
import api from '../../services/api'; 

export default function LoginScreen() {
  const router = useRouter(); 
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false); 

  useFocusEffect(
    useCallback(() => {
      setEmail('');
      setPassword('');
      setLoading(false);
    }, [])
  );

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    setLoading(true);
    try {
      // ✅ ENSURE THIS HITS /auth/login
      console.log("🚀 Attempting login for:", email);
      const response = await api.post('/auth/login', { email, password });
      
      const { token, role, userId } = response.data;

      // 🔍 DEBUG: Log what we're saving
      console.log("🔐 Login Success! Saving data...");
      
      // ✅ Save to SecureStore
      await SecureStore.setItemAsync('token', token);
      await SecureStore.setItemAsync('role', role);
      await SecureStore.setItemAsync('userId', String(userId)); 

      // ✅ Set axios headers globally
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      
      Alert.alert('Success', `Welcome back!`);
      
      // Navigate based on role
      if (role === 'ADMIN') {
        router.replace('/(tabs)/catalog');
      } else {
        router.replace('/(tabs)/explore'); 
      }

    } catch (error: any) {
      console.error("❌ Login Error Details:", error);
      
      if (error.response) {
          // The request was made and the server responded with a status code
          console.log("Status:", error.response.status);
          console.log("Data:", error.response.data);
          
          if (error.response.status === 401) {
              Alert.alert('Login Failed', 'Incorrect email or password.');
          } else if (error.response.status === 404) {
              Alert.alert('Login Failed', 'User not found. Please sign up.');
          } else {
              Alert.alert('Login Failed', `Server Error (${error.response.status}): ${JSON.stringify(error.response.data)}`);
          }
      } else if (error.request) {
          // The request was made but no response was received
          Alert.alert('Network Error', 'Could not connect to the server. Check your internet or IP config.');
      } else {
          Alert.alert('Error', 'An unexpected error occurred.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    Alert.alert("Google Login", "This feature will be enabled in a future update!");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.logoContainer}>
          {/* Ensure the image path is correct for your project structure */}
          <Image source={require('../../assets/images/logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Log in to continue your verified learning journey.</Text>

        <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
          <Ionicons name="logo-google" size={20} color="#DB4437" style={{ marginRight: 10 }} />
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <View style={styles.inputWrapper}>
             <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#94A3B8"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
            />
          </View>

          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#94A3B8"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
              style={{ alignSelf: 'flex-end', marginBottom: 20 }}
              onPress={() => router.push('/forgot-password')} 
          >
              <Text style={styles.forgotPassword}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Log in</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to Outcomely? </Text>
          <TouchableOpacity onPress={() => router.push('/signup')}>
            <Text style={styles.signupLink}>Create an account</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF', 
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 180, 
    height: 60,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F172A', 
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  googleButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
  },
  form: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 16,
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#0F172A',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  forgotPassword: {
    color: '#10B981', 
    fontWeight: '600',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#10B981', 
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  loginButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  signupLink: {
    color: '#10B981',
    fontWeight: 'bold',
    fontSize: 14,
  },
});