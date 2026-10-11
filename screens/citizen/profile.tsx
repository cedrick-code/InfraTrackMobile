import {
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

type Props = {
  firstName: string;
  lastName: string;
  onLogout: () => void;
  onPersonalInformation: () => void;
  onNotifications: () => void;
  onSettings: () => void;
};

export default function ProfileScreen({
  firstName,
  lastName,
  onLogout,
  onPersonalInformation,
  onNotifications,
  onSettings,
}: Props) {

  const handleLogout = () => {

    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );

  };

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Profile
      </Text>

      {/* Profile Header */}
      <View style={styles.profileCard}>

        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {firstName.charAt(0).toUpperCase()} 
          </Text>
        </View>

        <View>
          <Text style={styles.name}>
            {firstName} {lastName}
          </Text>

          <Text style={styles.role}>
            Citizen
          </Text>
        </View>

      </View>


      {/* Profile Options */}
      <View style={styles.optionsContainer}>

        <TouchableOpacity
          style={styles.option}
          onPress={onPersonalInformation}
        >
          <Text style={styles.optionIcon}>
            👤
          </Text>

          <Text style={styles.optionText}>
            Personal Information 
          </Text>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.option} onPress={onNotifications}>
          <Text style={styles.optionIcon}>
            🔔
          </Text>

          <Text style={styles.optionText}>
            Notifications
          </Text>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.option} onPress={onSettings}>
          <Text style={styles.optionIcon}>
            ⚙️
          </Text>

          <Text style={styles.optionText}>
            Settings
          </Text>

          <Text style={styles.arrow}>
            ›
          </Text>
        </TouchableOpacity>

      </View>


      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButton}
        onPress={handleLogout}
      >
        <Text style={styles.logoutIcon}>
          🚪
        </Text>

        <Text style={styles.logoutText}>
          Logout
        </Text>
      </TouchableOpacity>

    </View>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 55,
    backgroundColor: '#F8F9FA',
  },

  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 25,
  },
  
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 25,
  },

  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F98B88',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },

  avatarText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  name: {
    fontSize: 20,
    fontWeight: '700',
  },

  role: {
    marginTop: 4,
    fontSize: 14,
    color: '#777777',
  },

  optionsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
  },

  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  optionIcon: {
    fontSize: 20,
    width: 35,
  },

  optionText: {
    flex: 1,
    fontSize: 16,
  },

  arrow: {
    fontSize: 24,
    color: '#999999',
  },

  logoutButton: {
    marginTop: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },

  logoutIcon: {
    fontSize: 18,
    marginRight: 8,
  },

  logoutText: {
    fontSize: 16,
    fontWeight: '600',
  },

});