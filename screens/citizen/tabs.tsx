import React from 'react';
import {
  NavigationContainer,
} from '@react-navigation/native';
import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from './home';
import ProfileScreen from './profile';
import PersonalInformationScreen from './personal-information';
import MapScreen from './map';
import ReportsScreen from './reports';
import ReportIssueScreen from './report-issue';
import ReportDetailScreen from './report-detail';
import NotificationsScreen from '../shared/notifications';
import SettingsScreen from './settings';

type Props = {
  firstName: string;
  lastName: string;
  onLogout: () => void;
};

const Tab = createBottomTabNavigator();
const ProfileStack = createNativeStackNavigator();
const HomeStack = createNativeStackNavigator();
const ReportsStack = createNativeStackNavigator();

function ProfileStackScreen({
  firstName,
  lastName,
  onLogout,
}: Props) {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ProfileStack.Screen name="ProfileHome">
        {({ navigation }) => (
          <ProfileScreen
            firstName={firstName}
            lastName={lastName}
            onLogout={onLogout}
            onPersonalInformation={() =>
              navigation.navigate('PersonalInformation')
            }
            onNotifications={() => navigation.navigate('ProfileNotifications')}
            onSettings={() => navigation.navigate('Settings')}
          />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen
        name="PersonalInformation"
        component={PersonalInformationScreen}
      />

      <ProfileStack.Screen
        name="ProfileNotifications"
        options={{
          headerShown: true,
          title: 'Notifications',
        }}
      >
        {({ navigation }) => (
          <NotificationsScreen
            showTitle={false}
            onOpenNotification={(notification) => {
              if (notification.report) {
                navigation.navigate('Reports', {
                  screen: 'ReportDetail',
                  params: { reportId: notification.report },
                });
              }
            }}
          />
        )}
      </ProfileStack.Screen>

      <ProfileStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          headerShown: true,
          title: 'Settings',
        }}
      />
    </ProfileStack.Navigator>
  );
}

function HomeStackScreen({ firstName }: { firstName: string }) {
  return (
    <HomeStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <HomeStack.Screen name="HomeMain">
        {({ navigation }) => (
          <HomeScreen
            firstName={firstName}
            onReportIssue={() => navigation.navigate('ReportIssue')}
            onViewReport={(reportId: number) =>
              navigation.navigate('Reports', {
                screen: 'ReportDetail',
                params: { reportId },
              })
            }
            onViewAllReports={() =>
              navigation.navigate('Reports', { screen: 'ReportsList' })
            }
            onOpenNotifications={() => navigation.navigate('Notifications')}
          />
        )}
      </HomeStack.Screen>

      <HomeStack.Screen
        name="ReportIssue"
        component={ReportIssueScreen}
        options={{
          headerShown: true,
          title: 'Report an Issue',
        }}
      />

      <HomeStack.Screen
        name="Notifications"
        options={{
          headerShown: true,
          title: 'Notifications',
        }}
      >
        {({ navigation }) => (
          <NotificationsScreen
            showTitle={false}
            onOpenNotification={(notification) => {
              if (notification.report) {
                navigation.navigate('Reports', {
                  screen: 'ReportDetail',
                  params: { reportId: notification.report },
                });
              }
            }}
          />
        )}
      </HomeStack.Screen>
    </HomeStack.Navigator>
  );
}

function ReportsStackScreen() {
  return (
    <ReportsStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <ReportsStack.Screen name="ReportsList" component={ReportsScreen} />
      <ReportsStack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{
          headerShown: true,
          title: 'Report Details',
        }}
      />
    </ReportsStack.Navigator>
  );
}

export default function CitizenTabs({
  firstName,
  lastName,
  onLogout,
}: Props) {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'home';

            if (route.name === 'Home') {
              iconName = 'home';
            } else if (route.name === 'Map') {
              iconName = 'map';
            } else if (route.name === 'Reports') {
              iconName = 'document-text';
            } else if (route.name === 'Profile') {
              iconName = 'person';
            }

            return <Ionicons name={iconName} size={size} color={color} />;
          },
        })}
      >

        {/* HOME TAB */}
        <Tab.Screen
          name="Home"
          options={{
            title: 'Home',
            tabBarLabel: 'Home',
          }}
        >
          {() => <HomeStackScreen firstName={firstName} />}
        </Tab.Screen>

        {/* MAP TAB */}
        <Tab.Screen
          name="Map"
          component={MapScreen}
          options={{
            title: 'Map',
            tabBarLabel: 'Map',
          }}
        />

        {/* REPORTS TAB */}
        <Tab.Screen
          name="Reports"
          component={ReportsStackScreen}
          options={{
            title: 'Reports',
            tabBarLabel: 'Reports',
          }}
        />

        {/* PROFILE TAB */}
        <Tab.Screen
          name="Profile"
          options={{
            title: 'Profile',
            tabBarLabel: 'Profile',
          }}
        >
          {() => (
            <ProfileStackScreen
              firstName={firstName}
              lastName={lastName}
              onLogout={onLogout}
            />
          )}
        </Tab.Screen>

      </Tab.Navigator>
    </NavigationContainer>
  );
}