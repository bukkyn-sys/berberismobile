import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, RefreshControl, Alert,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowLeft, Lock, ChevronRight } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import type { Database } from "@/types/database";

type Deck = Database["public"]["Tables"]["flashcard_decks"]["Row"];

const DECK_COLORS: Record<string, string> = {
  accounting: "#60A5FA",
  valuation: "#A78BFA",
  market: "#34D399",
  modelling: "#F59E0B",
  credit: "#FB923C",
};

const DECK_EMOJIS: Record<string, string> = {
  accounting: "📊",
  valuation: "💹",
  market: "📈",
  modelling: "🧮",
  credit: "💳",
};

export default function FlashcardDecksScreen() {
  const { isPaid } = useSubscription();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDecks = async () => {
    const { data } = await supabase.from("flashcard_decks").select("*");
    setDecks(data ?? []);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { loadDecks(); }, []);
  const onRefresh = () => { setRefreshing(true); loadDecks(); };

  const deckColor = (deck: Deck) => {
    const cat = deck.category.toLowerCase();
    return DECK_COLORS[cat] ?? "#C89B3C";
  };

  const deckEmoji = (deck: Deck) => {
    const cat = deck.category.toLowerCase();
    return DECK_EMOJIS[cat] ?? "🃏";
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Flashcard Decks</Text>
      </View>

      {!isPaid && (
        <View className="mx-4 mb-3 bg-gold/10 border border-gold/30 rounded-xl px-4 py-2.5">
          <Text className="text-gold text-xs font-medium">
            Free: up to 20 cards/day · Upgrade for unlimited + premium decks
          </Text>
        </View>
      )}

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C89B3C" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C89B3C" />}
        >
          {decks.length === 0 ? (
            <View className="items-center pt-12">
              <Text className="text-3xl mb-4">🃏</Text>
              <Text className="text-white font-semibold mb-2">Decks coming soon</Text>
              <Text className="text-gray-400 text-sm text-center">
                Flashcard decks are added by the team. Check back soon!
              </Text>
            </View>
          ) : (
            decks.map((deck) => {
              const isLocked = deck.is_premium && !isPaid;
              const color = deckColor(deck);

              return (
                <TouchableOpacity
                  key={deck.id}
                  onPress={() => {
                    if (isLocked) {
                      Alert.alert(
                        "Premium Deck",
                        "Upgrade to Standard or Ultra to unlock all premium flashcard decks."
                      );
                      return;
                    }
                    router.push(`/prep/flashcards/${deck.id}/review` as any);
                  }}
                  className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-3 flex-row items-center gap-3"
                >
                  <View
                    className="w-12 h-12 rounded-xl items-center justify-center"
                    style={{ backgroundColor: `${color}20` }}
                  >
                    <Text className="text-xl">{deckEmoji(deck)}</Text>
                  </View>

                  <View className="flex-1">
                    <View className="flex-row items-center gap-2 mb-0.5 flex-wrap">
                      <Text className="text-white font-semibold">{deck.name}</Text>
                      {deck.is_premium && (
                        <View className="px-2 py-0.5 rounded-full bg-gold/10">
                          <Text className="text-gold text-xs font-medium">Premium</Text>
                        </View>
                      )}
                    </View>
                    {deck.description && (
                      <Text className="text-gray-500 text-xs" numberOfLines={1}>
                        {deck.description}
                      </Text>
                    )}
                    <Text className="text-gray-600 text-xs mt-1 capitalize">{deck.category}</Text>
                  </View>

                  {isLocked ? (
                    <Lock size={16} color="#C89B3C" />
                  ) : (
                    <ChevronRight size={16} color="#6B7280" />
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
