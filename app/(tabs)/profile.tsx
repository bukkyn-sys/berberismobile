import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { useAuth } from "@/stores/auth-store";
import { LogOut, Settings, CreditCard, User } from "lucide-react-native";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
        <Text className="text-2xl font-bold text-white mb-6">Profile</Text>

        {/* Avatar + name */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 rounded-full bg-gold/20 items-center justify-center mb-3">
            <User size={36} color="#C89B3C" />
          </View>
          <Text className="text-white font-semibold text-lg">{user?.email ?? "—"}</Text>
          <View className="mt-1 px-3 py-0.5 rounded-full bg-dark-card border border-dark-border">
            <Text className="text-gray-400 text-xs">Free tier</Text>
          </View>
        </View>

        {/* Menu items */}
        <View className="gap-3">
          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3">
            <User size={18} color="#9CA3AF" />
            <Text className="text-white flex-1">Edit Profile</Text>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3">
            <CreditCard size={18} color="#9CA3AF" />
            <Text className="text-white flex-1">Subscription & Billing</Text>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>

          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3">
            <Settings size={18} color="#9CA3AF" />
            <Text className="text-white flex-1">Settings</Text>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={signOut}
            className="bg-dark-card border border-red-900/40 rounded-2xl p-4 flex-row items-center gap-3 mt-4"
          >
            <LogOut size={18} color="#EF4444" />
            <Text className="text-red-400 flex-1">Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
