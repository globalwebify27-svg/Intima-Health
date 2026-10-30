import { connectDB } from "@/db/connect";
import { PostModel } from "@/modules/cms/schema";
import { BookOpen, Clock, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";

export const revalidate = 120; // Revalidate every 2 minutes

export const metadata: Metadata = {
  title: "Clinical Journal | KELKAR MANAS HEALTH CLINIC",
  description:
    "Expert insights, clinical updates, and evidence-based perspectives on mental health, psychiatry, and wellness.",
};

export default async function BlogPage() {
  await connectDB();

  const postsDocs = await PostModel.find({ status: "Published" })
    .populate("categoryId")
    .sort({ createdAt: -1 })
    .lean();

  const posts = JSON.parse(JSON.stringify(postsDocs || []));

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-muted/30 overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="max-w-3xl mx-auto">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="w-8 h-8" />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6">
              Clinical <span className="text-primary italic">Journal</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Expert insights, clinical updates, and evidence-based perspectives on mental health, psychiatry, and wellness.
            </p>
          </div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {posts.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No journal articles published yet. Check back later!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
              {posts.map((article: any, idx: number) => (
                <Link href={`/blog/${article.slug}`} key={article._id || idx}>
                  <article className="group flex flex-col p-8 rounded-[2rem] bg-card border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300 h-full cursor-pointer">
                    <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                      {article.categoryId?.name || "Mental Health"}
                    </div>
                    <h3 className="text-2xl font-serif font-medium mb-4 group-hover:text-primary transition-colors">
                      {article.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between pt-6 border-t border-border/50 text-sm text-muted-foreground mt-auto">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5">
                          <User className="w-4 h-4" /> {article.author}
                        </span>
                      </div>
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> {article.readTime || "5 min read"}
                      </span>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-16 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              All Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
