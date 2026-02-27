import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView
} from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase/client";

export default function SignUpScreen() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isStudentEmail = email.toLowerCase().includes(".ac.uk");

  const handleSignUp = async () => {
    if (!fullName || !email || !password) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    if (password.length < 8) {
      Alert.alert("Error", "Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          is_student_email: isStudentEmail,
        },
      },
    });
    setLoading(false);
    if (error) {
      Alert.alert("Sign up failed", error.message);
    } else {
      // Navigate to onboarding
      router.replace("/onboarding");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 48, paddingBottom: 32 }}>
          <View className="items-center mb-8">
            <Text className="text-3xl font-bold text-gold tracking-tight">Berberis</Text>
            <Text className="text-gray-400 text-sm mt-1">Capital Career Platform</Text>
          </View>

          <Text className="text-2xl font-bold text-white mb-6">Create Account</Text>

          {/* Full Name */}
          <View className="mb-4">
            <Text className="text-gray-400 text-sm mb-1.5">Full Name</Text>
            <TextInput
              className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
              placeholder="Alex Johnson"
              placeholderTextColor="#4B5563"
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Email */}
          <View className="mb-4">
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
            {isStudentEmail && (
              <Text className="text-gold text-xs mt-1.5">
                University email detected — you may qualify for student pricing!
              </Text>
            )}
          </View>

          {/* Password */}
          <View className="mb-6">
            <Text className="text-gray-400 text-sm mb-1.5">Password</Text>
            <TextInput
              className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
              placeholder="Minimum 8 characters"
              placeholderTextColor="#4B5563"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            onPress={handleSignUp}
            disabled={loading}
            className="bg-gold rounded-xl py-4 items-center mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-bold text-base">Create Account</Text>
            )}
          </TouchableOpacity>

          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-dark-border" />
            <Text className="text-gray-600 text-xs">or</Text>
            <View className="flex-1 h-px bg-dark-border" />
          </View>

          <TouchableOpacity className="border border-dark-border rounded-xl py-4 items-center mb-8">
            <Text className="text-white font-semibold">Continue with LinkedIn</Text>
          </TouchableOpacity>

          <View className="flex-row justify-center">
            <Text className="text-gray-400 text-sm">Already have an account? </Text>
            <Link href="/(auth)/sign-in">
              <Text className="text-gold text-sm font-semibold">Sign In</Text>
            </Link>
          </View>

          <Text className="text-gray-600 text-xs text-center mt-6">
            By continuing you agree to our Terms of Service and Privacy Policy.
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
