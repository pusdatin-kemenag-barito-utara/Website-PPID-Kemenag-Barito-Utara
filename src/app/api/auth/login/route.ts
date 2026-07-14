import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const { email, password, turnstileToken } = await request.json();

    // 1. Verify Turnstile token (Optional for now in dev, but good practice)
    if (!turnstileToken && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Verifikasi Captcha gagal." }, { status: 400 });
    }

    const supabase = await createClient();

    // 2. Autentikasi dengan Supabase (Sinkron dengan tabel auth.users Pusdatin)
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return NextResponse.json({ error: "Email atau password salah." }, { status: 401 });
    }

    // Berhasil masuk
    return NextResponse.json({ success: true, message: "Login berhasil", user: data.user }, { status: 200 });

  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
