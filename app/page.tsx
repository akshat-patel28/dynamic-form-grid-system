import Link from "next/link";
import { NAV_LINKS } from "@/helpers/constant/constant";
import styles from "./page.module.css";

export default function Home() {
  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Dynamic Form & Grid System</h1>
        <nav className={styles.nav} aria-label="Main">
          {NAV_LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={styles.navLink}>
              {label}
            </Link>
          ))}
        </nav>
      </main>
    </div>
  );
}
