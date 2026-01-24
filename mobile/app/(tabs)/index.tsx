import { StyleSheet, View, Text, ScrollView, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.username}>Prince</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 0 Days</Text>
          </View>
        </View>

        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Text style={styles.heroTitle}>Start Verified Learning</Text>
          <Text style={styles.heroSubtitle}>Import a playlist to begin your outcome journey.</Text>
        </View>

        {/* Placeholder for Courses */}
        <Text style={styles.sectionTitle}>Your Courses</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No active courses yet.</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A', // Dark Navy
  },
  content: {
    padding: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 14,
    color: '#94A3B8',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  streakBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)', // Green tint
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.5)',
  },
  streakText: {
    color: '#10B981', // Brand Green
    fontWeight: 'bold',
  },
  heroCard: {
    backgroundColor: '#10B981', // Brand Green
    borderRadius: 20,
    padding: 24,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 8,
  },
  heroSubtitle: {
    color: '#0F172A',
    opacity: 0.8,
    lineHeight: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F8FAFC',
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: '#334155',
  },
  emptyText: {
    color: '#64748B',
  },
});