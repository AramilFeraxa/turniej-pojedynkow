import { useState, useEffect, useCallback } from 'react';
import styles from '../styles/Host.module.css';
import '../app/globals.css';
import ikonka from '../images/ikonka.png';

import PlayerCard from '../Components/Host/PlayerCard';
import Controls from '../Components/Host/Controls';
import Notification from '../Components/Notification';

const initialPlayer = { name: '', house: '', spell: null, score: 0, roundsWon: 0, used: { Phh: false, Wow: false, Antares: false } };
const spellGroups = { podstawowe: ['Iskos', 'Aetos', 'Olor'], obronne: ['Phh', 'Wow'], specjalne: ['Antares'] };
const houses = ['Antares', 'Imerus', 'Semperos', 'Xifang', 'Psor'];
const pointsPerSpell = { Aetos: 2, Iskos: 2, Olor: 2, Phh: 1, Wow: 1, Antares: 3 };
const beats = { Iskos: ['Aetos'], Aetos: ['Olor'], Olor: ['Iskos'], Phh: ['Aetos', 'Iskos', 'Olor'], Wow: ['Aetos', 'Iskos', 'Olor'], Antares: ['Phh', 'Wow'] };

export default function Host() {
    const [players, setPlayers] = useState({ p1: { ...initialPlayer }, p2: { ...initialPlayer } });
    const [pending, setPending] = useState({ p1: { Phh: false, Wow: false, Antares: false }, p2: { Phh: false, Wow: false, Antares: false } });
    const [currentRound, setCurrentRound] = useState(1);
    const [roundWinner, setRoundWinner] = useState(null);
    const [matchWinner, setMatchWinner] = useState(null);
    const [showSpells, setShowSpells] = useState(false);
    const [notification, setNotification] = useState({ showError: false, msg: '' });

    const isRoundOver = Math.max(players.p1.score, players.p2.score) >= 8;

    const syncState = useCallback((extra = {}) => {
        const state = {
            players,
            currentRound,
            roundWinner,
            matchWinner,
            showSpells: extra.showSpells ?? showSpells,
            showError: extra.showError ?? notification.showError,
            errorMsg: extra.errorMsg ?? notification.msg,
        };
        localStorage.setItem('turniejState', JSON.stringify(state));
    }, [players, currentRound, roundWinner, matchWinner, showSpells, notification]);

    useEffect(() => { syncState(); }, [players, currentRound, roundWinner, matchWinner, showSpells, notification, syncState]);

    const updatePlayer = (id, updater) => setPlayers(prev => ({ ...prev, [id]: updater(prev[id]) }));
    const resetPendingFor = id => setPending(prev => ({ ...prev, [id]: { Phh: false, Wow: false, Antares: false } }));

    const handleInputChange = (id, field, value) => {
        updatePlayer(id, p => ({ ...p, [field]: value }));
    };

    const handleSpell = (id, spell) => {
        updatePlayer(id, p => {
            const newSpell = p.spell === spell ? null : spell;
            if (['Phh', 'Wow', 'Antares'].includes(newSpell)) {
                setPending(prev => ({ ...prev, [id]: { Phh: false, Wow: false, Antares: false, [newSpell]: true } }));
            } else {
                resetPendingFor(id);
            }
            return { ...p, spell: newSpell };
        });
    };

    const handleError = id => {
        const offender = players[id];
        const opponentId = id === 'p1' ? 'p2' : 'p1';
        const opponent = players[opponentId];
        if (!opponent.spell) return;

        const pts = pointsPerSpell[opponent.spell];
        updatePlayer(opponentId, p => {
            const newScore = p.score + pts;
            const updated = { ...p, score: newScore };
            if (newScore >= 8) {
                setRoundWinner(opponentId);
                updated.roundsWon++;
                if (updated.roundsWon === 2) setMatchWinner(opponentId);
            }
            return updated;
        });

        ['p1', 'p2'].forEach(playerId => {
            if (players[playerId].spell && ['Phh', 'Wow', 'Antares'].includes(players[playerId].spell)) {
                updatePlayer(playerId, p => ({
                    ...p,
                    used: { ...p.used, [p.spell]: true }
                }));
            }
        });

        setNotification({ showError: true, msg: `Błąd: ${offender.name || 'Zawodnik'} popełnił błąd! ${opponent.name || 'Przeciwnik'} otrzymuje ${pts} pkt.` });
        syncState({ showError: true, errorMsg: notification.msg });

        setTimeout(() => {
            setNotification({ showError: false, msg: '' });
            resetPendingFor('p1');
            resetPendingFor('p2');
            setPlayers(prev => ({
                p1: { ...prev.p1, spell: null },
                p2: { ...prev.p2, spell: null }
            }));
            syncState({ showError: false, errorMsg: '' });
        }, 3000);
    };

    const resolveFight = () => {
        const [p1, p2] = ['p1', 'p2'];
        if (!players.p1.spell || !players.p2.spell) return;

        const reused = id => {
            const spell = players[id].spell;
            return spell && players[id].used[spell];
        };
        if (reused(p1)) return handleError(p1);
        if (reused(p2)) return handleError(p2);

        setShowSpells(true);
        syncState({ showSpells: true });

        setTimeout(() => {
            let inc = { p1: 0, p2: 0 };
            const { spell: s1 } = players.p1;
            const { spell: s2 } = players.p2;
            if (s1 !== s2) {
                if (beats[s1]?.includes(s2)) inc.p1 = pointsPerSpell[s1];
                else if (beats[s2]?.includes(s1)) inc.p2 = pointsPerSpell[s2];
            }

            ['p1', 'p2'].forEach(id => {
                const pts = inc[id];
                updatePlayer(id, p => ({
                    ...p,
                    score: p.score + pts,
                    used: { ...p.used, ...(pending[id].Phh && { Phh: true }), ...(pending[id].Wow && { Wow: true }), ...(pending[id].Antares && { Antares: true }) }
                }));
            });

            const newWin = Object.entries(inc).find(([id, val]) => players[id].score + val >= 8)?.[0];
            if (newWin) {
                setRoundWinner(newWin);
                updatePlayer(newWin, p => ({ ...p, roundsWon: p.roundsWon + 1 }));
                if (players[newWin].roundsWon + 1 === 2) setMatchWinner(newWin);
            }

            resetPendingFor(p1);
            resetPendingFor(p2);
            setPlayers(prev => ({ p1: { ...prev.p1, spell: null }, p2: { ...prev.p2, spell: null } }));
            setShowSpells(false);
            syncState({ showSpells: false });
        }, 2000);
    };

    const nextRound = () => {
        setPlayers(prev => ({
            p1: {
                ...prev.p1,
                spell: null,
                score: 0,
                used: { Phh: false, Wow: false, Antares: false }
            },
            p2: {
                ...prev.p2,
                spell: null,
                score: 0,
                used: { Phh: false, Wow: false, Antares: false }
            }
        }));
        setRoundWinner(null);
        resetPendingFor('p1');
        resetPendingFor('p2');
        setCurrentRound(r => r + 1);
    };

    const resetGame = () => {
        setPlayers({ p1: { ...initialPlayer }, p2: { ...initialPlayer } });
        setRoundWinner(null);
        setMatchWinner(null);
        setCurrentRound(1);
        resetPendingFor('p1');
        resetPendingFor('p2');
    };

    const renderSpellUsage = p => (
        <div className={styles.spellUsage}>
            {Object.entries(p.used).map(([spell, used]) => (
                <div key={spell} className={`${styles.spellBox} ${used ? styles.used : ''}`}>{spell}</div>
            ))}
        </div>
    );

    const handleFullscreen = () => {
        const el = document.documentElement;
        document.fullscreenElement ? document.exitFullscreen?.() : el.requestFullscreen?.();
    };

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <img src={ikonka.src} alt="ikonka" className={styles.headerImageLeft} />
                <div className={styles.headerText}>
                    <h1>Panel prowadzącego</h1>
                    <p>Runda {currentRound}</p>
                    {matchWinner ? (
                        <h2 className={styles.overlayMessage}>Zwycięzca meczu: {players[matchWinner].name}</h2>
                    ) : roundWinner && (
                        <h3 className={styles.overlayMessage}>Rundę wygrywa: {players[roundWinner].name}</h3>
                    )}
                </div>
                <button onClick={handleFullscreen} className={styles.fullscreenButton}>Fullscreen</button>
            </header>
            <main className={styles.main}>
                {['p1', 'p2'].map(id => (
                    <div key={id} className={styles.playerCardWrapper}>
                        <PlayerCard
                            id={id}
                            player={players[id]}
                            pending={pending[id]}
                            spellGroups={spellGroups}
                            houses={houses}
                            handleInputChange={handleInputChange}
                            handleSpell={handleSpell}
                            handleError={handleError}
                            isRoundOver={isRoundOver}
                            isReady={players[id].name.trim() !== '' && players[id].house.trim() !== ''}
                            renderSpellUsage={renderSpellUsage}
                            opponentSpell={players[id === 'p1' ? 'p2' : 'p1'].spell}
                        />
                        <Notification
                            showSpell={showSpells}
                            showError={notification.showError && notification.msg.includes(players[id].name)}
                            player={players[id]}
                            errorMsg={notification.msg}
                        />
                    </div>
                ))}
            </main>
            <Controls
                resolveFight={resolveFight}
                nextRound={nextRound}
                resetGame={resetGame}
                disabled={!players.p1.spell || !players.p2.spell || isRoundOver}
            />
            <footer className={styles.footer}>© 2025 Mateusz Kopeć / Aramil</footer>
        </div>
    );
}
