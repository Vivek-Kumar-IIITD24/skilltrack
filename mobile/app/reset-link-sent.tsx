import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function ResetLinkSentScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams(); // Get the email passed from previous screen

  return (
    <View style={styles.container}>
      
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/images/logo.png')} style={styles.logo} />
      </View>

      {/* Success Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name="checkmark" size={50} color="#10B981" />
      </View>

      <Text style={styles.title}>Check Your Email</Text>
      <Text style={styles.subtitle}>
        We've sent a password reset link to {'\n'}
        <Text style={styles.emailText}>{email || 'your@email.com'}</Text>.
      </Text>

      {/* ✅ UPDATED: The "Simulate" link is now a real Primary Button */}
      <TouchableOpacity 
        style={styles.primaryButton} 
        onPress={() => router.push('/reset-password')}
      >
        <Text style={styles.buttonText}>Reset Password</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.resendLink}>
        <Text style={styles.footerText}>Didn't receive it? <Text style={styles.boldLink}>Resend Link</Text></Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'absolute',
    top: 60,
  },
  logo: {
    width: 140,
    height: 40,
    resizeMode: 'contain',
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#ECFDF5', // Light Green
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  emailText: {
    fontWeight: 'bold',
    color: '#0F172A',
  },
  // ✅ NEW: Matches the style of Login/Signup buttons
  primaryButton: {
    backgroundColor: '#10B981', // Outcomely Green
    width: '100%',
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
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  resendLink: {
    marginBottom: 40,
  },
  footerText: {
    color: '#64748B',
    fontSize: 14,
  },
  boldLink: {
    color: '#10B981',
    fontWeight: 'bold',
  },
});