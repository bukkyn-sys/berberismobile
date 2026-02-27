import { View, Text, TouchableOpacity, SafeAreaView } from "react-native";
import { router } from "expo-router";
import { Briefcase, GraduationCap } from "lucide-react-native";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function RoleSelectionScreen() {
  const { setRole } = useOnboardingStore();

  const choose = (role: "mentee" | "mentor") => {
    setRole(role);
    router.push(role === "mentee" ? "/onboarding/mentee-stage" : "/onboarding/mentor-firm");
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-6 pt-12">
        <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-gold">Berberis Capital</Text>
          <Text className="text-gray-400 text-sm mt-1">Let's personalise your experience</Text>
        </View>

        <Text className="text-2xl font-bold text-white mb-2">I am joining as a…</Text>
        <Text className="text-gray-400 text-sm mb-8">You can change this later in settings.</Text>

        <View className="gap-4">
          <TouchableOpacity
            onPress={() => choose("mentee")}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 flex-row items-center gap-4 active:border-gold"
          >
            <View className="w-12 h-12 rounded-xl bg-blue-500/20 items-center justify-center">
              <GraduationCap size={24} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Mentee</Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                Student or finance professional seeking mentorship
              </Text>
            </View>
            <Text className="text-gray-600 text-lg">›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => choose("mentor")}
            className="bg-dark-card border border-dark-border rounded-2xl p-5 flex-row items-center gap-4 active:border-gold"
          >
            <View className="w-12 h-12 rounded-xl bg-gold/20 items-center justify-center">
              <Briefcase size={24} color="#C89B3C" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-bold text-base">Mentor</Text>
              <Text className="text-gray-500 text-sm mt-0.5">
                Finance professional offering mentorship
              </Text>
            </View>
            <Text className="text-gray-600 text-lg">›</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}
