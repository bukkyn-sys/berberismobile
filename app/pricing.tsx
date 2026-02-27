import {
  View, Text, ScrollView, SafeAreaView,
  TouchableOpacity, Linking, ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ArrowLeft, CheckCircle, Zap, Crown, GraduationCap } from "lucide-react-native";
import { useAuth } from "@/stores/auth-store";
import { useSubscription } from "@/hooks/use-subscription";

type BillingInterval = "monthly" | "annual";

const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL ?? "https://berberiscapital.com";

const PLANS = [
  {
    id: "free",
    name: "Free",
    monthlyPrice: "£0",
    annualMonthly: null,
    annualTotal: null,
    description: "Get started with the basics.",
    features: [
      "Browse mentor directory",
      "Practice Mode (random Q&A)",
      "20 flashcard reviews/day",
      "Lateral moves feed (browse only)",
    ],
    color: "#9CA3AF",
  },
  {
    id: "standard",
    name: "Standard",
    monthlyPrice: "£29.99",
    annualMonthly: "£20.75",
    annualTotal: "£249",
    description: "Group mentorship + full prep suite.",
    features: [
      "Group mentorship (1:3) — 3 sessions/month",
      "Mentor matching algorithm",
      "Drill Mode (timed, scored)",
      "Unlimited flashcard review",
      "Lateral move filters + alerts",
      "Drill progress tracking",
    ],
    popular: true,
    color: "#C89B3C",
  },
  {
    id: "ultra",
    name: "Ultra",
    monthlyPrice: "£69.99",
    annualMonthly: "£49.92",
    annualTotal: "£599",
    description: "1:1 mentorship with top professionals.",
    features: [
      "1:1 mentorship — 8 sessions/month",
      "Priority matching with Top Mentors",
      "Everything in Standard",
    ],
    color: "#A78BFA",
  },
] as const;

export default function PricingScreen() {
  const { user } = useAuth();
  const { tier, isStudent, isFounding } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<BillingInterval>("monthly");
  const [opening, setOpening] = useState(false);

  const currentTier: string = tier ?? "free";

  async function handleUpgrade(planId: string) {
    if (!user || planId === currentTier) return;
    setOpening(true);
    try {
      const url = `${WEB_URL}/settings/billing?userId=${user.id}&plan=${planId}&annual=${billingInterval === "annual"}`;
      await Linking.openURL(url);
    } catch {
      // If the URL fails to open, silently ignore (user can retry)
    } finally {
      setOpening(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-dark">
      {/* Header */}
      <View className="flex-row items-center px-4 pt-4 pb-3">
        <TouchableOpacity onPress={() => router.back()} className="mr-3">
          <ArrowLeft size={22} color="#9CA3AF" />
        </TouchableOpacity>
        <Text className="text-white font-bold text-lg flex-1">Subscription & Billing</Text>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 40 }}>
        {/* Current plan chip */}
        <View className="flex-row items-center gap-2 mb-6">
          <View className="px-3 py-1 rounded-full bg-gold/20 border border-gold/30">
            <Text className="text-gold text-xs font-semibold capitalize">
              Current plan: {currentTier}
            </Text>
          </View>
          {isFounding && (
            <View className="px-3 py-1 rounded-full bg-gold/20 border border-gold/30">
              <Text className="text-gold text-xs font-semibold">Founding Member</Text>
            </View>
          )}
          {isStudent && (
            <View className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
              <Text className="text-blue-400 text-xs font-semibold">Student pricing</Text>
            </View>
          )}
        </View>

        {/* Monthly / Annual toggle */}
        <View className="flex-row justify-center gap-2 mb-6">
          {(["monthly", "annual"] as const).map((iv) => (
            <TouchableOpacity
              key={iv}
              onPress={() => setBillingInterval(iv)}
              className={`px-5 py-2 rounded-full border ${
                billingInterval === iv
                  ? "bg-gold border-gold"
                  : "border-dark-border bg-dark-card"
              }`}
            >
              <Text
                className={`text-sm font-semibold capitalize ${
                  billingInterval === iv ? "text-black" : "text-gray-400"
                }`}
              >
                {iv}
                {iv === "annual" ? "  Save 30%" : ""}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Student pricing note */}
        {isStudent && (
          <View className="flex-row items-center gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-4">
            <GraduationCap size={16} color="#60A5FA" />
            <Text className="text-blue-400 text-sm flex-1">
              Student pricing active — Standard £19.99/mo · Ultra £49.99/mo
            </Text>
          </View>
        )}

        {/* Plan cards */}
        {PLANS.map((plan) => {
          const isCurrent = plan.id === currentTier;
          const displayPrice =
            billingInterval === "annual" && plan.annualMonthly
              ? plan.annualMonthly
              : plan.monthlyPrice;

          return (
            <View
              key={plan.id}
              className={`mb-4 rounded-3xl border p-5 ${
                plan.popular
                  ? "border-gold/50 bg-gold/5"
                  : "border-dark-border bg-dark-card"
              }`}
            >
              {plan.popular && (
                <View className="absolute -top-3 left-5">
                  <View className="bg-gold px-3 py-0.5 rounded-full">
                    <Text className="text-black text-[10px] font-bold">Most popular</Text>
                  </View>
                </View>
              )}

              {/* Plan header */}
              <View className="flex-row items-center justify-between mb-1">
                <View className="flex-row items-center gap-2">
                  {plan.id === "standard" && <Zap size={16} color="#C89B3C" />}
                  {plan.id === "ultra" && <Crown size={16} color="#A78BFA" />}
                  <Text className="text-white font-bold text-base">{plan.name}</Text>
                  {isCurrent && (
                    <View className="px-2 py-0.5 rounded-full bg-green-500/20">
                      <Text className="text-green-400 text-[10px] font-semibold">Active</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Price */}
              <View className="flex-row items-end gap-1 mb-1">
                <Text className="text-white font-bold text-2xl">{displayPrice}</Text>
                <Text className="text-gray-500 text-sm mb-0.5">/month</Text>
              </View>
              {billingInterval === "annual" && plan.annualTotal && (
                <Text className="text-gold text-xs mb-1">
                  billed {plan.annualTotal}/year
                </Text>
              )}
              <Text className="text-gray-400 text-xs mb-4">{plan.description}</Text>

              {/* Features */}
              <View className="gap-2 mb-5">
                {plan.features.map((f) => (
                  <View key={f} className="flex-row items-start gap-2">
                    <CheckCircle size={14} color="#4ADE80" style={{ marginTop: 1 }} />
                    <Text className="text-gray-300 text-sm flex-1">{f}</Text>
                  </View>
                ))}
              </View>

              {/* CTA */}
              <TouchableOpacity
                onPress={() => handleUpgrade(plan.id)}
                disabled={isCurrent || opening}
                className={`rounded-xl py-3.5 items-center ${
                  isCurrent
                    ? "bg-dark-border"
                    : plan.id === "ultra"
                    ? "bg-purple-600"
                    : plan.id === "standard"
                    ? "bg-gold"
                    : "bg-dark-border"
                }`}
              >
                {opening ? (
                  <ActivityIndicator color={isCurrent ? "#9CA3AF" : "#000"} />
                ) : (
                  <Text
                    className={`font-bold text-sm ${
                      isCurrent
                        ? "text-gray-500"
                        : plan.id === "ultra"
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {isCurrent
                      ? "Current plan"
                      : plan.id === "free"
                      ? "Downgrade to Free"
                      : `Upgrade to ${plan.name}`}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          );
        })}

        {/* Founding Member callout */}
        {!isFounding && (
          <View className="rounded-2xl border border-gold/20 bg-gold/5 p-4 mb-4">
            <Text className="text-white font-semibold text-sm mb-1">Founding Member</Text>
            <Text className="text-gray-400 text-xs leading-relaxed">
              Have a Founding Member code? Redeem it on the next screen to lock in Standard at £19.99/month for life. 120 spots — first come, first served.
            </Text>
          </View>
        )}

        {/* Student verification CTA */}
        {!isStudent && (
          <TouchableOpacity
            onPress={() => router.push("/profile/student-verify")}
            className="flex-row items-center gap-2 p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 mb-4"
          >
            <GraduationCap size={18} color="#60A5FA" />
            <View className="flex-1">
              <Text className="text-blue-400 text-sm font-semibold">Student? Get 33% off</Text>
              <Text className="text-gray-500 text-xs mt-0.5">Verify your .ac.uk email →</Text>
            </View>
          </TouchableOpacity>
        )}

        {/* Manage existing subscription */}
        {currentTier !== "free" && (
          <TouchableOpacity
            onPress={async () => {
              if (!user) return;
              setOpening(true);
              try {
                await Linking.openURL(`${WEB_URL}/settings/billing?userId=${user.id}`);
              } finally {
                setOpening(false);
              }
            }}
            className="border border-dark-border rounded-xl py-3 items-center"
          >
            <Text className="text-gray-400 text-sm">Manage subscription & invoices</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
