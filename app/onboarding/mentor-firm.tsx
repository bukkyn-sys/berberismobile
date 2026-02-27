import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";

const SENIORITY_LEVELS = ["Analyst", "Associate", "VP / Director", "MD / Partner", "C-Suite"];

export default function MentorFirmScreen() {
  const { mentor, setMentor } = useOnboardingStore();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}>
          <Text className="text-xs text-gray-600 mb-2">STEP 1 OF 4</Text>
          <Text className="text-2xl font-bold text-white mb-2">Your firm & seniority</Text>
          <Text className="text-gray-400 text-sm mb-8">Shown on your public mentor profile.</Text>

          <View className="gap-4 mb-6">
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Firm</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                placeholder="e.g. Goldman Sachs, Blackstone, KKR"
                placeholderTextColor="#4B5563"
                value={mentor.firm}
                onChangeText={(v) => setMentor({ firm: v })}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-sm mb-3">Seniority</Text>
          <View className="gap-2 mb-8">
            {SENIORITY_LEVELS.map((level) => (
              <TouchableOpacity
                key={level}
                onPress={() => setMentor({ seniority: level })}
                className={`px-4 py-3 rounded-xl border ${
                  mentor.seniority === level ? "border-gold bg-gold/10" : "border-dark-border bg-dark-card"
                }`}
              >
                <Text className={mentor.seniority === level ? "text-gold font-semibold" : "text-white"}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/onboarding/mentor-expertise")}
            disabled={!mentor.firm || !mentor.seniority}
            className={`rounded-xl py-4 items-center ${mentor.firm && mentor.seniority ? "bg-gold" : "bg-dark-muted"}`}
          >
            <Text className="text-black font-bold text-base">Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
