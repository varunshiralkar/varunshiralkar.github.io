import Link from "next/link";
import DitherHero from "@/components/DitherHero";
import styles from "@/components/DitherHero.module.css";

export default function HomePage() {
  return (
    <DitherHero>
      <h1 className={styles.brand}>Varun Shiralkar</h1>
      <p className={styles.tagline}>
        Notes, experiments, and writing — kept minimal on purpose.
      </p>
      <Link href="/blog" className={styles.cta}>
        Read the blog
      </Link>
    </DitherHero>
  );
}
