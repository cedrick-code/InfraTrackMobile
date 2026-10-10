import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator, Linking,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { API_URL } from '../../services/api';

export default function InspectionFormScreen({ route, navigation }: any) {
  const { report } = route.params;

  const [remarks, setRemarks] = useState('');
  const [recommendedAction, setRecommendedAction] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [validationResult, setValidationResult] = useState<'Confirmed' | 'Not Confirmed'>('Confirmed');
  const [severity, setSeverity] = useState<string>(report.severity_level || 'Medium');
  const [comments, setComments] = useState('');

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
    if (!remarks.trim()) {
      Alert.alert('Missing info', 'Please describe your findings.');
      return;
    }
    if (validationResult === 'Confirmed' && !recommendedAction.trim()) {
      Alert.alert('Missing info', 'Please add a recommended action.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const formData = new FormData();
      formData.append('inspection_remarks', remarks);
      formData.append('recommended_action', recommendedAction);
      formData.append('validation_result', validationResult);
      formData.append('severity_rating', severity);
      formData.append('comments', comments);

      for (let i = 0; i < photos.length; i++) {
        const res = await fetch(photos[i]);
        const blob = await res.blob();
        formData.append(`inspection_photo_${i}`, blob, `inspection_${i}.jpg`);
      }

      const response = await fetch(`${API_URL}/api/reports/${report.id}/inspect/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Token ${token}` },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Inspection submitted.');
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
      <Text style={styles.label}>Report</Text>
      <Text style={styles.reportTitle}>{report.title}</Text>
      <Text style={styles.reportDesc}>{report.description}</Text>

    <Text style={styles.label}>Location</Text>
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: parseFloat(report.latitude),
          longitude: parseFloat(report.longitude),
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
      >
        <Marker
          coordinate={{
            latitude: parseFloat(report.latitude),
            longitude: parseFloat(report.longitude),
          }}
          title={report.title}
        />
      </MapView>
      {report.geographic_address ? (
        <Text style={styles.address}>📍 {report.geographic_address}</Text>
      ) : null}

      <TouchableOpacity
        style={styles.directionsButton}
        onPress={() => {
          const url = `https://www.google.com/maps/dir/?api=1&destination=${report.latitude},${report.longitude}`;
          Linking.openURL(url);
        }}
      >
        <Text style={styles.directionsButtonText}>Get Directions</Text>
      </TouchableOpacity>

            <Text style={styles.label}>Validation Result</Text>
      <View style={styles.toggleRow}>
        {(['Confirmed', 'Not Confirmed'] as const).map((value) => (
          <TouchableOpacity
            key={value}
            style={[styles.toggleButton, validationResult === value && styles.toggleButtonActive]}
            onPress={() => setValidationResult(value)}
          >
            <Text style={[styles.toggleText, validationResult === value && styles.toggleTextActive]}>
              {value}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Severity Rating (your assessment)</Text>
      <View style={styles.toggleRow}>
        {['Low', 'Medium', 'High'].map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.toggleButton, severity === level && styles.toggleButtonActive]}
            onPress={() => setSeverity(level)}
          >
            <Text style={[styles.toggleText, severity === level && styles.toggleTextActive]}>
              {level}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Inspection Remarks</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={remarks}
        onChangeText={setRemarks}
        multiline
        placeholder="What did you find on-site?"
      />

      <Text style={styles.label}>Recommended Action</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={recommendedAction}
        onChangeText={setRecommendedAction}
        multiline
        placeholder="What repair action do you recommend?"
      />

      <Text style={styles.label}>Additional Comments (optional)</Text>
      <TextInput
        style={[styles.input, { height: 80 }]}
        value={comments}
        onChangeText={setComments}
        multiline
        placeholder="Anything else DPWH should know?"
      />

      <Text style={styles.label}>Inspection Photos</Text>
      <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}>
        <Text style={styles.photoButtonText}>+ Add Photos</Text>
      </TouchableOpacity>
      <View style={styles.photoPreviewRow}>
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.photoPreview} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Inspection</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 6, fontSize: 14 },
  reportTitle: { fontSize: 18, fontWeight: 'bold' },
  reportDesc: { color: '#555', marginTop: 4 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, fontSize: 15 },
  photoButton: { borderWidth: 1, borderColor: '#00695c', borderStyle: 'dashed', padding: 14, borderRadius: 8, alignItems: 'center' },
  photoButtonText: { color: '#00695c', fontWeight: '600' },
  photoPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  photoPreview: { width: 70, height: 70, borderRadius: 8 },
  submitButton: { backgroundColor: '#00695c', padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 40 },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    map: { height: 200, borderRadius: 8, marginTop: 4 },
  address: { color: '#666', fontSize: 13, marginTop: 6 },
  directionsButton: {
    backgroundColor: '#0A2E5C', paddingVertical: 10, borderRadius: 8,
    alignItems: 'center', marginTop: 10,
  },
  directionsButtonText: { color: '#fff', fontWeight: '600' },
    toggleRow: { flexDirection: 'row', gap: 8 },
  toggleButton: {
    flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', backgroundColor: '#fff',
  },
  toggleButtonActive: { backgroundColor: '#00695c', borderColor: '#00695c' },
  toggleText: { color: '#444', fontWeight: '600' },
  toggleTextActive: { color: '#fff' },
});