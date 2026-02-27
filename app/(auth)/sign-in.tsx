import {
  View, Text, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from "react-native";
import { useState } from "react";
import { Link, router } from "expo-router";
import { supabase } from "@/lib/supabase/client";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) {
      Alert.alert("Sign in failed", error.message);
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <View className="flex-1 justify-center px-6">
          {/* Logo / brand */}
          <View className="items-center mb-10">
            <Text className="text-3xl font-bold text-gold tracking-tight">Berberis</Text>
            <Text className="text-gray-400 text-sm mt-1">Capital Career Platform</Text>
          </View>

          <Text className="text-2xl font-bold text-white mb-6">Sign In</Text>

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
          </View>

          {/* Password */}
          <View className="mb-2">
            <Text className="text-gray-400 text-sm mb-1.5">Password</Text>
            <TextInput
              className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
              placeholder="••••••••"
              placeholderTextColor="#4B5563"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <Link href="/(auth)/forgot-password" className="mb-6">
            <Text className="text-gold text-sm text-right">Forgot password?</Text>
          </Link>

          {/* Sign in button */}
          <TouchableOpacity
            onPress={handleSignIn}
            disabled={loading}
            className="bg-gold rounded-xl py-4 items-center mb-4"
          >
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text className="text-black font-bold text-base">Sign In</Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View className="flex-row items-center gap-3 mb-4">
            <View className="flex-1 h-px bg-dark-border" />
            <Text className="text-gray-600 text-xs">or</Text>
            <View className="flex-1 h-px bg-dark-border" />
          </View>

          {/* LinkedIn OAuth */}
          <TouchableOpacity className="border border-dark-border rounded-xl py-4 items-center mb-8">
            <Text className="text-white font-semibold">Continue with LinkedIn</Text>
          </TouchableOpacity>

          {/* Sign up link */}
          <View className="flex-row justify-center">
            <Text className="text-gray-400 text-sm">Don't have an account? </Text>
            <Link href="/(auth)/sign-up">
              <Text className="text-gold text-sm font-semibold">Sign Up</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
