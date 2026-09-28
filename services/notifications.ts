import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from './api';

const listeners = new Set<() => void>();

const authHeaders = async () => {
  const token = await AsyncStorage.getItem('auth_token');
  return { 'Authorization': `Token ${token}` };
};

export const notifyChanged = () => {
  listeners.forEach((listener) => listener());
};

export async function fetchUnreadCount(): Promise<number | null> {
  try {
    const response = await fetch(`${API_URL}/api/reports/notifications/unread-count/`, {
      headers: await authHeaders(),
    });
    if (response.ok) {
      const data = await response.json();
      return data.count;
    }
  } catch (err) {
    console.log('Unread count error:', err);
  }
  return null;
}

export async function markNotificationRead(id: number) {
  try {
    await fetch(`${API_URL}/api/reports/notifications/${id}/read/`, {
      method: 'POST',
      headers: await authHeaders(),
    });
    notifyChanged();
  } catch (err) {
    console.log('Mark read error:', err);
  }
}

export async function markAllNotificationsRead() {
  try {
    await fetch(`${API_URL}/api/reports/notifications/read-all/`, {
      method: 'POST',
      headers: await authHeaders(),
    });
    notifyChanged();
  } catch (err) {
    console.log('Mark all read error:', err);
  }
}

// Polls for the unread count while the app is open
export function useUnreadCount(intervalMs = 15000) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const value = await fetchUnreadCount();
    if (value !== null) setCount(value);
  }, []);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, intervalMs);
    listeners.add(refresh);
    return () => {
      clearInterval(timer);
      listeners.delete(refresh);
    };
  }, [refresh, intervalMs]);

  return count;
}