import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, ActivityIndicator, RefreshControl } from "react-native";
import { useState, useEffect, useCallback } from "react";
import { router } from "expo-router";
import { Calendar, Clock } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { format } from "date-fns";

function SessionCard({ session, role, onPress }: { session: any; role: "mentee" | "mentor"; onPress: () => void }) {
  const isUpcoming = new Date(session.scheduled_at) > new Date();
  return (
    <TouchableOpacity onPress={onPress} className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-3">
      <View className="flex-row items-start justify-between mb-2">
        <View className="flex-1">
          <Text className="text-white font-semibold">
            {role === "mentee"
              ? session.mentors?.users?.full_name ?? "Session"
              : `${session.mentee_ids?.length ?? 1} mentee${session.mentee_ids?.length !== 1 ? "s" : ""}`}
          </Text>
          <Text className="text-gray-500 text-xs mt-0.5">
            {session.session_type === "one_to_one" ? "1:1 Session" : "Group Session"}
          </Text>
        </View>
        <View className={`px-2 py-0.5 rounded-full ${
          session.status === "completed" ? "bg-green-500/10" :
          session.status === "cancelled" ? "bg-red-500/10" : "bg-blue-500/10"
        }`}>
          <Text className={`text-xs font-semibold ${
            session.status === "completed" ? "text-green-400" :
            session.status === "cancelled" ? "text-red-400" : "text-blue-400"
          }`}>
            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
          </Text>
        </View>
      </View>
      <View className="flex-row items-center gap-4">
        <View className="flex-row items-center gap-1.5">
          <Calendar size={13} color="#6B7280" />
          <Text className="text-gray-400 text-xs">
            {format(new Date(session.scheduled_at), "dd MMM yyyy")}
          </Text>
        </View>
        <View className="flex-row items-center gap-1.5">
          <Clock size={13} color="#6B7280" />
          <Text className="text-gray-400 text-xs">
            {format(new Date(session.scheduled_at), "HH:mm")}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function SessionsScreen() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [role, setRole] = useState<"mentee" | "mentor">("mentee");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState<"upcoming" | "past">("upcoming");

  const fetchSessions = useCallback(async () => {
    if (!user) return;
    const { data: userData } = await supabase.from("users").select("role").eq("id", user.id).single();
    const userRole = (userData?.role ?? "mentee") as "mentee" | "mentor";
    setRole(userRole);

    let query = supabase.from("mentor_sessions").select(`
      id, mentor_id, mentee_ids, session_type, scheduled_at, duration_mins, status, notes, action_items,
      mentors:mentor_id(users!inner(full_name))
    `);

    if (userRole === "mentor") {
      query = query.eq("mentor_id", user.id);
    } else {
      query = query.contains("mentee_ids", [user.id]);
    }

    const { data } = await query.order("scheduled_at", { ascending: false });
    setSessions(data ?? []);
    setLoading(false);
    setRefreshing(false);
  }, [user]);

  useEffect(() => { fetchSessions(); }, [fetchSessions]);

  const now = new Date();
  const upcoming = sessions.filter((s) => new Date(s.scheduled_at) >= now && s.status !== "cancelled");
  const past = sessions.filter((s) => new Date(s.scheduled_at) < now || s.status === "completed");

  const displayed = tab === "upcoming" ? upcoming : past;

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="px-4 pt-6 pb-3">
        <Text className="text-2xl font-bold text-white mb-4">My Sessions</Text>
        <View className="flex-row bg-dark-card border border-dark-border rounded-xl p-1">
          {(["upcoming", "past"] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg items-center ${tab === t ? "bg-dark-muted" : ""}`}
            >
              <Text className={tab === t ? "text-white font-semibold text-sm" : "text-gray-500 text-sm"}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
                {t === "upcoming" && upcoming.length > 0 ? ` (${upcoming.length})` : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C89B3C" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchSessions(); }} tintColor="#C89B3C" />}
        >
          {displayed.length === 0 ? (
            <View className="py-16 items-center">
              <Text className="text-gray-500 text-sm">
                {tab === "upcoming" ? "No upcoming sessions" : "No past sessions"}
              </Text>
            </View>
          ) : (
            displayed.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                role={role}
                onPress={() => router.push(`/sessions/${session.id}` as any)}
              />
            ))
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
