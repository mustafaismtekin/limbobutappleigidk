import { useListCompanies } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Brands() {
  const { data: companies, isLoading } = useListCompanies();
  const companyList = Array.isArray(companies) ? companies : [];

  return (
    <div className="container mx-auto max-w-6xl px-4 py-16 min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 border-b-4 border-foreground pb-4 gap-4">
        <div>
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tight">Brands</h1>
          <p className="font-mono text-muted-foreground mt-2 max-w-xl">
            Choose a target. Assemble the fans. Pitch a product they can't ignore.
          </p>
        </div>
        <Link href="/brands/new">
          <Button className="gap-2">
            <Plus className="w-5 h-5" /> Add Brand
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="h-48 animate-pulse bg-muted" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {companyList.map((company, i) => (
            <Link key={company.id} href={`/brands/${company.id}`} className="block group">
              <Card className="h-full flex flex-col hover:bg-primary transition-all duration-300 animate-in fade-in slide-in-from-bottom-4" style={{ animationDelay: `${i * 50}ms` }}>
                <CardHeader className="flex-1 group-hover:bg-primary group-hover:border-foreground transition-colors">
                  <div className="w-12 h-12 bg-foreground text-background flex items-center justify-center font-black text-2xl mb-4 border-2 border-transparent group-hover:border-foreground">
                    {company.name.charAt(0)}
                  </div>
                  <CardTitle>{company.name}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-2 group-hover:text-foreground/80">
                    {company.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
          {companyList.length === 0 && (
            <div className="col-span-full py-20 text-center font-mono text-muted-foreground uppercase">
              No brands listed yet. Be the first to add one.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
