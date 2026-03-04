"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  useSession,
  signIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import type { UserProfile } from "@/types";

const STORAGE_KEY = "academy_user";
const ACTIVE_WALLET_KEY = "academy_active_wallet";
const LINKED_PROVIDERS_KEY = "academy_linked_providers";

/* ── Linked providers store (survives session changes) ── */

interface LinkedProviders {
  githubId: string | null;
  googleId: string | null;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}

function getLinkedProviders(): LinkedProviders {
  if (typeof window === "undefined")
    return {
      githubId: null,
      googleId: null,
      email: null,
      name: null,
      avatarUrl: null,
    };
  try {
    const raw = localStorage.getItem(LINKED_PROVIDERS_KEY);
    if (!raw)
      return {
        githubId: null,
        googleId: null,
        email: null,
        name: null,
        avatarUrl: null,
      };
    return JSON.parse(raw);
  } catch {
    return {
      githubId: null,
      googleId: null,
      email: null,
      name: null,
      avatarUrl: null,
    };
  }
}

function saveLinkedProvider(
  provider: string,
  accountId: string,
  extra?: {
    email?: string | null;
    name?: string | null;
    image?: string | null;
  },
): void {
  if (typeof window === "undefined") return;
  const current = getLinkedProviders();
  if (provider === "github") current.githubId = accountId;
  if (provider === "google") current.googleId = accountId;
  if (extra?.email) current.email = extra.email;
  if (extra?.name) current.name = extra.name;
  if (extra?.image) current.avatarUrl = extra.image;
  localStorage.setItem(LINKED_PROVIDERS_KEY, JSON.stringify(current));
}

function removeLinkedProvider(provider: "github" | "google"): void {
  if (typeof window === "undefined") return;
  const current = getLinkedProviders();
  if (provider === "github") current.githubId = null;
  if (provider === "google") current.googleId = null;
  localStorage.setItem(LINKED_PROVIDERS_KEY, JSON.stringify(current));
}

function clearLinkedProviders(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(LINKED_PROVIDERS_KEY);
}

/* ── User persistence ── */

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  updateProfile: (updates: Partial<UserProfile>) => void;
  signOut: () => void;
  linkGoogle: () => void;
  linkGithub: () => void;
  unlinkProvider: (provider: "github" | "google") => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  updateProfile: () => {},
  signOut: () => {},
  linkGoogle: () => {},
  linkGithub: () => {},
  unlinkProvider: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

function loadUser(key: string): UserProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
    return all[key] ?? null;
  } catch {
    return null;
  }
}

function saveUser(user: UserProfile): void {
  if (typeof window === "undefined") return;
  const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  const key = user.walletAddress ?? user.id;
  all[key] = user;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}

function getStoredWallet(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_WALLET_KEY);
}

function setStoredWallet(address: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_WALLET_KEY, address);
}

function clearStoredWallet(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACTIVE_WALLET_KEY);
}

function applyLinkedProviders(user: UserProfile): UserProfile {
  const linked = getLinkedProviders();
  let changed = false;
  const updates: Partial<UserProfile> = {};

  if (linked.githubId && !user.githubId) {
    updates.githubId = linked.githubId;
    changed = true;
  }
  if (linked.googleId && !user.googleId) {
    updates.googleId = linked.googleId;
    changed = true;
  }
  if (linked.email && !user.email) {
    updates.email = linked.email;
    changed = true;
  }
  if (linked.name && user.name.startsWith("Learner ")) {
    updates.name = linked.name;
    changed = true;
  }
  if (linked.avatarUrl && !user.avatarUrl) {
    updates.avatarUrl = linked.avatarUrl;
    changed = true;
  }

  if (changed) {
    const updated = { ...user, ...updates };
    saveUser(updated);
    return updated;
  }
  return user;
}

function createDefaultUser(walletAddress: string): UserProfile {
  const short = walletAddress.slice(0, 6);
  return {
    id: walletAddress,
    walletAddress,
    email: null,
    googleId: null,
    githubId: null,
    name: `Learner ${short}`,
    username: `learner_${short.toLowerCase()}`,
    bio: "",
    initials: "SL",
    avatarUrl: null,
    joinDate: new Date().toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    }),
    locale: "en",
    theme: "dark",
    isPublic: true,
    socialLinks: {},
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, connected, disconnect } = useWallet();
  const { data: session, status: sessionStatus } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // When session has provider info, persist it to the linked providers store
  useEffect(() => {
    if (session?.provider && session?.providerAccountId) {
      saveLinkedProvider(session.provider, session.providerAccountId, {
        email: session.user?.email,
        name: session.user?.name,
        image: session.user?.image,
      });
    }
  }, [session]);

  // Main auth effect
  useEffect(() => {
    const walletAddress = connected && publicKey ? publicKey.toBase58() : null;
    const storedWallet = walletAddress ?? getStoredWallet();

    if (walletAddress) {
      setStoredWallet(walletAddress);
    }

    if (storedWallet) {
      // Load or create wallet-based user
      let existing = loadUser(storedWallet);
      if (!existing && walletAddress) {
        existing = createDefaultUser(walletAddress);
        saveUser(existing);
      }
      if (existing) {
        // Merge any linked providers from the persistent store
        existing = applyLinkedProviders(existing);
        setUser(existing);
        setIsLoading(false);
        return;
      }
    }

    if (session?.user && sessionStatus === "authenticated") {
      // Pure OAuth user (never connected a wallet)
      const linked = getLinkedProviders();
      const displayName = session.user.name ?? "User";
      const initials =
        displayName
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2) || "U";
      const oauthUser: UserProfile = {
        id: `oauth:${session.user.email ?? "unknown"}`,
        walletAddress: null,
        email: session.user.email ?? null,
        googleId: linked.googleId,
        githubId: linked.githubId,
        name: displayName,
        username: displayName.toLowerCase().replace(/\s+/g, "_").slice(0, 20),
        bio: "",
        initials,
        avatarUrl: session.user.image ?? null,
        joinDate: new Date().toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
        locale: "en",
        theme: "dark",
        isPublic: true,
        socialLinks: {},
      };
      setUser(oauthUser);
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, [connected, publicKey, session, sessionStatus]);

  const updateProfile = useCallback(
    (updates: Partial<UserProfile>) => {
      if (!user) return;
      const updated = { ...user, ...updates };
      saveUser(updated);
      setUser(updated);
    },
    [user],
  );

  const signOut = useCallback(() => {
    clearStoredWallet();
    clearLinkedProviders();
    disconnect();
    nextAuthSignOut({ redirect: false });
    setUser(null);
  }, [disconnect]);

  const linkGoogle = useCallback(() => {
    signIn("google", { callbackUrl: "/settings?tab=account" });
  }, []);

  const linkGithub = useCallback(() => {
    signIn("github", { callbackUrl: "/settings?tab=account" });
  }, []);

  const unlinkProvider = useCallback(
    (provider: "github" | "google") => {
      removeLinkedProvider(provider);
      if (user) {
        const key = provider === "github" ? "githubId" : "googleId";
        const updated = { ...user, [key]: null };
        saveUser(updated);
        setUser(updated);
      }
      // If the current NextAuth session is for this provider, sign out of it
      if (session?.provider === provider) {
        nextAuthSignOut({ redirect: false });
      }
    },
    [user, session],
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        updateProfile,
        signOut,
        linkGoogle,
        linkGithub,
        unlinkProvider,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
