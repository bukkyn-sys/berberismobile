import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { ArrowLeft, Star, Trophy, TrendingUp } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { TouchableOpacity } from "react-native";
import { Badge } from "@/components/ui/badge";

// Top Mentor thresholds (to be confirmed pre-launch — these are placeholders)
const TOP_MENTOR_HOURS_THRESHOLD = 20;
const TOP_MENTOR_RATING_THRESHOLD = 4.5;
const TOP_MENTOR_SESSIONS_THRESHOLD = 15;

function ProgressBar({ value, max, color = "#C89B3C" }: { value: number; max: number; color?: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <View className="h-2 bg-dark-muted rounded-full overflow-hidden">
      <View style={{ width: `${pct}%`, height: "100%", backgroundColor: color, borderRadius: 99 }} />
    </View>
  );
}

export default function MentorProgressScreen() {
  const { user } = useAuth();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mentors")
        .select("*")
        .eq("user_id", user!.id)
        .single();
      setMentor(data);
      setLoading(false);
    })();
  }, [user]);

  if (loading) {
    return <SafeAreaView className="flex-1 bg-dark items-center justify-center"><ActivityIndicator color="#C89B3C" /></SafeAreaView>;
  }

  if (!mentor) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center px-6">
        <Text className="text-gray-400 text-center">No mentor profile found.</Text>
      </SafeAreaView>
    );
  }

  const isTopMentor = mentor.is_top_mentor;
  const hoursProgress = Math.min(mentor.total_hours, TOP_MENTOR_HOURS_THRESHOLD);
  const sessionProgress = Math.min(mentor.session_count, TOP_MENTOR_SESSIONS_THRESHOLD);

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <View className="flex-row items-center gap-2 mb-1">
          <Trophy size={22} color="#C89B3C" />
          <Text className="text-2xl font-bold text-white">Mentor Progress</Text>
        </View>
        <Text className="text-gray-400 text-sm mb-8">Your path to Top Mentor status</Text>

        {/* Status */}
        {isTopMentor ? (
          <View className="bg-gold/10 border border-gold/40 rounded-2xl p-5 mb-6 items-center">
            <Badge type="top_mentor" />
            <Text className="text-gold font-bold text-lg mt-2">You're a Top Mentor!</Text>
            <Text className="text-gray-400 text-sm mt-1 text-center">
              You earn £20 per session. Keep up the great work.
            </Text>
          </View>
        ) : (
          <View className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6">
            <Text className="text-white font-semibold mb-1">Volunteer → Top Mentor</Text>
            <Text className="text-gray-400 text-sm">
              Hit all three thresholds to unlock £20/session payouts and a Top Mentor badge.
            </Text>
          </View>
        )}

        {/* Stats */}
        <View className="flex-row gap-3 mb-6">
          {[
            { label: "Sessions", value: mentor.session_count, color: "#60A5FA" },
            { label: "Hours", value: `${mentor.total_hours}h`, color: "#A78BFA" },
            { label: "Avg Rating", value: mentor.rating_avg > 0 ? mentor.rating_avg.toFixed(1) : "—", color: "#C89B3C" },
          ].map((stat) => (
            <View key={stat.label} className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-3 items-center">
              <Text style={{ color: stat.color }} className="text-xl font-bold">{stat.value}</Text>
              <Text className="text-gray-500 text-xs mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Progress bars */}
        <View className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6 gap-5">
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white text-sm font-semibold">Total Hours</Text>
              <Text className="text-gray-400 text-sm">{mentor.total_hours}h / {TOP_MENTOR_HOURS_THRESHOLD}h</Text>
            </View>
            <ProgressBar value={hoursProgress} max={TOP_MENTOR_HOURS_THRESHOLD} color="#A78BFA" />
          </View>
          <View>
            <View className="flex-row justify-between mb-2">
              <Text className="text-white text-sm font-semibold">Sessions Completed</Text>
              <Text className="text-gray-400 text-sm">{mentor.session_count} / {TOP_MENTOR_SESSIONS_THRESHOLD}</Text>
            </View>
            <ProgressBar value={sessionProgress} max={TOP_MENTOR_SESSIONS_THRESHOLD} color="#60A5FA" />
          </View>
          <View>
            <View className="flex-row justify-between mb-2">
              <View className="flex-row items-center gap-1">
                <Star size={14} color="#C89B3C" fill="#C89B3C" />
                <Text className="text-white text-sm font-semibold">Average Rating</Text>
              </View>
              <Text className="text-gray-400 text-sm">{mentor.rating_avg > 0 ? mentor.rating_avg.toFixed(1) : "—"} / {TOP_MENTOR_RATING_THRESHOLD}</Text>
            </View>
            <ProgressBar value={mentor.rating_avg} max={5} color="#C89B3C" />
          </View>
        </View>

        {/* What you get */}
        <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
          <Text className="text-white font-semibold mb-3">Top Mentor Benefits</Text>
          {[
            "£20 per session (paid by the platform)",
            "Top Mentor badge on your profile",
            "Priority placement in mentor directory",
            "Mentor of the Month nomination eligibility",
            "LinkedIn-shareable stats and badge",
          ].map((benefit, i) => (
            <View key={i} className="flex-row items-start gap-2 mb-2">
              <TrendingUp size={14} color="#C89B3C" style={{ marginTop: 2 }} />
              <Text className="text-gray-400 text-sm flex-1">{benefit}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
