import { useGetIdeasSummary, useListIdeas, useListCompanies } from "@workspace/api-client-react";
import { IdeaCard } from "@/components/IdeaCard";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Flame, Lightbulb, Users } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Home() {
  const { data: summary, isLoading: isSummaryLoading } = useGetIdeasSummary();
  const { data: ideas, isLoading: isIdeasLoading } = useListIdeas();
  const { data: companies } = useListCompanies();
  const ideaList = Array.isArray(ideas) ? ideas : [];
  const companyList = Array.isArray(companies) ? companies : [];

  const getCompanyName = (companyId: number) => {
    return companyList.find((c) => c.id === companyId)?.name || `Brand #${companyId}`;
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Hero Section */}
      <section className="bg-foreground text-background pt-24 pb-20 px-4 brutal-border-b-2 border-foreground">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] mb-8">
            Make them <br />
            <span className="text-primary underline decoration-primary underline-offset-[12px]">build it.</span>
          </h1>
          <p className="text-lg md:text-2xl max-w-2xl font-mono mb-12 text-muted">
            Pitch the products you wish existed. Be free.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/submit">
              <Button size="lg" className="text-lg">
                Pitch an Idea <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="/brands">
              <Button size="lg" variant="outline" className="text-lg bg-transparent text-background border-background hover:bg-background hover:text-foreground">
                Browse Brands
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Ticker */}
      <div className="border-b-2 border-foreground bg-primary py-4 overflow-hidden flex whitespace-nowrap">
        <div className="animate-in slide-in-from-right-full duration-1000 flex gap-12 px-4 font-mono font-bold uppercase tracking-widest text-foreground">
          <span className="flex items-center gap-2"><Lightbulb className="w-5 h-5" /> {summary?.totalIdeas || 0} Ideas Pitched</span>
          <span className="flex items-center gap-2"><Flame className="w-5 h-5" /> {summary?.totalVotes || 0} Votes Cast</span>
          <span className="flex items-center gap-2"><Users className="w-5 h-5" /> {summary?.totalPreorders || 0} Preorders Made</span>
          <span className="flex items-center gap-2"><PackageIcon className="w-5 h-5" /> {summary?.ideasInProduction || 0} In Production</span>
        </div>
      </div>

      {/* Main Feed */}
      <main className="container mx-auto max-w-6xl px-4 pt-16">
        <div className="flex justify-between items-end mb-10 border-b-4 border-foreground pb-4">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">Top Pitches</h2>
        </div>

        {isIdeasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="h-96 animate-pulse bg-muted" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideaList.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} brandName={getCompanyName(idea.companyId)} />
            ))}
            {ideaList.length === 0 && (
              <div className="col-span-full py-20 text-center font-mono text-muted-foreground uppercase">
                No ideas pitched yet. Be the first.
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function PackageIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16.5 9.4 7.5 4.21" />
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  )
}
