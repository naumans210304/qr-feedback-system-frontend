import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Backend API URL 
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.100.122.228:5000';

const LoginScreen = ({ navigation }: any) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    // Auto-Login Check
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                const token = await AsyncStorage.getItem('token');
                const role = await AsyncStorage.getItem('role');

                if (token && role) {
                    console.log("User already logged in as:", role);

                    // Redirect based on role
                    if (role === 'manager') {
                        navigation.replace('ManagerDashboard');
                    } else {
                        navigation.replace('HomeScreen');
                    }
                }
            } catch (error) {
                console.error("Auto-login Error:", error);
            }
        };

        checkLoginStatus();
    }, []);

    // Handle Login Function
    const handleLogin = async () => {
        setLoading(true);
        try {
            const response = await axios.post(`${BASE_URL}/api/advisors/login`, { email, password });

            if (response.data.token) {
                const { token, advisorId, role } = response.data;

                // Save Credentials in AsyncStorage
                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('advisorId', advisorId);
                await AsyncStorage.setItem('role', role || 'advisor'); 

                console.log("Login Successful:", { advisorId, role });

                // Redirect User Based on Role
                if (role === 'manager') {
                    navigation.replace('ManagerDashboard');
                } else {
                    navigation.replace('HomeScreen');
                }
            } else {
                throw new Error("No token received.");
            }

        } catch (error: any) {
            console.error("Login Error:", error.response?.data?.message || error.message);

            let errorMessage = 'Please check your credentials.';
            if (error.response) {
                errorMessage = error.response.data?.message || errorMessage;
            } else if (error.request) {
                errorMessage = 'No response from server. Check your internet connection.';
            }

            Alert.alert('Login Failed', errorMessage);
        }

        setLoading(false);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Login</Text>
            
            <TextInput
                style={styles.input}
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
            />

            <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
            />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                <Button title="Login" onPress={handleLogin} />
            )}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderWidth: 1,
        marginBottom: 10,
        paddingHorizontal: 10,
        borderRadius: 5,
        backgroundColor: 'white',
    }
});

export default LoginScreen;