import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Button, StyleSheet, Alert } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';

// Backend URL
const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.100.122.228:5000';

// Define the performance data type
type AdvisorPerformance = {
    id: string;
    name: string;
    totalFeedback: number;
    averageRating: number;
};

const ManagerDashboard = () => {
    const [performanceData, setPerformanceData] = useState<AdvisorPerformance[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [showStartDatePicker, setShowStartDatePicker] = useState(false);
    const [showEndDatePicker, setShowEndDatePicker] = useState(false);

    // Define correct navigation type
    const navigation = useNavigation<NavigationProp<Record<string, object | undefined>>>();

    // Fetch Performance Data
    const fetchPerformanceData = async () => {
        setLoading(true);
        try {
            const token = await AsyncStorage.getItem('token');
            if (!token) {
                Alert.alert("Session Expired", "Please log in again.");
                navigation.navigate("LoginScreen"); 
                return;
            }

            let url = `${BASE_URL}/api/advisors/performance`;
            if (startDate && endDate) {
                url += `?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
            }

            console.log(`Fetching Manager Dashboard Data from: ${url}`);

            const response = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && Array.isArray(response.data)) {
                // Ensure `averageRating` is always a number
                const sanitizedData = response.data.map(advisor => ({
                    ...advisor,
                    averageRating: typeof advisor.averageRating === "number" ? advisor.averageRating : 0
                }));
                setPerformanceData(sanitizedData);
                console.log("Data Loaded:", sanitizedData);
            } else {
                Alert.alert("No Data", "No performance data available.");
                setPerformanceData([]);
            }
        } catch (error: any) {
            console.error("Error fetching performance data:", error.response?.data || error.message);
            Alert.alert("Error", "Failed to load performance data.");
            setPerformanceData([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPerformanceData();
    }, [startDate, endDate]);

    // Logout Function 
    const handleLogout = async () => {
        try {
            console.log("Logging out...");
            await AsyncStorage.clear(); // Clears all stored data
            navigation.navigate("LoginScreen"); // Redirect to LoginScreen
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Manager Dashboard</Text>

            {/* Date Pickers */}
            <Button title="Select Start Date" onPress={() => setShowStartDatePicker(true)} />
            {showStartDatePicker && (
                <DateTimePicker
                    value={startDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowStartDatePicker(false);
                        if (date) setStartDate(date);
                    }}
                />
            )}

            <Button title="Select End Date" onPress={() => setShowEndDatePicker(true)} />
            {showEndDatePicker && (
                <DateTimePicker
                    value={endDate || new Date()}
                    mode="date"
                    display="default"
                    onChange={(event, date) => {
                        setShowEndDatePicker(false);
                        if (date) setEndDate(date);
                    }}
                />
            )}

            <Button title="Refresh Data" onPress={fetchPerformanceData} />

            {loading ? (
                <ActivityIndicator size="large" color="#0000ff" />
            ) : (
                performanceData.length > 0 ? (
                    <>
                        {/* Bar Chart */}
                        <Text style={styles.chartTitle}>Feedback Count</Text>
                        <BarChart
                            data={{
                                labels: performanceData.map(a => a.name),
                                datasets: [{ data: performanceData.map(a => a.totalFeedback) }]
                            }}
                            width={350}
                            height={220}
                            yAxisLabel=""  
                            yAxisSuffix=" reviews"
                            chartConfig={{
                                backgroundColor: "#1cc910",
                                backgroundGradientFrom: "#1cc910",
                                backgroundGradientTo: "#eff3ff",
                                decimalPlaces: 0,
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                                labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`
                            }}
                            style={styles.chartStyle}
                        />

                        {/* Pie Chart */}
                        <Text style={styles.chartTitle}>Rating Distribution</Text>
                        <PieChart
                            data={performanceData.map(a => ({
                                name: a.name,
                                population: a.totalFeedback,
                                color: `#${Math.floor(Math.random() * 16777215).toString(16)}`,
                                legendFontColor: "#7F7F7F",
                                legendFontSize: 15
                            }))}
                            width={350}
                            height={220}
                            chartConfig={{
                                backgroundGradientFrom: "#1cc910",
                                backgroundGradientTo: "#eff3ff",
                                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`, 
                            }}
                            accessor="population"
                            backgroundColor="transparent"
                            paddingLeft="15"
                            style={styles.chartStyle}
                        />
                    </>
                ) : (
                    <Text style={styles.noDataText}>⚠️ No performance data available.</Text>
                )
            )}

            {/* Logout Button */}
            <Button 
                title="Logout" 
                color="red" 
                onPress={handleLogout} 
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
        marginBottom: 20,
    },
    chartTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
    },
    chartStyle: {
        marginVertical: 8,
        borderRadius: 16,
    },
    noDataText: {
        fontSize: 16,
        color: 'gray',
        marginTop: 20,
        textAlign: 'center',
    },
});

export default ManagerDashboard;