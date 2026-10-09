import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Building2 } from "lucide-react";

const brandSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z.string().min(2, "Slug must be at least 2 characters").regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers, and hyphens only"),
  description: z.string().min(10, "Brief description required"),
  logoUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
});

export default function CreateBrand() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  
  const form = useForm<z.infer<typeof brandSchema>>({
    resolver: zodResolver(brandSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      logoUrl: "",
    },
  });

  function onSubmit(values: z.infer<typeof brandSchema>) {
    // Brand requests are reviewed before going live -- no direct creation.
    toast({ title: "SENT TO THE TEAM", description: `Your request for ${values.name} was sent to the admins for review.` });
    setLocation("/brands");
  }

  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    form.setValue("name", e.target.value);
    if (!form.formState.touchedFields.slug) {
      form.setValue("slug", e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""));
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-16 px-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="mb-10 text-center">
          <Building2 className="w-12 h-12 mx-auto mb-4" />
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-4">Add a Brand</h1>
          <p className="font-mono text-muted-foreground">
            Put them on the radar.
          </p>
        </div>

        <div className="bg-card brutal-border brutal-shadow p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Lego, Nike, Oreo" className="h-12 text-lg font-bold" {...field} onChange={(e) => {
                        field.onChange(e);
                        handleNameChange(e);
                      }} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL Slug</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. nike" className="font-mono" {...field} />
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
                    <FormLabel>Brief Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="What do they make?" 
                        className="min-h-[100px] font-mono" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Logo URL (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="https://..." className="font-mono text-sm" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button 
                type="submit" 
                size="lg" 
                className="w-full h-14 text-xl tracking-widest"
              >
                SEND REQUEST
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
