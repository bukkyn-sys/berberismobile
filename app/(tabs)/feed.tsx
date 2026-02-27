import { View, Text, ScrollView, SafeAreaView, RefreshControl } from "react-native";
import { useState } from "react";
import { ArrowRight } from "lucide-react-native";

// Placeholder data — will be replaced by Supabase query
const PLACEHOLDER_MOVES = [
  { id: "1", person: "Alex Chen", from: "Goldman Sachs", fromRole: "Analyst", to: "Blackstone", toRole: "Associate", division: "Private Equity" },
  { id: "2", person: "Sarah Mills", from: "JP Morgan", fromRole: "Analyst", to: "KKR", toRole: "Associate", division: "Credit" },
  { id: "3", person: "James Park", from: "Morgan Stanley", fromRole: "Associate", to: "Citadel", toRole: "VP", division: "Equities" },
];

export default function FeedScreen() {
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    // TODO: re-fetch from Supabase
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      <ScrollView
        className="flex-1 px-4"
        contentContainerStyle={{ paddingTop: 24, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C89B3C" />}
      >
        <View className="mb-6">
          <Text className="text-2xl font-bold text-white">Lateral Moves</Text>
          <Text className="text-gray-400 text-sm mt-1">UK finance job movements</Text>
        </View>

        {PLACEHOLDER_MOVES.map((move) => (
          <View key={move.id} className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-white font-semibold text-sm">{move.person}</Text>
              {move.division && (
                <Text className="text-xs text-gold bg-gold/10 px-2 py-0.5 rounded-full">
                  {move.division}
                </Text>
              )}
            </View>
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">{move.fromRole}</Text>
                <Text className="text-white text-sm font-medium">{move.from}</Text>
              </View>
              <ArrowRight size={16} color="#6B7280" />
              <View className="flex-1">
                <Text className="text-gray-400 text-xs">{move.toRole}</Text>
                <Text className="text-white text-sm font-medium">{move.to}</Text>
              </View>
            </View>
          </View>
        ))}

        <View className="bg-dark-card border border-gold/30 rounded-2xl p-4 mt-2">
          <Text className="text-gold font-semibold text-sm mb-1">Upgrade for full access</Text>
          <Text className="text-gray-400 text-xs">Filter by firm, division, seniority and get custom move alerts.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
