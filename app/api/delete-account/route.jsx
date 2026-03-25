import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import supabaseAdmin from "@/services/supabaseAdmin";

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required." },
        { status: 400 },
      );
    }

    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const supabaseClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    );
    const {
      data: { user: authUser },
      error: authError,
    } = await supabaseClient.auth.getUser(token);

    if (authError || !authUser || authUser.email !== email) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { error: dbError } = await supabaseAdmin
      .from("users")
      .delete()
      .eq("email", email);

    if (dbError) {
      console.error("Error deleting user record:", dbError);
      return NextResponse.json(
        { error: "Failed to delete account data." },
        { status: 500 },
      );
    }

    const { error: authDeleteError } =
      await supabaseAdmin.auth.admin.deleteUser(authUser.id);

    if (authDeleteError) {
      console.error("Error deleting auth user:", authDeleteError);
      return NextResponse.json(
        { error: "Failed to delete authentication account." },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred." },
      { status: 500 },
    );
  }
}
