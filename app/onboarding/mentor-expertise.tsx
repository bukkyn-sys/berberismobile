import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";

const EXPERTISE_OPTIONS = [
  "Investment Banking", "Private Equity", "Asset Management",
  "Venture Capital", "Sales & Trading", "Equity Research",
  "Hedge Funds", "Credit / Fixed Income", "Fintech",
  "Risk Management", "DCF Modelling", "LBO Modelling",
  "M&A", "ECM / DCM", "Restructuring",
  "CV & Cover Letter", "Interview Prep", "Networking",
];

export default function MentorExpertiseScreen() {
  const { mentor, setMentor } = useOnboardingStore();

  const toggle = (area: string) => {
    const current = mentor.expertise_areas;
    if (current.includes(area)) {
      setMentor({ expertise_areas: current.filter((a) => a !== area) });
    } else {
      setMentor({ expertise_areas: [...current, area] });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}>
        <Text className="text-xs text-gray-600 mb-2">STEP 2 OF 4</Text>
        <Text className="text-2xl font-bold text-white mb-2">Your expertise</Text>
        <Text className="text-gray-400 text-sm mb-8">
          Select the areas you can best help mentees with. Pick at least one.
        </Text>

        <View className="flex-row flex-wrap gap-2 mb-8">
          {EXPERTISE_OPTIONS.map((area) => {
            const selected = mentor.expertise_areas.includes(area);
            return (
              <TouchableOpacity
                key={area}
                onPress={() => toggle(area)}
                className={`px-3 py-2 rounded-full border ${
                  selected ? "border-gold bg-gold/10" : "border-dark-border bg-dark-card"
                }`}
              >
                <Text className={selected ? "text-gold text-sm font-semibold" : "text-gray-400 text-sm"}>
                  {area}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => router.push("/onboarding/mentor-bio")}
          disabled={mentor.expertise_areas.length === 0}
          className={`rounded-xl py-4 items-center ${mentor.expertise_areas.length > 0 ? "bg-gold" : "bg-dark-muted"}`}
        >
          <Text className="text-black font-bold text-base">
            Continue ({mentor.expertise_areas.length} selected)
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
