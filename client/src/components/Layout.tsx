import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Film, LogOut, Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated } = useAuth();
  const [location] = useLocation();

  const isAdmin = location.startsWith("/admin");

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 group">
            <Film className="w-8 h-8 text-primary group-hover:rotate-12 transition-transform duration-300" />
            <span className="font-display text-3xl font-bold tracking-wider text-primary">STREAM<span className="text-foreground">FLIX</span></span>
          </Link>

          <nav className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 px-3 py-1 bg-zinc-900/50 rounded-full border border-border">
                  <Avatar className="w-7 h-7">
                    <AvatarImage src={user?.profileImageUrl || undefined} />
                    <AvatarFallback className="bg-primary/20 text-primary text-xs">
                      {user?.firstName?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || "?"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium hidden sm:inline-block">
                    {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : user?.email?.split("@")[0]}
                  </span>
                </div>
                <Link href="/admin">
                  <Button variant={isAdmin ? "default" : "ghost"} size="sm" className="gap-2">
                    <Settings className="w-4 h-4" />
                    Admin
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={() => logout()} className="gap-2 text-muted-foreground hover:text-destructive">
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Avatar className="w-8 h-8 border border-border">
                  <AvatarFallback className="bg-zinc-800 text-muted-foreground text-xs">?</AvatarFallback>
                </Avatar>
                <Button variant="ghost" size="sm" className="font-medium" onClick={() => window.location.href = "/api/login"}>
                  Admin Login
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t border-border/40 bg-zinc-950 py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p className="mb-2">&copy; {new Date().getFullYear()} StreamFlix. All rights reserved.</p>
          <p className="text-xs opacity-50">Demo Application • Built with React, Tailwind, and Node.js</p>
        </div>
      </footer>
    </div>
  );
}
