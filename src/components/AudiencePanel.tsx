import { Bell, Calendar, Camera, Car, CircleCheck, Clock, FileText, MapPin,
  MessageSquare, Search, Star, TrendingUp, User, Users, Wrench, type LucideIcon } from "lucide-react";

type Item = [label: string, icon: LucideIcon];

export const audiences = [
  {
    id: "owners",
    icon: Users,
    eyebrow: "For vehicle owners",
    title: "Stop searching. Start connecting.",
    body: "No more calling multiple shops trying to explain your vehicle problem. UNIQU3 is designed to give customers one place to handle the whole job.",
    kicker: "Your vehicle. Your location. Your choice.",
    items: [
      ["Find mobile mechanics", Search], ["Request repairs", Wrench],
      ["Schedule service", Calendar], ["Share VIN and vehicle information", Car],
      ["Upload photos and videos", Camera], ["Receive quotes", FileText],
      ["Communicate with mechanics", MessageSquare], ["Track appointments", Clock],
      ["Rate and review mechanics", Star],
    ] as Item[],
    cta: "Join the customer waitlist",
    role: "customer" as const,
    brand: true,
  },
  {
    id: "mechanics",
    icon: Wrench,
    eyebrow: "For professional mechanics",
    title: "Turn your skills into more jobs.",
    body: "UNIQU3 is being built for professional mechanics who want another way to connect with customers who need automotive services.",
    note: "No monthly subscription required — the initial marketplace model is designed around pay-per-job.",
    items: [
      ["Create a professional profile", User], ["Choose your service area", MapPin],
      ["Set availability", Calendar], ["Receive nearby job requests", Bell],
      ["Review vehicle information and VIN", Car], ["See customer photos and videos", Camera],
      ["Quote jobs", FileText], ["Accept or decline requests", CircleCheck],
      ["Communicate with customers", MessageSquare], ["Build ratings and reviews", Star],
      ["Grow your customer base", TrendingUp],
    ] as Item[],
    cta: "Join as a mechanic",
    role: "mechanic" as const,
    brand: false,
  },
];

export function AudiencePanel({ a }: { a: (typeof audiences)[number] }) {
  return (
    <section id={a.id} className="mx-auto w-full max-w-[1120px] px-5 py-16 lg:py-24">
      <div className={`rounded-panel border p-7 sm:p-10 lg:p-12 ${
        a.brand ? "panel-brand border-panel-edge/60" : "border-edge bg-surface/60"}`}>
        <div className="flex items-center gap-4">
          <span className="tile grid size-14 shrink-0 place-items-center rounded-[1.1rem] text-white">
            <a.icon className="size-7" />
          </span>
          <div>
            <p className="text-sm font-semibold text-brand-soft">{a.eyebrow}</p>
            <h2 className="mt-1 text-[clamp(1.8rem,4.2vw,2.75rem)]">{a.title}</h2>
          </div>
        </div>

        <p className={`mt-6 max-w-[62ch] text-[1.05rem] leading-relaxed ${a.brand ? "text-white/80" : "text-ink-dim"}`}>
          {a.body}
        </p>

        {"kicker" in a && (
          <p className="mt-5 text-[1.05rem] font-semibold text-brand-soft">{a.kicker}</p>
        )}

        <ul className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {a.items.map(([label, Icon]) => (
            <li key={label} className={`flex items-center gap-3.5 rounded-tile p-4 ${
              a.brand ? "border border-white/10 bg-white/5" : "border border-edge bg-white/[0.03]"}`}>
              <span className={`grid size-10 shrink-0 place-items-center rounded-[0.7rem] ${
                a.brand ? "bg-white/15 text-white" : "bg-brand/15 text-brand-hi"}`}>
                <Icon className="size-5" />
              </span>
              <span className={`text-[0.95rem] font-medium ${a.brand ? "text-white" : "text-ink"}`}>{label}</span>
            </li>
          ))}
        </ul>

        {"note" in a && (
          <p className="mt-8 flex items-start gap-2.5 rounded-card border border-accent/25 bg-accent/5 p-6 text-[1rem] font-medium">
            <CircleCheck className="mt-0.5 size-5 shrink-0 text-accent" />
            {a.note}
          </p>
        )}

        <a href="#waitlist" data-role={a.role}
          className={`mt-8 inline-flex rounded-control px-6 py-3.5 text-[0.95rem] font-semibold ${
            a.brand ? "bg-white text-panel hover:bg-brand-soft" : "bg-brand text-white hover:bg-brand-hi"}`}>
          {a.cta}
        </a>
      </div>
    </section>
  );
}
