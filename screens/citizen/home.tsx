import { useState, useCallback } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../../services/api';

type Props = {
  onReportIssue: () => void;
  onViewReport: (reportId: number) => void;
  onViewAllReports: () => void;
  firstName: string;
};

type Report = {
  id: number;
  title: string;
  infrastructure_type: string;
  severity_level: string;
  status: string;
  reported_date: string;
};

export default function HomeScreen({
  onReportIssue,
  onViewReport,
  onViewAllReports,
  firstName,
}: Props) {
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchRecentReports = async () => {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await fetch(`${API_URL}/api/reports/my-reports/`, {
        headers: { 'Authorization': `Token ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setRecentReports(data.slice(0, 3));
      }
    } catch (err) {
      console.log('Fetch recent reports error:', err);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchRecentReports();
    }, [])
  );

  const statusColor = (status: string) => {
    if (status === 'Resolved') return '#388e3c';
    if (status === 'Rejected') return '#d32f2f';
    if (status === 'In Progress' || status === 'Work Order Issued') return '#f9a825';
    return '#008080';
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {firstName}! 👋
          </Text>
          <Text style={styles.subtitle}>
            Help improve your community
          </Text>
        </View>

        <View style={styles.profileCircle}>
          <Text style={styles.profileText}>
            {firstName.charAt(0).toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Main Report Card */}
      <View style={styles.reportCard}>
        <Text style={styles.cardTitle}>
          See an infrastructure problem?
        </Text>

        <Text style={styles.cardDescription}>
          Report roads, bridges, drainage, and other
          infrastructure issues in your area.
        </Text>

        <TouchableOpacity
          style={styles.reportButton}
          onPress={onReportIssue}
        >
          <Text style={styles.reportButtonText}>
            + Report an Issue
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Access */}
      <Text style={styles.sectionTitle}>Quick Access</Text>

      <View style={styles.quickContainer}>

        <TouchableOpacity style={styles.quickCard} onPress={onViewAllReports}>
          <Text style={styles.quickIcon}>📋</Text>
          <Text style={styles.quickTitle}>My Reports</Text>
          <Text style={styles.quickDescription}>
            View your submitted reports
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickCard}>
          <Text style={styles.quickIcon}>🔔</Text>
          <Text style={styles.quickTitle}>Notifications</Text>
          <Text style={styles.quickDescription}>
            Check report updates
          </Text>
        </TouchableOpacity>

      </View>

      {/* Recent Reports */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitleNoMargin}>Recent Reports</Text>
        {recentReports.length > 0 && (
          <TouchableOpacity onPress={onViewAllReports}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#008080" style={{ marginVertical: 20 }} />
      ) : recentReports.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No reports yet
          </Text>

          <Text style={styles.emptyText}>
            Your submitted infrastructure reports will
            appear here.
          </Text>
        </View>
      ) : (
        recentReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={styles.reportItem}
            onPress={() => onViewReport(report.id)}
          >
            <View style={styles.reportItemHeader}>
              <Text style={styles.reportItemTitle} numberOfLines={1}>
                {report.title}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: statusColor(report.status) }]}>
                <Text style={styles.statusBadgeText}>{report.status}</Text>
              </View>
            </View>
            <Text style={styles.reportItemMeta}>
              {report.infrastructure_type} • {new Date(report.reported_date).toLocaleDateString()}
            </Text>
          </TouchableOpacity>
        ))
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9F9',
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 30,
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },

  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222222',
  },

  subtitle: {
    fontSize: 14,
    color: '#777777',
    marginTop: 5,
  },

  profileCircle: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#008080',
    alignItems: 'center',
    justifyContent: 'center',
  },

  profileText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  reportCard: {
    backgroundColor: '#008080',
    borderRadius: 15,
    padding: 22,
    marginBottom: 25,
  },

  cardTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },

  cardDescription: {
    color: '#E0F2F1',
    fontSize: 14,
    lineHeight: 21,
    marginBottom: 20,
  },

  reportButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },

  reportButtonText: {
    color: '#008080',
    fontSize: 15,
    fontWeight: 'bold',
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
    marginBottom: 12,
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitleNoMargin: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222222',
  },

  seeAll: {
    fontSize: 14,
    color: '#008080',
    fontWeight: '600',
  },

  quickContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 25,
  },

  quickCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  quickIcon: {
    fontSize: 25,
    marginBottom: 8,
  },

  quickTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 5,
  },

  quickDescription: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 17,
  },

  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  emptyTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#444444',
    marginBottom: 5,
  },

  emptyText: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 19,
  },

  reportItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    marginBottom: 10,
  },

  reportItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  reportItemTitle: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333333',
    flex: 1,
    marginRight: 8,
  },

  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },

  statusBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  reportItemMeta: {
    marginTop: 6,
    fontSize: 12,
    color: '#888888',
  },
});