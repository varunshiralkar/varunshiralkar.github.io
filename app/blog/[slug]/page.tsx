import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { formatPostDate, getPostBySlug, getPostSlugs } from "@/lib/posts";
import styles from "../blog.module.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Post" };

  return {
    title: post.title,
    description: post.excerpt || post.title,
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="site-main--padded">
      <article className="content">
        <header className={styles.articleHeader}>
          <p className="meta">{formatPostDate(post.date)}</p>
          <h1 className="page-title">{post.title}</h1>
        </header>
        <div className={styles.articleBody}>
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
        <Link href="/blog" className={styles.back}>
          ← Back to blog
        </Link>
      </article>
    </div>
  );
}
