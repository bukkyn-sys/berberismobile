import { View, Text, ScrollView, SafeAreaView } from "react-native";
import { useAuth } from "@/stores/auth-store";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-white">
            Good morning 👋
          </Text>
          <Text className="text-gray-400 mt-1 text-sm">
            Welcome to Berberis Capital
          </Text>
        </View>

        {/* Upcoming Sessions */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-3">Upcoming Sessions</Text>
          <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <Text className="text-gray-500 text-sm">No upcoming sessions</Text>
          </View>
        </View>

        {/* Streak */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-3">Learning Streak</Text>
          <View className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3">
            <Text className="text-3xl">🔥</Text>
            <View>
              <Text className="text-white font-bold text-lg">0 days</Text>
              <Text className="text-gray-500 text-xs">Start your streak today</Text>
            </View>
          </View>
        </View>

        {/* Recent Moves */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-3">Latest Moves</Text>
          <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <Text className="text-gray-500 text-sm">Loading latest moves...</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
