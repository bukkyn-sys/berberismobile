// Supabase Edge Function: redeem-founding-code
// Deploy with: npx supabase functions deploy redeem-founding-code
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// Valid codes table: founding_codes (code text PK, used boolean, used_by uuid)
// Add this table to your schema.sql:
//   create table public.founding_codes (
//     code text primary key,
//     used boolean not null default false,
//     used_by uuid references public.users(id)
//   );

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  try {
    const { code, user_id } = await req.json();
    if (!code || !user_id) {
      return Response.json({ success: false, message: "Missing code or user_id" }, { status: 400 });
    }

    // Check code exists and is unused
    const { data: codeRow, error: fetchError } = await supabase
      .from("founding_codes")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (fetchError || !codeRow) {
      return Response.json({ success: false, message: "Invalid code." });
    }
    if (codeRow.used) {
      return Response.json({ success: false, message: "This code has already been used." });
    }

    // Mark code as used
    await supabase
      .from("founding_codes")
      .update({ used: true, used_by: user_id })
      .eq("code", code.toUpperCase());

    // Flag user as founding member
    await supabase
      .from("profiles")
      .update({ is_founding_member: true })
      .eq("user_id", user_id);

    // Update subscription to founding pricing
    await supabase
      .from("subscriptions")
      .update({ is_founding: true })
      .eq("user_id", user_id);

    return Response.json({ success: true, message: "Founding Member code applied!" });
  } catch (e: any) {
    return Response.json({ success: false, message: e.message }, { status: 500 });
  }
});
