"use client";

import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";

const API = process.env.NEXT_PUBLIC_WAITLIST_API || "/api/waitlist";
const field = "w-full rounded-control border border-edge bg-white/[0.04] px-4 py-3.5 text-[0.98rem] placeholder:text-ink-faint focus:border-brand focus:outline-none";

export function Waitlist() {
  const [role, setRole] = useState<"customer" | "mechanic">("customer");
  const [msg, setMsg] = useState<{ text: string; bad?: boolean }>({ text: "" });
  const [pending, setPending] = useState(false);

  // CTAs elsewhere on the page carry data-role, so they preselect without
  // needing JavaScript of their own.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const r = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-role]")?.dataset.role;
      if (r === "customer" || r === "mechanic") setRole(r);
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
      return setMsg({ text: "Enter a valid email address.", bad: true });
    }

    setPending(true);
    setMsg({ text: "Adding you…" });
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, zip: data.get("zip"), joinedAt: new Date().toISOString() }),
      });
      if (res.status === 409) {
        form.reset();
        setMsg({ text: "That email is already on the list — you're set." });
      } else if (res.ok) {
        form.reset();
        setMsg({ text: "You're on the waitlist. We'll email you at launch." });
      } else {
        setMsg({ text: (await res.json().catch(() => ({}))).error ?? "That didn't save.", bad: true });
      }
    } catch {
      setMsg({ text: "Couldn't reach the server. Try again.", bad: true });
    } finally {
      setPending(false);
    }
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
          {(["customer", "mechanic"] as const).map((v) => (
            <button key={v} type="button" aria-pressed={role === v} onClick={() => setRole(v)}
              className={`flex-1 rounded-control border px-4 py-3.5 text-[0.95rem] font-semibold ${
                role === v ? "border-brand bg-brand/15 text-brand-soft" : "border-edge text-ink-dim"}`}>
              {v === "customer" ? "Vehicle owner" : "Mechanic"}
            </button>
          ))}
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-[1.6fr_1fr]">
          <input name="email" type="email" autoComplete="email" aria-label="Email address"
            placeholder="you@example.com" required className={field} />
          <input name="zip" inputMode="numeric" autoComplete="postal-code" maxLength={10}
            aria-label="ZIP code" placeholder="ZIP (optional)" className={field} />
        </div>

        <button type="submit" disabled={pending}
          className="mt-5 w-full rounded-control bg-brand py-4 font-semibold text-white hover:bg-brand-hi disabled:opacity-60">
          {pending ? "Adding you…" : "Join the waitlist"}
        </button>

        <p role="status" aria-live="polite"
          className={`mt-4 min-h-[1.3em] text-[0.9rem] ${msg.bad ? "text-warn" : "text-accent"}`}>
          {msg.text}
        </p>
      </form>
    </section>
  );
}
