import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert } from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { Gift } from "lucide-react-native";

// Valid Founding Member codes are checked server-side via a Supabase function.
// Here we validate client-side format only, then call the DB.

export default function FoundingCodeScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const skip = () => router.replace("/(tabs)");

  const redeem = async () => {
    if (!code.trim()) return skip();
    setLoading(true);
    try {
      // Call a Supabase Edge Function (to be created) that validates and marks the code used
      const { data, error } = await supabase.functions.invoke("redeem-founding-code", {
        body: { code: code.trim().toUpperCase(), user_id: user!.id },
      });
      if (error || !data?.success) {
        Alert.alert("Invalid code", data?.message ?? "This code is not valid or has already been used.");
        return;
      }
      Alert.alert("Welcome, Founding Member! 🎉", "Your code has been applied. You're now a Founding Member.", [
        { text: "Let's go!", onPress: () => router.replace("/(tabs)") },
      ]);
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <View className="flex-1 px-6 pt-12">
          <View className="items-center mb-10">
            <View className="w-16 h-16 rounded-full bg-gold/20 items-center justify-center mb-4">
              <Gift size={28} color="#C89B3C" />
            </View>
            <Text className="text-2xl font-bold text-white text-center mb-2">Founding Member Code</Text>
            <Text className="text-gray-400 text-sm text-center">
              If you received an invite code as a Berberis Founding Member, enter it below to unlock lifetime Standard pricing at £19.99/mo.
            </Text>
          </View>

          <TextInput
            className="bg-dark-card border border-gold/30 rounded-xl px-4 py-3.5 text-white text-center text-xl tracking-widest mb-4"
            placeholder="BERB-XXXX"
            placeholderTextColor="#4B5563"
            autoCapitalize="characters"
            value={code}
            onChangeText={setCode}
          />

          <TouchableOpacity
            onPress={redeem}
            disabled={loading}
            className="bg-gold rounded-xl py-4 items-center mb-3"
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold text-base">Redeem Code</Text>}
          </TouchableOpacity>

          <TouchableOpacity onPress={skip} className="py-3 items-center">
            <Text className="text-gray-500 text-sm">Skip — I don't have a code</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
