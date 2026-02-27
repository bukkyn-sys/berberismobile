import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  ActivityIndicator, TextInput, Alert,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Timer } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import type { Database, QuestionCategory, QuestionDifficulty } from "@/types/database";

type Question = Database["public"]["Tables"]["interview_questions"]["Row"];
type DrillState = "setup" | "question" | "result" | "summary";

const CATEGORIES: Array<{ key: QuestionCategory; label: string }> = [
  { key: "accounting", label: "Accounting" },
  { key: "dcf", label: "DCF" },
  { key: "lbo", label: "LBO" },
  { key: "comps", label: "Comps" },
  { key: "market", label: "Market" },
  { key: "behavioural", label: "Behavioural" },
];

const DIFFICULTIES: Array<{ key: QuestionDifficulty; label: string }> = [
  { key: "uni_spring", label: "Uni / Spring Week" },
  { key: "graduate", label: "Graduate" },
  { key: "analyst", label: "Analyst" },
  { key: "associate_plus", label: "Associate+" },
];

const TIME_LIMIT = 90;

export default function DrillModeScreen() {
  const { user } = useAuth();
  const [state, setState] = useState<DrillState>("setup");
  const [category, setCategory] = useState<QuestionCategory>("accounting");
  const [difficulty, setDifficulty] = useState<QuestionDifficulty>("graduate");
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [timeTakenAtSubmit, setTimeTakenAtSubmit] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(TIME_LIMIT);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setTimeTakenAtSubmit(TIME_LIMIT);
          setState("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const startDrill = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("interview_questions")
      .select("*")
      .eq("category", category)
      .eq("difficulty", difficulty)
      .limit(20);

    if (!data || data.length === 0) {
      Alert.alert("No Questions", "No questions found for this selection. Try a different category or difficulty.");
      setLoading(false);
      return;
    }

    const shuffled = [...data].sort(() => Math.random() - 0.5).slice(0, 5);
    setQuestions(shuffled);
    setCurrentIdx(0);
    setScores([]);
    setUserAnswer("");
    setState("question");
    setLoading(false);
    startTimer();
  };

  const submitAnswer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeTakenAtSubmit(TIME_LIMIT - timeLeft);
    setState("result");
  };

  const rateAnswer = async (score: number) => {
    await supabase.from("interview_attempts").insert({
      user_id: user!.id,
      question_id: questions[currentIdx].id,
      user_answer: userAnswer || null,
      score,
      time_taken_seconds: timeTakenAtSubmit,
    });

    const newScores = [...scores, score];
    setScores(newScores);

    if (currentIdx + 1 >= questions.length) {
      setState("summary");
    } else {
      setCurrentIdx(currentIdx + 1);
      setUserAnswer("");
      setState("question");
      startTimer();
    }
  };

  const timerColor = timeLeft <= 15 ? "#EF4444" : timeLeft <= 30 ? "#F59E0B" : "#4ADE80";

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity
          onPress={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            router.back();
          }}
          className="mr-3"
        >
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Drill Mode</Text>
        {state === "question" && (
          <View className="flex-row items-center gap-1">
            <Timer size={14} color={timerColor} />
            <Text style={{ color: timerColor }} className="font-bold text-sm">{timeLeft}s</Text>
          </View>
        )}
      </View>

      <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Setup */}
        {state === "setup" && (
          <View>
            <Text className="text-white font-semibold mb-3">Category</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c.key}
                  onPress={() => setCategory(c.key)}
                  className={`px-4 py-2 rounded-full border ${
                    category === c.key ? "bg-gold border-gold" : "border-dark-border bg-dark-card"
                  }`}
                >
                  <Text className={`text-sm font-medium ${category === c.key ? "text-black" : "text-gray-300"}`}>
                    {c.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="text-white font-semibold mb-3">Difficulty</Text>
            <View className="gap-2 mb-8">
              {DIFFICULTIES.map((d) => (
                <TouchableOpacity
                  key={d.key}
                  onPress={() => setDifficulty(d.key)}
                  className={`px-4 py-3 rounded-xl border flex-row items-center justify-between ${
                    difficulty === d.key ? "bg-gold/10 border-gold" : "border-dark-border bg-dark-card"
                  }`}
                >
                  <Text className={`font-medium ${difficulty === d.key ? "text-gold" : "text-gray-300"}`}>
                    {d.label}
                  </Text>
                  {difficulty === d.key && <Text className="text-gold">✓</Text>}
                </TouchableOpacity>
              ))}
            </View>

            <View className="bg-dark-card border border-dark-border rounded-xl p-4 mb-6">
              <Text className="text-gray-400 text-sm">
                5 questions · {TIME_LIMIT}s per question · Self-assess each answer 1–5
              </Text>
            </View>

            <TouchableOpacity
              onPress={startDrill}
              disabled={loading}
              className="bg-gold rounded-xl py-3.5 items-center"
            >
              {loading ? <ActivityIndicator color="#000" /> : <Text className="text-black font-bold text-base">Start Drill</Text>}
            </TouchableOpacity>
          </View>
        )}

        {/* Question */}
        {state === "question" && questions[currentIdx] && (
          <View>
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-gray-400 text-sm">
                Question {currentIdx + 1} of {questions.length}
              </Text>
              <View className="flex-row gap-1">
                {questions.map((_, i) => (
                  <View
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < currentIdx ? "bg-gold" : i === currentIdx ? "bg-white" : "bg-gray-700"
                    }`}
                  />
                ))}
              </View>
            </View>

            <View className="bg-dark-card border border-dark-border rounded-2xl p-5 mb-4">
              <Text className="text-white text-base leading-relaxed font-medium">
                {questions[currentIdx].question_text}
              </Text>
            </View>

            <TextInput
              value={userAnswer}
              onChangeText={setUserAnswer}
              placeholder="Type your answer here..."
              placeholderTextColor="#4B5563"
              multiline
              className="bg-dark-card border border-dark-border rounded-2xl p-4 text-white text-sm mb-4"
              style={{ textAlignVertical: "top", minHeight: 120 }}
            />

            <TouchableOpacity
              onPress={submitAnswer}
              className="bg-blue-500 rounded-xl py-3.5 items-center"
            >
              <Text className="text-white font-bold">Submit & See Answer</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Result — show model answer + self-rate */}
        {state === "result" && questions[currentIdx] && (
          <View>
            <Text className="text-white font-semibold mb-2">Your Answer</Text>
            <View className="bg-dark-card border border-dark-border rounded-xl p-4 mb-4">
              <Text className="text-gray-300 text-sm">
                {userAnswer || "(No answer submitted — time ran out)"}
              </Text>
            </View>

            <Text className="text-white font-semibold mb-2">Model Answer</Text>
            <View className="bg-dark-card border border-green-500/20 rounded-xl p-4 mb-6">
              <Text className="text-gray-300 text-sm leading-relaxed">
                {questions[currentIdx].model_answer}
              </Text>
            </View>

            <Text className="text-white font-semibold mb-3">How did you do?</Text>
            <View className="flex-row gap-2 mb-2">
              {([1, 2, 3, 4, 5] as const).map((score) => (
                <TouchableOpacity
                  key={score}
                  onPress={() => rateAnswer(score)}
                  className={`flex-1 py-3 rounded-xl items-center border ${
                    score <= 2
                      ? "border-red-500/40 bg-red-500/10"
                      : score === 3
                      ? "border-yellow-500/40 bg-yellow-500/10"
                      : "border-green-500/40 bg-green-500/10"
                  }`}
                >
                  <Text
                    className="font-bold text-lg"
                    style={{ color: score <= 2 ? "#EF4444" : score === 3 ? "#F59E0B" : "#4ADE80" }}
                  >
                    {score}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <View className="flex-row justify-between px-1">
              <Text className="text-gray-600 text-xs">Again</Text>
              <Text className="text-gray-600 text-xs">Perfect</Text>
            </View>
          </View>
        )}

        {/* Summary */}
        {state === "summary" && (
          <View className="items-center pt-4">
            <Text className="text-white font-bold text-2xl mb-2">Drill Complete!</Text>
            <Text className="text-gray-400 text-sm mb-8">
              {questions.length} questions · Avg score:{" "}
              {(scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)} / 5
            </Text>

            {questions.map((q, i) => (
              <View
                key={q.id}
                className="w-full bg-dark-card border border-dark-border rounded-xl p-3 mb-2 flex-row items-center justify-between"
              >
                <Text className="text-gray-300 text-sm flex-1 mr-3" numberOfLines={2}>
                  {q.question_text}
                </Text>
                <Text
                  className="font-bold text-base"
                  style={{ color: scores[i] <= 2 ? "#EF4444" : scores[i] === 3 ? "#F59E0B" : "#4ADE80" }}
                >
                  {scores[i]}/5
                </Text>
              </View>
            ))}

            <TouchableOpacity
              onPress={() => setState("setup")}
              className="mt-6 bg-gold rounded-xl py-3.5 px-8 items-center"
            >
              <Text className="text-black font-bold">New Drill</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
