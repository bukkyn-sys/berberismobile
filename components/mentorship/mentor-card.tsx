import { View, Text, TouchableOpacity } from "react-native";
import { Star, Award } from "lucide-react-native";
import { Badge } from "@/components/ui/badge";
import type { Database } from "@/types/database";

type MentorRow = Database["public"]["Tables"]["mentors"]["Row"];
type UserRow = Database["public"]["Tables"]["users"]["Row"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type MentorCardData = Pick<MentorRow, "firm" | "seniority" | "expertise_areas" | "rating_avg" | "session_count" | "is_top_mentor" | "is_founding_mentor"> &
  Pick<UserRow, "id" | "full_name"> &
  Pick<ProfileRow, "avatar_url">;

type Props = {
  mentor: MentorCardData;
  onPress: () => void;
  locked?: boolean;
};

export function MentorCard({ mentor, onPress, locked }: Props) {
  const initials = mentor.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={locked ? 1 : 0.7}
      className="bg-dark-card border border-dark-border rounded-2xl p-4 mb-3"
    >
      <View className="flex-row items-start gap-3">
        {/* Avatar */}
        <View className="w-12 h-12 rounded-full bg-gold/20 items-center justify-center flex-shrink-0">
          <Text className="text-gold font-bold text-base">{initials}</Text>
        </View>

        {/* Info */}
        <View className="flex-1 min-w-0">
          <View className="flex-row items-center gap-2 flex-wrap mb-0.5">
            <Text className="text-white font-semibold text-base">{mentor.full_name}</Text>
            {mentor.is_top_mentor && <Badge type="top_mentor" />}
            {mentor.is_founding_mentor && <Badge type="founding_member" />}
          </View>
          <Text className="text-gray-400 text-sm">{mentor.seniority} · {mentor.firm}</Text>

          {/* Expertise chips */}
          <View className="flex-row flex-wrap gap-1.5 mt-2">
            {mentor.expertise_areas.slice(0, 3).map((area) => (
              <View key={area} className="px-2 py-0.5 rounded-full bg-dark-muted/50 border border-dark-border">
                <Text className="text-gray-400 text-xs">{area}</Text>
              </View>
            ))}
            {mentor.expertise_areas.length > 3 && (
              <View className="px-2 py-0.5 rounded-full bg-dark-muted/50 border border-dark-border">
                <Text className="text-gray-400 text-xs">+{mentor.expertise_areas.length - 3}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Rating */}
        <View className="items-end flex-shrink-0">
          <View className="flex-row items-center gap-1 mb-1">
            <Star size={12} color="#C89B3C" fill="#C89B3C" />
            <Text className="text-gold text-sm font-semibold">
              {mentor.rating_avg > 0 ? mentor.rating_avg.toFixed(1) : "New"}
            </Text>
          </View>
          <Text className="text-gray-600 text-xs">{mentor.session_count} sessions</Text>
        </View>
      </View>

      {locked && (
        <View className="absolute inset-0 rounded-2xl bg-dark/60 items-center justify-center">
          <Text className="text-gold text-xs font-semibold">Upgrade to view</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
