import { Car, ClipboardList, Star, Users, Wrench, type LucideIcon } from "lucide-react";

import { AudiencePanel, audiences } from "@/components/AudiencePanel";
import { Waitlist } from "@/components/Waitlist";

const steps: [icon: LucideIcon, title: string, body: string][] = [
  [Car, "Tell us about your vehicle", "Enter your vehicle information, including your VIN, so mechanics can better understand exactly what they're working on."],
  [ClipboardList, "Tell us what you need", "Describe the problem or select the service you need. Upload photos and videos to help mechanics understand the issue before they arrive."],
  [Users, "Connect with a mechanic", "Get connected with available professional mobile mechanics in your area. Choose ASAP service or schedule a future appointment."],
  [Wrench, "Get your vehicle serviced", "Your mechanic comes to your location, performs the service, and documents the work."],
  [Star, "Rate your experience", "After the job, rate and review your mechanic to help build a trusted marketplace."],
];

const services = ["Brakes", "Batteries", "Diagnostics", "Suspension", "Steering", "Starters",
  "Alternators", "Cooling systems", "Electrical", "AC / Heat", "Engine repair", "Transmission",
  "Maintenance", "& more"];

const wordmark = (
  <span className="flex items-center gap-2.5">
    <span className="tile grid size-9 place-items-center rounded-full text-white">
      <Wrench className="size-5" />
    </span>
    <span className="text-gradient text-xl font-extrabold tracking-tight">UNIQU3</span>
  </span>
);

export default function HomePage() {
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ground/80 backdrop-blur-xl">
        <div className="mx-auto flex min-h-16 w-full max-w-[1120px] items-center gap-4 px-5">
          {wordmark}
          <a href="#waitlist" className="ml-auto rounded-control border border-edge bg-white/5 px-4 py-2.5 text-sm font-semibold hover:border-brand">
            Join the waitlist
          </a>
        </div>
      </header>

      <main>
        <section className="mx-auto flex w-full max-w-[1120px] flex-col items-center px-5 py-16 text-center sm:py-24">
          <span className="rounded-full border border-brand/30 bg-brand/10 px-4 py-2 text-sm font-semibold text-brand-soft">
            Coming soon
          </span>
          <h1 className="mt-7 max-w-[18ch] text-[clamp(2.4rem,7vw,4.5rem)]">
            Professional Auto Repair. <span className="text-gradient">Wherever You Are.</span>
          </h1>
          <p className="mt-6 max-w-[58ch] text-[clamp(1.05rem,2vw,1.25rem)] leading-relaxed text-ink-dim">
            Connect with professional mobile mechanics who come to you. Whether you need a repair
            now or want to schedule a mechanic for later, UNIQU3 is being built to make finding
            automotive help faster, easier, and more convenient.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <a href="#waitlist" data-role="customer" className="rounded-control bg-brand px-6 py-3.5 font-semibold text-white hover:bg-brand-hi">
              Join the waitlist
            </a>
            <a href="#mechanics" className="rounded-control border border-edge bg-white/5 px-6 py-3.5 font-semibold hover:border-brand">
              For mechanics
            </a>
          </div>
        </section>

        <section id="how" className="mx-auto w-full max-w-[1120px] px-5 py-16 lg:py-24">
          <h2 className="mb-12 text-center text-[clamp(1.95rem,4.6vw,3rem)]">Five steps, start to finish.</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map(([Icon, title, body], i) => (
              <div key={title} className="rounded-card border border-edge bg-surface/60 p-6">
                <div className="flex items-center justify-between">
                  <span className="tile grid size-11 place-items-center rounded-tile text-white">
                    <Icon className="size-5.5" />
                  </span>
                  <span className="text-3xl font-extrabold text-white/10">0{i + 1}</span>
                </div>
                <h3 className="mt-5 text-[1.3rem]">{title}</h3>
                <p className="mt-2.5 text-[0.98rem] leading-relaxed text-ink-dim">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {audiences.map((a) => (
          <AudiencePanel key={a.id} a={a} />
        ))}

        <section className="mx-auto w-full max-w-[1120px] px-5 py-16 text-center lg:py-24">
          <h2 className="text-[clamp(1.95rem,4.6vw,3rem)]">From simple maintenance to major repairs.</h2>
          <p className="mt-4 text-ink-dim">Examples of services that can be requested:</p>
          <div className="mt-10 flex flex-wrap justify-center gap-2.5">
            {services.map((s) => (
              <span key={s} className="rounded-full border border-edge bg-surface/60 px-5 py-2.5 text-[0.95rem] font-medium text-ink-dim">
                {s}
              </span>
            ))}
          </div>
        </section>

        <Waitlist />
      </main>

      <footer className="border-t border-white/5 py-12">
        <div className="mx-auto flex w-full max-w-[1120px] flex-col gap-6 px-5 sm:flex-row sm:items-center sm:justify-between">
          {wordmark}
          <p className="text-[0.85rem] text-ink-faint">
            © {new Date().getFullYear()} UNIQU3. Professional automotive service, connected.
          </p>
        </div>
      </footer>
    </>
  );
}
