"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import {
  User,
  Wallet,
  Settings2,
  Shield,
  Github,
  Twitter,
  Globe,
  Copy,
  Check,
  Download,
  Lock,
  Unlock,
  Trash2,
  Bell,
  BellOff,
} from "lucide-react";
import { userProfile } from "@/data/profile";

const MOCK_WALLET = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

type Tab = "profile" | "account" | "preferences" | "privacy";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account", icon: Wallet },
  { id: "preferences", label: "Preferences", icon: Settings2 },
  { id: "privacy", label: "Privacy", icon: Shield },
];

/* ── Toggle Switch ── */

function Toggle({
  enabled,
  onToggle,
}: {
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
        enabled ? "bg-primary" : "bg-border"
      }`}
    >
      <span
        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${
          enabled ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

/* ── Section: Profile ── */

interface ProfileForm {
  name: string;
  username: string;
  bio: string;
  github: string;
  twitter: string;
  website: string;
}

function ProfileSection({
  form,
  setField,
  onSave,
  saved,
}: {
  form: ProfileForm;
  setField: (k: keyof ProfileForm, v: string) => void;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* Avatar preview */}
      <div className="flex items-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xl font-bold border border-primary/20">
          {form.name
            ? form.name
                .split(" ")
                .map((w) => w[0])
                .join("")
                .toUpperCase()
                .slice(0, 2)
            : "?"}
        </div>
        <div>
          <p className="text-sm font-medium">{form.name || "Your Name"}</p>
          <p className="text-xs text-muted-foreground/60">
            @{form.username || "username"}
          </p>
        </div>
      </div>

      {/* Name */}
      <FieldGroup label="Display Name">
        <input
          value={form.name}
          onChange={(e) => setField("name", e.target.value)}
          className="w-full rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/40 transition-colors"
        />
      </FieldGroup>

      {/* Username */}
      <FieldGroup label="Username">
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground/50">
            @
          </span>
          <input
            value={form.username}
            onChange={(e) => setField("username", e.target.value)}
            className="w-full rounded-lg border border-border/40 bg-transparent pl-7 pr-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/40 transition-colors"
          />
        </div>
      </FieldGroup>

      {/* Bio */}
      <FieldGroup label="Bio">
        <textarea
          value={form.bio}
          onChange={(e) => setField("bio", e.target.value)}
          rows={3}
          className="w-full rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/40 transition-colors resize-none"
        />
      </FieldGroup>

      {/* Social Links */}
      <FieldGroup label="Social Links">
        <div className="space-y-2">
          <SocialInput
            icon={Github}
            value={form.github}
            onChange={(v) => setField("github", v)}
            placeholder="https://github.com/username"
          />
          <SocialInput
            icon={Twitter}
            value={form.twitter}
            onChange={(v) => setField("twitter", v)}
            placeholder="https://twitter.com/username"
          />
          <SocialInput
            icon={Globe}
            value={form.website}
            onChange={(v) => setField("website", v)}
            placeholder="https://yoursite.dev"
          />
        </div>
      </FieldGroup>

      {/* Save */}
      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onSave}
          className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
        >
          Save Changes
        </button>
        {saved && (
          <span className="text-xs text-primary flex items-center gap-1">
            <Check className="size-3" />
            Saved!
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Section: Account ── */

function AccountSection() {
  const [copied, setCopied] = useState(false);
  const truncated = MOCK_WALLET.slice(0, 4) + "..." + MOCK_WALLET.slice(-4);

  function handleCopy() {
    navigator.clipboard.writeText(MOCK_WALLET);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* Connected Wallet */}
      <FieldGroup label="Connected Wallet">
        <div className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2.5">
          <Wallet className="size-4 text-muted-foreground/60" />
          <span className="text-sm font-mono flex-1">{truncated}</span>
          <button
            onClick={handleCopy}
            className="text-muted-foreground/60 hover:text-foreground transition-colors"
          >
            {copied ? (
              <Check className="size-3.5 text-primary" />
            ) : (
              <Copy className="size-3.5" />
            )}
          </button>
        </div>
      </FieldGroup>

      {/* Email */}
      <FieldGroup
        label="Email"
        description="For notifications and account recovery"
      >
        <input
          type="email"
          placeholder="Add your email"
          className="w-full rounded-lg border border-border/40 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/40 transition-colors"
        />
      </FieldGroup>

      {/* Connected Accounts */}
      <FieldGroup label="Connected Accounts">
        <div className="space-y-2">
          <div className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2.5">
            <Github className="size-4 text-muted-foreground/60" />
            <span className="text-sm flex-1">GitHub</span>
            <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              Connected
            </span>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border/40 px-3 py-2.5">
            <svg
              className="size-4 text-muted-foreground/60"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
            <span className="text-sm flex-1">Google</span>
            <button className="text-[10px] font-medium text-muted-foreground/70 border border-border/40 px-2 py-0.5 rounded-full hover:text-foreground transition-colors">
              Connect
            </button>
          </div>
        </div>
      </FieldGroup>
    </div>
  );
}

/* ── Section: Preferences ── */

function PreferencesSection() {
  const { theme, setTheme } = useTheme();
  const [notifications, setNotifications] = useState({
    courseUpdates: true,
    achievements: true,
    streakReminders: false,
  });

  const themes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "system", label: "System" },
  ];

  return (
    <div className="space-y-6">
      {/* Theme */}
      <FieldGroup label="Theme">
        <div className="flex gap-0.5 rounded-lg bg-muted/30 p-1 w-fit">
          {themes.map((t) => (
            <button
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={`px-4 py-1.5 rounded-md text-xs font-medium transition-colors ${
                theme === t.value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FieldGroup>

      {/* Language */}
      <FieldGroup label="Language" description="More languages coming soon">
        <div className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2.5 w-fit">
          <span className="text-sm">English</span>
          <span className="text-[10px] text-muted-foreground/50 bg-muted/30 px-1.5 py-0.5 rounded">
            Only
          </span>
        </div>
      </FieldGroup>

      {/* Notifications */}
      <FieldGroup label="Notifications">
        <div className="space-y-3">
          <NotificationRow
            icon={Bell}
            title="Course Updates"
            description="New lessons, course completions"
            enabled={notifications.courseUpdates}
            onToggle={() =>
              setNotifications((n) => ({
                ...n,
                courseUpdates: !n.courseUpdates,
              }))
            }
          />
          <NotificationRow
            icon={Bell}
            title="Achievement Alerts"
            description="New badges and milestones"
            enabled={notifications.achievements}
            onToggle={() =>
              setNotifications((n) => ({
                ...n,
                achievements: !n.achievements,
              }))
            }
          />
          <NotificationRow
            icon={notifications.streakReminders ? Bell : BellOff}
            title="Streak Reminders"
            description="Daily reminders to maintain your streak"
            enabled={notifications.streakReminders}
            onToggle={() =>
              setNotifications((n) => ({
                ...n,
                streakReminders: !n.streakReminders,
              }))
            }
          />
        </div>
      </FieldGroup>
    </div>
  );
}

/* ── Section: Privacy ── */

function PrivacySection() {
  const [isPublic, setIsPublic] = useState(userProfile.isPublic);

  return (
    <div className="space-y-6">
      {/* Profile Visibility */}
      <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3.5">
        <div className="flex items-center gap-3">
          {isPublic ? (
            <Unlock className="size-4 text-primary" />
          ) : (
            <Lock className="size-4 text-muted-foreground/60" />
          )}
          <div>
            <p className="text-sm font-medium">Profile Visibility</p>
            <p className="text-[11px] text-muted-foreground/60">
              {isPublic
                ? "Your profile is visible to everyone"
                : "Only you can see your profile"}
            </p>
          </div>
        </div>
        <Toggle enabled={isPublic} onToggle={() => setIsPublic(!isPublic)} />
      </div>

      {/* Data Export */}
      <FieldGroup
        label="Data Export"
        description="Download all your learning data, achievements, and credentials"
      >
        <button className="flex items-center gap-2 rounded-lg border border-border/40 px-3 py-2 text-sm text-muted-foreground/70 hover:text-foreground transition-colors">
          <Download className="size-3.5" />
          Export Data
        </button>
      </FieldGroup>

      {/* Danger Zone */}
      <div className="pt-4 border-t border-border/20">
        <p className="text-sm font-medium text-destructive">Danger Zone</p>
        <p className="text-[11px] text-muted-foreground/60 mt-1">
          Permanently delete your account and all associated data. This action
          cannot be undone.
        </p>
        <button className="mt-3 flex items-center gap-2 rounded-lg border border-destructive/30 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors">
          <Trash2 className="size-3.5" />
          Delete Account
        </button>
      </div>
    </div>
  );
}

/* ── Shared Components ── */

function FieldGroup({
  label,
  description,
  children,
}: {
  label: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      {description && (
        <p className="text-[11px] text-muted-foreground/60 mt-0.5">
          {description}
        </p>
      )}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function SocialInput({
  icon: Icon,
  value,
  onChange,
  placeholder,
}: {
  icon: typeof Github;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <Icon className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground/50" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-border/40 bg-transparent pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:border-muted-foreground/40 transition-colors"
      />
    </div>
  );
}

function NotificationRow({
  icon: Icon,
  title,
  description,
  enabled,
  onToggle,
}: {
  icon: typeof Bell;
  title: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border/40 px-4 py-3">
      <div className="flex items-center gap-3">
        <Icon className="size-4 text-muted-foreground/60" />
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-[10px] text-muted-foreground/60">{description}</p>
        </div>
      </div>
      <Toggle enabled={enabled} onToggle={onToggle} />
    </div>
  );
}

/* ── Page ── */

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>("profile");
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    name: userProfile.name,
    username: userProfile.username,
    bio: userProfile.bio,
    github: userProfile.socialLinks.github || "",
    twitter: userProfile.socialLinks.twitter || "",
    website: userProfile.socialLinks.website || "",
  });

  function setField(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function handleSave() {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-mesh animate-drift-2" />

      <div className="relative z-10 mx-auto max-w-4xl px-6 pt-28 pb-20">
        {/* Header */}
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground/60 mt-1">
          Manage your account and preferences
        </p>

        <div className="mt-8 flex flex-col sm:flex-row gap-6">
          {/* Tab Nav — horizontal on mobile, vertical sidebar on desktop */}
          <nav className="flex sm:flex-col gap-1 sm:w-48 shrink-0 overflow-x-auto sm:overflow-visible pb-2 sm:pb-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm whitespace-nowrap transition-colors ${
                  activeTab === tab.id
                    ? "bg-muted/30 text-foreground font-medium"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                <tab.icon className="size-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="rounded-xl border border-border/30 p-6">
              {activeTab === "profile" && (
                <ProfileSection
                  form={form}
                  setField={setField}
                  onSave={handleSave}
                  saved={saved}
                />
              )}
              {activeTab === "account" && <AccountSection />}
              {activeTab === "preferences" && <PreferencesSection />}
              {activeTab === "privacy" && <PrivacySection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
