import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

export default function ValidatedReportsScreen({ navigation }: any) {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/validated/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        setReports(await response.json());
      }
    } catch (err) {
      console.log('Fetch validated reports error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReports(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchReports();
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#00695c" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reports for Inspection</Text>
      <FlatList
        data={reports}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('InspectionForm', { report: item })}
          >
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardType}>{item.infrastructure_type} • {item.severity_level}</Text>
            {item.geographic_address ? (
              <Text style={styles.cardAddress}>📍 {item.geographic_address}</Text>
            ) : null}
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reports awaiting inspection.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16 },
  card: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 14, marginBottom: 12 },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardType: { color: '#666', fontSize: 13, marginTop: 4 },
  cardAddress: { color: '#888', fontSize: 12, marginTop: 6 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});