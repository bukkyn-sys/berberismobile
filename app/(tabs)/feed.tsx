import {
  View, Text, ScrollView, SafeAreaView, TouchableOpacity,
  RefreshControl, ActivityIndicator, Modal, Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { ArrowRight, SlidersHorizontal, X, Bell } from "lucide-react-native";
import { supabase } from "@/lib/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import type { Database } from "@/types/database";

type LateralMove = Database["public"]["Tables"]["lateral_moves"]["Row"];

const DIVISIONS = [
  "All", "Investment Banking", "Private Equity", "Asset Management",
  "Sales & Trading", "Equity Research", "Credit", "Risk", "Operations",
  "Technology", "Strategy",
];

const SENIORITIES = ["All", "Analyst", "Associate", "VP", "Director", "MD"];

const FIRMS = [
  "All", "Goldman Sachs", "JP Morgan", "Morgan Stanley", "Barclays",
  "HSBC", "Deutsche Bank", "UBS", "Blackstone", "KKR", "Citadel",
];

type Filters = {
  division: string;
  seniority: string;
  firm: string;
};

export default function FeedScreen() {
  const { isPaid } = useSubscription();
  const [moves, setMoves] = useState<LateralMove[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    division: "All",
    seniority: "All",
    firm: "All",
  });
  const [pendingFilters, setPendingFilters] = useState<Filters>(filters);

  const loadMoves = useCallback(async (activeFilters: Filters = filters) => {
    let query = supabase
      .from("lateral_moves")
      .select("*")
      .order("date_moved", { ascending: false })
      .limit(50);

    // Paid users can filter
    if (isPaid) {
      if (activeFilters.division !== "All") {
        query = query.eq("division", activeFilters.division);
      }
      if (activeFilters.seniority !== "All") {
        query = query.ilike("to_role", `%${activeFilters.seniority}%`);
      }
      if (activeFilters.firm !== "All") {
        query = query.or(
          `from_firm.ilike.%${activeFilters.firm}%,to_firm.ilike.%${activeFilters.firm}%`
        );
      }
    }

    const { data } = await query;
    setMoves(data ?? []);
    setLoading(false);
    setRefreshing(false);
  }, [isPaid, filters]);

  useEffect(() => { loadMoves(); }, [isPaid]);

  const onRefresh = () => {
    setRefreshing(true);
    loadMoves();
  };

  const applyFilters = () => {
    setFilters(pendingFilters);
    setShowFilters(false);
    loadMoves(pendingFilters);
  };

  const resetFilters = () => {
    const empty: Filters = { division: "All", seniority: "All", firm: "All" };
    setPendingFilters(empty);
  };

  const hasActiveFilters =
    filters.division !== "All" ||
    filters.seniority !== "All" ||
    filters.firm !== "All";

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { month: "short", year: "numeric" });
  };

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-6 pb-3">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-white">Lateral Moves</Text>
          <Text className="text-gray-400 text-sm mt-0.5">UK finance job movements</Text>
        </View>
        {isPaid && (
          <TouchableOpacity
            onPress={() => {
              setPendingFilters(filters);
              setShowFilters(true);
            }}
            className={`flex-row items-center gap-1.5 px-3 py-2 rounded-xl border ${
              hasActiveFilters
                ? "bg-gold/10 border-gold"
                : "bg-dark-card border-dark-border"
            }`}
          >
            <SlidersHorizontal size={14} color={hasActiveFilters ? "#C89B3C" : "#9CA3AF"} />
            <Text
              className={`text-xs font-medium ${hasActiveFilters ? "text-gold" : "text-gray-400"}`}
            >
              Filter{hasActiveFilters ? " •" : ""}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#C89B3C" />
        </View>
      ) : (
        <ScrollView
          className="flex-1 px-4"
          contentContainerStyle={{ paddingBottom: 32 }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#C89B3C" />
          }
        >
          {moves.length === 0 ? (
            <View className="items-center pt-12">
              <Text className="text-3xl mb-4">📋</Text>
              <Text className="text-white font-semibold mb-2">No moves yet</Text>
              <Text className="text-gray-400 text-sm text-center">
                {hasActiveFilters
                  ? "No results match your filters. Try adjusting them."
                  : "Lateral move data is added regularly. Check back soon!"}
              </Text>
            </View>
          ) : (
            <>
              {moves.map((move) => (
                <View
                  key={move.id}
                  className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-3"
                >
                  {/* Top row: name + division tag */}
                  <View className="flex-row items-start justify-between mb-3">
                    <View className="flex-1 mr-2">
                      <Text className="text-white font-semibold text-sm">{move.person_name}</Text>
                      {move.date_moved && (
                        <Text className="text-gray-600 text-xs mt-0.5">
                          {formatDate(move.date_moved)}
                          {move.is_verified && " · Verified"}
                        </Text>
                      )}
                    </View>
                    {move.division && (
                      <View className="px-2 py-1 rounded-full bg-gold/10">
                        <Text className="text-gold text-xs font-medium">{move.division}</Text>
                      </View>
                    )}
                  </View>

                  {/* From → To */}
                  <View className="flex-row items-center gap-2">
                    <View className="flex-1 bg-dark/50 rounded-xl p-3">
                      <Text className="text-gray-500 text-xs mb-0.5">From</Text>
                      <Text className="text-white text-sm font-medium">{move.from_firm}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5">{move.from_role}</Text>
                    </View>
                    <ArrowRight size={16} color="#C89B3C" />
                    <View className="flex-1 bg-dark/50 rounded-xl p-3">
                      <Text className="text-gray-500 text-xs mb-0.5">To</Text>
                      <Text className="text-white text-sm font-medium">{move.to_firm}</Text>
                      <Text className="text-gray-400 text-xs mt-0.5">{move.to_role}</Text>
                    </View>
                  </View>
                </View>
              ))}

              {/* Upgrade prompt for free users */}
              {!isPaid && (
                <View className="bg-dark-card border border-gold/30 rounded-2xl p-4 mt-2 mb-4">
                  <View className="flex-row items-center gap-2 mb-2">
                    <Bell size={14} color="#C89B3C" />
                    <Text className="text-gold font-semibold text-sm">More with Standard or Ultra</Text>
                  </View>
                  <Text className="text-gray-400 text-xs leading-relaxed">
                    Filter by firm, division and seniority. Set custom move alerts so you're notified when roles matching your target appear.
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      )}

      {/* Filter modal — paid users only */}
      <Modal
        visible={showFilters}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowFilters(false)}
      >
        <View className="flex-1 bg-dark">
          <View className="flex-row items-center px-4 pt-6 pb-4 border-b border-dark-border">
            <Text className="text-white font-bold text-lg flex-1">Filter Moves</Text>
            <TouchableOpacity onPress={() => setShowFilters(false)}>
              <X size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <ScrollView className="flex-1 px-4" contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}>
            {/* Division */}
            <Text className="text-white font-semibold mb-3">Division</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {DIVISIONS.map((d) => (
                <TouchableOpacity
                  key={d}
                  onPress={() => setPendingFilters((f) => ({ ...f, division: d }))}
                  className={`px-3 py-1.5 rounded-full border ${
                    pendingFilters.division === d
                      ? "bg-gold border-gold"
                      : "border-dark-border bg-dark-card"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      pendingFilters.division === d ? "text-black" : "text-gray-300"
                    }`}
                  >
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Seniority */}
            <Text className="text-white font-semibold mb-3">Seniority</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {SENIORITIES.map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setPendingFilters((f) => ({ ...f, seniority: s }))}
                  className={`px-3 py-1.5 rounded-full border ${
                    pendingFilters.seniority === s
                      ? "bg-gold border-gold"
                      : "border-dark-border bg-dark-card"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      pendingFilters.seniority === s ? "text-black" : "text-gray-300"
                    }`}
                  >
                    {s}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Firm */}
            <Text className="text-white font-semibold mb-3">Firm</Text>
            <View className="flex-row flex-wrap gap-2 mb-6">
              {FIRMS.map((f) => (
                <TouchableOpacity
                  key={f}
                  onPress={() => setPendingFilters((prev) => ({ ...prev, firm: f }))}
                  className={`px-3 py-1.5 rounded-full border ${
                    pendingFilters.firm === f
                      ? "bg-gold border-gold"
                      : "border-dark-border bg-dark-card"
                  }`}
                >
                  <Text
                    className={`text-xs font-medium ${
                      pendingFilters.firm === f ? "text-black" : "text-gray-300"
                    }`}
                  >
                    {f}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <View className="px-4 pb-8 pt-2 flex-row gap-3 border-t border-dark-border">
            <TouchableOpacity
              onPress={resetFilters}
              className="flex-1 border border-dark-border rounded-xl py-3.5 items-center"
            >
              <Text className="text-white font-semibold">Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={applyFilters}
              className="flex-1 bg-gold rounded-xl py-3.5 items-center"
            >
              <Text className="text-black font-bold">Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
