import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const role = body?.role;
  const zip = typeof body?.zip === "string" ? body.zip.trim() : "";

  console.log("[waitlist] incoming request", {
    email,
    role,
    zip,
    rawBody: body,
    headers: Object.fromEntries(request.headers.entries()),
  });

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 400 });
  }
  if (role !== "customer" && role !== "mechanic") {
    return NextResponse.json({ error: "Choose vehicle owner or mechanic." }, { status: 400 });
  }
  if (zip && !/^\d{5}(?:-\d{4})?$/.test(zip)) {
    return NextResponse.json({ error: "Enter a valid ZIP code." }, { status: 400 });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || url.includes("YOUR_PROJECT_REF")) {
    return NextResponse.json({ error: "Set NEXT_PUBLIC_SUPABASE_URL in .env.local and restart the server." }, { status: 503 });
  }
  if (!key || key.includes("YOUR_PUBLISHABLE_KEY")) {
    return NextResponse.json({ error: "Set NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local and restart the server." }, { status: 503 });
  }

  const endpoint = `${url.replace(/\/$/, "")}/rest/v1/waitlist`;

  try {
    const result = await fetch(endpoint, {
      method: "POST",
      headers: {
        apikey: key,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email, role, zip: zip || null }),
      cache: "no-store",
    });

    // Read the body exactly once; a fetch response body can't be consumed twice.
    const raw = await result.text();
    let parsedError: { code?: string; message?: string; details?: string; hint?: string } = {};
    try {
      parsedError = raw ? JSON.parse(raw) : {};
    } catch {
      // Non-JSON error body; leave the raw response text for the logs below.
    }

    console.error("[waitlist] Supabase raw response", {
      status: result.status,
      statusText: result.statusText,
      rawResponse: raw || "(empty)",
      parsedError,
      request: { email, role, zip: zip || null, endpoint },
    });

    if (result.ok) {
      return NextResponse.json({ status: "added" }, { status: 201 });
    }

    if (parsedError.code === "23505") {
      return NextResponse.json({ status: "exists" }, { status: 409 });
    }

    if (["42P01", "42501", "PGRST205"].includes(parsedError.code ?? "")) {
      console.error("[waitlist] Table or insert policy missing:", {
        status: result.status,
        code: parsedError.code,
        message: parsedError.message,
        details: parsedError.details,
        hint: parsedError.hint,
      });
      return NextResponse.json(
        { error: "Run waitlist.sql in your Supabase SQL Editor, then try again." },
        { status: 503 }
      );
    }

    const message = parsedError.message || parsedError.details || "Couldn't join the waitlist. Please try again.";
    console.error("[waitlist] Insert failed:", {
      status: result.status,
      code: parsedError.code,
      message,
      details: parsedError.details,
      hint: parsedError.hint,
      rawResponse: raw || "(empty)",
    });
    return NextResponse.json({ error: message }, { status: 502 });
  } catch (err) {
    console.error("[waitlist] Connection failed:", {
      email,
      role,
      zip: zip || null,
      error: err instanceof Error ? { name: err.name, message: err.message, stack: err.stack } : err,
    });
    return NextResponse.json({ error: err instanceof Error ? err.message : "Couldn't join the waitlist. Please try again." }, { status: 502 });
  }
}