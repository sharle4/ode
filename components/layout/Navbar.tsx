import React from "react";
import { createClient } from "@/utils/supabase/server";
import NavbarClient from "./NavbarClient";

export type UserProfile = {
  id: string;
  email?: string;
  username: string;
  avatar_url?: string;
} | null;

export default async function Navbar() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile: UserProfile = null;

  if (user) {
    userProfile = {
      id: user.id,
      email: user.email,
      username: user.user_metadata?.username || user.email?.split("@")[0] || "Utilisateur",
      avatar_url: user.user_metadata?.avatar_url,
    };
  }

  return <NavbarClient userProfile={userProfile} />;
}
