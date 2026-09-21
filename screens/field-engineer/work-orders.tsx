import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

export default function WorkOrdersScreen({ navigation }: any) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/work-orders/my-orders/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        setOrders(await response.json());
      }
    } catch (err) {
      console.log('Fetch work orders error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchOrders(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchOrders();
  };

  const statusColor = (status: string) => {
    if (status === 'Completed') return '#388e3c';
    if (status === 'In Progress') return '#f9a825';
    return '#0A2E5C';
  };

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#00695c" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Work Orders</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('WorkOrderDetail', { workOrder: item })}
          >
            <View style={styles.cardHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                {item.update_requested && <View style={styles.dot} />}
                <Text style={styles.cardTitle}>{item.report_title}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: statusColor(item.status) }]}>
                <Text style={styles.badgeText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.details} numberOfLines={2}>{item.work_order_details}</Text>
            <Text style={styles.date}>Issued: {new Date(item.date_issued).toLocaleDateString()}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No work orders assigned yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
    
    container: { flex: 1, backgroundColor: '#fff' },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    title: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 16 },
    card: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 14, marginBottom: 12 },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    cardTitle: { fontSize: 16, fontWeight: '600', flex: 1, marginRight: 8 },
    badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12 },
    badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    details: { marginTop: 8, color: '#333' },
    date: { marginTop: 8, color: '#888', fontSize: 12 },
    empty: { textAlign: 'center', color: '#888', marginTop: 40 },
    dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d32f2f', marginRight: 6 },
});