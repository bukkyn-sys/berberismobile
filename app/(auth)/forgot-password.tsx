import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { ArrowLeft } from "lucide-react-native";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async () => {
    if (!email) {
      Alert.alert("Error", "Please enter your email address.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "berberis://reset-password",
    });
    setLoading(false);
    if (error) {
      Alert.alert("Error", error.message);
    } else {
      setSent(true);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 px-6 pt-6">
          <TouchableOpacity onPress={() => router.back()} className="mb-8">
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>

          <Text className="text-2xl font-bold text-white mb-2">Reset Password</Text>
          <Text className="text-gray-400 text-sm mb-8">
            Enter your email and we'll send a reset link.
          </Text>

          {sent ? (
            <View className="bg-dark-card border border-green-800/50 rounded-2xl p-5">
              <Text className="text-green-400 font-semibold mb-1">Email sent!</Text>
              <Text className="text-gray-400 text-sm">
                Check your inbox for a password reset link.
              </Text>
            </View>
          ) : (
            <>
              <View className="mb-6">
                <Text className="text-gray-400 text-sm mb-1.5">Email</Text>
                <TextInput
                  className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                  placeholder="you@example.com"
                  placeholderTextColor="#4B5563"
                  autoCapitalize="none"
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>
              <TouchableOpacity
                onPress={handleReset}
                disabled={loading}
                className="bg-gold rounded-xl py-4 items-center"
              >
                {loading ? (
                  <ActivityIndicator color="#000" />
                ) : (
                  <Text className="text-black font-bold text-base">Send Reset Link</Text>
                )}
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
