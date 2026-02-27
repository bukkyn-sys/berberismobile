import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";

const AVAILABILITY_OPTIONS = ["Weekday evenings", "Weekend mornings", "Weekend afternoons", "Flexible"];

export default function MentorBioScreen() {
  const { mentor, setMentor, reset } = useOnboardingStore();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      const { error: userError } = await supabase
        .from("users")
        .update({ role: "mentor" })
        .eq("id", user!.id);
      if (userError) throw userError;

      const { error: mentorError } = await supabase.from("mentors").upsert({
        user_id: user!.id,
        firm: mentor.firm,
        seniority: mentor.seniority,
        expertise_areas: mentor.expertise_areas,
        availability: mentor.availability || null,
        bio: mentor.bio || null,
      });
      if (mentorError) throw mentorError;

      reset();
      router.push("/onboarding/founding-code");
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 px-6 pt-12">
          <Text className="text-xs text-gray-600 mb-2">STEP 4 OF 4</Text>
          <Text className="text-2xl font-bold text-white mb-2">Availability & bio</Text>
          <Text className="text-gray-400 text-sm mb-6">A short bio helps mentees decide to book with you.</Text>

          <Text className="text-gray-400 text-sm mb-2">When are you generally available?</Text>
          <View className="flex-row flex-wrap gap-2 mb-6">
            {AVAILABILITY_OPTIONS.map((opt) => (
              <TouchableOpacity
                key={opt}
                onPress={() => setMentor({ availability: opt })}
                className={`px-3 py-1.5 rounded-full border ${
                  mentor.availability === opt ? "border-gold bg-gold/10" : "border-dark-border"
                }`}
              >
                <Text className={mentor.availability === opt ? "text-gold text-sm" : "text-gray-400 text-sm"}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-gray-400 text-sm mb-1.5">Short bio</Text>
          <TextInput
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white mb-8"
            placeholder="e.g. I'm a VP in IB at JPM with 6 years experience. Happy to help with breaking in, technicals, and lateral moves."
            placeholderTextColor="#4B5563"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            value={mentor.bio}
            onChangeText={(v) => setMentor({ bio: v })}
            style={{ height: 100 }}
          />

          <TouchableOpacity onPress={finish} disabled={saving} className="bg-gold rounded-xl py-4 items-center">
            {saving ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold text-base">Finish Setup</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
