import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  SafeAreaView, KeyboardAvoidingView, Platform, ActivityIndicator
} from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Send } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { format } from "date-fns";

type Message = {
  id: string;
  sender_id: string;
  content: string;
  created_at: string;
  read_at: string | null;
};

export default function MessageThreadScreen() {
  const { userId: recipientId } = useLocalSearchParams<{ userId: string }>();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [recipientName, setRecipientName] = useState("");
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    (async () => {
      const { data: recipient } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", recipientId)
        .single();
      setRecipientName(recipient?.full_name ?? "");

      const { data } = await supabase
        .from("messages")
        .select("*")
        .or(`and(sender_id.eq.${user!.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user!.id})`)
        .order("created_at", { ascending: true });
      setMessages(data ?? []);
      setLoading(false);

      // Mark messages as read
      await supabase
        .from("messages")
        .update({ read_at: new Date().toISOString() })
        .eq("recipient_id", user!.id)
        .eq("sender_id", recipientId)
        .is("read_at", null);
    })();

    // Subscribe to new messages via Supabase Realtime
    const channel = supabase
      .channel(`messages:${user!.id}:${recipientId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `recipient_id=eq.${user!.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [recipientId, user]);

  const sendMessage = async () => {
    const content = text.trim();
    if (!content) return;
    setText("");

    const optimistic: Message = {
      id: Date.now().toString(),
      sender_id: user!.id,
      content,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages((prev) => [...prev, optimistic]);

    const { data, error } = await supabase.from("messages").insert({
      sender_id: user!.id,
      recipient_id: recipientId,
      content,
    }).select().single();

    if (!error && data) {
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? data : m));
    }

    flatListRef.current?.scrollToEnd({ animated: true });
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMe = item.sender_id === user!.id;
    return (
      <View className={`mb-2 ${isMe ? "items-end" : "items-start"}`}>
        <View className={`max-w-[75%] px-4 py-2.5 rounded-2xl ${isMe ? "bg-gold rounded-br-sm" : "bg-dark-card border border-dark-border rounded-bl-sm"}`}>
          <Text className={isMe ? "text-black text-sm" : "text-white text-sm"}>{item.content}</Text>
        </View>
        <Text className="text-gray-600 text-xs mt-0.5 px-1">
          {format(new Date(item.created_at), "HH:mm")}
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : "height"}>
        {/* Header */}
        <View className="flex-row items-center gap-3 px-4 py-3 border-b border-dark-border">
          <TouchableOpacity onPress={() => router.back()}>
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="text-white font-semibold text-base flex-1">{recipientName}</Text>
        </View>

        {/* Messages */}
        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#C89B3C" />
          </View>
        ) : (
          <FlatList
            ref={flatListRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={renderMessage}
            contentContainerStyle={{ padding: 16, paddingBottom: 8 }}
            onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
            ListEmptyComponent={
              <View className="flex-1 items-center justify-center py-16">
                <Text className="text-gray-500 text-sm">No messages yet. Say hello!</Text>
              </View>
            }
          />
        )}

        {/* Input */}
        <View className="flex-row items-end gap-2 px-4 py-3 border-t border-dark-border">
          <TextInput
            className="flex-1 bg-dark-card border border-dark-border rounded-xl px-4 py-2.5 text-white text-sm"
            placeholder="Type a message..."
            placeholderTextColor="#4B5563"
            value={text}
            onChangeText={setText}
            multiline
            returnKeyType="default"
          />
          <TouchableOpacity
            onPress={sendMessage}
            disabled={!text.trim()}
            className={`w-10 h-10 rounded-full items-center justify-center ${text.trim() ? "bg-gold" : "bg-dark-card border border-dark-border"}`}
          >
            <Send size={16} color={text.trim() ? "#000" : "#6B7280"} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
