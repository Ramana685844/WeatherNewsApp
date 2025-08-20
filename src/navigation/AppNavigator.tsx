import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet } from 'react-native';
import { Home, Settings, Cloud, Newspaper } from 'lucide-react-native';
import HomeScreen from '../screens/HomeScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Tab = createBottomTabNavigator();

const styles = StyleSheet.create({
  headerIcon: {
    marginLeft: 15,
  },
});

const TabIcon: React.FC<{ 
  routeName: string; 
  focused: boolean; 
  color: string; 
  size: number; 
}> = ({ routeName, focused, color, size }) => {
  if (routeName === 'Home') {
    const IconComponent = focused ? Cloud : Home;
    return <IconComponent size={size} color={color} />;
  } else if (routeName === 'Settings') {
    return <Settings size={size} color={color} />;
  }
  return null;
};

const HeaderIcon: React.FC<{ routeName: string }> = ({ routeName }) => {
  if (routeName === 'Home') {
    return <Newspaper size={20} color="#FFFFFF" style={styles.headerIcon} />;
  } else if (routeName === 'Settings') {
    return <Settings size={20} color="#FFFFFF" style={styles.headerIcon} />;
  }
  return null;
};

const createTabIcon = (routeName: string) => ({ focused, color, size }: {
  focused: boolean;
  color: string;
  size: number;
}) => (
  <TabIcon 
    routeName={routeName} 
    focused={focused} 
    color={color} 
    size={size} 
  />
);

const createHeaderIcon = (routeName: string) => () => (
  <HeaderIcon routeName={routeName} />
);

const AppNavigator: React.FC = () => {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#4A90E2',
          tabBarInactiveTintColor: '#8E8E93',
          tabBarStyle: {
            backgroundColor: '#FFFFFF',
            borderTopWidth: 0.5,
            borderTopColor: '#E5E5EA',
            paddingBottom: 8,
            paddingTop: 8,
            height: 85,
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: -2,
            },
            shadowOpacity: 0.1,
            shadowRadius: 3.84,
            elevation: 5,
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '600',
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          
          headerStyle: {
            backgroundColor: '#4A90E2',
            shadowColor: '#000',
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.25,
            shadowRadius: 3.84,
            elevation: 5,
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 18,
          },
          headerTitleAlign: 'center',
        }}
      >
        <Tab.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ 
            title: 'Weather & News',
            tabBarLabel: 'Home',
            tabBarIcon: createTabIcon('Home'),
            headerLeft: createHeaderIcon('Home'),
          }}
        />
        <Tab.Screen 
          name="Settings" 
          component={SettingsScreen}
          options={{ 
            title: 'Settings',
            tabBarLabel: 'Settings',
            tabBarIcon: createTabIcon('Settings'),
            headerLeft: createHeaderIcon('Settings'),
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;