import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Star, Calendar, MessageSquare } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { Badge } from "@/components/ui/badge";

export default function MentorProfileScreen() {
  const { mentorId } = useLocalSearchParams<{ mentorId: string }>();
  const { isPaid, isUltra } = useSubscription();
  const [mentor, setMentor] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("mentors")
        .select(`
          *,
          users!inner(id, full_name, email),
          profiles(bio, avatar_url, is_founding_member)
        `)
        .eq("user_id", mentorId)
        .single();
      setMentor(data);
      setLoading(false);
    })();
  }, [mentorId]);

  const bookSession = () => {
    if (!isPaid) {
      Alert.alert("Paid feature", "Upgrade to book a session.");
      return;
    }
    router.push(`/mentorship/${mentorId}/book` as any);
  };

  const sendMessage = () => {
    router.push(`/messages/${mentorId}` as any);
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#C89B3C" />
      </SafeAreaView>
    );
  }

  if (!mentor) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <Text className="text-gray-400">Mentor not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 32 }}>
        {/* Back */}
        <TouchableOpacity onPress={() => router.back()} className="px-4 pt-4 pb-2">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>

        {/* Header */}
        <View className="px-4 pb-6 items-center">
          <View className="w-20 h-20 rounded-full bg-gold/20 items-center justify-center mb-3">
            <Text className="text-gold font-bold text-2xl">
              {mentor.users.full_name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </Text>
          </View>
          <Text className="text-white font-bold text-xl mb-1">{mentor.users.full_name}</Text>
          <Text className="text-gray-400 text-sm mb-3">{mentor.seniority} · {mentor.firm}</Text>
          <View className="flex-row gap-2 flex-wrap justify-center">
            {mentor.is_top_mentor && <Badge type="top_mentor" />}
            {mentor.profiles?.is_founding_member && <Badge type="founding_member" />}
          </View>
        </View>

        {/* Stats */}
        <View className="flex-row mx-4 mb-6 bg-dark-card border border-dark-border rounded-2xl overflow-hidden">
          {[
            { label: "Rating", value: mentor.rating_avg > 0 ? mentor.rating_avg.toFixed(1) : "New", icon: Star },
            { label: "Sessions", value: String(mentor.session_count) },
            { label: "Hours", value: mentor.total_hours > 0 ? `${mentor.total_hours}h` : "—" },
          ].map((stat, i) => (
            <View key={stat.label} className={`flex-1 items-center py-4 ${i < 2 ? "border-r border-dark-border" : ""}`}>
              <Text className="text-white font-bold text-lg">{stat.value}</Text>
              <Text className="text-gray-500 text-xs mt-0.5">{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* Expertise */}
        <View className="px-4 mb-6">
          <Text className="text-white font-semibold mb-2">Expertise</Text>
          <View className="flex-row flex-wrap gap-2">
            {mentor.expertise_areas.map((area: string) => (
              <View key={area} className="px-3 py-1 rounded-full border border-dark-border bg-dark-card">
                <Text className="text-gray-300 text-sm">{area}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Bio */}
        {mentor.profiles?.bio && (
          <View className="px-4 mb-6">
            <Text className="text-white font-semibold mb-2">About</Text>
            <Text className="text-gray-400 text-sm leading-relaxed">{mentor.profiles.bio}</Text>
          </View>
        )}

        {/* Session type info */}
        <View className="px-4 mb-6">
          <View className={`rounded-2xl p-4 border ${isUltra ? "border-gold/30 bg-gold/5" : "border-blue-500/20 bg-blue-500/5"}`}>
            <Text className={`font-semibold text-sm mb-1 ${isUltra ? "text-gold" : "text-blue-400"}`}>
              {isUltra ? "1:1 Session (Ultra)" : "Group Session (Standard)"}
            </Text>
            <Text className="text-gray-400 text-xs">
              {isUltra
                ? "Private 1:1 session — you and this mentor only. Up to 8/month."
                : "Group session with up to 2 other mentees. 3 sessions/month."}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Actions */}
      <View className="px-4 pb-6 pt-2 flex-row gap-3 border-t border-dark-border">
        <TouchableOpacity
          onPress={sendMessage}
          className="flex-1 border border-dark-border rounded-xl py-3.5 items-center flex-row justify-center gap-2"
        >
          <MessageSquare size={16} color="#9CA3AF" />
          <Text className="text-white font-semibold">Message</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={bookSession}
          className="flex-1 bg-gold rounded-xl py-3.5 items-center flex-row justify-center gap-2"
        >
          <Calendar size={16} color="#000" />
          <Text className="text-black font-bold">Book Session</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
