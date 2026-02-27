import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/stores/auth-store";
import type { Database } from "@/types/database";

type SubscriptionRow = Database["public"]["Tables"]["subscriptions"]["Row"];

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionRow | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .single()
      .then(({ data }) => {
        setSubscription(data);
        setLoading(false);
      });
  }, [user]);

  const tier = subscription?.tier ?? "free";
  const isActive = subscription?.status === "active";

  return {
    subscription,
    loading,
    tier,
    isFree: tier === "free" || !isActive,
    isStandard: (tier === "standard" || tier === "ultra") && isActive,
    isUltra: tier === "ultra" && isActive,
    isPaid: (tier === "standard" || tier === "ultra") && isActive,
    isStudent: subscription?.is_student ?? false,
    isFounding: subscription?.is_founding ?? false,
  };
}
