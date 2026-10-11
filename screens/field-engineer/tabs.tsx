import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

import ValidatedReportsScreen from './validated_reports';
import InspectionFormScreen from './inspection_form';
import MyInspectionsScreen from './my_inspections';
import WorkOrdersScreen from './work-orders';
import WorkOrderDetailScreen from './work-order-detail';
import NotificationsScreen from '../shared/notifications';
import { useUnreadCount } from '../../services/notifications';

type Props = {
  firstName: string;
  lastName: string;
  onLogout: () => void;
};

const Tab = createBottomTabNavigator();
const InspectStack = createNativeStackNavigator();
const WorkOrderStack = createNativeStackNavigator();

function InspectStackScreen() {
  return (
    <InspectStack.Navigator screenOptions={{ headerShown: false }}>
      <InspectStack.Screen name="ValidatedReports" component={ValidatedReportsScreen} />
      <InspectStack.Screen
        name="InspectionForm"
        component={InspectionFormScreen}
        options={{ headerShown: true, title: 'Submit Inspection' }}
      />
    </InspectStack.Navigator>
  );
}

function WorkOrderStackScreen() {
  return (
    <WorkOrderStack.Navigator screenOptions={{ headerShown: false }}>
      <WorkOrderStack.Screen name="WorkOrdersList" component={WorkOrdersScreen} />
      <WorkOrderStack.Screen
        name="WorkOrderDetail"
        component={WorkOrderDetailScreen}
        options={{ headerShown: true, title: 'Work Order Details' }}
      />
    </WorkOrderStack.Navigator>
  );
}

function ProfileTab({ firstName, lastName, onLogout }: Props) {
  return (
    <View style={styles.profileContainer}>
      <Text style={styles.name}>{firstName} {lastName}</Text>
      <Text style={styles.role}>Field Engineer</Text>
      <TouchableOpacity style={styles.logoutButton} onPress={onLogout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function FieldEngineerTabs({ firstName, lastName, onLogout }: Props) {
  const unreadCount = useUnreadCount();

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'clipboard';
            if (route.name === 'Inspections') iconName = 'clipboard';
            if (route.name === 'MyInspections') iconName = 'checkmark-done';
            if (route.name === 'WorkOrders') iconName = 'construct';
            if (route.name === 'Notifications') iconName = 'notifications';
            if (route.name === 'Profile') iconName = 'person';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >
        <Tab.Screen name="Inspections" component={InspectStackScreen} />
        <Tab.Screen
          name="MyInspections"
          component={MyInspectionsScreen}
          options={{ title: 'My Inspections' }}
        />
        <Tab.Screen name="WorkOrders" component={WorkOrderStackScreen} options={{ title: 'Work Orders' }} />
        <Tab.Screen
          name="Notifications"
          options={{ tabBarBadge: unreadCount > 0 ? unreadCount : undefined }}
        >
          {({ navigation }) => (
            <NotificationsScreen
              onOpenNotification={(notification) => {
                if (notification.kind === 'report_validated') {
                  navigation.navigate('Inspections');
                } else {
                  navigation.navigate('WorkOrders');
                }
              }}
            />
          )}
        </Tab.Screen>
        <Tab.Screen name="Profile">
          {() => <ProfileTab firstName={firstName} lastName={lastName} onLogout={onLogout} />}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  profileContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: 'bold' },
  role: { color: '#666', marginTop: 4, marginBottom: 24 },
  logoutButton: { backgroundColor: '#d32f2f', paddingVertical: 12, paddingHorizontal: 32, borderRadius: 8 },
  logoutText: { color: '#fff', fontWeight: '600' },
});