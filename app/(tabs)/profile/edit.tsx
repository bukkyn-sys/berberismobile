import {
  View, Text, TextInput, TouchableOpacity, SafeAreaView,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, Alert, Image
} from "react-native";
import { useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { Camera } from "lucide-react-native";
import { router } from "expo-router";

export default function EditProfileScreen() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: u } = await supabase.from("users").select("full_name").eq("id", user.id).single();
      const { data: p } = await supabase.from("profiles").select("bio, goals, avatar_url").eq("user_id", user.id).single();
      if (u) setFullName(u.full_name);
      if (p) {
        setBio(p.bio ?? "");
        setGoals(p.goals ?? "");
        setAvatarUrl(p.avatar_url ?? null);
      }
    })();
  }, [user]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      const ext = uri.split(".").pop() ?? "jpg";
      const fileName = `${user!.id}/avatar.${ext}`;
      const formData = new FormData();
      formData.append("file", { uri, name: fileName, type: `image/${ext}` } as any);

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, formData, { upsert: true });

      if (uploadError) {
        Alert.alert("Upload failed", uploadError.message);
        return;
      }

      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(publicUrl);
      await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("user_id", user!.id);
    }
  };

  const save = async () => {
    setLoading(true);
    try {
      await supabase.from("users").update({ full_name: fullName }).eq("id", user!.id);
      await supabase.from("profiles").update({ bio, goals }).eq("user_id", user!.id);
      router.back();
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        <ScrollView className="flex-1 px-6" contentContainerStyle={{ paddingTop: 32, paddingBottom: 32 }}>
          <Text className="text-2xl font-bold text-white mb-6">Edit Profile</Text>

          {/* Avatar */}
          <TouchableOpacity onPress={pickImage} className="items-center mb-8">
            <View className="relative">
              {avatarUrl ? (
                <Image source={{ uri: avatarUrl }} className="w-24 h-24 rounded-full" />
              ) : (
                <View className="w-24 h-24 rounded-full bg-gold/20 items-center justify-center">
                  <Text className="text-gold text-3xl font-bold">{fullName?.[0] ?? "?"}</Text>
                </View>
              )}
              <View className="absolute bottom-0 right-0 w-8 h-8 bg-gold rounded-full items-center justify-center">
                <Camera size={14} color="#000" />
              </View>
            </View>
            <Text className="text-gold text-sm mt-2">Change photo</Text>
          </TouchableOpacity>

          <View className="gap-4 mb-8">
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Full Name</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Your name"
                placeholderTextColor="#4B5563"
              />
            </View>
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Bio</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                value={bio}
                onChangeText={setBio}
                placeholder="Tell mentors about yourself"
                placeholderTextColor="#4B5563"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ height: 80 }}
              />
            </View>
            <View>
              <Text className="text-gray-400 text-sm mb-1.5">Goals</Text>
              <TextInput
                className="bg-dark-card border border-dark-border rounded-xl px-4 py-3.5 text-white"
                value={goals}
                onChangeText={setGoals}
                placeholder="What are you working towards?"
                placeholderTextColor="#4B5563"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{ height: 80 }}
              />
            </View>
          </View>

          <TouchableOpacity onPress={save} disabled={loading} className="bg-gold rounded-xl py-4 items-center">
            {loading ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold text-base">Save Changes</Text>}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
