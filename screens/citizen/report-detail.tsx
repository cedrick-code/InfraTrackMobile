import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, ActivityIndicator, Image,
  TextInput, TouchableOpacity, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

export default function ReportDetailScreen({ route }: any) {
  const { reportId } = route.params;
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchReport = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/my-reports/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReport(data.find((r: any) => r.id === reportId));
      }
    } catch (err) {
      console.log('Fetch report detail error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(useCallback(() => { fetchReport(); }, [reportId]));

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

  const handleSubmitResponse = async () => {
    if (!responseText.trim()) {
      Alert.alert('Missing info', 'Please write the information being requested.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('response_message', responseText.trim());

      for (let i = 0; i < photos.length; i++) {
        const res = await fetch(photos[i]);
        const blob = await res.blob();
        formData.append(`photo_${i}`, blob, `photo_${i}.jpg`);
      }

      const response = await fetch(`${API_URL}/api/reports/${report.id}/respond/`, {
        method: 'POST',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Sent', 'Your additional information was sent back for review.');
        setResponseText('');
        setPhotos([]);
        fetchReport();
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

  if (loading || !report) {
    return <View style={styles.centered}><ActivityIndicator size="large" color="#00695c" /></View>;
  }

  const severityColor = (level: string) => {
    if (level === 'High') return '#d32f2f';
    if (level === 'Medium') return '#f9a825';
    return '#388e3c';
  };

  const pendingRequest = report.info_requests?.find((r: any) => !r.response_date);
  const requestMessage = pendingRequest?.request_message || report.screening_remarks;
  const isResubmitted = report.info_requests && report.info_requests.length > 0;

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>{report.title}</Text>
        <View style={[styles.badge, { backgroundColor: severityColor(report.severity_level) }]}>
          <Text style={styles.badgeText}>{report.severity_level}</Text>
        </View>
      </View>
      <Text style={styles.description}>{report.description}</Text>
      {report.geographic_address ? (
        <Text style={styles.address}>📍 {report.geographic_address}</Text>
      ) : null}

      {/* Reply form when FRU asked for more information */}
      {report.status === 'Needs More Info' && (
        <View style={styles.requestBox}>
          <Text style={styles.requestTitle}>⚠️ More information needed</Text>
          {requestMessage ? (
            <Text style={styles.requestMessage}>"{requestMessage}"</Text>
          ) : null}

          <Text style={styles.formLabel}>Your response</Text>
          <TextInput
            style={styles.input}
            value={responseText}
            onChangeText={setResponseText}
            multiline
            placeholder="Add the details requested above"
          />

          <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}>
            <Text style={styles.photoButtonText}>+ Add Photos (optional)</Text>
          </TouchableOpacity>
          <View style={styles.photoRow}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.photo} />
            ))}
          </View>

          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmitResponse}
            disabled={submitting}
          >
            {submitting
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.submitButtonText}>Send Information</Text>}
          </TouchableOpacity>
        </View>
      )}

      <Text style={styles.sectionTitle}>Status Timeline</Text>

      {/* Submitted */}
      <View style={styles.stepCard}>
        <Text style={styles.stepTitle}>✅ Report Submitted</Text>
        <Text style={styles.stepDate}>{new Date(report.reported_date).toLocaleString()}</Text>
      </View>

      {/* Information requests and the citizen's replies */}
      {report.info_requests && report.info_requests.map((req: any) => (
        <View key={req.id} style={styles.stepCard}>
          <Text style={styles.stepTitle}>❓ More information requested</Text>
          {req.request_message ? (
            <Text style={styles.stepRemarks}>{req.request_message}</Text>
          ) : null}
          <Text style={styles.stepDate}>{new Date(req.requested_date).toLocaleString()}</Text>

          {req.response_message ? (
            <View style={styles.responseBox}>
              <Text style={styles.responseLabel}>Your response</Text>
              <Text style={styles.stepRemarks}>{req.response_message}</Text>
              <Text style={styles.stepDate}>{new Date(req.response_date).toLocaleString()}</Text>
            </View>
          ) : null}
        </View>
      ))}

      {/* Screening */}
      {report.status === 'Pending Screening' ? (
        <View style={styles.stepCardPending}>
          <Text style={styles.stepTitlePending}>
            {isResubmitted ? '⏳ Awaiting FRU Re-screening' : '⏳ Awaiting FRU Screening'}
          </Text>
        </View>
      ) : report.screened_date && report.status !== 'Needs More Info' ? (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>✅ Screened by FRU</Text>
          {report.screening_remarks ? (
            <Text style={styles.stepRemarks}>{report.screening_remarks}</Text>
          ) : null}
          <Text style={styles.stepDate}>{new Date(report.screened_date).toLocaleString()}</Text>
        </View>
      ) : null}

      {/* Inspection */}
      {report.inspection_date ? (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>✅ Inspected by Field Engineer</Text>
          {report.inspection_remarks ? (
            <Text style={styles.stepRemarks}>Findings: {report.inspection_remarks}</Text>
          ) : null}
          {report.recommended_action ? (
            <Text style={styles.stepRemarks}>Recommended: {report.recommended_action}</Text>
          ) : null}
          <Text style={styles.stepDate}>{new Date(report.inspection_date).toLocaleString()}</Text>
        </View>
      ) : report.status === 'Validated' ? (
        <View style={styles.stepCardPending}>
          <Text style={styles.stepTitlePending}>⏳ Awaiting Field Inspection</Text>
        </View>
      ) : null}

      {/* Work Order */}
      {report.work_order ? (
        <View style={styles.stepCard}>
          <Text style={styles.stepTitle}>✅ Work Order Issued</Text>
          <Text style={styles.stepRemarks}>{report.work_order.work_order_details}</Text>
          <Text style={styles.stepDate}>{new Date(report.work_order.date_issued).toLocaleString()}</Text>
        </View>
      ) : report.status === 'Inspected' ? (
        <View style={styles.stepCardPending}>
          <Text style={styles.stepTitlePending}>⏳ Awaiting Work Order</Text>
        </View>
      ) : null}

      {/* Repair Progress */}
      {report.work_order && report.work_order.repair_updates && report.work_order.repair_updates.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>Repair Progress</Text>
          {report.work_order.repair_updates.map((update: any) => (
            <View key={update.id} style={styles.stepCard}>
              <Text style={styles.stepTitle}>🔧 {update.status_update}</Text>
              {update.progress_remarks ? (
                <Text style={styles.stepRemarks}>{update.progress_remarks}</Text>
              ) : null}
              {update.photos && update.photos.length > 0 && (
                <View style={styles.photoRow}>
                  {update.photos.map((p: any) => (
                    <Image key={p.id} source={{ uri: p.image }} style={styles.photo} />
                  ))}
                </View>
              )}
              <Text style={styles.stepDate}>{new Date(update.update_date).toLocaleString()}</Text>
            </View>
          ))}
        </>
      )}

      {report.status === 'Resolved' && (
        <View style={styles.resolvedBanner}>
          <Text style={styles.resolvedText}>🎉 This issue has been resolved!</Text>
        </View>
      )}

      {report.status === 'Rejected' && (
        <View style={styles.rejectedBanner}>
          <Text style={styles.rejectedText}>This report was rejected during screening.</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', flex: 1, marginRight: 8 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  description: { color: '#555', marginTop: 8 },
  address: { color: '#888', fontSize: 13, marginTop: 6 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', marginTop: 24, marginBottom: 8, color: '#00695c' },
  stepCard: { backgroundColor: '#f0f7f4', borderLeftWidth: 4, borderLeftColor: '#00695c', borderRadius: 8, padding: 12, marginBottom: 10 },
  stepCardPending: { backgroundColor: '#fafafa', borderLeftWidth: 4, borderLeftColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 10 },
  stepTitle: { fontWeight: '700', color: '#00695c' },
  stepTitlePending: { fontWeight: '700', color: '#999' },
  stepRemarks: { marginTop: 6, color: '#333' },
  stepDate: { marginTop: 6, color: '#888', fontSize: 12 },
  photoRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8, gap: 8 },
  photo: { width: 60, height: 60, borderRadius: 6 },
  responseBox: { backgroundColor: '#ffffff', borderRadius: 6, padding: 10, marginTop: 10 },
  responseLabel: { fontWeight: '600', color: '#0A2E5C', fontSize: 12 },
  requestBox: { backgroundColor: '#fff4e0', borderRadius: 10, padding: 14, marginTop: 16 },
  requestTitle: { color: '#a15c00', fontWeight: '700', fontSize: 15 },
  requestMessage: { color: '#a15c00', marginTop: 6, fontStyle: 'italic' },
  formLabel: { fontWeight: '600', marginTop: 14, marginBottom: 6 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15, minHeight: 90, textAlignVertical: 'top' },
  photoButton: { borderWidth: 1, borderColor: '#00695c', borderStyle: 'dashed', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 12, backgroundColor: '#fff' },
  photoButtonText: { color: '#00695c', fontWeight: '600' },
  submitButton: { backgroundColor: '#00695c', padding: 14, borderRadius: 8, alignItems: 'center', marginTop: 14 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  resolvedBanner: { backgroundColor: '#e6f7ec', padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  resolvedText: { color: '#1e7e34', fontWeight: '700' },
  rejectedBanner: { backgroundColor: '#fdeaea', padding: 14, borderRadius: 8, marginTop: 20, alignItems: 'center' },
  rejectedText: { color: '#c0392b', fontWeight: '700' },
});