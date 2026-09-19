import { useParams, Link } from "wouter";
import { useGetCompany, useListIdeas, getGetCompanyQueryKey, getListIdeasQueryKey } from "@workspace/api-client-react";
import { IdeaCard } from "@/components/IdeaCard";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Megaphone } from "lucide-react";

export default function BrandDetail() {
  const { id } = useParams();
  const companyId = parseInt(id || "0", 10);
  
  const { data: company, isLoading: isCompanyLoading } = useGetCompany(companyId, {
    query: { enabled: !!companyId, queryKey: getGetCompanyQueryKey(companyId) }
  });
  
  const { data: ideas, isLoading: isIdeasLoading } = useListIdeas(
    { companyId },
    { query: { enabled: !!companyId, queryKey: getListIdeasQueryKey({ companyId }) } }
  );
  const ideaList = Array.isArray(ideas) ? ideas : [];

  if (isCompanyLoading) return <div className="p-20 text-center font-mono uppercase font-bold animate-pulse">Loading Target...</div>;
  if (!company) return <div className="p-20 text-center font-mono uppercase font-bold text-destructive">Brand Not Found</div>;

  return (
    <div className="min-h-screen pb-20">
      {/* Brand Header */}
      <section className="bg-primary border-b-4 border-foreground pt-12 pb-16 px-4">
        <div className="container mx-auto max-w-6xl">
          <Link href="/brands" className="inline-flex items-center font-mono font-bold text-sm uppercase mb-8 hover:underline underline-offset-4">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Brands
          </Link>
          
          <div className="flex flex-col md:flex-row gap-8 items-start justify-between">
            <div>
              <h1 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4">{company.name}</h1>
              <p className="text-xl font-mono max-w-2xl text-foreground/80">{company.description}</p>
            </div>
            
            <Link href={`/submit?companyId=${company.id}`}>
              <Button size="lg" className="bg-foreground text-background hover:bg-foreground/90 gap-2 whitespace-nowrap brutal-shadow-none shadow-[4px_4px_0px_0px_#ffffff] hover:shadow-[6px_6px_0px_0px_#ffffff] border-foreground">
                <Megaphone className="w-5 h-5" /> Pitch Idea to {company.name}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Ideas Feed */}
      <main className="container mx-auto max-w-6xl px-4 pt-16">
        <h2 className="text-3xl font-black uppercase tracking-tight mb-8 border-b-2 border-foreground pb-2">Pitches</h2>

        {isIdeasLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 animate-pulse bg-muted brutal-border" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ideaList.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} brandName={company.name} />
            ))}
            {ideaList.length === 0 && (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-foreground p-12">
                <p className="font-mono text-xl uppercase font-bold mb-4">No pitches yet.</p>
                <Link href={`/submit?companyId=${company.id}`}>
                  <Button variant="outline">Be the first</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
