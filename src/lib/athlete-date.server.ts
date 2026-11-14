import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { calendarDate } from "./dates";
export async function athleteToday(supabase: SupabaseClient<Database>, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("timezone")
    .eq("id", userId)
    .single();
  if (error) throw new Error("Could not load athlete timezone");
  return calendarDate(new Date(), data.timezone);
}
