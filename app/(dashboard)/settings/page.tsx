"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Clock3,
  Globe2,
  LogOut,
  Save,
  Settings,
  ShieldCheck,
  TimerReset,
  Trophy,
  UsersRound,
} from "lucide-react";

import { useCurrentMember } from "@/hooks/useCurrentMember";
import ChangePinCard from "@/components/settings/ChangePinCard";

import Avatar from "@/components/ui/Avatar";
import Card, {
  CardContent,
  CardHeader,
} from "@/components/ui/Card";
import GlowButton from "@/components/ui/GlowButton";
import PageTitle from "@/components/ui/PageTitle";
import Section from "@/components/ui/Section";
import {
  getTeamSettings,
  updateTeamSettings,
  type TeamSettings,
} from "@/services/settings/settingsService";

type AppSettings = {
  teamName: string;
  leagueName: string;
  defaultStartTime: string;
  defaultSessionDuration: number;
  timezone: string;
  notificationsEnabled: boolean;
  pollRemindersEnabled: boolean;
};

const DEFAULT_SETTINGS: AppSettings = {
  teamName: "NightmareCamp",
  leagueName: "Israeli Premier League",
  defaultStartTime: "22:00",
  defaultSessionDuration: 120,
  timezone: "Asia/Jerusalem",
  notificationsEnabled: true,
  pollRemindersEnabled: true,
};



export default function SettingsPage() {
  const router = useRouter();
  const { member } = useCurrentMember();

  const [settingsId, setSettingsId] = useState("");

const [settings, setSettings] =
    useState<AppSettings>(DEFAULT_SETTINGS);

  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<
    "success" | "error"
  >("success");

  const isAdmin = member?.role === "admin";

useEffect(() => {
  async function loadSettings() {
    try {
      const data = await getTeamSettings();

      if (!data) return;

      setSettingsId(data.id);

      setSettings({
        teamName: data.team_name,
        leagueName: data.league_name,
        defaultStartTime: data.default_start_time.slice(0, 5),
        defaultSessionDuration:
          data.default_session_duration,
        timezone: data.timezone,
        notificationsEnabled:
          data.notifications_enabled,
        pollRemindersEnabled:
          data.poll_reminders_enabled,
      });
    } catch (error) {
      console.error(error);

      setMessageType("error");
      setMessage("לא ניתן לטעון את ההגדרות");
    }
  }

  loadSettings();
}, []);

  function updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ) {
    setSettings((current) => ({
      ...current,
      [key]: value,
    }));

    setMessage("");
  }

  async function saveSettings(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");

    if (!isAdmin) {
      setMessageType("error");
      setMessage(
        "רק מנהל הקבוצה יכול לשנות הגדרות מערכת"
      );
      return;
    }

    if (!settings.teamName.trim()) {
      setMessageType("error");
      setMessage("יש להזין שם קבוצה");
      return;
    }

    if (!settings.leagueName.trim()) {
      setMessageType("error");
      setMessage("יש להזין שם ליגה");
      return;
    }

    if (
      settings.defaultSessionDuration < 30 ||
      settings.defaultSessionDuration > 600
    ) {
      setMessageType("error");
      setMessage(
        "משך הסשן חייב להיות בין 30 ל־600 דקות"
      );
      return;
    }

    setIsSaving(true);

    try {
await updateTeamSettings(settingsId, {
  team_name: settings.teamName,
  league_name: settings.leagueName,
  default_start_time: settings.defaultStartTime,
  default_session_duration:
    settings.defaultSessionDuration,
  timezone: settings.timezone,
  notifications_enabled:
    settings.notificationsEnabled,
  poll_reminders_enabled:
    settings.pollRemindersEnabled,
});

      setMessageType("success");
      setMessage("ההגדרות נשמרו בהצלחה");
    } catch (error) {
      console.error(
        "Failed to save settings:",
        error
      );

      setMessageType("error");
      setMessage("שמירת ההגדרות נכשלה");
    } finally {
      setIsSaving(false);
    }
  }

async function resetSettings() {
  const approved = window.confirm(
    "להחזיר את כל ההגדרות לברירת המחדל?"
  );

  if (!approved) {
    return;
  }

  if (!isAdmin) {
    setMessageType("error");
    setMessage("רק מנהל הקבוצה יכול לשנות הגדרות");
    return;
  }

  if (!settingsId) {
    setMessageType("error");
    setMessage("לא נמצאה רשומת הגדרות לעדכון");
    return;
  }

  setIsSaving(true);
  setMessage("");

  try {
    await updateTeamSettings(settingsId, {
      team_name: DEFAULT_SETTINGS.teamName,
      league_name: DEFAULT_SETTINGS.leagueName,
      default_start_time:
        DEFAULT_SETTINGS.defaultStartTime,
      default_session_duration:
        DEFAULT_SETTINGS.defaultSessionDuration,
      timezone: DEFAULT_SETTINGS.timezone,
      notifications_enabled:
        DEFAULT_SETTINGS.notificationsEnabled,
      poll_reminders_enabled:
        DEFAULT_SETTINGS.pollRemindersEnabled,
    });

    setSettings(DEFAULT_SETTINGS);

    setMessageType("success");
    setMessage("ההגדרות הוחזרו לברירת המחדל");
  } catch (error) {
    console.error("Reset settings error:", error);

    setMessageType("error");
    setMessage("איפוס ההגדרות נכשל");
  } finally {
    setIsSaving(false);
  }
}

  function logout() {
    localStorage.removeItem("teamSyncMember");
    router.replace("/login");
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-10">
      <PageTitle
        title="הגדרות"
        subtitle="ניהול פרטי הקבוצה, ברירות מחדל והתראות"
        icon={<Settings size={26} />}
      />

      {message && (
        <div
          role="alert"
          className={`mb-6 rounded-2xl border px-4 py-3 text-sm ${
            messageType === "success"
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/20 bg-red-500/10 text-red-300"
          }`}
        >
          {message}
        </div>
      )}

      <Section
        title="המשתמש המחובר"
        subtitle="פרטי החשבון וההרשאות שלך"
      >
        <Section
  title="אבטחת החשבון"
  subtitle="שינוי הקוד האישי המשמש לכניסה למערכת"
  className="mt-10"
>
  <ChangePinCard phone={member?.phone} />
</Section>

        <Card variant="purple" glow padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar
                name={
                  member?.fullName ??
                  "חבר קבוצה"
                }
                size="lg"
                status="online"
              />

              <div>
                <h2 className="text-xl font-black text-white">
                  {member?.fullName ??
                    "חבר קבוצה"}
                </h2>

                <p
                  className="mt-1 text-sm text-white/45"
                  dir="ltr"
                >
                  {member?.phone ?? ""}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <ShieldCheck
                    size={16}
                    className={
                      isAdmin
                        ? "text-amber-300"
                        : "text-purple-300"
                    }
                  />

                  <span className="text-sm font-bold text-white/60">
                    {isAdmin
                      ? "מנהל הקבוצה"
                      : "שחקן הקבוצה"}
                  </span>
                </div>
              </div>
            </div>

            <GlowButton
              type="button"
              variant="danger"
              leftIcon={<LogOut size={18} />}
              onClick={logout}
            >
              התנתקות
            </GlowButton>
          </div>
        </Card>
      </Section>

      <form
        onSubmit={saveSettings}
        className="mt-10 space-y-10"
      >
        <Section
          title="פרטי הקבוצה"
          subtitle="השם והליגה שיוצגו ברחבי המערכת"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card padding="lg">
              <CardHeader
                title="שם הקבוצה"
                description="השם שיופיע בכותרות ובמיתוג"
                icon={<UsersRound size={22} />}
              />

              <CardContent>
                <label
                  htmlFor="teamName"
                  className="mb-2 block text-sm font-bold text-white/60"
                >
                  שם הקבוצה
                </label>

                <input
                  id="teamName"
                  type="text"
                  value={settings.teamName}
                  disabled={!isAdmin}
                  onChange={(event) =>
                    updateSetting(
                      "teamName",
                      event.target.value
                    )
                  }
                  className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-white outline-none transition focus:border-purple-400/50 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader
                title="שם הליגה"
                description="שם התחרות או המסגרת הפעילה"
                icon={<Trophy size={22} />}
              />

              <CardContent>
                <label
                  htmlFor="leagueName"
                  className="mb-2 block text-sm font-bold text-white/60"
                >
                  ליגה
                </label>

                <input
                  id="leagueName"
                  type="text"
                  value={settings.leagueName}
                  disabled={!isAdmin}
                  onChange={(event) =>
                    updateSetting(
                      "leagueName",
                      event.target.value
                    )
                  }
                  className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-white outline-none transition focus:border-purple-400/50 focus:ring-4 focus:ring-purple-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          title="ברירות מחדל"
          subtitle="הערכים שיופיעו אוטומטית בעת פתיחת סקר חדש"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            <Card padding="lg">
              <CardHeader
                title="שעת התחלה"
                description="שעת ברירת המחדל לסשן"
                icon={<Clock3 size={22} />}
              />

              <CardContent>
                <label
                  htmlFor="defaultStartTime"
                  className="mb-2 block text-sm font-bold text-white/60"
                >
                  שעה
                </label>

                <input
                  id="defaultStartTime"
                  type="time"
                  value={
                    settings.defaultStartTime
                  }
                  disabled={!isAdmin}
                  onChange={(event) =>
                    updateSetting(
                      "defaultStartTime",
                      event.target.value
                    )
                  }
                  className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-white outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader
                title="משך סשן"
                description="משך ברירת מחדל בדקות"
                icon={<TimerReset size={22} />}
              />

              <CardContent>
                <label
                  htmlFor="sessionDuration"
                  className="mb-2 block text-sm font-bold text-white/60"
                >
                  מספר דקות
                </label>

                <input
                  id="sessionDuration"
                  type="number"
                  min={30}
                  max={600}
                  step={15}
                  value={
                    settings.defaultSessionDuration
                  }
                  disabled={!isAdmin}
                  onChange={(event) =>
                    updateSetting(
                      "defaultSessionDuration",
                      Number(event.target.value)
                    )
                  }
                  className="h-13 w-full rounded-2xl border border-white/10 bg-black/25 px-4 text-white outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </CardContent>
            </Card>

            <Card padding="lg">
              <CardHeader
                title="אזור זמן"
                description="התאמת תאריכים ושעות"
                icon={<Globe2 size={22} />}
              />

              <CardContent>
                <label
                  htmlFor="timezone"
                  className="mb-2 block text-sm font-bold text-white/60"
                >
                  אזור זמן
                </label>

                <select
                  id="timezone"
                  value={settings.timezone}
                  disabled={!isAdmin}
                  onChange={(event) =>
                    updateSetting(
                      "timezone",
                      event.target.value
                    )
                  }
                  className="h-13 w-full rounded-2xl border border-white/10 bg-[#10131a] px-4 text-white outline-none transition focus:border-purple-400/50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="Asia/Jerusalem">
                    ישראל — Asia/Jerusalem
                  </option>

                  <option value="Europe/London">
                    בריטניה — Europe/London
                  </option>

                  <option value="Europe/Athens">
                    יוון — Europe/Athens
                  </option>

                  <option value="UTC">
                    UTC
                  </option>
                </select>
              </CardContent>
            </Card>
          </div>
        </Section>

        <Section
          title="התראות"
          subtitle="העדפות לקבלת עדכונים ותזכורות"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <SettingToggle
              title="התראות מערכת"
              description="קבלת עדכונים על סקרים וסשנים חדשים"
              icon={<Bell size={22} />}
              checked={
                settings.notificationsEnabled
              }
              disabled={!isAdmin}
              onChange={(checked) =>
                updateSetting(
                  "notificationsEnabled",
                  checked
                )
              }
            />

            <SettingToggle
              title="תזכורות לסקר"
              description="הצגת תזכורת כאשר עדיין לא מילאת זמינות"
              icon={<Clock3 size={22} />}
              checked={
                settings.pollRemindersEnabled
              }
              disabled={!isAdmin}
              onChange={(checked) =>
                updateSetting(
                  "pollRemindersEnabled",
                  checked
                )
              }
            />
          </div>
        </Section>

        {!isAdmin && (
          <Card
            variant="gold"
            padding="lg"
          >
            <div className="flex items-start gap-4">
              <ShieldCheck
                size={24}
                className="mt-0.5 shrink-0 text-amber-300"
              />

              <div>
                <h3 className="font-black text-white">
                  הרשאת צפייה בלבד
                </h3>

                <p className="mt-2 text-sm leading-7 text-white/45">
                  רק מנהל הקבוצה יכול לעדכן את
                  הגדרות המערכת. עדיין ניתן לצפות
                  בהגדרות הפעילות.
                </p>
              </div>
            </div>
          </Card>
        )}

        {isAdmin && (
          <div className="flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-end">
            <GlowButton
              type="button"
              variant="ghost"
              leftIcon={
                <TimerReset size={18} />
              }
              onClick={resetSettings}
            >
              החזרה לברירת מחדל
            </GlowButton>

            <GlowButton
              type="submit"
              variant="primary"
              loading={isSaving}
              leftIcon={<Save size={18} />}
            >
              שמירת הגדרות
            </GlowButton>
          </div>
        )}
      </form>
    </main>
  );
}

function SettingToggle({
  title,
  description,
  icon,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  checked: boolean;
  disabled?: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <Card padding="lg">
      <div className="flex items-center justify-between gap-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-300">
            {icon}
          </div>

          <div>
            <h3 className="font-black text-white">
              {title}
            </h3>

            <p className="mt-1 text-sm leading-6 text-white/40">
              {description}
            </p>
          </div>
        </div>

        <button
          type="button"
          role="switch"
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative h-8 w-14 shrink-0 rounded-full transition ${
            checked
              ? "bg-purple-500"
              : "bg-white/10"
          } disabled:cursor-not-allowed disabled:opacity-40`}
        >
          <span
            className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow transition ${
              checked
                ? "right-7"
                : "right-1"
            }`}
          />
        </button>
      </div>
    </Card>
  );
}