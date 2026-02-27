import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { Lock, Search } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { MentorCard, type MentorCardData } from "@/components/mentorship/mentor-card";

export default function MentorshipScreen() {
  const { isPaid, isUltra } = useSubscription();
  const [mentors, setMentors] = useState<MentorCardData[]>([]);
  const [filtered, setFiltered] = useState<MentorCardData[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMentors = useCallback(async () => {
    const { data } = await supabase
      .from("mentors")
      .select(`
        user_id,
        firm, seniority, expertise_areas,
        rating_avg, session_count,
        is_top_mentor, is_founding_mentor,
        users!inner(id, full_name),
        profiles(avatar_url)
      `)
      .order("is_top_mentor", { ascending: false })
      .order("rating_avg", { ascending: false });

    if (data) {
      const shaped: MentorCardData[] = (data as any[]).map((m) => ({
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
      setMentors(shaped);
      setFiltered(shaped);
    }
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => { fetchMentors(); }, [fetchMentors]);

  useEffect(() => {
    if (!search.trim()) { setFiltered(mentors); return; }
    const q = search.toLowerCase();
    setFiltered(
      mentors.filter((m) =>
        m.full_name.toLowerCase().includes(q) ||
        m.firm.toLowerCase().includes(q) ||
        m.expertise_areas.some((a) => a.toLowerCase().includes(q))
      )
    );
  }, [search, mentors]);

  if (!isPaid) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View className="flex-1 items-center justify-center px-6">
          <View className="bg-dark-card border border-dark-border rounded-3xl p-8 items-center">
            <View className="w-16 h-16 rounded-full bg-gold/10 items-center justify-center mb-4">
              <Lock size={28} color="#C89B3C" />
            </View>
            <Text className="text-xl font-bold text-white text-center mb-2">Mentorship is a paid feature</Text>
            <Text className="text-gray-400 text-sm text-center mb-6">
              Standard: group sessions (3/month){"\n"}Ultra: 1:1 sessions (up to 8/month)
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/pricing")}
              className="bg-gold rounded-xl px-6 py-3 w-full items-center"
            >
              <Text className="text-black font-bold">View Plans</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1">
        <View className="px-4 pt-6 pb-3">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-2xl font-bold text-white">Mentors</Text>
            <TouchableOpacity
              onPress={() => router.push("/mentorship/match")}
              className="bg-gold/10 border border-gold/30 rounded-xl px-3 py-1.5"
            >
              <Text className="text-gold text-xs font-semibold">Find My Match</Text>
            </TouchableOpacity>
          </View>
          <View className="flex-row items-center bg-dark-card border border-dark-border rounded-xl px-3 gap-2">
            <Search size={16} color="#6B7280" />
            <TextInput
              className="flex-1 py-3 text-white text-sm"
              placeholder="Search name, firm, expertise..."
              placeholderTextColor="#4B5563"
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </View>

        <View className={`mx-4 mb-3 px-3 py-2 rounded-xl ${isUltra ? "bg-gold/10 border border-gold/30" : "bg-blue-500/10 border border-blue-500/20"}`}>
          <Text className={`text-xs font-semibold ${isUltra ? "text-gold" : "text-blue-400"}`}>
            {isUltra
              ? "Ultra — 1:1 sessions · Up to 8/month · Priority matching"
              : "Standard — Group sessions (1:3) · 3/month"}
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#C89B3C" />
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-4"
            contentContainerStyle={{ paddingBottom: 32 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => { setRefreshing(true); fetchMentors(); }}
                tintColor="#C89B3C"
              />
            }
          >
            {filtered.length === 0 ? (
              <View className="py-12 items-center">
                <Text className="text-gray-500 text-sm">No mentors found</Text>
              </View>
            ) : (
              filtered.map((mentor) => (
                <MentorCard
                  key={mentor.id}
                  mentor={mentor}
                  onPress={() => router.push(`/mentorship/${mentor.id}` as any)}
                />
              ))
            )}
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}
