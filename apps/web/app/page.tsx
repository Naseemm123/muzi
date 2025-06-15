import { auth } from "@/auth";
import { Header } from "@/components/landing/header";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Footer } from "@/components/landing/footer";

export default async function Page() {
  const session = await auth();

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      
      {/* Minimal gradient orb */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-r from-white/5 to-white/1 rounded-full blur-3xl animate-pulse"></div>

      <Header session={session} />
      <Hero session={session} />
      <Features />
      <Footer />
    </div>
  );
}
