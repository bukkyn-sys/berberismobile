import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";

const STAGES = [
  { value: "university", label: "University Student", description: "Currently studying, looking for internships or spring weeks" },
  { value: "graduate", label: "Graduate / Spring Weeker", description: "Recently graduated or completed a placement" },
  { value: "analyst", label: "Analyst", description: "First 1–3 years in finance" },
  { value: "associate_plus", label: "Associate+", description: "3+ years experience, looking to move or grow" },
] as const;

export default function MenteeStageScreen() {
  const { mentee, setMentee } = useOnboardingStore();

  const select = (stage: typeof STAGES[number]["value"]) => {
    setMentee({ career_stage: stage });
    if (stage === "university") {
      router.push("/onboarding/mentee-university");
    } else {
      router.push("/onboarding/mentee-current");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}>
        <Text className="text-xs text-gray-600 mb-2">STEP 1 OF 5</Text>
        <Text className="text-2xl font-bold text-white mb-2">Where are you in your career?</Text>
        <Text className="text-gray-400 text-sm mb-8">This helps us match you with the right mentors.</Text>

        <View className="gap-3">
          {STAGES.map((stage) => (
            <TouchableOpacity
              key={stage.value}
              onPress={() => select(stage.value)}
              className={`bg-dark-card border rounded-2xl p-4 ${mentee.career_stage === stage.value ? "border-gold" : "border-dark-border"}`}
            >
              <Text className="text-white font-semibold text-base">{stage.label}</Text>
              <Text className="text-gray-500 text-sm mt-0.5">{stage.description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
