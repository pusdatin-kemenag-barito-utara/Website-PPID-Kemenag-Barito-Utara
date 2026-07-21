import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase";

// In-memory rate limiting map for basic protection against brute force attacks
const loginAttempts = new Map<string, { count: number; resetTime: number }>();

export async function POST(request: Request) {
  try {
    const { email, password, turnstileToken } = await request.json();

    const clientIp = request.headers.get("x-forwarded-for") || "client-ip";
    const now = Date.now();
    const attempt = loginAttempts.get(clientIp);

    if (attempt && now < attempt.resetTime) {
      if (attempt.count >= 5) {
        return NextResponse.json(
          { error: "Terlalu banyak percobaan login. Silakan tunggu 1 menit." },
          { status: 429 }
        );
      }
    } else {
      loginAttempts.set(clientIp, { count: 0, resetTime: now + 60 * 1000 });
    }

    const currentAttempt = loginAttempts.get(clientIp)!;
    currentAttempt.count += 1;

    // Validate inputs
    const cleanEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const cleanPassword = typeof password === "string" ? password : "";

    if (!cleanEmail || !cleanPassword) {
      return NextResponse.json({ error: "Email dan password wajib diisi." }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json({ error: "Format email tidak valid." }, { status: 400 });
    }

    // Optional Turnstile verification in production
    if (!turnstileToken && process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Verifikasi Captcha gagal." }, { status: 400 });
    }

    const supabase = await createClient();

    // Authenticate with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: cleanPassword,
    });

    if (error) {
      return NextResponse.json({ error: "Kredensial email atau password tidak cocok." }, { status: 401 });
    }

    // Reset failed attempts on success
    loginAttempts.delete(clientIp);

    return NextResponse.json(
      { success: true, message: "Login berhasil", user: { id: data.user.id, email: data.user.email } },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan keamanan pada server." }, { status: 500 });
  }
}
