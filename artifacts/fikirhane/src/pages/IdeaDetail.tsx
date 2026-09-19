import { useState } from "react";
import { useParams, Link } from "wouter";
import { 
  useGetIdea, 
  useGetCompany, 
  useVoteIdea, 
  usePreorderIdea,
  getGetIdeaQueryKey,
  getGetCompanyQueryKey,
  getGetIdeasSummaryQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ArrowLeft, ArrowUpCircle, Package, TrendingUp, FileText, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function IdeaDetail() {
  const { id } = useParams();
  const ideaId = parseInt(id || "0", 10);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [email, setEmail] = useState("");

  const { data: idea, isLoading: isIdeaLoading } = useGetIdea(ideaId, {
    query: { enabled: !!ideaId, queryKey: getGetIdeaQueryKey(ideaId) }
  });

  const { data: company } = useGetCompany(idea?.companyId || 0, {
    query: { enabled: !!idea?.companyId, queryKey: getGetCompanyQueryKey(idea?.companyId || 0) }
  });

  const voteMutation = useVoteIdea({
    mutation: {
      onSuccess: (updatedIdea) => {
        toast({
          title: "VOTE CAST",
          description: "You backed this idea. Tell your friends.",
        });
        queryClient.setQueryData(getGetIdeaQueryKey(ideaId), updatedIdea);
        queryClient.invalidateQueries({ queryKey: getGetIdeasSummaryQueryKey() });
      }
    }
  });

  const preorderMutation = usePreorderIdea({
    mutation: {
      onSuccess: (updatedIdea) => {
        toast({
          title: "PREORDER CONFIRMED",
          description: "You're in. We'll email you if it hits production.",
        });
        setEmail("");
        queryClient.setQueryData(getGetIdeaQueryKey(ideaId), updatedIdea);
        queryClient.invalidateQueries({ queryKey: getGetIdeasSummaryQueryKey() });
      },
      onError: () => {
        toast({
          title: "ERROR",
          description: "Could not process preorder. Please try again.",
          variant: "destructive"
        });
      }
    }
  });

  if (isIdeaLoading) return <div className="min-h-screen flex items-center justify-center font-mono font-bold uppercase animate-pulse">Loading Pitch...</div>;
  if (!idea) return <div className="p-20 text-center font-mono uppercase font-bold text-destructive">Pitch Not Found</div>;

  const isVoting = idea.status === "voting";
  const isPreorder = idea.status === "preorder";
  const isProducing = idea.status === "producing";

  const votePercentage = Math.min(100, Math.round((idea.voteCount / idea.voteThreshold) * 100));
  const preorderPercentage = Math.min(100, Math.round((idea.preorderCount / idea.preorderThreshold) * 100));

  return (
    <div className="min-h-screen pb-32">
      <div className="container mx-auto max-w-5xl px-4 pt-12">
        <Link href={`/brands/${idea.companyId}`} className="inline-flex items-center font-mono font-bold text-sm uppercase mb-8 hover:underline underline-offset-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to {company?.name || "Brand"}
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-7 space-y-8">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <Badge variant={isVoting ? "outline" : isPreorder ? "secondary" : "default"} className="text-sm px-3 py-1">
                  STATUS: {idea.status}
                </Badge>
                {company && <span className="font-mono text-primary font-bold">{company.name}</span>}
              </div>
              <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tight leading-none mb-6">
                {idea.title}
              </h1>
              
              <div className="prose max-w-none font-mono text-lg leading-relaxed whitespace-pre-wrap">
                {idea.description}
              </div>
            </div>

            {idea.imageUrl && (
              <div className="brutal-border brutal-shadow p-2 bg-background">
                <img src={idea.imageUrl} alt="Pitch Concept" className="w-full h-auto object-cover grayscale hover:grayscale-0 transition-all duration-700" />
              </div>
            )}

            {idea.pdfUrl && (
              <div className="brutal-border bg-muted/30 p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-primary" />
                  <span className="font-bold uppercase">Pitch Deck Attached</span>
                </div>
                <Button variant="outline" asChild>
                  <a href={idea.pdfUrl} target="_blank" rel="noopener noreferrer">View PDF</a>
                </Button>
              </div>
            )}
          </div>

          {/* Action Sidebar */}
          <div className="lg:col-span-5 relative">
            <div className="sticky top-24 bg-card brutal-border brutal-shadow p-8 space-y-8">
              
              {/* Campaign Progress */}
              <div className="space-y-6">
                <h3 className="font-black text-2xl uppercase tracking-tight border-b-2 border-foreground pb-2">Campaign Status</h3>
                
                {/* Phase 1: Voting */}
                <div className={`space-y-2 ${isVoting ? 'opacity-100' : 'opacity-60'}`}>
                  <div className="flex justify-between font-mono text-sm font-bold uppercase">
                    <span className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Phase 1: Votes</span>
                    <span>{idea.voteCount} / {idea.voteThreshold}</span>
                  </div>
                  <Progress value={votePercentage} indicatorColor="bg-primary" />
                  {!isVoting && <div className="text-xs font-mono text-primary flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> Cleared</div>}
                </div>

                {/* Phase 2: Preorder */}
                <div className={`space-y-2 ${!isVoting ? 'opacity-100' : 'opacity-40 grayscale'}`}>
                  <div className="flex justify-between font-mono text-sm font-bold uppercase">
                    <span className="flex items-center gap-2"><Package className="w-4 h-4" /> Phase 2: Preorders</span>
                    <span>{idea.preorderCount} / {idea.preorderThreshold}</span>
                  </div>
                  <Progress value={preorderPercentage} indicatorColor="bg-foreground" />
                  {isProducing && <div className="text-xs font-mono text-primary flex items-center gap-1 mt-1"><CheckCircle2 className="w-3 h-3" /> Funded</div>}
                </div>
              </div>

              <div className="w-full h-[2px] bg-foreground" />

              {/* Action Area */}
              <div className="space-y-4">
                {isVoting && (
                  <div className="space-y-4">
                    <p className="font-mono text-sm">This idea needs {idea.voteThreshold - idea.voteCount} more votes to enter the preorder phase.</p>
                    <Button 
                      size="lg" 
                      className="w-full text-xl h-16 gap-3" 
                      onClick={() => voteMutation.mutate({ id: ideaId })}
                      disabled={voteMutation.isPending}
                    >
                      <ArrowUpCircle className="w-6 h-6" /> 
                      {voteMutation.isPending ? "VOTING..." : "UPVOTE PITCH"}
                    </Button>
                  </div>
                )}

                {isPreorder && (
                  <form onSubmit={(e) => {
                    e.preventDefault();
                    if(email) preorderMutation.mutate({ id: ideaId, data: { email } });
                  }} className="space-y-4">
                    <p className="font-mono text-sm bg-primary/10 p-3 brutal-border">
                      Threshold reached! The brand is watching. Commit to preorder to make it a reality.
                    </p>
                    <div className="space-y-2">
                      <Input 
                        type="email" 
                        placeholder="ENTER YOUR EMAIL" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-14 font-mono uppercase"
                      />
                      <Button 
                        type="submit" 
                        size="lg" 
                        className="w-full text-xl h-16 bg-foreground text-background hover:bg-foreground/90 gap-2"
                        disabled={preorderMutation.isPending || !email}
                      >
                        <Package className="w-6 h-6" /> 
                        {preorderMutation.isPending ? "PROCESSING..." : "PREORDER NOW"}
                      </Button>
                    </div>
                  </form>
                )}

                {isProducing && (
                  <div className="bg-primary text-primary-foreground p-6 brutal-border text-center space-y-2">
                    <h4 className="font-black text-2xl uppercase">It's Happening</h4>
                    <p className="font-mono text-sm font-bold">This product is officially in production.</p>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
