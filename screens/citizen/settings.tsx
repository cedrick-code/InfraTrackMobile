import { StyleSheet, Text, View } from 'react-native';

export default function SettingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>App</Text>
          <Text style={styles.value}>InfraTrack</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Version</Text>
          <Text style={styles.value}>1.0.0</Text>
        </View>
        <View style={[styles.row, { borderBottomWidth: 0 }]}>
          <Text style={styles.label}>Agency</Text>
          <Text style={styles.value}>DPWH Iligan City</Text>
        </View>
      </View>

      <Text style={styles.note}>
        InfraTrack lets you report infrastructure problems and follow their
        progress until they are resolved.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  card: { backgroundColor: '#FFFFFF', borderRadius: 16, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  label: { fontSize: 16, color: '#333333' },
  value: { fontSize: 16, color: '#777777' },
  note: { marginTop: 20, color: '#888888', fontSize: 13, lineHeight: 19 },
});