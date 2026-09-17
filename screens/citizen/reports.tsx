import React from 'react';
import { StyleSheet, Text, View, FlatList } from 'react-native';

export default function ReportsScreen() {
  // TODO: replace with actual fetch from your Django API (all community reports)
  const reports: any[] = [];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>All Reports</Text>
      <FlatList
        data={reports}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text>{item.title}</Text>
          </View>
        )}
        ListEmptyComponent={<Text style={styles.empty}>No reports yet.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  card: { padding: 12, backgroundColor: '#f2f2f2', borderRadius: 8, marginBottom: 8 },
  empty: { color: '#888', marginTop: 20, textAlign: 'center' },
});