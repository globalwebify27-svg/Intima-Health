"use client";

import { motion } from "framer-motion";
import { BookOpen, ArrowRight, Clock, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const articles = [
  {
    title: "Understanding the Psychological Impact of ED",
    excerpt: "Erectile dysfunction is not just a physical condition. We explore the profound psychological effects and how comprehensive therapy can help.",
    category: "Mental Health",
    author: "Dr. Sarah Jenkins",
    readTime: "5 min read",
    date: "Oct 12, 2026"
  },
  {
    title: "The Truth About Testosterone Replacement Therapy",
    excerpt: "Separating fact from fiction. What modern clinical studies say about TRT, its benefits, and potential side effects.",
    category: "Men's Health",
    author: "Dr. Michael Chen",
    readTime: "8 min read",
    date: "Sep 28, 2026"
  },
  {
    title: "How to Build Endurance and Stamina Safely",
    excerpt: "Clinical approaches to managing premature ejaculation without relying on unverified over-the-counter supplements.",
    category: "Sexual Health",
    author: "Dr. Emily Roberts",
    readTime: "6 min read",
    date: "Sep 15, 2026"
  },
  {
    title: "Navigating Intimacy After 50",
    excerpt: "Age brings changes to our bodies and our relationships. Here is how to adapt and thrive in your intimate life.",
    category: "Relationships",
    author: "Dr. Sarah Jenkins",
    readTime: "7 min read",
    date: "Aug 30, 2026"
  }
];

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-16 lg:pb-24 bg-muted/30 overflow-hidden border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={fadeIn}
            className="max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary mb-6">
              <BookOpen className="w-8 h-8" />
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-medium mb-6">
              Clinical <span className="text-primary italic">Journal</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
              Expert insights, clinical updates, and evidence-based perspectives on longevity, sexual health, and intimacy.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Articles Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12"
          >
            {articles.map((article, idx) => (
              <motion.article 
                key={idx}
                variants={fadeIn}
                className="group flex flex-col p-8 rounded-[2rem] bg-card border border-border hover:shadow-xl hover:border-primary/20 transition-all duration-300"
              >
                <div className="text-xs font-bold uppercase tracking-widest text-primary mb-4">
                  {article.category}
                </div>
                <h3 className="text-2xl font-serif font-medium mb-4 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed mb-8 flex-1">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between pt-6 border-t border-border/50 text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5"><User className="w-4 h-4" /> {article.author}</span>
                  </div>
                  <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" /> {article.readTime}</span>
                </div>
              </motion.article>
            ))}
          </motion.div>
          
          <div className="mt-16 text-center">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Load More Articles
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
