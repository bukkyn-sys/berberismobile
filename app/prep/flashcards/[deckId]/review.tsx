import {
  View, Text, SafeAreaView, TouchableOpacity,
  ActivityIndicator, ScrollView,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import { useSubscription } from "@/hooks/use-subscription";
import { sm2Update, sm2Initial } from "@/lib/sm2";
import type { Database } from "@/types/database";

type Flashcard = Database["public"]["Tables"]["flashcards"]["Row"];
type Progress = Database["public"]["Tables"]["user_flashcard_progress"]["Row"];

const FREE_DAILY_LIMIT = 20;

// Rating button config: quality 1-5
const RATINGS = [
  { quality: 1, label: "Again", color: "#EF4444", bg: "#EF444420" },
  { quality: 2, label: "Hard", color: "#F59E0B", bg: "#F59E0B20" },
  { quality: 3, label: "Okay", color: "#60A5FA", bg: "#60A5FA20" },
  { quality: 4, label: "Good", color: "#4ADE80", bg: "#4ADE8020" },
  { quality: 5, label: "Easy", color: "#A78BFA", bg: "#A78BFA20" },
] as const;

export default function FlashcardReviewScreen() {
  const { deckId } = useLocalSearchParams<{ deckId: string }>();
  const { user } = useAuth();
  const { isPaid } = useSubscription();

  const [cards, setCards] = useState<Flashcard[]>([]);
  const [progressMap, setProgressMap] = useState<Record<string, Progress>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewedToday, setReviewedToday] = useState(0);
  const [sessionDone, setSessionDone] = useState(false);
  const [deckName, setDeckName] = useState("");

  useEffect(() => {
    if (!user || !deckId) return;
    loadSession();
  }, [user, deckId]);

  const loadSession = async () => {
    // Load deck info
    const { data: deck } = await supabase
      .from("flashcard_decks")
      .select("name")
      .eq("id", deckId)
      .single();
    if (deck) setDeckName(deck.name);

    // Load all cards in deck
    const { data: flashcards } = await supabase
      .from("flashcards")
      .select("*")
      .eq("deck_id", deckId);

    if (!flashcards || flashcards.length === 0) {
      setLoading(false);
      return;
    }

    // Load user progress for these cards
    const { data: progress } = await supabase
      .from("user_flashcard_progress")
      .select("*")
      .eq("user_id", user!.id)
      .in("flashcard_id", flashcards.map((c) => c.id));

    const progMap: Record<string, Progress> = {};
    (progress ?? []).forEach((p) => { progMap[p.flashcard_id] = p; });

    // Count cards reviewed today (free tier cap check)
    if (!isPaid) {
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count } = await supabase
        .from("user_flashcard_progress")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .gte("next_review_at", todayStart.toISOString());
      setReviewedToday(count ?? 0);
    }

    // Sort: due cards first (next_review_at <= now), then new cards
    const now = new Date().toISOString();
    const sorted = [...flashcards].sort((a, b) => {
      const pa = progMap[a.id];
      const pb = progMap[b.id];
      const aTime = pa ? pa.next_review_at : "0";
      const bTime = pb ? pb.next_review_at : "0";
      if (aTime <= now && bTime > now) return -1;
      if (bTime <= now && aTime > now) return 1;
      return aTime.localeCompare(bTime);
    });

    setCards(sorted);
    setProgressMap(progMap);
    setCurrentIdx(0);
    setFlipped(false);
    setLoading(false);
  };

  const handleRate = async (quality: 1 | 2 | 3 | 4 | 5) => {
    if (!user) return;
    const card = cards[currentIdx];
    const existing = progressMap[card.id];

    const current = existing ?? { ...sm2Initial(), user_id: user.id, flashcard_id: card.id };
    const updated = sm2Update(current, quality);

    // Upsert progress
    await supabase.from("user_flashcard_progress").upsert({
      user_id: user.id,
      flashcard_id: card.id,
      ...updated,
    });

    setProgressMap((prev) => ({
      ...prev,
      [card.id]: { user_id: user.id, flashcard_id: card.id, ...updated },
    }));

    const nextIdx = currentIdx + 1;
    const limit = isPaid ? Infinity : FREE_DAILY_LIMIT;

    if (!isPaid && reviewedToday + nextIdx >= limit) {
      setSessionDone(true);
      return;
    }

    if (nextIdx >= cards.length) {
      setSessionDone(true);
    } else {
      setCurrentIdx(nextIdx);
      setFlipped(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-dark items-center justify-center">
        <ActivityIndicator color="#C89B3C" />
      </SafeAreaView>
    );
  }

  if (cards.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">{deckName}</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <Text className="text-gray-400 text-center">No cards in this deck yet.</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (sessionDone) {
    const reviewed = Math.min(currentIdx, cards.length);
    return (
      <SafeAreaView className="flex-1 bg-dark">
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg">{deckName}</Text>
        </View>
        <View className="flex-1 items-center justify-center px-8">
          <CheckCircle size={48} color="#4ADE80" />
          <Text className="text-white font-bold text-2xl mt-4 mb-2">Session Complete!</Text>
          <Text className="text-gray-400 text-sm text-center mb-2">
            {reviewed} card{reviewed !== 1 ? "s" : ""} reviewed
          </Text>
          {!isPaid && (
            <Text className="text-gold text-xs text-center mb-6">
              Free limit: {FREE_DAILY_LIMIT} cards/day · Upgrade for unlimited
            </Text>
          )}
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-gold rounded-xl py-3.5 px-8 items-center mt-4"
          >
            <Text className="text-black font-bold">Back to Decks</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const card = cards[currentIdx];
  const progress = progressMap[card.id];
  const isNew = !progress || progress.repetitions === 0;
  const isDue =
    !progress || new Date(progress.next_review_at) <= new Date();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">{deckName}</Text>
        <Text className="text-gray-500 text-sm">
          {currentIdx + 1} / {cards.length}
        </Text>
      </View>

      {/* Progress bar */}
      <View className="mx-4 mb-4 h-1.5 bg-dark-border rounded-full overflow-hidden">
        <View
          className="h-full bg-gold rounded-full"
          style={{ width: `${((currentIdx) / cards.length) * 100}%` }}
        />
      </View>

      {/* Status chip */}
      <View className="mx-4 mb-4 flex-row">
        {isNew ? (
          <View className="px-3 py-1 rounded-full bg-blue-500/20">
            <Text className="text-blue-400 text-xs font-medium">New card</Text>
          </View>
        ) : isDue ? (
          <View className="px-3 py-1 rounded-full bg-gold/20">
            <Text className="text-gold text-xs font-medium">Due for review</Text>
          </View>
        ) : (
          <View className="px-3 py-1 rounded-full bg-green-500/20">
            <Text className="text-green-400 text-xs font-medium">Ahead of schedule</Text>
          </View>
        )}
      </View>

      {/* Card */}
      <TouchableOpacity
        onPress={() => setFlipped(!flipped)}
        activeOpacity={0.85}
        className="mx-4 flex-1 bg-dark-card border border-dark-border rounded-3xl p-6 justify-center items-center"
        style={{ minHeight: 280 }}
      >
        {!flipped ? (
          <View className="items-center">
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4">
              Question
            </Text>
            <Text className="text-white text-lg font-medium text-center leading-relaxed">
              {card.front}
            </Text>
            <Text className="text-gray-600 text-xs mt-6">Tap to reveal answer</Text>
          </View>
        ) : (
          <View className="items-center">
            <Text className="text-gray-500 text-xs font-medium uppercase tracking-wider mb-4">
              Answer
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text className="text-white text-base text-center leading-relaxed">
                {card.back}
              </Text>
            </ScrollView>
          </View>
        )}
      </TouchableOpacity>

      {/* Rating buttons — only shown after flip */}
      <View className="px-4 pt-4 pb-6">
        {!flipped ? (
          <TouchableOpacity
            onPress={() => setFlipped(true)}
            className="border border-dark-border rounded-xl py-3.5 items-center"
          >
            <Text className="text-white font-semibold">Show Answer</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text className="text-gray-500 text-xs text-center mb-3">How well did you know this?</Text>
            <View className="flex-row gap-2">
              {RATINGS.map(({ quality, label, color, bg }) => (
                <TouchableOpacity
                  key={quality}
                  onPress={() => handleRate(quality)}
                  className="flex-1 py-3 rounded-xl items-center"
                  style={{ backgroundColor: bg }}
                >
                  <Text className="text-xs font-bold" style={{ color }}>{label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
