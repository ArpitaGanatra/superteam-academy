import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const supabase = getSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase not configured" },
      { status: 503 },
    );
  }

  const body = await req.json();
  const {
    walletAddress,
    email,
    googleId,
    githubId,
    name,
    username,
    bio,
    initials,
    avatarUrl,
    locale,
    theme,
    isPublic,
    socialLinks,
  } = body;

  if (!walletAddress && !email) {
    return NextResponse.json(
      { error: "walletAddress or email required" },
      { status: 400 },
    );
  }

  // Build the row to upsert
  const row: Record<string, unknown> = {};
  if (walletAddress) row.wallet_address = walletAddress;
  if (email !== undefined) row.email = email;
  if (googleId !== undefined) row.google_id = googleId;
  if (githubId !== undefined) row.github_id = githubId;
  if (name !== undefined) row.name = name;
  if (username !== undefined) row.username = username;
  if (bio !== undefined) row.bio = bio;
  if (initials !== undefined) row.initials = initials;
  if (avatarUrl !== undefined) row.avatar_url = avatarUrl;
  if (locale !== undefined) row.locale = locale;
  if (theme !== undefined) row.theme = theme;
  if (isPublic !== undefined) row.is_public = isPublic;
  if (socialLinks !== undefined) row.social_links = socialLinks;

  // Determine the conflict column for upsert
  const onConflict = walletAddress ? "wallet_address" : "email";

  const { data, error } = await supabase
    .from("users")
    .upsert(row, { onConflict })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ user: data });
}
