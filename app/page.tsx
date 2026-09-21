import Link from "next/link";
import DitherHero from "@/components/DitherHero";
import styles from "@/components/DitherHero.module.css";

export default function HomePage() {
  return (
    <DitherHero>
      <h1 className={styles.brand}>Varun Shiralkar</h1>
      <p className={styles.tagline}>
        Croissant for your thoughts?
      </p>
      <Link href="/blog" className={styles.cta}>
        Read the blog
      </Link>
    </DitherHero>
  );
}
