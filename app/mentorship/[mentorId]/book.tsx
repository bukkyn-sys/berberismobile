import { View, Text, SafeAreaView, TouchableOpacity, ActivityIndicator, Alert, Linking } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Users, User } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { useSubscription } from "@/hooks/use-subscription";

export default function BookSessionScreen() {
  const { mentorId } = useLocalSearchParams<{ mentorId: string }>();
  const { user } = useAuth();
  const { isUltra, subscription } = useSubscription();
  const [mentor, setMentor] = useState<any>(null);
  const [sessionCap, setSessionCap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: mentorData }, { data: capData }] = await Promise.all([
        supabase
          .from("mentors")
          .select("users!inner(full_name), firm, seniority, availability")
          .eq("user_id", mentorId)
          .single(),
        supabase
          .from("session_caps")
          .select("sessions_used, sessions_limit")
          .eq("user_id", user!.id)
          .single(),
      ]);
      setMentor(mentorData);
      setSessionCap(capData);
      setLoading(false);
    })();
  }, [mentorId, user]);

  const sessionsRemaining = sessionCap
    ? Math.max(0, sessionCap.sessions_limit - sessionCap.sessions_used)
    : 0;

  const handleBook = async () => {
    if (sessionsRemaining <= 0) {
      Alert.alert(
        "Session cap reached",
        `You've used all your sessions this billing period. ${isUltra ? "" : "Upgrade to Ultra for more sessions."}`,
        [{ text: "OK" }]
      );
      return;
    }

    // Deep-link to Cal.com for scheduling.
    // The mentor's Cal.com link format: https://cal.com/[mentor-email]
    // For now we open Cal.com and prompt the mentor's availability info.
    setBooking(true);
    try {
      const { data: mentorUser } = await supabase
        .from("users")
        .select("email")
        .eq("id", mentorId)
        .single();

      const calLink = `https://cal.com/${mentorUser?.email?.split("@")[0] ?? "berberiscapital"}`;
      const supported = await Linking.canOpenURL(calLink);
      if (supported) {
        await Linking.openURL(calLink);
      } else {
        await Linking.openURL("https://cal.com");
      }

      // Record a pending session row (status: scheduled)
      await supabase.from("mentor_sessions").insert({
        mentor_id: mentorId,
        mentee_ids: [user!.id],
        session_type: isUltra ? "one_to_one" : "group",
        scheduled_at: new Date().toISOString(), // Will be updated via Cal.com webhook
        status: "scheduled",
      });

      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#C89B3C" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-1 px-4">
        <TouchableOpacity onPress={() => router.back()} className="pt-4 pb-6">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-white mb-1">Book a Session</Text>
        <Text className="text-gray-400 text-sm mb-8">
          with {(mentor?.users as any)?.full_name} · {mentor?.seniority} at {mentor?.firm}
        </Text>

        {/* Session type */}
        <View className={`rounded-2xl p-4 mb-4 border ${isUltra ? "border-gold/30 bg-gold/5" : "border-blue-500/20 bg-blue-500/5"}`}>
          <View className="flex-row items-center gap-2 mb-1">
            {isUltra ? <User size={16} color="#C89B3C" /> : <Users size={16} color="#60A5FA" />}
            <Text className={`font-semibold ${isUltra ? "text-gold" : "text-blue-400"}`}>
              {isUltra ? "1:1 Session" : "Group Session (up to 3 mentees)"}
            </Text>
          </View>
          <Text className="text-gray-400 text-xs">
            {isUltra
              ? "Private session — just you and your mentor."
              : "You may be matched with up to 2 other mentees with similar goals."}
          </Text>
        </View>

        {/* Sessions remaining */}
        <View className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6">
          <Text className="text-gray-400 text-sm mb-1">Sessions remaining this period</Text>
          <Text className={`text-2xl font-bold ${sessionsRemaining > 0 ? "text-white" : "text-red-400"}`}>
            {sessionsRemaining} / {sessionCap?.sessions_limit ?? 0}
          </Text>
        </View>

        {/* How booking works */}
        <View className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-8">
          <Text className="text-white font-semibold mb-2">How it works</Text>
          {[
            "Tap 'Confirm Booking' below",
            "You'll be taken to the mentor's Cal.com page",
            "Pick a time slot that suits both of you",
            "You'll both receive a calendar invite + push notification",
          ].map((step, i) => (
            <View key={i} className="flex-row gap-3 mb-2">
              <View className="w-5 h-5 rounded-full bg-gold/20 items-center justify-center mt-0.5">
                <Text className="text-gold text-xs font-bold">{i + 1}</Text>
              </View>
              <Text className="text-gray-400 text-sm flex-1">{step}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          onPress={handleBook}
          disabled={booking || sessionsRemaining <= 0}
          className={`rounded-xl py-4 items-center flex-row justify-center gap-2 ${sessionsRemaining > 0 ? "bg-gold" : "bg-dark-muted"}`}
        >
          {booking ? (
            <ActivityIndicator color="#000" />
          ) : (
            <>
              <Calendar size={18} color={sessionsRemaining > 0 ? "#000" : "#6B7280"} />
              <Text className={`font-bold text-base ${sessionsRemaining > 0 ? "text-black" : "text-gray-500"}`}>
                {sessionsRemaining > 0 ? "Confirm Booking" : "No sessions remaining"}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
