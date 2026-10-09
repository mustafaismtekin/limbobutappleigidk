import { Idea, IdeaStatus } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui/card";
import { Progress } from "./ui/progress";
import { Badge } from "./ui/badge";
import { TrendingUp, Package } from "lucide-react";

export function IdeaCard({ idea, brandName }: { idea: Idea; brandName?: string }) {
  const isPreorder = idea.status === 'preorder';
  const isProducing = idea.status === 'producing';
  
  const currentCount = isPreorder || isProducing ? idea.preorderCount : idea.voteCount;
  const threshold = isPreorder || isProducing ? idea.preorderThreshold : idea.voteThreshold;
  const percentage = Math.min(100, Math.round((currentCount / threshold) * 100));

  return (
    <Link href={`/ideas/${idea.id}`} className="block animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="h-full flex flex-col hover:bg-muted/10 transition-colors">
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              {brandName && <CardDescription className="mb-1 text-primary">{brandName}</CardDescription>}
              <CardTitle className="line-clamp-2">{idea.title}</CardTitle>
            </div>
            <Badge variant={isProducing ? "default" : isPreorder ? "secondary" : "outline"} className="whitespace-nowrap">
              {idea.status}
            </Badge>
          </div>
        </CardHeader>
        {idea.imageUrl && (
          <div className="w-full h-48 border-b-2 border-foreground overflow-hidden bg-muted">
            <img src={idea.imageUrl} alt={idea.title} className="w-full h-full object-cover object-center grayscale hover:grayscale-0 transition-all duration-500" />
          </div>
        )}
        <CardContent className="flex-1 py-4">
          <p className="text-muted-foreground line-clamp-3 mb-6 font-mono text-sm">{idea.description}</p>
        </CardContent>
        <CardFooter className="flex-col gap-2 pt-0">
          <div className="flex justify-between w-full text-xs font-mono font-bold uppercase">
            <span className="flex items-center gap-1">
              {isPreorder ? <Package className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
              {currentCount} {isPreorder ? 'Preorders' : 'Votes'}
            </span>
            <span>{threshold} Goal</span>
          </div>
          <Progress 
            value={percentage} 
            className="h-3"
            indicatorColor={isPreorder ? "bg-foreground" : "bg-primary"}
          />
        </CardFooter>
      </Card>
    </Link>
  );
}
