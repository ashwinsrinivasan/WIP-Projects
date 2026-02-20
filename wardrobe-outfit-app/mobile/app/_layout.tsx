import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.root}>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: '#0A0A0A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: '700', fontSize: 18 },
          tabBarStyle: {
            backgroundColor: '#0A0A0A',
            borderTopColor: '#1A1A1A',
            paddingBottom: 8,
            paddingTop: 4,
            height: 70,
          },
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#555555',
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="(tabs)/index"
          options={{
            title: 'Wardrobe',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shirt-outline" size={size} color={color} />
            ),
            headerTitle: 'My Wardrobe',
          }}
        />
        <Tabs.Screen
          name="(tabs)/advisor"
          options={{
            title: 'Outfit Advisor',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="sparkles-outline" size={size} color={color} />
            ),
            headerTitle: 'Outfit Advisor',
          }}
        />
      </Tabs>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
});
