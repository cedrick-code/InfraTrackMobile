import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl,
  ActivityIndicator, TouchableOpacity, Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

const severityColor = (level: string) => {
  if (level === 'High') return '#d32f2f';
  if (level === 'Medium') return '#f9a825';
  return '#388e3c';
};

export default function MyInspectionsScreen() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [openId, setOpenId] = useState<number | null>(null);

  const fetchItems = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/my-inspections/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (err) {
      console.log('Fetch my inspections error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchItems(); }, []));

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#00695c" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.pageTitle}>My Inspections</Text>
      <FlatList
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 16 }}
        data={items}
        keyExtractor={(item) => item.id.toString()}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { setRefreshing(true); fetchItems(); }}
          />
        }
        renderItem={({ item }) => {
          const open = openId === item.id;
          const confirmed = item.validation_result === 'Confirmed';

          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() => setOpenId(open ? null : item.id)}
              activeOpacity={0.8}
            >
              <View style={styles.topRow}>
                <Text style={styles.title} numberOfLines={open ? undefined : 1}>
                  {item.report_title}
                </Text>
                <View style={[styles.badge, { backgroundColor: confirmed ? '#388e3c' : '#757575' }]}>
                  <Text style={styles.badgeText}>{item.validation_result}</Text>
                </View>
              </View>

              <View style={styles.metaRow}>
                <View style={[styles.sevBadge, { backgroundColor: severityColor(item.severity_rating) }]}>
                  <Text style={styles.badgeText}>{item.severity_rating}</Text>
                </View>
                <Text style={styles.date}>{new Date(item.inspection_date).toLocaleString()}</Text>
              </View>

              {open && (
                <View style={styles.details}>
                  {item.report_address ? (
                    <Text style={styles.address}>{item.report_address}</Text>
                  ) : null}

                  <Text style={styles.label}>Findings</Text>
                  <Text style={styles.value}>{item.findings}</Text>

                  {item.recommended_repairs ? (
                    <>
                      <Text style={styles.label}>Recommended Action</Text>
                      <Text style={styles.value}>{item.recommended_repairs}</Text>
                    </>
                  ) : null}

                  {item.comments ? (
                    <>
                      <Text style={styles.label}>Comments</Text>
                      <Text style={styles.value}>{item.comments}</Text>
                    </>
                  ) : null}

                  <Text style={styles.label}>Report status</Text>
                  <Text style={styles.value}>{item.report_status}</Text>

                  {item.photos && item.photos.length > 0 && (
                    <View style={styles.photoRow}>
                      {item.photos.map((uri: string, i: number) => (
                        <Image key={i} source={{ uri }} style={styles.photo} />
                      ))}
                    </View>
                  )}
                </View>
              )}

              <Text style={styles.hint}>{open ? 'Tap to collapse' : 'Tap for details'}</Text>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <Text style={styles.empty}>You haven't submitted any inspections yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  pageTitle: { fontSize: 22, fontWeight: 'bold', paddingHorizontal: 16, paddingTop: 55, paddingBottom: 8 },
  card: { backgroundColor: '#f0f7f4', borderLeftWidth: 4, borderLeftColor: '#00695c', borderRadius: 8, padding: 14, marginBottom: 12 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 16, fontWeight: '600', color: '#00695c', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10 },
  sevBadge: { paddingHorizontal: 10, paddingVertical: 3, borderRadius: 10, marginRight: 10 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  date: { color: '#888', fontSize: 12 },
  details: { marginTop: 10, borderTopWidth: 1, borderTopColor: '#d9e8e2', paddingTop: 10 },
  address: { color: '#666', fontSize: 13, marginBottom: 6 },
  label: { fontWeight: '600', fontSize: 12, color: '#0A2E5C', marginTop: 8 },
  value: { color: '#333', marginTop: 2 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  photo: { width: 70, height: 70, borderRadius: 6 },
  hint: { color: '#999', fontSize: 11, marginTop: 8 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});