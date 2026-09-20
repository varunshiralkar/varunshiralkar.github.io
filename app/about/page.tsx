import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Me",
  description: "About Varun Shiralkar.",
};

function getAboutContent(): string {
  const fullPath = path.join(process.cwd(), "content/about.md");
  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { content } = matter(fileContents);
  return content;
}

export default function AboutPage() {
  const content = getAboutContent();

  return (
    <div className="site-main--padded">
      <div className="content">
        <h1 className="page-title">About Me</h1>
        <div className={styles.body}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
        <p className={styles.links}>
          <a
            href="https://github.com/varunshiralkar"
            rel="noopener noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </p>
      </div>
    </div>
  );
}
