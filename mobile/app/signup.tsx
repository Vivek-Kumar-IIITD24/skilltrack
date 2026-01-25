import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Eye, EyeOff, ShieldCheck, Mail, User, Lock, ArrowRight } from 'lucide-react-native';

export default function SignupScreen() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignup = () => {
    setLoading(true);
    // Simulate API Call
    setTimeout(() => {
      setLoading(false);
      alert('Welcome to Outcomely!');
      router.replace('/(tabs)'); // Uncomment when tabs are ready
    }, 1500);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 1. Logo Section */}
        <View style={styles.header}>
          {/* We use your uploaded logo here */}
          <Image 
            source={require('../assets/images/logo.png')} 
            style={styles.logoImage} 
            resizeMode="contain" 
          />
          {/* Fallback Text if logo image has background issues, usually we hide this if image is good */}
          {/* <Text style={styles.appName}>Outcomely</Text> */}
        </View>

        {/* 2. Headlines */}
        <Text style={styles.title}>Create your Outcomely account</Text>
        <Text style={styles.subtitle}>Turn learning into verified outcomes.</Text>

        {/* 3. Google Sign In */}
        <TouchableOpacity style={styles.googleButton}>
          {/* Placeholder for Google Icon - simpler than SVG for now */}
          <View style={styles.googleIconPlaceholder}>
            <Text style={styles.googleTextG}>G</Text>
          </View>
          <Text style={styles.googleButtonText}>Continue with Google</Text>
        </TouchableOpacity>

        {/* 4. Divider */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>or</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* 5. Form Fields */}
        <View style={styles.formContainer}>
          
          {/* Name */}
          <View style={styles.inputWrapper}>
            <User size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Full Name"
              placeholderTextColor="#64748B"
            />
          </View>

          {/* Email */}
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              placeholderTextColor="#64748B"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          {/* Password */}
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#64748B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Password"
              placeholderTextColor="#64748B"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? (
                <EyeOff size={20} color="#64748B" />
              ) : (
                <Eye size={20} color="#64748B" />
              )}
            </TouchableOpacity>
          </View>

          {/* Create Account Button */}
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={handleSignup}
            activeOpacity={0.8}
          >
            {loading ? (
              <Text style={styles.primaryButtonText}>Creating...</Text>
            ) : (
              <Text style={styles.primaryButtonText}>Create Account</Text>
            )}
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <ShieldCheck size={16} color="#94A3B8" />
            <Text style={styles.securityText}>
              Your learning progress and certificates are securely stored.
            </Text>
          </View>

        </View>

        {/* 6. Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity>
            <Text style={styles.linkText}>Log in</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Brand Secondary (Deep Navy)
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoImage: {
    width: 180, 
    height: 50, // Adjusted for typical logo aspect ratio
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#F8FAFC',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#94A3B8', // Slate 400
    textAlign: 'center',
    marginBottom: 32,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    height: 56,
    borderRadius: 16,
    marginBottom: 24,
  },
  googleIconPlaceholder: {
    marginRight: 12,
  },
  googleTextG: {
    fontSize: 20,
    fontWeight: '900',
    color: '#4285F4', // Google Blue
  },
  googleButtonText: {
    color: '#0F172A',
    fontSize: 16,
    fontWeight: '600',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#334155', // Slate 700
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#94A3B8',
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B', // Slate 800
    borderRadius: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#334155',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#10B981', // Brand Primary (Emerald)
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#0F172A', // Dark text on green button for contrast
    fontSize: 16,
    fontWeight: 'bold',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    paddingHorizontal: 10,
  },
  securityText: {
    fontSize: 12,
    color: '#94A3B8',
    marginLeft: 8,
    textAlign: 'center',
    lineHeight: 18,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    color: '#94A3B8',
    fontSize: 14,
  },
  linkText: {
    color: '#10B981',
    fontWeight: '600',
    fontSize: 14,
  },
});