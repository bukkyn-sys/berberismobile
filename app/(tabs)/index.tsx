import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { useAuth } from "@/stores/auth-store";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/lib/supabase/client";
import { Zap } from "lucide-react-native";

interface SessionCap {
  sessions_used: number;
  sessions_limit: number;
  period_end: string | null;
}

export default function HomeScreen() {
  const { user } = useAuth();
  const { isPaid, isUltra, tier } = useSubscription();
  const [sessionCap, setSessionCap] = useState<SessionCap | null>(null);
  const [recentMoves, setRecentMoves] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // Load session cap for paid users
    if (isPaid) {
      supabase
        .from("session_caps")
        .select("sessions_used, sessions_limit, period_end")
        .eq("user_id", user.id)
        .single()
        .then(({ data }) => setSessionCap(data as SessionCap | null));
    }

    // Load a few recent lateral moves for the feed preview
    supabase
      .from("lateral_moves")
      .select("id, person_name, from_firm, to_firm, role, date_moved")
      .order("date_moved", { ascending: false })
      .limit(3)
      .then(({ data }) => setRecentMoves(data ?? []));
  }, [user, isPaid]);

  const sessionsRemaining =
    sessionCap != null
      ? Math.max(0, sessionCap.sessions_limit - sessionCap.sessions_used)
      : null;

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
        {/* Header */}
        <View className="mb-8">
          <Text className="text-2xl font-bold text-white">
            {greeting} 👋
          </Text>
          <Text className="text-gray-400 mt-1 text-sm">
            Welcome to Berberis Capital
          </Text>
        </View>

        {/* Sessions remaining — paid users only */}
        {isPaid && (
          <View className="mb-6">
            <Text className="text-base font-semibold text-white mb-3">Mentorship Sessions</Text>
            {sessionCap ? (
              <View
                className={`rounded-2xl border p-4 flex-row items-center justify-between ${
                  sessionsRemaining === 0
                    ? "border-red-900/40 bg-red-900/10"
                    : "border-gold/30 bg-gold/5"
                }`}
              >
                <View>
                  <Text className="text-white font-bold text-2xl">
                    {sessionsRemaining}
                    <Text className="text-gray-400 text-sm font-normal">
                      {" "}/ {sessionCap.sessions_limit} remaining
                    </Text>
                  </Text>
                  <Text className="text-gray-500 text-xs mt-0.5">
                    {isUltra ? "1:1 sessions" : "Group sessions"} this month
                  </Text>
                </View>
                {sessionsRemaining === 0 && tier === "standard" && (
                  <TouchableOpacity
                    onPress={() => router.push("/pricing")}
                    className="bg-gold rounded-xl px-3 py-2 flex-row items-center gap-1"
                  >
                    <Zap size={12} color="#000" />
                    <Text className="text-black font-bold text-xs">Upgrade</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
                <Text className="text-gray-500 text-sm">Loading session info...</Text>
              </View>
            )}
          </View>
        )}

        {/* Upgrade nudge for free users */}
        {!isPaid && (
          <TouchableOpacity
            onPress={() => router.push("/pricing")}
            className="mb-6 rounded-2xl border border-gold/30 bg-gold/5 p-4 flex-row items-center gap-3"
          >
            <View className="w-10 h-10 rounded-full bg-gold/20 items-center justify-center">
              <Zap size={18} color="#C89B3C" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold text-sm">Unlock mentorship</Text>
              <Text className="text-gray-400 text-xs mt-0.5">
                Standard from £29.99/mo — group sessions with real professionals
              </Text>
            </View>
            <Text className="text-gold text-lg">›</Text>
          </TouchableOpacity>
        )}

        {/* Upcoming Sessions */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-3">Upcoming Sessions</Text>
          <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
            <Text className="text-gray-500 text-sm">No upcoming sessions</Text>
          </View>
        </View>

        {/* Streak */}
        <View className="mb-6">
          <Text className="text-base font-semibold text-white mb-3">Learning Streak</Text>
          <View className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-3">
            <Text className="text-3xl">🔥</Text>
            <View>
              <Text className="text-white font-bold text-lg">0 days</Text>
              <Text className="text-gray-500 text-xs">Start your streak today</Text>
            </View>
          </View>
        </View>

        {/* Recent Moves */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-base font-semibold text-white">Latest Moves</Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/feed")}>
              <Text className="text-gold text-xs">See all</Text>
            </TouchableOpacity>
          </View>
          {recentMoves.length === 0 ? (
            <View className="bg-dark-card border border-dark-border rounded-2xl p-4">
              <Text className="text-gray-500 text-sm">Loading latest moves...</Text>
            </View>
          ) : (
            <View className="gap-2">
              {recentMoves.map((move) => (
                <View
                  key={move.id}
                  className="bg-dark-card border border-dark-border rounded-2xl p-4"
                >
                  <Text className="text-white font-medium text-sm">{move.person_name}</Text>
                  <Text className="text-gray-400 text-xs mt-0.5">
                    {move.from_firm} → {move.to_firm}
                  </Text>
                  <Text className="text-gray-600 text-xs mt-0.5">{move.role}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
