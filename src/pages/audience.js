import { useEffect, useState } from 'react';
import styles from '../styles/Audience.module.css';
import RootLayout from '@/app/layout';
import AudiencePlayerCard from '../Components/Audience/PlayerCard';
import Notification from '../Components/Notification';

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

    const handleFullscreen = () => {
        const el = document.documentElement;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const getBorderColor = (house) => {
        switch (house) {
            case 'Xifang': return styles.borderRed;
            case 'Semperos': return styles.borderGreen;
            case 'Antares': return styles.borderYellow;
            case 'Imerus': return styles.borderBlue;
            case 'Psor': return styles.borderPurple;
            default: return '';
        }
    };

    return (
        <RootLayout>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <img src="/favicon.ico" alt="ikonka" className={styles.headerImageLeft} />
                    <div className={styles.headerText}>
                        <h1>Turniej Pojedynków</h1>
                        <p>Runda {currentRound}</p>
                        {matchWinner ? (
                            <h2 className={styles.overlayMessage}>
                                Zwycięzca meczu: {matchWinner === 'p1' ? players.p1.name : players.p2.name}
                            </h2>
                        ) : roundWinner && (
                            <h3 className={styles.overlayMessage}>
                                Rundę wygrał: {roundWinner === 'p1' ? players.p1.name : players.p2.name}
                            </h3>
                        )}
                    </div>
                    <button onClick={handleFullscreen} className={styles.fullscreenButton}>
                        Fullscreen
                    </button>
                </header>

                <main className={styles.main}>
                    <div
                        className={`${styles.playerCardWrapper} ${roundWinner === 'p1' ? styles.winnerCard : ''
                            }`}
                    >
                        <AudiencePlayerCard
                            player={players.p1}
                            borderColor={getBorderColor(players.p1.house)}
                            renderSpellBoxes={renderSpellBoxes}
                        />
                        <div className={styles.notificationContainer}>
                            <Notification
                                showSpell={showSpells}
                                showError={showError && errorMsg.includes(players.p1.name)}
                                player={players.p1}
                                errorMsg={errorMsg}
                            />
                        </div>
                    </div>

                    <div className={styles.vs}>VS</div>

                    <div
                        className={`${styles.playerCardWrapper} ${roundWinner === 'p2' ? styles.winnerCard : ''
                            }`}
                    >
                        <AudiencePlayerCard
                            player={players.p2}
                            borderColor={getBorderColor(players.p2.house)}
                            renderSpellBoxes={renderSpellBoxes}
                        />
                        <div className={styles.notificationContainer}>
                            <Notification
                                showSpell={showSpells}
                                showError={showError && errorMsg.includes(players.p2.name)}
                                player={players.p2}
                                errorMsg={errorMsg}
                            />
                        </div>
                    </div>
                </main>
            </div>
            <footer className={styles.footer}>
                © 2025 Mateusz Kopeć / Aramil
            </footer>
        </RootLayout>
    );
}
