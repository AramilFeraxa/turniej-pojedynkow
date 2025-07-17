import { useEffect, useState } from 'react';
import styles from '../styles/Audience.module.css';
import RootLayout from '@/app/layout';

export default function Audience() {
    const [state, setState] = useState(null);

    useEffect(() => {
        const stored = localStorage.getItem('turniejState');
        if (stored) setState(JSON.parse(stored));

        const listener = (e) => {
            if (e.key === 'turniejState') {
                setState(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', listener);
        return () => window.removeEventListener('storage', listener);
    }, []);

    if (!state) return <div className={styles.wrapper}>Oczekiwanie na rozpoczęcie gry...</div>;

    const { players, currentRound, roundWinner, matchWinner, showSpells, showError, errorMsg } = state;

    const renderSpellBoxes = (player) => (
        <div className={styles.spellUsage}>
            <div className={styles.spellGroup}>
                <div className={styles.spellGroupLabel}>Obronne</div>
                <div className={styles.spellBoxes}>
                    <div className={`${styles.spellBox} ${player.usedPhh ? styles.used : ''}`}>Phh</div>
                    <div className={`${styles.spellBox} ${player.usedWow ? styles.used : ''}`}>Wow</div>
                </div>
            </div>
            <div className={styles.spellGroup}>
                <div className={styles.spellGroupLabel}>Specjalne</div>
                <div className={styles.spellBoxes}>
                    <div className={`${styles.spellBox} ${player.usedAntares ? styles.used : ''}`}>Antares</div>
                </div>
            </div>
        </div>
    );

    return (
        <RootLayout>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <h1>Turniej Pojedynków — Widownia</h1>
                    <p>Runda {currentRound}</p>
                    {matchWinner && (
                        <h2 className={styles.highlight}>Zwycięzca meczu: {matchWinner === 'p1' ? players.p1.name : players.p2.name}</h2>
                    )}
                    {roundWinner && (
                        <h3 className={styles.subHighlight}>Rundę wygrał: {roundWinner === 'p1' ? players.p1.name : players.p2.name}</h3>
                    )}
                </header>

                <main className={styles.main}>
                    <section className={styles.playerCard}>
                        <h2>{players.p1.name}</h2>
                        <p>Dom: {players.p1.house}</p>
                        <p>Punkty: {players.p1.score}</p>
                        <p>Wygrane rundy: {players.p1.roundsWon}</p>
                        {renderSpellBoxes(players.p1)}
                    </section>

                    <div className={styles.vs}>VS</div>

                    <section className={styles.playerCard}>
                        <h2>{players.p2.name}</h2>
                        <p>Dom: {players.p2.house}</p>
                        <p>Punkty: {players.p2.score}</p>
                        <p>Wygrane rundy: {players.p2.roundsWon}</p>
                        {renderSpellBoxes(players.p2)}
                    </section>
                </main>

                {showSpells && (
                    <div className={styles.notification}>
                        {players.p1.name} rzucił {players.p1.spell} & {players.p2.name} rzucił {players.p2.spell}
                    </div>
                )}

                {showError && (
                    <div className={styles.errorMsg}>
                        {errorMsg}
                    </div>
                )}
            </div>
        </RootLayout>
    );
}
