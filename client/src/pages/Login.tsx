import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { Film } from "lucide-react";
import { useEffect } from "react";
import { SiGoogle } from "react-icons/si";

export default function Login() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (isAuthenticated) setLocation("/admin");
  }, [isAuthenticated, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-background to-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=1920&q=80')] bg-cover bg-center pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent z-0" />

      <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-zinc-800 shadow-2xl relative z-10">
        <CardHeader className="space-y-1 text-center pb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-4 rounded-full">
              <Film className="w-8 h-8 text-primary" />
            </div>
          </div>
          <CardTitle className="text-3xl font-display font-bold tracking-wide">Admin Access</CardTitle>
          <CardDescription>Sign in to manage the catalog</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button 
            className="w-full py-6 bg-primary hover:bg-primary/90 text-white font-semibold flex items-center justify-center"
            onClick={() => window.location.href = "/api/login"}
          >
            <SiGoogle className="mr-2 h-5 w-5" />
            Sign in with Google
          </Button>

          <div className="text-center text-xs text-muted-foreground mt-4">
            Authorized access only. By signing in, you agree to our terms.
          </div>
        </CardContent>
        <CardFooter className="justify-center border-t border-border/40 pt-6">
          <Link href="/">
            <Button variant="ghost" className="text-muted-foreground hover:text-white">
              Back to Home
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
