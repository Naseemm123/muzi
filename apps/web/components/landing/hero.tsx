import { Button } from "@workspace/ui/components/button";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Reveal } from "./reveal";

export function Hero({ session }: any) {
  return (
    <main className="relative z-10 mx-auto grid min-h-[76vh] w-full max-w-[1400px] grid-cols-1 items-center gap-12 px-4 py-16 md:px-6 lg:grid-cols-[1.08fr_0.92fr]">
      <Reveal className="space-y-8">
        <p className="w-fit rounded-full border border-white/15 bg-white/5 px-4 py-1 text-xs tracking-[0.18em] text-white/70 uppercase">
            Shared Listening Spaces
        </p>
        <h1 className="text-5xl leading-[0.95] tracking-tight text-white sm:text-7xl">
          Synchronized music
          <br />
          without friction.
        </h1>
        <p className="max-w-xl text-base leading-relaxed text-white/60 md:text-lg">
          Create a room, invite people, and control playback together in real time. Built for focused listening sessions.
        </p>

        <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          {!session ? (
            <Button className="group rounded-full bg-white px-6 text-black shadow-[0_10px_40px_rgba(255,255,255,0.15)] transition-transform hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0" asChild>
              <Link href="/signin">
                Get Started
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          ) : (
            <>
              <Button className="group rounded-full bg-white px-6 text-black shadow-[0_10px_40px_rgba(255,255,255,0.15)] transition-transform hover:-translate-y-0.5 hover:bg-white/90 active:translate-y-0" asChild>
                <Link href="/room">
                  Open Rooms
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button variant="ghost" className="rounded-full border border-white/15 text-white/80 transition-colors hover:bg-white/10 hover:text-white" asChild>
                <Link href="/space/demo">
                  Try Demo
                </Link>
              </Button>
            </>
          )}
        </div>
        <div className="grid max-w-xl grid-cols-1 gap-2 pt-2 text-sm text-white/70 sm:grid-cols-3">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Room-based playback</div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Live queue voting</div>
          <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">Shared controls</div>
        </div>
      </Reveal>

      <Reveal delayMs={120}>
        <div className="relative mx-auto w-full max-w-md">
          <div className="absolute -inset-8 rounded-[2rem] bg-gradient-to-b from-white/15 to-transparent blur-2xl" />
          <div className="relative space-y-3 rounded-[1.5rem] border border-white/15 bg-black/40 p-4 backdrop-blur-2xl">
            <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] p-3">
              <p className="text-sm text-white/80">room: lofi-friday</p>
              <span className="rounded-full border border-emerald-300/40 bg-emerald-300/10 px-2 py-0.5 text-xs text-emerald-300">live</span>
            </div>
            <div className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-transform duration-300 hover:-translate-y-0.5">
              <p className="text-sm text-white">Now playing</p>
              <p className="mt-1 text-white/60">Drop links, reorder the vibe, keep everyone in sync.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/10 active:scale-[0.99]">
                + Add Track
              </button>
              <button className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-sm text-white/85 transition-colors hover:bg-white/10 active:scale-[0.99]">
                Vote Queue
              </button>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
