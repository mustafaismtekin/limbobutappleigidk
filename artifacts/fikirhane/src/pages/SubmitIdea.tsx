import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateIdea, useListCompanies, getListIdeasQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Zap } from "lucide-react";

const submitSchema = z.object({
  companyId: z.coerce.number().min(1, "Select a brand"),
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(20, "Description needs to be convincing (at least 20 chars)"),
  imageUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  pdfUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  voteThreshold: z.coerce.number().min(10, "Minimum 10 votes to be serious").default(100),
  preorderThreshold: z.coerce.number().min(10, "Minimum 10 preorders").default(500),
});

export default function SubmitIdea() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Try to pre-fill companyId if passed in URL (wouter doesn't have useSearchParams out of box without custom hook, so we parse location.search manually)
  const searchParams = new URLSearchParams(window.location.search);
  const initialCompanyId = searchParams.get("companyId");

  const { data: companies, isLoading: isCompaniesLoading } = useListCompanies();
  const companyList = Array.isArray(companies) ? companies : [];
  
  const form = useForm<z.infer<typeof submitSchema>>({
    resolver: zodResolver(submitSchema),
    defaultValues: {
      companyId: initialCompanyId ? parseInt(initialCompanyId, 10) : undefined,
      title: "",
      description: "",
      imageUrl: "",
      pdfUrl: "",
      voteThreshold: 100,
      preorderThreshold: 500,
    },
  });

  const createMutation = useCreateIdea({
    mutation: {
      onSuccess: (idea) => {
        toast({ title: "PITCH LIVE", description: "Time to rally the fans." });
        queryClient.invalidateQueries({ queryKey: getListIdeasQueryKey() });
        setLocation(`/ideas/${idea.id}`);
      },
      onError: () => {
        toast({ title: "ERROR", description: "Failed to submit pitch.", variant: "destructive" });
      }
    }
  });

  function onSubmit(values: z.infer<typeof submitSchema>) {
    createMutation.mutate({
      data: {
        ...values,
        imageUrl: values.imageUrl || undefined,
        pdfUrl: values.pdfUrl || undefined,
      }
    });
  }

  return (
    <div className="min-h-screen bg-muted/20 py-16 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="mb-10 text-center">
          <Zap className="w-12 h-12 text-primary mx-auto mb-4" />
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4">Pitch It</h1>
          <p className="font-mono text-muted-foreground text-lg">
            Make your case. Set the goals. If the community backs it, the brand can't ignore it.
          </p>
        </div>

        <div className="bg-card brutal-border brutal-shadow p-6 md:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              
              <FormField
                control={form.control}
                name="companyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Target Brand</FormLabel>
                    <Select 
                      disabled={isCompaniesLoading} 
                      onValueChange={field.onChange} 
                      defaultValue={field.value?.toString()}
                    >
                      <FormControl>
                        <SelectTrigger className="h-14 brutal-border text-lg font-mono">
                          <SelectValue placeholder="Select who should build this" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="brutal-border brutal-shadow">
                        {companyList.map((c) => (
                          <SelectItem key={c.id} value={c.id.toString()} className="font-mono">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>Can't find them? <a href="/brands/new" className="underline text-primary">Add a new brand</a>.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full h-1 bg-foreground/10" />

              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">Product Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Italian Caramel Oreos" className="h-14 text-lg font-bold" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg">The Pitch</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What is it? What is it supposed to be? How would it work? What's on your mind?" 
                        className="min-h-[200px] text-lg font-mono leading-relaxed" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="w-full h-1 bg-foreground/10" />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Concept Image URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pdfUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pitch Deck PDF URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://..." className="font-mono text-sm" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-primary/10 p-6 brutal-border space-y-6">
                <h3 className="font-black uppercase text-xl">Campaign Goals</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="voteThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Votes Needed</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="font-mono text-lg h-12" />
                        </FormControl>
                        <FormDescription>To unlock preorders</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preorderThreshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preorders Needed</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} className="font-mono text-lg h-12" />
                        </FormControl>
                        <FormDescription>To trigger production</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-16 text-2xl tracking-widest gap-2"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending ? "LAUNCHING..." : "LAUNCH PITCH"}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
