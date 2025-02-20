import React, { useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackNavigationProp } from '@react-navigation/stack';
import { useNavigation, ParamListBase } from '@react-navigation/native';

// Define navigation Prop Type
type HomeScreenNavigationProp = StackNavigationProp<ParamListBase, 'HomeScreen'>;

const HomeScreen = () => {
    const navigation = useNavigation<HomeScreenNavigationProp>();
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<string | null>(null);
    const [userName, setUserName] = useState<string | null>(null);

    // Check authentication & Role on screen load
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const storedRole = await AsyncStorage.getItem('role');
                const storedName = await AsyncStorage.getItem('userName'); // Fetch stored username

                if (!token) {
                    console.warn("⚠️ No token found, redirecting to LoginScreen");
                    navigation.replace('LoginScreen');
                } else {
                    console.log("User Role:", storedRole);
                    setRole(storedRole || 'advisor');
                    setUserName(storedName || "User");
                }
            } catch (error) {
                console.error("Error checking authentication:", error);
                Alert.alert("Error", "Failed to check authentication.");
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    // Show loading indicator while checking authentication
    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#0000ff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {userName}!</Text>
            <Text style={styles.subtitle}>You are logged in as a {role === 'manager' ? "Manager" : "Client Advisor"}</Text>

            <Button 
                title="Generate QR Code for Feedback"
                onPress={() => navigation.navigate('FeedbackScreen')}
            />

            {/* Managers can access the performance dashboard for all advisors */}
            {role === 'manager' && (
                <Button 
                    title="View Manager Dashboard"
                    onPress={() => navigation.navigate('ManagerDashboard')}
                />
            )}

            {/* Advisors can access their own performance */}
            {role === 'advisor' && (
                <Button 
                    title="View My Performance"
                    onPress={() => navigation.navigate('PerformanceScreen')}
                />
            )}

            {/* Logout Button */}
            <Button 
                title="Logout"
                color="red"
                onPress={async () => {
                    try {
                        console.log("Logging out...");
                        await AsyncStorage.clear(); // Clears all stored data
                        navigation.replace('LoginScreen');
                    } catch (error) {
                        console.error("Logout Error:", error);
                    }
                }}
            />
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 18,
        color: 'gray',
        marginBottom: 20,
    },
});

export default HomeScreen;