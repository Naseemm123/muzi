import { Github, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 mt-10 border-t border-white/10 bg-black/30 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-4 py-10 md:px-6">
        <div className="flex flex-col items-start justify-between space-y-8 md:flex-row md:items-center md:space-y-0">
          <div className="flex items-center space-x-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-white/10">
              <span className="text-sm font-bold text-white">M</span>
            </div>
            <span className="font-medium text-white">Muzi</span>
          </div>

          <div className="flex space-x-8 text-white/60">
            <Link href="/privacy" className="hover:text-white transition-colors text-sm">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors text-sm">
              Terms
            </Link>
            <Link href="/docs" className="hover:text-white transition-colors text-sm">
              Docs
            </Link>
            <Link href="/support" className="hover:text-white transition-colors text-sm">
              Support
            </Link>
          </div>

          <div className="flex space-x-4">
            <Link href="#" className="text-white/60 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white/60 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center">
          <p className="text-sm text-white/40">
            &copy; 2026 Muzi. Built for creators, by creators.
          </p>
        </div>
      </div>
    </footer>
  );
}

