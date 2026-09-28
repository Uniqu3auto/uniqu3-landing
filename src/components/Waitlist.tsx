"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

/*
 * The signup form, and the Supabase call behind it.
 *
 * There is no server in this project: the site is a static export on GitHub
 * Pages, so everything below runs in the visitor's browser and posts straight
 * to Supabase's REST API over HTTPS.
 *
 * The publishable key ships to the browser by design. It is safe only because
 * Row Level Security is enabled on public.waitlist and the one policy there
 * grants INSERT and nothing else — see waitlist.sql. The secret / service-role
 * key bypasses RLS and must never appear here or in any NEXT_PUBLIC_ variable.
 */

const ROLES = ["customer", "mechanic"] as const;
type Role = (typeof ROLES)[number];

const ROLE_LABELS: Record<Role, string> = {
  customer: "Vehicle owner",
  mechanic: "Mechanic",
};

const EMAIL_MAX_LENGTH = 254; // RFC 5321
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ZIP_PATTERN = /^\d{5}(?:-\d{4})?$/;

/*
 * Next.js inlines NEXT_PUBLIC_* at BUILD time, and only where the whole
 * expression is written out literally, as below. Destructuring process.env or
 * assembling the name at runtime yields undefined in the browser. Because the
 * value is baked into the bundle, changing it means rebuilding — restarting
 * the dev server is not enough. Locally these come from .env.local, which is
 * the only env file Next reads; .env.example is a template and is ignored.
 */
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

type Outcome = {
  /** True when the visitor is on the list — including when they already were. */
  ok: boolean;
  message: string;
};

function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** Postgres / PostgREST codes that all mean "the database isn't set up yet". */
const SETUP_CODES = new Set([
  "42P01", // relation "waitlist" does not exist
  "42501", // permission denied — the INSERT grant or the policy is missing
  "PGRST204", // a column in the payload isn't in the schema cache
  "PGRST205", // the table isn't in the schema cache
]);

type PostgrestError = { code?: string; message?: string; details?: string; hint?: string };

/** Parses the body text once. Never throws; a non-JSON body becomes a message. */
function parseError(raw: string): PostgrestError {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? (parsed as PostgrestError) : {};
  } catch {
    return { message: raw.slice(0, 200) };
  }
}

/**
 * Validates, posts to Supabase, and returns a message ready to render.
 * Never throws and never rejects.
 */
async function joinWaitlist(raw: { email: string; role: string; zip: string }): Promise<Outcome> {
  const email = raw.email.trim().toLowerCase();
  const zip = raw.zip.trim();

  if (!EMAIL_PATTERN.test(email) || email.length > EMAIL_MAX_LENGTH) {
    return { ok: false, message: "That doesn't look like a valid email address." };
  }
  if (!isRole(raw.role)) {
    return { ok: false, message: "Choose whether you're a vehicle owner or a mechanic." };
  }
  if (zip && !ZIP_PATTERN.test(zip)) {
    return { ok: false, message: "Enter a ZIP code like 12345 or 12345-6789." };
  }

  if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error(
      "[waitlist] missing build-time configuration. Set NEXT_PUBLIC_SUPABASE_URL and " +
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local, then rebuild.",
    );
    return { ok: false, message: "The waitlist isn't connected yet. Please try again later." };
  }

  const endpoint = `${SUPABASE_URL.replace(/\/+$/, "")}/rest/v1/waitlist`;

  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        // `apikey` alone resolves the request to the `anon` role, which is what
        // the policy grants INSERT to. An `Authorization: Bearer <publishable
        // key>` header is accepted too but adds nothing; add it only if
        // Supabase ever answers 401.
        apikey: SUPABASE_KEY,
        "Content-Type": "application/json",
        // Required, not an optimisation: PostgREST needs SELECT to echo the
        // inserted row back, and waitlist.sql revokes SELECT from anon.
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ email, role: raw.role, zip: zip || null }),
      cache: "no-store",
    });
  } catch (cause) {
    console.error("[waitlist] could not reach Supabase", { endpoint, cause });
    return { ok: false, message: "Couldn't reach the server. Check your connection and try again." };
  }

  // Read the stream exactly once. A Response body cannot be consumed twice, so
  // calling .json() after .text() would throw "body stream already read".
  const body = await response.text();

  if (response.ok) {
    return { ok: true, message: "You're on the waitlist. We'll email you at launch." };
  }

  const error = parseError(body);
  console.error("[waitlist] insert rejected", {
    endpoint,
    status: response.status,
    statusText: response.statusText,
    code: error.code,
    message: error.message,
    details: error.details,
    hint: error.hint,
    raw: body || "(empty body)",
  });

  // The unique index on email. They are already on the list, so from their side
  // this is a success.
  if (error.code === "23505") {
    return { ok: true, message: "That email is already on the list — you're all set." };
  }
  if (SETUP_CODES.has(error.code ?? "")) {
    return {
      ok: false,
      message: "The waitlist table isn't ready yet. Run waitlist.sql in the Supabase SQL Editor, then try again.",
    };
  }
  if (response.status === 401 || response.status === 403) {
    return {
      ok: false,
      message: "Supabase rejected the request. Check the publishable key and the insert policy from waitlist.sql.",
    };
  }

  const detail = error.message || error.details || `The request failed (HTTP ${response.status}).`;
  return { ok: false, message: error.code ? `${detail} (${error.code})` : detail };
}

const field =
  "w-full rounded-control border border-edge bg-white/[0.04] px-4 py-3.5 text-[0.98rem] placeholder:text-ink-faint focus:border-brand focus:outline-none";

export function Waitlist() {
  const [role, setRole] = useState<Role>("customer");
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [pending, setPending] = useState(false);

  // CTAs elsewhere on the page carry data-role, so they preselect without
  // needing JavaScript of their own.
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const picked = (event.target as HTMLElement | null)?.closest<HTMLElement>("[data-role]")?.dataset.role;
      if (isRole(picked)) setRole(picked);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Captured before the await: currentTarget is cleared once dispatch ends.
    const form = event.currentTarget;
    const data = new FormData(form);

    setPending(true);
    setOutcome(null);

    const result = await joinWaitlist({
      email: String(data.get("email") ?? ""),
      role,
      zip: String(data.get("zip") ?? ""),
    });

    setPending(false);
    setOutcome(result);
    if (result.ok) form.reset();
  }

  return (
    <section id="waitlist" className="mx-auto grid w-full max-w-[1120px] gap-10 px-5 py-16 lg:grid-cols-2 lg:items-center lg:py-24">
      <div>
        <h2 className="text-[clamp(1.95rem,4.6vw,3rem)]">Be first in line.</h2>
        <p className="mt-5 max-w-[58ch] text-[1.05rem] leading-relaxed text-ink-dim">
          UNIQU3 is currently preparing for launch. Sign up to receive updates about the launch and
          availability in your area.
        </p>
        <p className="mt-5 flex max-w-[52ch] items-start gap-2.5 text-[0.9rem] text-ink-faint">
          <ShieldCheck className="mt-0.5 size-4 shrink-0" />
          We&apos;ll use your email only to send launch updates. Your ZIP helps us decide which
          areas to open first.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="rounded-panel border border-edge bg-surface/70 p-7 sm:p-9">
        <div className="flex gap-2.5" role="group" aria-label="Sign up as">
          {ROLES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={role === value}
              onClick={() => setRole(value)}
              className={`flex-1 rounded-control border px-4 py-3.5 text-[0.95rem] font-semibold ${
                role === value ? "border-brand bg-brand/15 text-brand-soft" : "border-edge text-ink-dim"
              }`}
            >
              {ROLE_LABELS[value]}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1.6fr_1fr]">
          <input
            name="email"
            type="email"
            autoComplete="email"
            aria-label="Email address"
            placeholder="you@example.com"
            required
            maxLength={EMAIL_MAX_LENGTH}
            className={field}
          />
          <input
            name="zip"
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            aria-label="ZIP code"
            placeholder="ZIP (optional)"
            className={field}
          />
        </div>

        <button
          type="submit"
          disabled={pending}
          className="mt-5 w-full rounded-control bg-brand py-4 font-semibold text-white hover:bg-brand-hi disabled:opacity-60"
        >
          {pending ? "Adding you…" : "Join the waitlist"}
        </button>

        <p
          role="status"
          aria-live="polite"
          className={`mt-4 min-h-[1.3em] text-[0.9rem] ${outcome && !outcome.ok ? "text-warn" : "text-accent"}`}
        >
          {pending ? "Adding you…" : (outcome?.message ?? "")}
        </p>
      </form>
    </section>
  );
}