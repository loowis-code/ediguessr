import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>
          Edi<span className={styles.highlight}>Guessr</span>
        </h1>
        <p className={styles.subtitle}>
          Explore Edinburgh through street views and test your geography knowledge
        </p>

        <div className={styles.actions}>
          <Link href="/create" className={styles.primaryButton}>
            Create Game
          </Link>
          <Link href="/join" className={styles.secondaryButton}>
            Join Game
          </Link>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>
              <span className={styles.emoji}>🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
              <span>Edinburgh Only</span>
            </h3>
            <p>All locations within Scotland's capital city</p>
          </div>
          <div className={styles.feature}>
            <h3>
              <span className={styles.emoji}>👥</span>
              <span>Multiplayer</span>
            </h3>
            <p>Play with friends in real-time</p>
          </div>
          <div className={styles.feature}>
            <h3>
              <span className={styles.emoji}>🎮</span>
              <span>Free</span>
            </h3>
            <p>No sign-up required, completely free</p>
          </div>
        </div>
      </div>
    </main>
  );
}
