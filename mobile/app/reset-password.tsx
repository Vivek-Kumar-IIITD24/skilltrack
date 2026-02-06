import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function ResetPassword() {
  // ✅ Added Token State to capture the code from the console
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Visibility toggles
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const router = useRouter();

  const handleReset = async () => {
    // 1. Validation
    if (!token || !newPassword || !confirmPassword) {
      Alert.alert("Error", "Please fill in all fields (Token is required).");
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      console.log("🚀 Sending Reset Request with Token:", token);
      
      // 2. API Call
      const response = await api.post('/auth/reset-password', {
        token: token.trim(), // Remove accidental spaces from copy-paste
        newPassword: newPassword.trim()
      });
      
      // 3. Success Handler
      Alert.alert(
        "Success", 
        "Password reset successfully! Please login with your new password.",
        [{ text: "Log In", onPress: () => router.replace('/') }]
      );
      
    } catch (error: any) {
      console.error("❌ Reset Error:", error.response?.data || error.message);
      const msg = error.response?.data || "Invalid or expired token.";
      // Handle the case where backend returns a JSON object vs a string
      Alert.alert("Reset Failed", typeof msg === 'string' ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        
        <View style={styles.logoContainer}>
           {/* Ensure this path matches your folder structure. Usually ../assets if in app/ */}
           <Image source={require('../assets/images/logo.png')} style={styles.logo} />
        </View>

        <Text style={styles.title}>Reset Password</Text>
        <Text style={styles.subtitle}>Enter the token from your email (console) and your new password.</Text>

        <View style={styles.form}>
          
          {/* ✅ NEW: TOKEN INPUT FIELD */}
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Paste Token Here (Check Backend Console)"
              placeholderTextColor="#94A3B8"
              value={token}
              onChangeText={setToken}
              autoCapitalize="none"
            />
          </View>

          {/* New Password Field */}
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="New Password"
              placeholderTextColor="#94A3B8"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />
             <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
             </TouchableOpacity>
          </View>

          {/* Confirm Password Field */}
          <View style={styles.inputWrapper}>
            <TextInput 
              style={styles.input}
              placeholder="Confirm Password"
              placeholderTextColor="#94A3B8"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeIcon}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={20} color="#94A3B8" />
             </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.button} onPress={handleReset} disabled={loading}>
            {loading ? (
                <ActivityIndicator color="#fff" />
            ) : (
                <Text style={styles.btnText}>Reset Password</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.note}>
            <Ionicons name="shield-checkmark-outline" size={14} color="#64748B" /> Password requires 8 characters minimum.
          </Text>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Remember your password? </Text>
            <TouchableOpacity onPress={() => router.replace('/')}>
                <Text style={styles.backLink}>Log in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { padding: 24, justifyContent: 'center', flexGrow: 1 },
  logoContainer: { alignItems: 'center', marginBottom: 30 },
  logo: { width: 160, height: 50, resizeMode: 'contain' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', textAlign: 'center', marginBottom: 10 },
  subtitle: { fontSize: 16, color: '#64748B', textAlign: 'center', marginBottom: 30 },
  form: { width: '100%' },
  inputWrapper: { marginBottom: 16, position: 'relative' },
  input: { 
    backgroundColor: '#fff', 
    borderWidth: 1, 
    borderColor: '#E2E8F0', 
    borderRadius: 12, 
    padding: 16, 
    fontSize: 16, 
    color: '#0F172A' 
  },
  eyeIcon: { position: 'absolute', right: 16, top: 18 },
  button: { 
    backgroundColor: '#10B981', 
    paddingVertical: 16, 
    borderRadius: 12, 
    alignItems: 'center', 
    marginTop: 10, 
    shadowColor: '#10B981', 
    shadowOffset: { width: 0, height: 4 }, 
    shadowOpacity: 0.2, 
    shadowRadius: 8, 
    elevation: 4 
  },
  btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  note: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 20,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
  },
  footerText: {
    color: '#64748B',
  },
  backLink: { 
    color: '#10B981', 
    fontWeight: 'bold', 
  }
});