import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

// Backend API URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.100.122.228:5000';

const PerformanceScreen = () => {
    const [performanceData, setPerformanceData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    // Fetch Performance Data
    const fetchPerformanceData = async () => {
        setLoading(true);
        setError(null);
    
        try {
            const token = await AsyncStorage.getItem('token');
            const advisorId = await AsyncStorage.getItem('advisorId');
    
            if (!token || !advisorId) {
                setError("Authentication error. Please log in again.");
                return;
            }
    
            const url = `${BASE_URL}/api/advisors/performance/${advisorId}`;
            console.log(`Fetching Performance Data from: ${url}`);
    
            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` },
            });
    
            if (response.data) {
                setPerformanceData(response.data.feedback || []);
                console.log("Updated Performance Data:", response.data);
            } else {
                setError("No performance data available.");
            }
        } catch (error: any) {
            console.error("Error fetching performance data:", error.response?.data || error.message);
            setError("Failed to load performance data.");
        }
    
        setLoading(false);
        setRefreshing(false);
    };

    // Automatically refresh when screen is focused
    useFocusEffect(
        useCallback(() => {
            fetchPerformanceData();
        }, [])
    );

    // Pull-to-refresh functionality
    const onRefresh = () => {
        setRefreshing(true);
        fetchPerformanceData();
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>My Performance</Text>

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : error ? (
                <Text style={styles.errorText}>{error}</Text>
            ) : (
                <FlatList
                    data={performanceData}
                    keyExtractor={(item, index) => index.toString()}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
                    renderItem={({ item }) => (
                        <View style={styles.card}>
                            <Text style={styles.feedbackTitle}>Rating: {item.rating}</Text>
                            <Text>Comment: {item.comments || "No comment"}</Text>
                            <Text style={styles.date}> {new Date(item.date).toLocaleString()}</Text>
                        </View>
                    )}
                />
            )}
        </View>
    );
};

// Styles
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#f8f9fa',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    errorText: {
        color: 'red',
        fontSize: 16,
        textAlign: 'center',
    },
    card: {
        backgroundColor: 'white',
        padding: 15,
        marginVertical: 10,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        elevation: 2,
    },
    feedbackTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    date: {
        fontSize: 12,
        color: 'gray',
    }
});

export default PerformanceScreen;