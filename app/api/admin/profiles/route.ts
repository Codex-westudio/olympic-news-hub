import { NextRequest, NextResponse } from "next/server";

import { getServiceRoleClient } from "@/lib/supabaseServer";
import { getServerSession } from "@/lib/articlesService";

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await getServerSession();
    if (!user) {
      return NextResponse.json({ message: "Non authentifié" }, { status: 401 });
    }

    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean);

    if (!adminEmails.includes(user.email?.toLowerCase() ?? "")) {
      return NextResponse.json({ message: "Accès refusé" }, { status: 403 });
    }

    const payload = await request.json();
    const { id, plan, plan_expires_at, is_active } = payload;

    const supabase = getServiceRoleClient();
    const { error } = await supabase
      .from("profiles")
      .update({ plan, plan_expires_at, is_active })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ message: (error as Error).message }, { status: 500 });
  }
}
