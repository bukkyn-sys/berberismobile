import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function MenteeCurrentScreen() {
  const { mentee, setMentee } = useOnboardingStore();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 px-6 pt-12">
          <Text className="text-xs text-gray-600 mb-2">STEP 2 OF 5</Text>
          <Text className="text-2xl font-bold text-white mb-2">Where do you work?</Text>
          <Text className="text-gray-400 text-sm mb-8">Your current position helps mentors understand your context.</Text>

          <View className="gap-4 mb-8">
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Current firm</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                placeholder="e.g. Barclays"
                placeholderTextColor="#4B5563"
                value={mentee.current_firm}
                onChangeText={(v) => setMentee({ current_firm: v })}
              />
            </View>
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Current role</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                placeholder="e.g. Analyst, IB Coverage"
                placeholderTextColor="#4B5563"
                value={mentee.current_role}
                onChangeText={(v) => setMentee({ current_role: v })}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={() => router.push("/onboarding/mentee-target")}
            className="bg-gold rounded-xl py-4 items-center"
          >
            <Text className="text-black font-bold text-base">Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
