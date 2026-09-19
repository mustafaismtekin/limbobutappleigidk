import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex justify-center">
            <AlertCircle className="h-16 w-16 text-destructive" />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tight text-foreground">
            404 Not Found
          </h1>
          <p className="text-muted-foreground font-mono">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link href="/">
            <Button size="lg" className="w-full">
              RETURN HOME
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
