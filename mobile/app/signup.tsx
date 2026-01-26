import React, { useState, useCallback } from 'react'; // ✅ Added useCallback
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, Image, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router'; // ✅ Added useFocusEffect
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function SignupScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STUDENT'); 
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // ✅ PRIVACY FIX: Clear fields every time screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setName('');
      setEmail('');
      setPassword('');
      setRole('STUDENT'); // Reset role to default
      setLoading(false);
    }, [])
  );

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      // ✅ Sends the selected ROLE to the backend
      await api.post('/auth/register', {
        name,
        email,
        password,
        role: role // 'STUDENT' or 'ADMIN'
      });

      Alert.alert('Success', 'Account created! Please log in.');
      router.back(); 

    } catch (error: any) {
      console.error(error);
      Alert.alert('Signup Failed', 'This email might already be taken.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
     Alert.alert("Google Signup", "This feature will be enabled in a future update!");
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.logoContainer}>
          <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Turn learning into verified outcomes.</Text>

         {/* Google Button */}
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
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            placeholderTextColor="#94A3B8"
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder="Email Address"
            placeholderTextColor="#94A3B8"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          
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

          {/* ✅ ROLE SELECTOR */}
          <View style={styles.roleContainer}>
            <Text style={styles.roleLabel}>I am a:</Text>
            <View style={styles.roleRow}>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'STUDENT' && styles.roleButtonActive]} 
                onPress={() => setRole('STUDENT')}
              >
                <Text style={[styles.roleText, role === 'STUDENT' && styles.roleTextActive]}>Student</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.roleButton, role === 'ADMIN' && styles.roleButtonActive]} 
                onPress={() => setRole('ADMIN')}
              >
                <Text style={[styles.roleText, role === 'ADMIN' && styles.roleTextActive]}>Manager</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={styles.createButton} onPress={handleSignup} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.createButtonText}>Create Account</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.securityNote}>
           <Ionicons name="shield-checkmark-outline" size={16} color="#64748B" />
           <Text style={styles.securityText}> Your progress is securely stored.</Text>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.loginLink}>Log in</Text>
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
    marginBottom: 20,
  },
  logo: {
    width: 160,
    height: 50,
    resizeMode: 'contain',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
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
    elevation: 1,
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
    position: 'relative',
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 16,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 18,
  },
  // ROLE SELECTOR STYLES
  roleContainer: {
    marginBottom: 20,
  },
  roleLabel: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    fontWeight: '600',
  },
  roleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  roleButtonActive: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  roleText: {
    color: '#64748B',
    fontWeight: '600',
  },
  roleTextActive: {
    color: '#10B981', // Active Green
  },
  createButton: {
    backgroundColor: '#10B981',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  createButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
  },
  securityText: {
    color: '#64748B',
    fontSize: 12,
    marginLeft: 6,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  footerText: {
    color: '#64748B',
  },
  loginLink: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});