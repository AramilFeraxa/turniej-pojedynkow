import { useEffect, useState, useCallback } from 'react';
import styles from '../styles/Audience.module.css';
import RootLayout from '@/app/layout';
import AudiencePlayerCard from '../Components/Audience/PlayerCard';
import Notification from '../Components/Notification';
import ikonka from '../images/ikonka.png';

const houseBorder = {
    Xifang: styles.borderRed,
    Semperos: styles.borderGreen,
    Antares: styles.borderYellow,
    Imerus: styles.borderBlue,
    Psor: styles.borderPurple,
};

export default function Audience() {
    const [state, setState] = useState(null);

    const onStorage = useCallback((e) => {
        if (e.key === 'turniejState' && e.newValue) {
            setState(JSON.parse(e.newValue));
        }
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('turniejState');
        if (stored) setState(JSON.parse(stored));
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, [onStorage]);

    if (!state) {
        return <div className={styles.wrapper}>Oczekiwanie na rozpoczęcie gry...</div>;
    }

    const { players, currentRound, roundWinner, matchWinner, showSpells, showError, errorMsg } = state;

    const renderSpellBoxes = (player) => (
        <div className={styles.spellUsage}>
            <div className={styles.spellGroup}>
                <div className={styles.spellGroupLabel}>Obronne</div>
                <div className={styles.spellBoxes}>
                    <div className={`${styles.spellBox} ${player.used['Phh'] ? styles.used : ''}`}>Phh</div>
                    <div className={`${styles.spellBox} ${player.used['Wow'] ? styles.used : ''}`}>Wow</div>
                </div>
            </div>
            <div className={styles.spellGroup}>
                <div className={styles.spellGroupLabel}>Specjalne</div>
                <div className={styles.spellBoxes}>
                    <div className={`${styles.spellBox} ${player.used['Antares'] ? styles.used : ''}`}>Antares</div>
                </div>
            </div>
        </div>
    );

    const handleFullscreen = () => {
        const el = document.documentElement;
        document.fullscreenElement ? document.exitFullscreen?.() : el.requestFullscreen?.();
    };

    const renderPlayerCard = (id) => {
        const player = players[id];
        const isWinner = roundWinner === id;
        const borderColor = houseBorder[player.house] || '';

        return (
            <div key={id} className={`${styles.playerCardWrapper} ${isWinner ? styles.winnerCard : ''}`}>
                <AudiencePlayerCard
                    player={player}
                    borderColor={borderColor}
                    renderSpellBoxes={renderSpellBoxes}
                />
                <div className={styles.notificationContainer}>
                    <Notification
                        showSpell={showSpells}
                        showError={showError && errorMsg?.includes(player.name)}
                        player={player}
                        errorMsg={errorMsg}
                    />
                </div>
            </div>
        );
    };

    return (
        <RootLayout>
            <div className={styles.wrapper}>
                <header className={styles.header}>
                    <img src={ikonka.src} alt="ikonka" className={styles.headerImageLeft} />
                    <div className={styles.headerText}>
                        <h1>Turniej Pojedynków</h1>
                        <p>Runda {currentRound}</p>
                        {matchWinner ? (
                            <h2 className={styles.overlayMessage}>
                                Zwycięzca meczu: {matchWinner === 'p1' ? players.p1.name : players.p2.name}
                            </h2>
                        ) : (
                            roundWinner && (
                                <h3 className={styles.overlayMessage}>
                                    Rundę wygrywa: {roundWinner === 'p1' ? players.p1.name : players.p2.name}
                                </h3>
                            )
                        )}
                    </div>
                    <button onClick={handleFullscreen} className={styles.fullscreenButton}>
                        Fullscreen
                    </button>
                </header>

                <main className={styles.main}>
                    {renderPlayerCard('p1')}
                    <div className={styles.vs}>VS</div>
                    {renderPlayerCard('p2')}
                </main>
            </div>

            <footer className={styles.footer}>
                © 2025 Mateusz Kopeć / Aramil
            </footer>
        </RootLayout>
    );
}
