import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

export default function UserManagementScreen() {
    const router = useRouter();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await api.get('/users');
            // Assuming endpoint returns array of UserResponse: { id, name, email, role }
            if (Array.isArray(response.data)) {
                setUsers(response.data);
            } else {
                setUsers([]);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
            Alert.alert("Error", "Could not load user list.");
        } finally {
            setLoading(false);
        }
    };

    const confirmDeleteUser = (userId: number, userName: string) => {
        Alert.alert(
            "Delete User",
            `Are you sure you want to permanently delete user "${userName}"? This cannot be undone.`,
            [
                { text: "Cancel", style: "cancel" },
                { 
                    text: "Delete", 
                    style: "destructive", 
                    onPress: () => deleteUser(userId) 
                }
            ]
        );
    };

    const deleteUser = async (userId: number) => {
        try {
            await api.delete(`/users/${userId}`);
            Alert.alert("Success", "User deleted successfully.");
            fetchUsers(); // Refresh list
        } catch (error) {
            console.error('Failed to delete user:', error);
            Alert.alert("Error", "Failed to delete user.");
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        u.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const renderUser = ({ item }: { item: any }) => (
        <View style={styles.userCard}>
            <View style={styles.userInfo}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
                </View>
                <View>
                    <Text style={styles.userName}>{item.name}</Text>
                    <Text style={styles.userEmail}>{item.email}</Text>
                    <View style={[styles.roleBadge, item.role === 'ADMIN' ? styles.adminBadge : styles.studentBadge]}>
                        <Text style={[styles.roleText, item.role === 'ADMIN' ? styles.adminText : styles.studentText]}>
                            {item.role}
                        </Text>
                    </View>
                </View>
            </View>
            
            {/* Don't allow deleting self or other admins typically, but for this demo let's just show trash icon */}
            <TouchableOpacity onPress={() => confirmDeleteUser(item.id, item.name)} style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#0F172A" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Manage Users</Text>
                <View style={{ width: 24 }} /> 
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#94A3B8" style={styles.searchIcon} />
                <TextInput 
                    style={styles.searchInput}
                    placeholder="Search users..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    placeholderTextColor="#94A3B8"
                />
            </View>

            {loading ? (
                <ActivityIndicator size="large" color="#10B981" style={{ marginTop: 40 }} />
            ) : (
                <FlatList
                    data={filteredUsers}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderUser}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <Text style={styles.emptyText}>No users found.</Text>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8FAFC',
        paddingTop: 50,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    backButton: {
        padding: 8,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#0F172A',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        marginHorizontal: 20,
        paddingHorizontal: 16,
        height: 50,
        borderRadius: 12,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#0F172A',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    userCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderRadius: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    userInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#E2E8F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#64748B',
    },
    userName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#0F172A',
        marginBottom: 2,
    },
    userEmail: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 4,
    },
    roleBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
    },
    adminBadge: {
        backgroundColor: '#DBEAFE',
    },
    studentBadge: {
        backgroundColor: '#ECFDF5',
    },
    roleText: {
        fontSize: 10,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    adminText: {
        color: '#1E40AF',
    },
    studentText: {
        color: '#047857',
    },
    deleteButton: {
        padding: 8,
        marginLeft: 8,
    },
    emptyText: {
        textAlign: 'center',
        color: '#64748B',
        marginTop: 40,
        fontSize: 16,
    }
});
