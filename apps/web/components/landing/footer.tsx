import { Github, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-white/5 bg-black/50 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-8 py-12">
        
        {/* Main Footer Content */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
          
          {/* Brand */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-white rounded-md flex items-center justify-center">
              <span className="text-black font-bold text-sm">M</span>
            </div>
            <span className="text-white font-medium">Muzi</span>
          </div>

          {/* Links */}
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

          {/* Social */}
          <div className="flex space-x-4">
            <Link href="#" className="text-white/60 hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </Link>
            <Link href="#" className="text-white/60 hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-white/40 text-sm">
            &copy; 2025 Muzi. Built for creators, by creators.
          </p>
        </div>
      </div>
    </footer>
  );
}



