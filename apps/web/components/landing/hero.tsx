import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { SignIn } from "@/components/signin";
import { Session } from "next-auth";
import { ArrowRight, Github } from "lucide-react";

interface HeroProps {
  session: Session | null;
}

export function Hero({ session }: HeroProps) {
  return (
    <main className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-8 text-center overflow-hidden">
      
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating Particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 10}s`,
              animationDuration: `${8 + Math.random() * 4}s`,
            }}
          />
        ))}
        
        {/* Larger Glowing Dots */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={`glow-${i}`}
            className="absolute w-2 h-2 bg-white/10 rounded-full blur-sm animate-glow"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${6 + Math.random() * 3}s`,
            }}
          />
        ))}

        {/* Subtle Moving Lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent animate-slide-right"></div>
        <div className="absolute top-3/4 right-0 w-full h-px bg-gradient-to-l from-transparent via-white/5 to-transparent animate-slide-left"></div>
        
        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-radial-gradient from-white/[0.02] via-transparent to-transparent animate-pulse-slow"></div>
      </div>

      {/* Hero Content */}
      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        
        {/* Main Headline */}
        <div className="space-y-8 animate-fade-in-up">
          <h1 className="text-6xl md:text-8xl font-light text-white leading-[0.9] tracking-tighter">
            Real-time
            <br />
            <span className="font-medium relative">
              Collaboration
              {/* Subtle text glow effect */}
              <div className="absolute inset-0 text-6xl md:text-8xl font-medium bg-gradient-to-r from-white/10 to-white/5 bg-clip-text text-transparent blur-sm -z-10">
                Collaboration
              </div>
            </span>
          </h1>
          <p className="text-xl text-white/60 max-w-2xl mx-auto leading-relaxed font-light">
            Build together in spaces that understand your workflow. 
            Simple, fast, and beautifully designed.
          </p>
        </div>

        {/* CTA Section */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-up delay-300">
          {!session ? (
            <>
              <Button 
                variant="ghost" 
                className="text-white/70 hover:text-white hover:bg-white/5 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/5 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                <Github className="w-4 h-4 mr-2 relative z-10" />
                <span className="relative z-10">View on GitHub</span>
                <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 relative z-10" />
              </Button>
            </>
          ) : (
            <>
              <Button 
                className="bg-white text-black hover:bg-white/90 px-8 py-3 font-medium group relative overflow-hidden"
                asChild
              >
                <Link href="/room">
                  <div className="absolute inset-0 bg-black/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                  <span className="relative z-10">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2 transition-transform group-hover:translate-x-1 relative z-10" />
                </Link>
              </Button>
              <Button 
                variant="ghost" 
                className="text-white/70 hover:text-white hover:bg-white/5 group"
                asChild
              >
                <Link href="/space/demo">
                  <span className="relative z-10">Try Demo</span>
                </Link>
              </Button>
            </>
          )}
        </div>

        {/* Simple Stats */}
        <div className="flex justify-center items-center space-x-12 pt-16 text-white/40 text-sm animate-fade-in-up delay-500">
          <div className="hover:text-white/60 transition-colors cursor-default">10K+ users</div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="hover:text-white/60 transition-colors cursor-default">99.9% uptime</div>
          <div className="w-px h-4 bg-white/20"></div>
          <div className="hover:text-white/60 transition-colors cursor-default">Open source</div>
        </div>
      </div>
    </main>
  );
}