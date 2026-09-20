import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts, formatPostDate } from "@/lib/posts";
import styles from "./blog.module.css";

export const metadata: Metadata = {
  title: "Blog",
  description: "Writing and notes by Varun Shiralkar.",
};

export default function BlogIndexPage() {
  const posts = getAllPosts();

  return (
    <div className="site-main--padded">
      <div className="content">
        <h1 className="page-title">Blog</h1>
        <p className="page-lead">Writing and notes, newest first.</p>

        {posts.length === 0 ? (
          <p className={styles.empty}>No posts yet.</p>
        ) : (
          <ul className={styles.list}>
            {posts.map((post) => (
              <li key={post.slug} className={styles.item}>
                <p className="meta">{formatPostDate(post.date)}</p>
                <h2 className={styles.title}>
                  <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                </h2>
                {post.excerpt ? (
                  <p className={styles.excerpt}>{post.excerpt}</p>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
