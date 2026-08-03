import { supabase } from "@/lib/supabase";

export type TeamSettings = {
  id: string;
  team_name: string;
  league_name: string;
  default_start_time: string;
  default_session_duration: number;
  timezone: string;
  notifications_enabled: boolean;
  poll_reminders_enabled: boolean;
  updated_at: string;
};

export async function getTeamSettings(): Promise<TeamSettings | null> {
  const { data, error } = await supabase
    .from("team_settings")
    .select(
      `
        id,
        team_name,
        league_name,
        default_start_time,
        default_session_duration,
        timezone,
        notifications_enabled,
        poll_reminders_enabled,
        updated_at
      `
    )
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return (data ?? null) as TeamSettings | null;
}

export async function updateTeamSettings(
  id: string,
  settings: Omit<TeamSettings, "id" | "updated_at">
) {
  const { data, error } = await supabase
    .from("team_settings")
    .update({
      team_name: settings.team_name,
      league_name: settings.league_name,
      default_start_time: settings.default_start_time,
      default_session_duration: settings.default_session_duration,
      timezone: settings.timezone,
      notifications_enabled: settings.notifications_enabled,
      poll_reminders_enabled: settings.poll_reminders_enabled,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as TeamSettings;
}