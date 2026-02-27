import { View, Text } from "react-native";
import { Star, Shield, GraduationCap } from "lucide-react-native";

type BadgeType = "top_mentor" | "founding_member" | "student";

type Props = {
  type: BadgeType;
};

const CONFIG = {
  top_mentor: { label: "Top Mentor", icon: Star, color: "#C89B3C", bg: "bg-gold/15" },
  founding_member: { label: "Founding Member", icon: Shield, color: "#8B5CF6", bg: "bg-purple-500/15" },
  student: { label: "Student", icon: GraduationCap, color: "#60A5FA", bg: "bg-blue-500/15" },
};

export function Badge({ type }: Props) {
  const { label, icon: Icon, color, bg } = CONFIG[type];
  return (
    <View className={`flex-row items-center gap-1 px-2 py-0.5 rounded-full ${bg}`}>
      <Icon size={11} color={color} />
      <Text style={{ color, fontSize: 11, fontWeight: "600" }}>{label}</Text>
    </View>
  );
}
