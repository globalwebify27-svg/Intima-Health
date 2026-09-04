"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Clock, User, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      try {
        const res = await fetch(`/api/public/posts/${slug}`);
        const json = await res.json();
        if (json.success) {
          setPost(json.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPost();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col justify-center items-center text-center p-4">
        <h1 className="text-3xl font-serif text-primary mb-4">Post Not Found</h1>
        <p className="text-muted-foreground mb-8">The article you're looking for doesn't exist or has been removed.</p>
        <Link href="/blog">
          <Button variant="outline">Back to Journal</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Article Header */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24 bg-muted/30 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-8">
            <ArrowLeft className="mr-2 w-4 h-4" />
            Back to Journal
          </Link>
          
          <div className="text-sm font-bold uppercase tracking-widest text-primary mb-6">
            {post.categoryId?.name || "Clinical Insights"}
          </div>
          
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-medium leading-tight mb-8">
            {post.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{post.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{post.readTime || "5 min read"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Article Content */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
          <div 
            className="prose prose-lg dark:prose-invert prose-headings:font-serif prose-headings:font-medium prose-a:text-primary max-w-none"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
          
          <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <span className="font-medium">Share this article:</span>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                  <span className="sr-only">Share on Twitter</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path></svg>
                </Button>
                <Button variant="outline" size="icon" className="rounded-full w-10 h-10">
                  <span className="sr-only">Share on LinkedIn</span>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd"></path></svg>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
