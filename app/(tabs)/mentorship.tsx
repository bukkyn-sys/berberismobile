import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { Lock } from "lucide-react-native";
import { useAuth } from "@/stores/auth-store";

export default function MentorshipScreen() {
  const { user } = useAuth();

  // Placeholder: tier gating will be wired to Supabase subscription
  const isFree = true;

  if (isFree) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-dark-card border border-dark-border rounded-3xl p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-gold/10 items-center justify-center mb-4">
              <Lock size={28} color="#C89B3C" />
            </View>
            <Text className="text-xl font-bold text-white text-center mb-2">
              Mentorship is a paid feature
            </Text>
            <Text className="text-gray-400 text-sm text-center mb-6">
              Upgrade to Standard for group sessions (3/month) or Ultra for 1:1 sessions (up to 8/month).
            </Text>
            <TouchableOpacity className="bg-gold rounded-xl px-6 py-3 w-full items-center">
              <Text className="text-black font-bold">View Plans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-white mb-6">Mentorship</Text>
        {/* Directory, matching, sessions will be built here */}
        <Text className="text-gray-400">Mentor directory loading...</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
