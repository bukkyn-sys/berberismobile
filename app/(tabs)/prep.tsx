import { View, Text, ScrollView, SafeAreaView, TouchableOpacity, Alert } from "react-native";
import { router } from "expo-router";
import { BookOpen, Zap, Brain, TrendingUp, ChevronRight } from "lucide-react-native";
import { useSubscription } from "@/hooks/use-subscription";

export default function PrepScreen() {
  const { isPaid } = useSubscription();

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
        <View className="mb-8">
          <Text className="text-2xl font-bold text-white">Interview Prep</Text>
          <Text className="text-gray-400 text-sm mt-1">Technical drills and micro-learning</Text>
        </View>

        {/* Interview Practice */}
        <Text className="text-base font-semibold text-white mb-3">Practice Questions</Text>

        <TouchableOpacity
          onPress={() => router.push("/prep/practice" as any)}
          className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-4 mb-3"
        >
          <View className="w-10 h-10 rounded-xl bg-blue-500/20 items-center justify-center">
            <BookOpen size={20} color="#60A5FA" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">Practice Mode</Text>
            <Text className="text-gray-500 text-xs mt-0.5">Random questions, no timer — free</Text>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            if (!isPaid) {
              Alert.alert("Paid Feature", "Upgrade to Standard or Ultra to access Drill Mode.");
              return;
            }
            router.push("/prep/drill" as any);
          }}
          className={`bg-dark-card border rounded-2xl p-4 flex-row items-center gap-4 mb-6 ${
            isPaid ? "border-dark-border" : "border-dark-border opacity-70"
          }`}
        >
          <View className="w-10 h-10 rounded-xl bg-gold/20 items-center justify-center">
            <Zap size={20} color="#C89B3C" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">Drill Mode</Text>
            <Text className="text-gray-500 text-xs mt-0.5">Timed, scored, by category</Text>
          </View>
          {isPaid ? (
            <ChevronRight size={16} color="#6B7280" />
          ) : (
            <Text className="text-gold text-xs font-semibold">Upgrade</Text>
          )}
        </TouchableOpacity>

        {/* Micro-Learning */}
        <Text className="text-base font-semibold text-white mb-3">Micro-Learning</Text>

        <TouchableOpacity
          onPress={() => router.push("/prep/flashcards" as any)}
          className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-4 mb-3"
        >
          <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
            <Brain size={20} color="#A78BFA" />
          </View>
          <View className="flex-1">
            <Text className="text-white font-semibold">Flashcard Decks</Text>
            <Text className="text-gray-500 text-xs mt-0.5">
              {isPaid ? "Unlimited review — spaced repetition" : "Up to 20 cards/day free"}
            </Text>
          </View>
          <ChevronRight size={16} color="#6B7280" />
        </TouchableOpacity>

        {isPaid && (
          <TouchableOpacity
            onPress={() => router.push("/prep/prep-progress" as any)}
            className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-4"
          >
            <View className="w-10 h-10 rounded-xl bg-green-500/20 items-center justify-center">
              <TrendingUp size={20} color="#4ADE80" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">My Progress</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Accuracy by category, weak areas</Text>
            </View>
            <ChevronRight size={16} color="#6B7280" />
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
