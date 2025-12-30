import Link from 'next/link';
import { Music2, Github, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Music2 className="h-6 w-6 text-primary" />
              <span className="font-bold">Clavier</span>
            </div>
            <p className="text-sm text-muted-foreground">
              An interactive music theory learning tool for piano and keyboard.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/walkthrough"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Walkthrough
                </Link>
              </li>
              <li>
                <Link
                  href="/curriculum"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Curriculum
                </Link>
              </li>
              <li>
                <Link
                  href="/explorer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  Explorer
                </Link>
              </li>
            </ul>
          </div>

          {/* About */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">About</h3>
            <p className="text-sm text-muted-foreground">
              Built with Next.js, TypeScript, and Tailwind CSS.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="GitHub repository"
              >
                <Github className="h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t pt-6">
          <p className="text-center text-sm text-muted-foreground">
            <span className="flex items-center justify-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-red-500" /> for music learners
            </span>
            <span className="mt-1 block">
              © {currentYear} Clavier. All rights reserved.
            </span>
          </p>
        </div>
      </div>
    </footer>
  );
}
