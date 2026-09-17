import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, Image, Alert, ActivityIndicator,
} from 'react-native';
import * as Location from 'expo-location';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SEVERITY_OPTIONS = ['Low', 'Medium', 'High'];
const INFRA_TYPES = ['Road', 'Bridge', 'Drainage'];

type Props = {
  authToken: string; // your login token, passed from wherever you store auth
};

export default function ReportIssueScreen() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [infraType, setInfraType] = useState('Road');
  const [severity, setSeverity] = useState('Low');
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [address, setAddress] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const captureLocation = async () => {
    setLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Location access is required to geo-tag the issue.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({});
      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const reverse = await Location.reverseGeocodeAsync(position.coords);
      if (reverse.length > 0) {
        const place = reverse[0];
        setAddress(`${place.street ?? ''} ${place.city ?? ''} ${place.region ?? ''}`.trim());
      }
    } catch (err) {
      Alert.alert('Error', 'Could not get your location. Try again.');
    } finally {
      setLocating(false);
    }
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
    if (!title || !description || !coords) {
      Alert.alert('Missing info', 'Please fill in the title, description, and capture your location.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('auth_token');

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('infrastructure_type', infraType);
      formData.append('severity_level', severity);
      formData.append('latitude', coords.latitude.toFixed(7));
      formData.append('longitude', coords.longitude.toFixed(7));
      formData.append('geographic_address', address);
      formData.append('location_method', 'GPS');

      for (let index = 0; index < photos.length; index++) {
        const uri = photos[index];
        const response = await fetch(uri);
        const blob = await response.blob();
        formData.append(`photo_${index}`, blob, `photo_${index}.jpg`);
        }

      const response = await fetch(`${API_URL}/api/reports/create/`, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        Alert.alert('Success', 'Your report has been submitted.');
        setTitle('');
        setDescription('');
        setCoords(null);
        setAddress('');
        setPhotos([]);
      } else {
        const errText = await response.text();
        Alert.alert('Submission failed', errText);
      }
    } catch (err: any) {
        console.log('Submit error:', err);
        Alert.alert('Error', `Something went wrong: ${err?.message || String(err)}`);
    } finally {
        setSubmitting(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="e.g. Pothole on Roxas Ave" />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, { height: 100 }]}
        value={description}
        onChangeText={setDescription}
        multiline
        placeholder="Describe the issue in detail"
      />

      <Text style={styles.label}>Infrastructure Type</Text>
      <View style={styles.row}>
        {INFRA_TYPES.map((type) => (
          <TouchableOpacity
            key={type}
            style={[styles.chip, infraType === type && styles.chipSelected]}
            onPress={() => setInfraType(type)}
          >
            <Text style={infraType === type ? styles.chipTextSelected : styles.chipText}>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Severity</Text>
      <View style={styles.row}>
        {SEVERITY_OPTIONS.map((level) => (
          <TouchableOpacity
            key={level}
            style={[styles.chip, severity === level && styles.chipSelected]}
            onPress={() => setSeverity(level)}
          >
            <Text style={severity === level ? styles.chipTextSelected : styles.chipText}>{level}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Location</Text>
      <TouchableOpacity style={styles.locationButton} onPress={captureLocation} disabled={locating}>
        {locating ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.locationButtonText}>
            {coords ? 'Location Captured ✓' : '📍 Capture Current Location'}
          </Text>
        )}
      </TouchableOpacity>
      {address ? <Text style={styles.addressText}>{address}</Text> : null}

      <Text style={styles.label}>Photos</Text>
      <TouchableOpacity style={styles.photoButton} onPress={pickPhotos}>
        <Text style={styles.photoButtonText}>+ Add Photos</Text>
      </TouchableOpacity>
      <View style={styles.photoPreviewRow}>
        {photos.map((uri, i) => (
          <Image key={i} source={{ uri }} style={styles.photoPreview} />
        ))}
      </View>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={submitting}>
        {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitButtonText}>Submit Report</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  label: { fontWeight: '600', marginTop: 16, marginBottom: 6, fontSize: 14 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 15,
  },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
    borderWidth: 1, borderColor: '#ddd', marginRight: 8, marginBottom: 8,
  },
  chipSelected: { backgroundColor: '#00695c', borderColor: '#00695c' },
  chipText: { color: '#333' },
  chipTextSelected: { color: '#fff', fontWeight: '600' },
  locationButton: {
    backgroundColor: '#00695c', padding: 14, borderRadius: 8, alignItems: 'center',
  },
  locationButtonText: { color: '#fff', fontWeight: '600' },
  addressText: { marginTop: 6, color: '#666', fontSize: 13 },
  photoButton: {
    borderWidth: 1, borderColor: '#00695c', borderStyle: 'dashed',
    padding: 14, borderRadius: 8, alignItems: 'center',
  },
  photoButtonText: { color: '#00695c', fontWeight: '600' },
  photoPreviewRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10, gap: 8 },
  photoPreview: { width: 70, height: 70, borderRadius: 8 },
  submitButton: {
    backgroundColor: '#00695c', padding: 16, borderRadius: 8,
    alignItems: 'center', marginTop: 24, marginBottom: 40,
  },
  submitButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});