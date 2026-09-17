import React, { useState, useCallback } from 'react';
import { StyleSheet, View, ActivityIndicator } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import { Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

type Report = {
  id: number;
  title: string;
  severity_level: string;
  latitude: string;
  longitude: string;
};

export default function MapScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/list/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.log('Fetch map reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00695c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: 8.2280,
          longitude: 124.2452,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
      >
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: parseFloat(report.latitude),
              longitude: parseFloat(report.longitude),
            }}
            pinColor={
              report.severity_level === 'High' ? 'red' :
              report.severity_level === 'Medium' ? 'orange' : 'green'
            }
          >
            <Callout>
              <View style={{ maxWidth: 180 }}>
                <Text style={{ fontWeight: 'bold' }}>{report.title}</Text>
                <Text>{report.severity_level} severity</Text>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});