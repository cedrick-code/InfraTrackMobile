import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

const STATUS_OPTIONS = ['Not Started', 'In Progress', 'Completed'];

export default function WorkOrderDetailScreen({ route, navigation }: any) {
  const { workOrder } = route.params;

  const [statusUpdate, setStatusUpdate] = useState('In Progress');
  const [progressRemarks, setProgressRemarks] = useState('');
  const [delayReason, setDelayReason] = useState('');
  const [completionDetails, setCompletionDetails] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const statusColor = (status: string) => {
    if (status === 'Completed') return '#388e3c';
    if (status === 'In Progress') return '#f9a825';
    return '#0A2E5C';
  };

  const pickPhotos = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Photo library access is required.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPhotos(result.assets.map((a) => a.uri));
    }
  };

  const handleSubmit = async () => {
    if (!progressRemarks) {
      Alert.alert('Missing info', 'Please add progress remarks.');
      return;
    }
    if (statusUpdate === 'Completed' && !completionDetails) {
      Alert.alert('Missing info', 'Please describe the completed work.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('work_order', String(workOrder.id));
      formData.append('status_update', statusUpdate);
      formData.append('progress_remarks', progressRemarks);
      formData.append('delay_reason', delayReason);
      formData.append('completion_details', completionDetails);

      for (let i = 0; i < photos.length; i++) {
        const res = await fetch(photos[i]);
        const blob = await res.blob();
        formData.append(`repair_photo_${i}`, blob, `repair_${i}.jpg`);
      }

      const response = await fetch(`${API_URL}/api/reports/work-orders/repair-update/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Progress update submitted.');
        navigation.goBack();
      } else {
        const errText = await response.text();
        Alert.alert('Submission failed', errText);
      }
    } catch (err: any) {
      Alert.alert('Error', `Something went wrong: ${err?.message || String(err)}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <Text style={styles.reportTitle}>{workOrder.report_title}</Text>
        <View style={[styles.badge, { backgroundColor: statusColor(workOrder.status) }]}>
          <Text style={styles.badgeText}>{workOrder.status}</Text>
        </View>
      </View>

      <Text style={styles.label}>Work Order Details</Text>
      <Text style={styles.detailsText}>{workOrder.work_order_details}</Text>
      <Text style={styles.dateText}>Issued: {new Date(workOrder.date_issued).toLocaleDateString()}</Text>

      {workOrder.repair_updates && workOrder.repair_updates.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Update History</Text>
          {workOrder.repair_updates.map((update: any) => (
            <View key={update.id} style={styles.historyCard}>
              <View style={styles.historyHeader}>
                <Text style={styles.historyStatus}>{update.status_update}</Text>
                <Text style={styles.historyDate}>
                  {new Date(update.update_date).toLocaleDateString()}
                </Text>
              </View>
              <Text style={styles.historyRemarks}>{update.progress_remarks}</Text>
              {update.photos && update.photos.length > 0 && (
                <View style={styles.photoRow}>
                  {update.photos.map((p: any) => (
                    <Image key={p.id} source={{ uri: p.image }} style={styles.historyPhoto} />
                  ))}
                </View>
              )}
            </View>
          ))}
        </>
      )}

      <Text style={styles.sectionTitle}>Submit New Update</Text>

      <Text style={styles.label}>Status</Text>
      <View style={styles.statusRow}>
        {STATUS_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            style={[styles.statusChip, statusUpdate === s && styles.statusChipSelected]}
            onPress={() => setStatusUpdate(s)}
          >
            <Text style={statusUpdate === s ? styles.statusChipTextSelected : styles.statusChipText}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Progress Remarks</Text>
      <TextInput
        style={[styles.input, { height: 90 }]}
        value={progressRemarks}
        onChangeText={setProgressRemarks}
        multiline
        placeholder="What has been done so far?"
      />

      <Text style={styles.label}>Delay Reason (optional)</Text>
      <TextInput
        style={[styles.input, { height: 70 }]}
        value={delayReason}
        onChangeText={setDelayReason}
        multiline
        placeholder="If there's a delay, explain why"
      />

      {statusUpdate === 'Completed' && (
        <>
          <Text style={styles.label}>Completion Details</Text>
          <TextInput
            style={[styles.input, { height: 90 }]}
            value={completionDetails}
            onChangeText={setCompletionDetails}
            multiline
            placeholder="Describe the completed repair"
          />
        </>
      )}

      <Text style={styles.label}>Photos</Text>
      <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}>
        <Text style={styles.photoButtonText}>+ Add Photos</Text>
      </TouchableOpacity>
      <View style={styles.photoRow}>
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.photoPreview} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Update</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 6, fontSize: 14 },
  detailsText: { color: '#333', marginTop: 8 },
  dateText: { color: '#888', fontSize: 12, marginTop: 8 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginTop: 24, marginBottom: 8, color: '#0A2E5C' },
  historyCard: { backgroundColor: '#f7f7f7', borderRadius: 10, padding: 12, marginBottom: 10 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  historyStatus: { fontWeight: '600', color: '#0A2E5C' },
  historyDate: { color: '#888', fontSize: 12 },
  historyRemarks: { marginTop: 6, color: '#333' },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  historyPhoto: { width: 60, height: 60, borderRadius: 6 },
  statusRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusChip: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
  statusChipSelected: { backgroundColor: '#0A2E5C', borderColor: '#0A2E5C' },
  statusChipText: { color: '#333' },
  statusChipTextSelected: { color: '#fff', fontWeight: '600' },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  photoButton: { borderWidth: 1, borderColor: '#0A2E5C', borderStyle: 'dashed', padding: 14, borderRadius: 8, alignItems: 'center' },
  photoButtonText: { color: '#0A2E5C', fontWeight: '600' },
  photoPreview: { width: 70, height: 70, borderRadius: 8 },
  submitButton: { backgroundColor: '#0A2E5C', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});