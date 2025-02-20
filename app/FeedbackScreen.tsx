import React, { useState, useEffect } from 'react';
import { View, Text, Image, Button, ActivityIndicator, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.100.122.228:5000';

const FeedbackScreen = ({ navigation }: any) => {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [advisorId, setAdvisorId] = useState<string | null>(null);

    // Fetch Advisor ID from AsyncStorage
    const fetchAdvisorId = async () => {
        try {
            const storedAdvisorId = await AsyncStorage.getItem('advisorId');
            if (!storedAdvisorId) {
                Alert.alert("Session Expired", "Please log in again.");
                navigation.replace("LoginScreen");
                return null;
            }
            setAdvisorId(storedAdvisorId);
            return storedAdvisorId;
        } catch (error) {
            console.error("Error fetching advisor ID:", error);
            return null;
        }
    };

    // Function to fetch QR Code from backend
    const fetchQRCode = async () => {
        setLoading(true);
        setErrorMessage(null);

        try {
            const token = await AsyncStorage.getItem('token');
            const storedAdvisorId = await fetchAdvisorId();

            if (!token || !storedAdvisorId) {
                return;
            }

            console.log(`Fetching QR Code from: ${BASE_URL}/api/advisors/${storedAdvisorId}/qrcode`);

            const response = await axios.get(`${BASE_URL}/api/advisors/${storedAdvisorId}/qrcode`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.data.qrCodeURL) {
                setQrCode(response.data.qrCodeURL);
                console.log("🎉 QR Code Updated:", response.data.qrCodeURL);
            } else {
                console.warn('⚠️ QR Code URL not found in response, attempting regeneration...');
                await regenerateQRCode(storedAdvisorId, token);
            }
        } catch (error: any) {
            console.error('Axios Error fetching QR code:', error.message);
            setErrorMessage("Failed to load QR Code. Ensure backend is running and you're authorized.");
        }

        setLoading(false);
    };

    // Function to regenerate missing QR Code
    const regenerateQRCode = async (advisorId: string, token: string) => {
        try {
            console.log(`Attempting to regenerate QR Code for Advisor ID: ${advisorId}`);

            const regenResponse = await axios.post(
                `${BASE_URL}/api/advisors/${advisorId}/regenerate-qrcode`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                }
            );

            if (regenResponse.data.qrCodeURL) {
                setQrCode(regenResponse.data.qrCodeURL);
                console.log("QR Code Regenerated:", regenResponse.data.qrCodeURL);
            } else {
                setErrorMessage("QR Code regeneration failed.");
            }
        } catch (error: any) {
            console.error("Error regenerating QR Code:", error.message);
            setErrorMessage("Failed to regenerate QR Code. Try again later.");
        }
    };

    // Fetch QR Code when component loads
    useEffect(() => {
        fetchQRCode();
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Scan QR Code to Provide Feedback</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : qrCode ? (
                <Image source={{ uri: qrCode }} style={styles.qrCode} />
            ) : (
                <Text style={styles.errorText}>{errorMessage || "⚠️ QR Code could not be loaded"}</Text>
            )}

            <Button title="Refresh QR Code" onPress={fetchQRCode} />

            {/* Logout Button */}
            <Button
                title="Logout"
                color="red"
                onPress={async () => {
                    try {
                        console.log("Logging out...");
                        await AsyncStorage.clear();
                        navigation.replace("LoginScreen");
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
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    qrCode: {
        width: 200,
        height: 200,
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
        marginHorizontal: 20,
    },
});

export default FeedbackScreen;