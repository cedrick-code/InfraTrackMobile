import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, RefreshControl, ActivityIndicator, TouchableOpacity,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';
import { markNotificationRead, markAllNotificationsRead } from '../../services/notifications';

type Props = {
  onOpenNotification?: (notification: any) => void;
  showTitle?: boolean;
};

const ICONS: Record<string, string> = {
  report_submitted: '📝',
  info_provided: '💬',
  report_validated: '✅',
  report_rejected: '❌',
  info_requested: '❓',
  report_inspected: '🔍',
  work_order_issued: '🛠️',
  work_order_assigned: '🛠️',
  update_requested: '⚠️',
  repair_update: '🔧',
  repair_progress: '🔧',
  report_resolved: '🎉',
  follow_up_reply: '💬',
};

const timeAgo = (iso: string) => {
  const seconds = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString();
};

export default function NotificationsScreen({ onOpenNotification, showTitle = true }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchItems = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/notifications/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        setItems(await response.json());
      }
    } catch (err) {
      console.log('Fetch notifications error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchItems(); }, []));

  const onRefresh = () => {
    setRefreshing(true);
    fetchItems();
  };

  const handlePress = (item: any) => {
    if (!item.is_read) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)));
      markNotificationRead(item.id);
    }
    onOpenNotification?.(item);
  };

  const handleMarkAll = async () => {
    setItems((prev) => prev.map((n) => ({ ...n, is_read: true })));
    await markAllNotificationsRead();
  };

  const hasUnread = items.some((n) => !n.is_read);

  if (loading) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#00695c" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: showTitle ? 55 : 12 }]}>
        {showTitle ? <Text style={styles.title}>Notifications</Text> : <View />}
        {hasUnread && (
          <TouchableOpacity onPress={handleMarkAll}>
            <Text style={styles.markAll}>Mark all as read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ padding: 16, paddingTop: 4 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, !item.is_read && styles.cardUnread]}
            onPress={() => handlePress(item)}
          >
            <Text style={styles.icon}>{ICONS[item.kind] || '🔔'}</Text>
            <View style={{ flex: 1 }}>
              <View style={styles.titleRow}>
                <Text style={[styles.cardTitle, !item.is_read && styles.cardTitleUnread]}>
                  {item.title}
                </Text>
                {!item.is_read && <View style={styles.dot} />}
              </View>
              {item.message ? (
                <Text style={styles.message} numberOfLines={3}>{item.message}</Text>
              ) : null}
              <Text style={styles.time}>{timeAgo(item.created_at)}</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No notifications yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingBottom: 8,
  },
  title: { fontSize: 22, fontWeight: 'bold' },
  markAll: { color: '#00695c', fontWeight: '600' },
  card: {
    flexDirection: 'row', backgroundColor: '#f7f7f7', borderRadius: 10,
    padding: 14, marginBottom: 10, gap: 12,
  },
  cardUnread: { backgroundColor: '#e8f5f1', borderLeftWidth: 4, borderLeftColor: '#00695c' },
  icon: { fontSize: 22 },
  titleRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardTitle: { fontSize: 15, fontWeight: '600', color: '#333', flex: 1 },
  cardTitleUnread: { color: '#00695c' },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#d32f2f', marginLeft: 8 },
  message: { marginTop: 4, color: '#555', fontSize: 13 },
  time: { marginTop: 6, color: '#999', fontSize: 12 },
  empty: { textAlign: 'center', color: '#888', marginTop: 40 },
});