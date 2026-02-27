import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { ArrowLeft, Sparkles } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { MentorCard, type MentorCardData } from "@/components/mentorship/mentor-card";

const GOALS = [
  "Break into Investment Banking",
  "Break into Private Equity",
  "Break into Asset Management",
  "Spring Week / Internship",
  "Lateral move",
  "Interview prep",
  "Technical skills",
  "Networking & career development",
];

const STAGES = [
  { value: "university", label: "University student" },
  { value: "graduate", label: "Graduate / recent leaver" },
  { value: "analyst", label: "Analyst (1–3 years)" },
  { value: "associate_plus", label: "Associate+ (3+ years)" },
];

export default function MatchScreen() {
  const { user } = useAuth();
  const [stage, setStage] = useState("");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [matches, setMatches] = useState<MentorCardData[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const toggleGoal = (g: string) =>
    setSelectedGoals((prev) => prev.includes(g) ? prev.filter((x) => x !== g) : [...prev, g]);

  const findMatches = async () => {
    if (!stage) { Alert.alert("Select your career stage first"); return; }
    setLoading(true);

    // Scoring: mentors whose expertise_areas overlap with selected goals
    const { data } = await supabase
      .from("mentors")
      .select(`
        user_id, firm, seniority, expertise_areas,
        rating_avg, session_count, is_top_mentor, is_founding_mentor,
        users!inner(id, full_name),
        profiles(avatar_url)
      `)
      .order("is_top_mentor", { ascending: false })
      .order("rating_avg", { ascending: false });

    if (data) {
      const scored = (data as any[]).map((m) => {
        const overlap = m.expertise_areas.filter((a: string) =>
          selectedGoals.some((g) => g.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(g.split(" ")[0].toLowerCase()))
        ).length;
        return { ...m, score: overlap };
      });
      scored.sort((a, b) => b.score - a.score || b.rating_avg - a.rating_avg);

      const top3 = scored.slice(0, 3).map((m) => ({
        id: m.users.id,
        full_name: m.users.full_name,
        firm: m.firm,
        seniority: m.seniority,
        expertise_areas: m.expertise_areas,
        rating_avg: m.rating_avg,
        session_count: m.session_count,
        is_top_mentor: m.is_top_mentor,
        is_founding_mentor: m.is_founding_mentor,
        avatar_url: m.profiles?.avatar_url ?? null,
      }));
      setMatches(top3);
    }
    setLoading(false);
    setDone(true);
  };

  if (done) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
          <TouchableOpacity onPress={() => setDone(false)} className="mb-4">
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <View className="flex-row items-center gap-2 mb-1">
            <Sparkles size={20} color="#C89B3C" />
            <Text className="text-2xl font-bold text-white">Your Top Matches</Text>
          </View>
          <Text className="text-gray-400 text-sm mb-6">Based on your goals and career stage</Text>

          {matches.length === 0 ? (
            <View className="py-12 items-center">
              <Text className="text-gray-500 text-sm">No matches found yet. More mentors joining soon.</Text>
            </View>
          ) : (
            matches.map((mentor) => (
              <MentorCard
                key={mentor.id}
                mentor={mentor}
                onPress={() => router.push(`/mentorship/${mentor.id}` as any)}
              />
            ))
          )}

          <TouchableOpacity
            onPress={() => router.back()}
            className="mt-4 border border-dark-border rounded-xl py-3.5 items-center"
          >
            <Text className="text-white">Browse all mentors</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2 mb-1">
          <Sparkles size={20} color="#C89B3C" />
          <Text className="text-2xl font-bold text-white">Find Your Match</Text>
        </View>
        <Text className="text-gray-400 text-sm mb-8">Answer a couple of questions and we'll show your top 3 mentors.</Text>

        {/* Stage */}
        <Text className="text-white font-semibold mb-3">Where are you in your career?</Text>
        <View className="gap-2 mb-8">
          {STAGES.map((s) => (
            <TouchableOpacity
              key={s.value}
              onPress={() => setStage(s.value)}
              className={`px-4 py-3 rounded-xl border ${stage === s.value ? "border-gold bg-gold/10" : "border-dark-border bg-dark-card"}`}
            >
              <Text className={stage === s.value ? "text-gold font-semibold" : "text-white"}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Goals */}
        <Text className="text-white font-semibold mb-3">What do you want help with? (pick all that apply)</Text>
        <View className="flex-row flex-wrap gap-2 mb-10">
          {GOALS.map((g) => {
            const active = selectedGoals.includes(g);
            return (
              <TouchableOpacity
                key={g}
                onPress={() => toggleGoal(g)}
                className={`px-3 py-2 rounded-full border ${active ? "border-gold bg-gold/10" : "border-dark-border bg-dark-card"}`}
              >
                <Text className={active ? "text-gold text-sm font-semibold" : "text-gray-400 text-sm"}>{g}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={findMatches}
          disabled={loading}
          className="bg-gold rounded-xl py-4 items-center"
        >
          {loading ? <ActivityIndicator color="#000" /> : (
            <View className="flex-row items-center gap-2">
              <Sparkles size={18} color="#000" />
              <Text className="text-black font-bold text-base">Find My Matches</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
