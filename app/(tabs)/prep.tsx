import { View, Text, ScrollView, SafeAreaView, TouchableOpacity } from "react-native";
import { BookOpen, Zap } from "lucide-react-native";

export default function PrepScreen() {
  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}>
        <View className="mb-8">
          <Text className="text-2xl font-bold text-white">Interview Prep</Text>
          <Text className="text-gray-400 text-sm mt-1">Technical drills and micro-learning</Text>
        </View>

        {/* Interview Practice */}
        <View className="mb-4">
          <Text className="text-base font-semibold text-white mb-3">Practice Questions</Text>
          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-blue-500/20 items-center justify-center">
              <BookOpen size={20} color="#60A5FA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Practice Mode</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Random questions, no timer</Text>
            </View>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>
        </View>

        {/* Drill Mode (paid) */}
        <View className="mb-6">
          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-4 opacity-70">
            <View className="w-10 h-10 rounded-xl bg-gold/20 items-center justify-center">
              <Zap size={20} color="#C89B3C" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Drill Mode</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Timed, scored, tracked — paid</Text>
            </View>
            <Text className="text-gold text-xs font-semibold">Upgrade</Text>
          </TouchableOpacity>
        </View>

        {/* Flashcards */}
        <View>
          <Text className="text-base font-semibold text-white mb-3">Micro-Learning</Text>
          <TouchableOpacity className="bg-dark-card border border-dark-border rounded-2xl p-4 flex-row items-center gap-4">
            <View className="w-10 h-10 rounded-xl bg-purple-500/20 items-center justify-center">
              <Zap size={20} color="#A78BFA" />
            </View>
            <View className="flex-1">
              <Text className="text-white font-semibold">Flashcard Review</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Spaced repetition — up to 20/day free</Text>
            </View>
            <Text className="text-gray-600">›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
