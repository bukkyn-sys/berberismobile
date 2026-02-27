import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";

const DIVISIONS = [
  "Investment Banking", "Private Equity", "Asset Management",
  "Venture Capital", "Sales & Trading", "Hedge Funds",
  "Credit / Fixed Income", "Equity Research", "Fintech", "Risk Management",
];

export default function MenteeTargetScreen() {
  const { mentee, setMentee } = useOnboardingStore();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}>
          <Text className="text-xs text-gray-600 mb-2">STEP 3 OF 5</Text>
          <Text className="text-2xl font-bold text-white mb-2">What are you aiming for?</Text>
          <Text className="text-gray-400 text-sm mb-8">We use this to match you with the most relevant mentors.</Text>

          <View className="gap-4 mb-6">
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Target role</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                placeholder="e.g. Analyst at Goldman Sachs"
                placeholderTextColor="#4B5563"
                value={mentee.target_role}
                onChangeText={(v) => setMentee({ target_role: v })}
              />
            </View>
          </View>

          <Text className="text-gray-400 text-sm mb-2">Target division</Text>
          <View className="flex-row flex-wrap gap-2 mb-8">
            {DIVISIONS.map((div) => (
              <TouchableOpacity
                key={div}
                onPress={() => setMentee({ target_division: div })}
                className={`px-3 py-1.5 rounded-full border text-sm ${
                  mentee.target_division === div
                    ? "border-gold bg-gold/10"
                    : "border-dark-border bg-dark-card"
                }`}
              >
                <Text className={mentee.target_division === div ? "text-gold text-sm" : "text-gray-400 text-sm"}>
                  {div}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity
            onPress={() => router.push("/onboarding/mentee-goals")}
            className="bg-gold rounded-xl py-4 items-center"
          >
            <Text className="text-black font-bold text-base">Continue</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
