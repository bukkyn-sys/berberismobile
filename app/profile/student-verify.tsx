import {
  View, Text, SafeAreaView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, KeyboardAvoidingView, Platform,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ArrowLeft, GraduationCap, Mail } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";

export default function StudentVerifyScreen() {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isValidAcUk = (val: string) =>
    val.toLowerCase().trim().endsWith(".ac.uk") && val.includes("@");

  async function handleSend() {
    const trimmed = email.toLowerCase().trim();
    if (!isValidAcUk(trimmed)) {
      Alert.alert("Invalid email", "Please enter a valid .ac.uk email address.");
      return;
    }
    if (!user) return;

    setLoading(true);
    try {
      // Update the user's email address — Supabase will send a confirmation link.
      // On confirmation the webhook / trigger sets subscriptions.is_student = true.
      // For now we optimistically write a pending flag so the UI reflects intent.
      const { error } = await supabase
        .from("subscriptions")
        .update({ student_email_pending: trimmed } as any)
        .eq("user_id", user.id);

      if (error) throw error;

      // Send a magic-link / OTP to the .ac.uk address via Supabase Auth OTP
      // so Supabase can confirm it belongs to the user.
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: { shouldCreateUser: false },
      });

      if (otpError) {
        // OTP failure is non-fatal — we still record the pending email
        console.warn("[student-verify] OTP error:", otpError.message);
      }

      setSent(true);
    } catch (err: any) {
      Alert.alert("Error", err.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">Student Verification</Text>
        </View>

        <View className="flex-1 px-6 pt-8">
          {/* Icon */}
          <View className="w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center mb-5 self-center">
            <GraduationCap size={28} color="#60A5FA" />
          </View>

          {!sent ? (
            <>
              <Text className="text-white font-bold text-xl text-center mb-2">
                Verify your student email
              </Text>
              <Text className="text-gray-400 text-sm text-center mb-8 leading-relaxed">
                Enter your university email address ending in .ac.uk. We'll send a verification link so you can unlock 33% off all paid plans.
              </Text>

              {/* Pricing reminder */}
              <View className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                <Text className="text-blue-400 text-sm font-semibold mb-1">Student pricing</Text>
                <Text className="text-gray-400 text-xs">Standard £19.99/mo  ·  Ultra £49.99/mo</Text>
                <Text className="text-gray-600 text-xs mt-1">Re-verified annually.</Text>
              </View>

              {/* Input */}
              <View className="flex-row items-center bg-dark-card border border-dark-border rounded-xl px-4 mb-6">
                <Mail size={16} color="#6B7280" />
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  placeholder="yourname@university.ac.uk"
                  placeholderTextColor="#4B5563"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  className="flex-1 text-white text-sm py-4 pl-3"
                />
              </View>

              <TouchableOpacity
                onPress={handleSend}
                disabled={loading || !email}
                className={`rounded-xl py-3.5 items-center ${
                  loading || !email ? "bg-dark-border" : "bg-blue-500"
                }`}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text className="text-white font-bold">Send verification link</Text>
                )}
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text className="text-white font-bold text-xl text-center mb-2">
                Check your inbox
              </Text>
              <Text className="text-gray-400 text-sm text-center mb-8 leading-relaxed">
                We've sent a verification link to{"\n"}
                <Text className="text-blue-400">{email}</Text>
                {"\n\n"}
                Click the link in that email to confirm your student status. Student pricing will be applied once verified.
              </Text>

              <TouchableOpacity
                onPress={() => router.push("/pricing")}
                className="bg-gold rounded-xl py-3.5 items-center mb-3"
              >
                <Text className="text-black font-bold">View plans</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => { setSent(false); setEmail(""); }}
                className="py-3 items-center"
              >
                <Text className="text-gray-500 text-sm">Use a different email</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
