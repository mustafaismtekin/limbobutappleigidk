import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { Megaphone } from "lucide-react";

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-foreground bg-background">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold uppercase tracking-tighter">
          <span>consumerthing</span>
        </Link>
        
        <div className="flex items-center gap-6 font-mono text-sm font-bold uppercase">
          <Link href="/brands" className={`hover:text-primary transition-colors ${location.startsWith('/brands') ? 'text-primary' : ''}`}>
            Brands
          </Link>
          <Link href="/submit" className="hidden sm:block">
            <Button size="sm" className="gap-2 bg-foreground text-background hover:bg-foreground">
              <Megaphone className="h-4 w-4" />
              Pitch Idea
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
