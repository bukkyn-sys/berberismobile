// Supabase Edge Function: send-push-notification
// Deploy with: npx supabase functions deploy send-push-notification
// Call from other functions or Supabase triggers via supabase.functions.invoke()

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

interface PushPayload {
  user_ids: string[];    // Supabase user IDs to notify
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { user_ids, title, body, data }: PushPayload = await req.json();
    if (!user_ids?.length || !title || !body) {
      return Response.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    // Fetch push tokens for the given user IDs
    const { data: users } = await supabase
      .from("users")
      .select("push_token")
      .in("id", user_ids)
      .not("push_token", "is", null);

    const tokens = (users ?? []).map((u: any) => u.push_token).filter(Boolean);
    if (tokens.length === 0) {
      return Response.json({ success: true, sent: 0, message: "No push tokens found" });
    }

    // Send via Expo Push API
    const messages = tokens.map((token: string) => ({
      to: token,
      title,
      body,
      data: data ?? {},
      sound: "default",
      priority: "high",
    }));

    const response = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Accept": "application/json" },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return Response.json({ success: true, sent: tokens.length, result });
  } catch (e: any) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
});
