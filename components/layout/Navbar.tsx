import React from "react";
import { createClient } from "@/utils/supabase/server";
import NavbarClient from "./NavbarClient";

export type UserProfile = {
  id: string;
  email?: string;
  username: string;
  avatar_url?: string;
} | null;

export interface NavbarProps {
  forceSolidBackground?: boolean;
}

export default async function Navbar({ forceSolidBackground }: NavbarProps = {}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userProfile: UserProfile = null;

  if (user) {
    const { data: dbUser } = await supabase
      .from('users')
      .select('username, avatar_url')
      .eq('id', user.id)
      .single();

    userProfile = {
      id: user.id,
      email: user.email,
      username: dbUser?.username || user.user_metadata?.username || user.email?.split("@")[0] || "Utilisateur",
      avatar_url: dbUser?.avatar_url || user.user_metadata?.avatar_url,
    };
  }

  return <NavbarClient userProfile={userProfile} forceSolidBackground={forceSolidBackground} />;
}
