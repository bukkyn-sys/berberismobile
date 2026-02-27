import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";

export default function MenteeGoalsScreen() {
  const { mentee, setMentee, reset } = useOnboardingStore();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);

  const finish = async () => {
    setSaving(true);
    try {
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: user!.id,
        career_stage: mentee.career_stage,
        university: mentee.university || null,
        year_of_study: mentee.year_of_study ? parseInt(mentee.year_of_study) : null,
        current_firm: mentee.current_firm || null,
        job_title: mentee.job_title || null,
        target_role: mentee.target_role || null,
        target_division: mentee.target_division || null,
        goals: mentee.goals || null,
      });
      if (profileError) throw profileError;

      const { error: userError } = await supabase
        .from("users")
        .update({ role: "mentee" })
        .eq("id", user!.id);
      if (userError) throw userError;

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
          <Text className="text-xs text-gray-600 mb-2">STEP 4 OF 5</Text>
          <Text className="text-2xl font-bold text-white mb-2">What are your goals?</Text>
          <Text className="text-gray-400 text-sm mb-8">
            Tell mentors what you're working towards in the next 6–12 months.
          </Text>

          <TextInput
            className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white mb-8"
            placeholder="e.g. Break into IB at a BB, pass CFA Level 1, lateral from Big 4..."
            placeholderTextColor="#4B5563"
            multiline
            numberOfLines={5}
            textAlignVertical="top"
            value={mentee.goals}
            onChangeText={(v) => setMentee({ goals: v })}
            style={{ height: 120 }}
          />

          <TouchableOpacity
            onPress={finish}
            disabled={saving}
            className="bg-gold rounded-xl py-4 items-center"
          >
            {saving ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold text-base">Continue</Text>}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
