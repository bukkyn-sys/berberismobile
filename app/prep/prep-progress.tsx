import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";

type CategoryStats = {
  category: string;
  label: string;
  total: number;
  avgScore: number;
};

const CATEGORY_LABELS: Record<string, string> = {
  accounting: "Accounting",
  dcf: "DCF",
  lbo: "LBO",
  comps: "Comps",
  market: "Market",
  behavioural: "Behavioural",
};

const scoreColor = (s: number) =>
  s >= 4 ? "#4ADE80" : s >= 3 ? "#F59E0B" : "#EF4444";

const scoreLabel = (s: number) =>
  s >= 4 ? "Strong" : s >= 3 ? "Developing" : "Needs Work";

export default function PrepProgressScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<CategoryStats[]>([]);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [avgScore, setAvgScore] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("interview_attempts")
        .select("score, interview_questions(category)")
        .eq("user_id", user.id)
        .not("score", "is", null);

      if (!data) { setLoading(false); return; }

      const grouped: Record<string, number[]> = {};
      data.forEach((a: any) => {
        const cat: string = a.interview_questions?.category ?? "unknown";
        if (!grouped[cat]) grouped[cat] = [];
        if (a.score != null) grouped[cat].push(a.score);
      });

      const categoryStats: CategoryStats[] = Object.entries(grouped)
        .map(([cat, scores]) => ({
          category: cat,
          label: CATEGORY_LABELS[cat] ?? cat,
          total: scores.length,
          avgScore: scores.length
            ? scores.reduce((a, b) => a + b, 0) / scores.length
            : 0,
        }))
        .sort((a, b) => a.avgScore - b.avgScore); // weakest first

      const allScores = data
        .map((a: any) => a.score as number)
        .filter((s) => s != null);

      setStats(categoryStats);
      setTotalAttempts(data.length);
      setAvgScore(
        allScores.length
          ? allScores.reduce((a, b) => a + b, 0) / allScores.length
          : 0
      );
      setLoading(false);
    })();
  }, [user]);

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg">My Progress</Text>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C89B3C" />
        </View>
      ) : (
        <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Summary cards */}
          <View className="flex-row gap-3 mb-6">
            <View className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 items-center">
              <Text className="text-white font-bold text-2xl">{totalAttempts}</Text>
              <Text className="text-gray-500 text-xs mt-1">Total Attempts</Text>
            </View>
            <View className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 items-center">
              <Text className="text-white font-bold text-2xl">
                {avgScore > 0 ? avgScore.toFixed(1) : "—"}
              </Text>
              <Text className="text-gray-500 text-xs mt-1">Avg Score</Text>
            </View>
            <View className="flex-1 bg-dark-card border border-dark-border rounded-2xl p-4 items-center">
              <Text className="text-white font-bold text-2xl">{stats.length}</Text>
              <Text className="text-gray-500 text-xs mt-1">Categories</Text>
            </View>
          </View>

          {totalAttempts === 0 ? (
            <View className="items-center pt-8">
              <Text className="text-gray-400 text-center text-sm leading-relaxed">
                No drill attempts yet.{"\n"}Complete some drills to track your progress here.
              </Text>
            </View>
          ) : (
            <>
              <Text className="text-white font-semibold mb-3">Performance by Category</Text>
              {stats.map((stat) => (
                <View
                  key={stat.category}
                  className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-3"
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-white font-medium">{stat.label}</Text>
                    <View className="flex-row items-center gap-2">
                      <Text
                        className="text-sm font-bold"
                        style={{ color: scoreColor(stat.avgScore) }}
                      >
                        {stat.avgScore.toFixed(1)} / 5
                      </Text>
                      <View
                        className="px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${scoreColor(stat.avgScore)}20` }}
                      >
                        <Text
                          className="text-xs font-medium"
                          style={{ color: scoreColor(stat.avgScore) }}
                        >
                          {scoreLabel(stat.avgScore)}
                        </Text>
                      </View>
                    </View>
                  </View>
                  {/* Progress bar */}
                  <View className="h-2 bg-dark-border rounded-full overflow-hidden mb-1">
                    <View
                      className="h-full rounded-full"
                      style={{
                        width: `${(stat.avgScore / 5) * 100}%`,
                        backgroundColor: scoreColor(stat.avgScore),
                      }}
                    />
                  </View>
                  <Text className="text-gray-600 text-xs">{stat.total} attempts</Text>
                </View>
              ))}

              {/* Weak area callout */}
              {stats.length > 0 && stats[0].avgScore < 3 && (
                <View className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-2">
                  <Text className="text-red-400 font-semibold text-sm mb-1">
                    Focus area: {stats[0].label}
                  </Text>
                  <Text className="text-gray-400 text-xs">
                    This is your weakest category. Run targeted drills to improve.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
