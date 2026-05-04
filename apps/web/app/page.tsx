import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";
import { auth } from "@/lib/auth"; // path to your Better Auth server instance
import { headers } from "next/headers";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 18%, rgba(255,255,255,0.08), transparent 34%), radial-gradient(circle at 78% 24%, rgba(255,255,255,0.06), transparent 35%), linear-gradient(120deg, rgba(255,255,255,0.02), transparent 45%, rgba(255,255,255,0.015))",
        }}
      />
      <div className="ambient-orb-a pointer-events-none absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-white/10 blur-[110px]" />
      <div className="ambient-orb-b pointer-events-none absolute right-[10%] top-[28%] h-80 w-80 rounded-full bg-slate-400/10 blur-[120px]" />
      <div className="ambient-orb-a pointer-events-none absolute bottom-[-120px] left-1/2 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-white/[0.05] blur-[140px]" />

      <Header session={session} />
      <Hero session={session} />
      <Features />
      <Footer />
    </div>
  );
}
