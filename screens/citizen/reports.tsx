import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

type Report = {
  id: number;
  title: string;
  description: string;
  infrastructure_type: string;
  severity_level: string;
  status: string;
  geographic_address: string;
  reported_date: string;
};

export default function ReportsScreen() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

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
      console.log('Fetch reports error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReports();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  const severityColor = (level: string) => {
    if (level === 'High') return '#d32f2f';
    if (level === 'Medium') return '#f9a825';
    return '#388e3c';
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#00695c" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <View style={[styles.badge, { backgroundColor: severityColor(item.severity_level) }]}>
                <Text style={styles.badgeText}>{item.severity_level}</Text>
              </View>
            </View>
            <Text style={styles.cardType}>{item.infrastructure_type} • {item.status}</Text>
            <Text numberOfLines={2} style={styles.cardDesc}>{item.description}</Text>
            {item.geographic_address ? (
              <Text style={styles.cardAddress}>📍 {item.geographic_address}</Text>
            ) : null}
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No reports yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16 },
  card: {
    backgroundColor: '#f7f7f7', borderRadius: 10, padding: 14, marginBottom: 12,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cardType: { color: '#666', fontSize: 13, marginTop: 4 },
  cardDesc: { marginTop: 6, color: '#333' },
  cardAddress: { marginTop: 6, color: '#888', fontSize: 12 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});