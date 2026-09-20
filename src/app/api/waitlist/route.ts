import { NextResponse } from "next/server";

// Placeholder: keeps signups in memory, so they vanish on restart and each
// serverless instance has its own copy. Replace by setting NEXT_PUBLIC_WAITLIST_API.
const signups = new Set<string>();

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "That doesn't look like a valid email address." }, { status: 400 });
  }
  if (signups.has(email)) {
    return NextResponse.json({ status: "exists" }, { status: 409 });
  }

  signups.add(email);
  console.log(`[waitlist] ${email} (${body.role}) — ${signups.size} in memory`);
  return NextResponse.json({ status: "added" }, { status: 201 });
}
