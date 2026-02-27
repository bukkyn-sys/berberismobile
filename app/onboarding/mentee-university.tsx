import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";

export default function MenteeUniversityScreen() {
  const { mentee, setMentee } = useOnboardingStore();

  const next = () => {
    router.push("/onboarding/mentee-target");
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 px-6 pt-12">
          <Text className="text-xs text-gray-600 mb-2">STEP 2 OF 5</Text>
          <Text className="text-2xl font-bold text-white mb-2">Your university</Text>
          <Text className="text-gray-400 text-sm mb-8">
            If you use a .ac.uk email you may qualify for student pricing.
          </Text>

          <View className="gap-4 mb-8">
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">University name</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                placeholder="e.g. University of Edinburgh"
                placeholderTextColor="#4B5563"
                value={mentee.university}
                onChangeText={(v) => setMentee({ university: v })}
              />
            </View>
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Year of study</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                placeholder="e.g. 2"
                placeholderTextColor="#4B5563"
                keyboardType="numeric"
                value={mentee.year_of_study}
                onChangeText={(v) => setMentee({ year_of_study: v })}
              />
            </View>
          </View>

          <TouchableOpacity onPress={next} className="bg-gold rounded-xl py-4 items-center">
            <Text className="text-black font-bold text-base">Continue</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
