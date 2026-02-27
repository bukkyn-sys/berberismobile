import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, TextInput, ActivityIndicator, Alert } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Star } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { format } from "date-fns";

export default function SessionDetailScreen() {
  const { sessionId } = useLocalSearchParams<{ sessionId: string }>();
  const { user } = useAuth();
  const [session, setSession] = useState<any>(null);
  const [userRole, setUserRole] = useState<"mentee" | "mentor">("mentee");
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [notes, setNotes] = useState("");
  const [actionItems, setActionItems] = useState("");
  const [saving, setSaving] = useState(false);
  const [alreadyRated, setAlreadyRated] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: sessionData }, { data: userData }, { data: ratingData }] = await Promise.all([
        supabase.from("mentor_sessions").select(`
          *, mentors:mentor_id(users!inner(full_name, id))
        `).eq("id", sessionId).single(),
        supabase.from("users").select("role").eq("id", user!.id).single(),
        supabase.from("mentor_ratings").select("id").eq("session_id", sessionId).eq("mentee_id", user!.id).maybeSingle(),
      ]);
      setSession(sessionData);
      setUserRole((userData?.role ?? "mentee") as "mentee" | "mentor");
      if (sessionData) {
        setNotes(sessionData.notes ?? "");
        setActionItems(sessionData.action_items ?? "");
      }
      setAlreadyRated(!!ratingData);
      setLoading(false);
    })();
  }, [sessionId, user]);

  const submitRating = async () => {
    if (rating === 0) { Alert.alert("Select a rating first"); return; }
    setSaving(true);
    const { error } = await supabase.from("mentor_ratings").insert({
      session_id: sessionId,
      mentor_id: session.mentor_id,
      mentee_id: user!.id,
      rating,
      feedback: feedback || null,
    });
    setSaving(false);
    if (error) { Alert.alert("Error", error.message); return; }
    setAlreadyRated(true);
    Alert.alert("Thanks!", "Your rating has been submitted.");
  };

  const saveMentorNotes = async () => {
    setSaving(true);
    await supabase.from("mentor_sessions").update({ notes, action_items: actionItems }).eq("id", sessionId);
    setSaving(false);
    Alert.alert("Saved");
  };

  const isCompleted = session?.status === "completed";
  const isMentor = userRole === "mentor";

  if (loading) {
    return <SafeAreaView className="flex-1 bg-dark items-center justify-center"><ActivityIndicator color="#C89B3C" /></SafeAreaView>;
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
        <TouchableOpacity onPress={() => router.back()} className="mb-6">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-white mb-1">Session Details</Text>
        <Text className="text-gray-400 text-sm mb-6">
          {session ? format(new Date(session.scheduled_at), "EEEE, dd MMMM yyyy 'at' HH:mm") : ""}
        </Text>

        {/* Info card */}
        <View className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-6">
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400 text-sm">Type</Text>
            <Text className="text-white text-sm font-semibold">
              {session?.session_type === "one_to_one" ? "1:1 Session" : "Group Session"}
            </Text>
          </View>
          <View className="flex-row justify-between mb-3">
            <Text className="text-gray-400 text-sm">Mentor</Text>
            <Text className="text-white text-sm font-semibold">{(session?.mentors?.users as any)?.full_name ?? "—"}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-gray-400 text-sm">Status</Text>
            <Text className={`text-sm font-semibold ${session?.status === "completed" ? "text-green-400" : session?.status === "cancelled" ? "text-red-400" : "text-blue-400"}`}>
              {session?.status?.charAt(0).toUpperCase() + session?.status?.slice(1)}
            </Text>
          </View>
        </View>

        {/* Mentor: notes + action items */}
        {isMentor && (
          <View className="mb-6">
            <Text className="text-white font-semibold mb-3">Session Notes</Text>
            <TextInput
              className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-3"
              placeholder="Add session notes..."
              placeholderTextColor="#4B5563"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              value={notes}
              onChangeText={setNotes}
              style={{ height: 100 }}
            />
            <Text className="text-white font-semibold mb-3">Action Items</Text>
            <TextInput
              className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-4"
              placeholder="What should the mentee work on?"
              placeholderTextColor="#4B5563"
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              value={actionItems}
              onChangeText={setActionItems}
              style={{ height: 80 }}
            />
            <TouchableOpacity onPress={saveMentorNotes} disabled={saving} className="bg-gold rounded-xl py-3.5 items-center">
              {saving ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold">Save Notes</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Mentee: show notes + rate */}
        {!isMentor && (
          <>
            {session?.notes && (
              <View className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-4">
                <Text className="text-white font-semibold mb-1">Mentor's Notes</Text>
                <Text className="text-gray-400 text-sm">{session.notes}</Text>
              </View>
            )}
            {session?.action_items && (
              <View className="bg-dark-card border border-gold/20 rounded-2xl p-4 mb-6">
                <Text className="text-gold font-semibold mb-1">Action Items</Text>
                <Text className="text-gray-300 text-sm">{session.action_items}</Text>
              </View>
            )}

            {isCompleted && !alreadyRated && (
              <View className="mb-6">
                <Text className="text-white font-semibold mb-3">Rate your mentor</Text>
                <View className="flex-row gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <TouchableOpacity key={s} onPress={() => setRating(s)}>
                      <Star size={32} color="#C89B3C" fill={s <= rating ? "#C89B3C" : "transparent"} />
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  className="bg-dark-card border border-dark-border rounded-xl px-4 py-3 text-white mb-4"
                  placeholder="Leave feedback (optional)..."
                  placeholderTextColor="#4B5563"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  value={feedback}
                  onChangeText={setFeedback}
                  style={{ height: 80 }}
                />
                <TouchableOpacity onPress={submitRating} disabled={saving} className="bg-gold rounded-xl py-3.5 items-center">
                  {saving ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold">Submit Rating</Text>}
                </TouchableOpacity>
              </View>
            )}

            {alreadyRated && (
              <View className="bg-green-500/10 border border-green-500/20 rounded-2xl p-4">
                <Text className="text-green-400 font-semibold">Rating submitted ✓</Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
