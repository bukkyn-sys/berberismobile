import { View, Text, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Lock, Zap } from "lucide-react-native";

interface UpgradePromptProps {
  feature: string;
  description?: string;
  /** Defaults to pushing /pricing */
  onUpgrade?: () => void;
}

export function UpgradePrompt({ feature, description, onUpgrade }: UpgradePromptProps) {
  function handleUpgrade() {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/pricing");
    }
  }

  return (
    <View className="mx-4 my-4 rounded-2xl border border-gold/30 bg-gold/5 p-5 items-center">
      <View className="w-12 h-12 rounded-full bg-gold/15 items-center justify-center mb-3">
        <Lock size={22} color="#C89B3C" />
      </View>
      <Text className="text-white font-bold text-base mb-1 text-center">
        Unlock {feature}
      </Text>
      {description ? (
        <Text className="text-gray-400 text-sm text-center mb-4 leading-relaxed">
          {description}
        </Text>
      ) : (
        <Text className="text-gray-400 text-sm text-center mb-4 leading-relaxed">
          Upgrade to Standard or Ultra to access this feature.
        </Text>
      )}
      <TouchableOpacity
        onPress={handleUpgrade}
        className="bg-gold rounded-xl py-3 px-6 flex-row items-center gap-2"
      >
        <Zap size={15} color="#000" />
        <Text className="text-black font-bold text-sm">View plans</Text>
      </TouchableOpacity>
    </View>
  );
}
