import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState, useCallback } from "react";
import { ArrowLeft, RefreshCw, Eye } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import type { Database, QuestionCategory } from "@/types/database";

type Question = Database["public"]["Tables"]["interview_questions"]["Row"];

const CATEGORIES: Array<{ key: QuestionCategory | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "accounting", label: "Accounting" },
  { key: "dcf", label: "DCF" },
  { key: "lbo", label: "LBO" },
  { key: "comps", label: "Comps" },
  { key: "market", label: "Market" },
  { key: "behavioural", label: "Behavioural" },
];

const DIFFICULTY_LABELS: Record<string, string> = {
  uni_spring: "Uni / Spring Week",
  graduate: "Graduate",
  analyst: "Analyst",
  associate_plus: "Associate+",
};

export default function PracticeModeScreen() {
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [category, setCategory] = useState<QuestionCategory | "all">("all");
  const [hasStarted, setHasStarted] = useState(false);

  const loadQuestion = useCallback(async (cat: QuestionCategory | "all" = "all") => {
    setLoading(true);
    setShowAnswer(false);

    let query = supabase.from("interview_questions").select("*");
    if (cat !== "all") query = (query as any).eq("category", cat);

    const { data } = await query.limit(100);
    if (data && data.length > 0) {
      setQuestion(data[Math.floor(Math.random() * data.length)]);
    } else {
      setQuestion(null);
    }
    setLoading(false);
    setHasStarted(true);
  }, []);

  const handleCategoryChange = (cat: QuestionCategory | "all") => {
    setCategory(cat);
    if (hasStarted) loadQuestion(cat);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View className="flex-row items-center px-4 pt-4 pb-3">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <ArrowLeft size={22} color="#9CA3AF" />
          </TouchableOpacity>
          <Text className="text-white font-bold text-lg flex-1">Practice Mode</Text>
          {hasStarted && !loading && (
            <TouchableOpacity onPress={() => loadQuestion(category)}>
              <RefreshCw size={20} color="#9CA3AF" />
            </TouchableOpacity>
          )}
        </View>

        {/* Category chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4"
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              onPress={() => handleCategoryChange(cat.key)}
              className={`px-4 py-1.5 rounded-full border ${
                category === cat.key ? "bg-gold border-gold" : "border-dark-border bg-dark-card"
              }`}
            >
              <Text
                className={`text-sm font-medium ${
                  category === cat.key ? "text-black" : "text-gray-300"
                }`}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {!hasStarted ? (
          <View className="px-4 pt-8 items-center">
            <View className="w-16 h-16 rounded-full bg-blue-500/20 items-center justify-center mb-4">
              <Text className="text-3xl">📚</Text>
            </View>
            <Text className="text-white font-bold text-xl mb-2">Ready to practice?</Text>
            <Text className="text-gray-400 text-sm text-center mb-8 leading-relaxed">
              Random questions from the bank. Read the question, form your answer, then reveal the model answer.
            </Text>
            <TouchableOpacity
              onPress={() => loadQuestion(category)}
              className="bg-blue-500 px-8 py-3.5 rounded-xl"
            >
              <Text className="text-white font-bold text-base">Start Practice</Text>
            </TouchableOpacity>
          </View>
        ) : loading ? (
          <View className="flex-1 items-center justify-center pt-20">
            <ActivityIndicator color="#C89B3C" />
          </View>
        ) : !question ? (
          <View className="px-4 pt-8 items-center">
            <Text className="text-gray-400 text-center">
              No questions available for this category yet.
            </Text>
          </View>
        ) : (
          <View className="px-4">
            {/* Metadata chips */}
            <View className="flex-row gap-2 mb-3">
              <View className="px-3 py-1 rounded-full bg-blue-500/20">
                <Text className="text-blue-400 text-xs font-medium capitalize">{question.category}</Text>
              </View>
              <View className="px-3 py-1 rounded-full bg-dark-card border border-dark-border">
                <Text className="text-gray-400 text-xs">
                  {DIFFICULTY_LABELS[question.difficulty] ?? question.difficulty}
                </Text>
              </View>
            </View>

            {/* Question */}
            <View className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-4">
              <Text className="text-white text-base leading-relaxed font-medium">
                {question.question_text}
              </Text>
            </View>

            {/* Hint */}
            {question.hints && !showAnswer && (
              <View className="bg-dark-card border border-yellow-500/20 rounded-xl p-4 mb-4">
                <Text className="text-yellow-400 text-xs font-semibold mb-1">Hint</Text>
                <Text className="text-gray-400 text-sm">{question.hints}</Text>
              </View>
            )}

            {!showAnswer ? (
              <TouchableOpacity
                onPress={() => setShowAnswer(true)}
                className="border border-dark-border rounded-xl py-3.5 items-center flex-row justify-center gap-2 mb-3"
              >
                <Eye size={16} color="#9CA3AF" />
                <Text className="text-white font-semibold">Show Model Answer</Text>
              </TouchableOpacity>
            ) : (
              <View className="bg-dark-card border border-green-500/20 rounded-2xl p-5 mb-4">
                <Text className="text-green-400 text-xs font-semibold mb-2">Model Answer</Text>
                <Text className="text-gray-300 text-sm leading-relaxed">{question.model_answer}</Text>
              </View>
            )}

            {showAnswer && (
              <TouchableOpacity
                onPress={() => loadQuestion(category)}
                className="bg-blue-500 rounded-xl py-3.5 items-center"
              >
                <Text className="text-white font-bold">Next Question</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
