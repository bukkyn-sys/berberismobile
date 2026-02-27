import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useAuth } from "@/stores/auth-store";
import { useSubscription } from "@/hooks/use-subscription";
import { LogOut, Settings, CreditCard, User, GraduationCap } from "lucide-react-native";

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  standard: "Standard",
  ultra: "Ultra",
};

const TIER_COLORS: Record<string, string> = {
  free: "#9CA3AF",
  standard: "#C89B3C",
  ultra: "#A78BFA",
};

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { tier, isFounding, isStudent } = useSubscription();

  const tierLabel = TIER_LABELS[tier] ?? "Free";
  const tierColor = TIER_COLORS[tier] ?? "#9CA3AF";

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

          {/* Tier badges */}
          <View className="flex-row gap-2 mt-2 items-center">
            <View
              className="px-3 py-0.5 rounded-full border"
              style={{ borderColor: tierColor + "60", backgroundColor: tierColor + "20" }}
            >
              <Text className="text-xs font-semibold" style={{ color: tierColor }}>
                {tierLabel}
              </Text>
            </View>
            {isFounding && (
              <View className="px-3 py-0.5 rounded-full bg-gold/20 border border-gold/40">
                <Text className="text-gold text-xs font-semibold">Founding Member</Text>
              </View>
            )}
            {isStudent && (
              <View className="px-3 py-0.5 rounded-full bg-blue-500/20 border border-blue-500/30">
                <GraduationCap size={10} color="#60A5FA" />
              </View>
            )}
          </View>
        </View>

        {/* Menu items */}
        <View className="gap-3">
          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3">
            <User size={18} color="#9CA3AF" />
            <Text className="text-white flex-1">Edit Profile</Text>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.push("/pricing")}
            className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3"
          >
            <CreditCard size={18} color="#9CA3AF" />
            <View className="flex-1">
              <Text className="text-white">Subscription & Billing</Text>
              {tier === "free" && (
                <Text className="text-gold text-xs mt-0.5">Upgrade to unlock mentorship</Text>
              )}
            </View>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>

          {!isStudent && (
            <TouchableOpacity
              onPress={() => router.push("/profile/student-verify")}
              className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex-row items-center gap-3"
            >
              <GraduationCap size={18} color="#60A5FA" />
              <View className="flex-1">
                <Text className="text-blue-400">Student Discount</Text>
                <Text className="text-gray-500 text-xs mt-0.5">Verify .ac.uk email for 33% off</Text>
              </View>
              <Text className="text-gray-600">›</Text>
            </TouchableOpacity>
          )}

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
