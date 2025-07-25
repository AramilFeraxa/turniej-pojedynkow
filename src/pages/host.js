import { useState, useEffect } from 'react';
import styles from '../styles/Host.module.css';
import "../app/globals.css";

import PlayerCard from '../Components/Host/PlayerCard';
import Controls from '../Components/Host/Controls';
import Notification from '../Components/Notification';

export default function Host() {
    const initialPlayer = { name: '', house: '', spell: null, score: 0, roundsWon: 0, usedPhh: false, usedWow: false, usedAntares: false };
    const [player1, setPlayer1] = useState({ ...initialPlayer });
    const [player2, setPlayer2] = useState({ ...initialPlayer });
    const [pending1, setPending1] = useState({ Phh: false, Wow: false, Antares: false });
    const [pending2, setPending2] = useState({ Phh: false, Wow: false, Antares: false });
    const [currentRound, setCurrentRound] = useState(1);
    const [roundWinner, setRoundWinner] = useState(null);
    const [matchWinner, setMatchWinner] = useState(null);
    const [showSpells, setShowSpells] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');
    const [showError, setShowError] = useState(false);

    const spellGroups = { podstawowe: ['Iskos', 'Aetos', 'Olor'], obronne: ['Phh', 'Wow'], specjalne: ['Antares'] };
    const houses = ['Antares', 'Imerus', 'Semperos', 'Xifang', 'Psor'];
    const pointsPerSpell = { Aetos: 2, Iskos: 2, Olor: 2, Phh: 1, Wow: 1, Antares: 3 };
    const beats = { Iskos: ['Aetos'], Aetos: ['Olor'], Olor: ['Iskos'], Phh: ['Aetos', 'Iskos', 'Olor'], Wow: ['Aetos', 'Iskos', 'Olor'], Antares: ['Phh', 'Wow'] };
    const isRoundOver = player1.score >= 8 || player2.score >= 8;

    const syncState = (extra = {}) => {
        const state = { players: { p1: player1, p2: player2 }, currentRound, roundWinner, matchWinner, showSpells: extra.showSpells ?? showSpells, showError, errorMsg: extra.errorMsg || errorMsg };
        localStorage.setItem('turniejState', JSON.stringify(state));
    };

    useEffect(() => { syncState(); }, [player1, player2, currentRound, roundWinner, matchWinner, showSpells]);

    const handleInputChange = (player, field, value) => player === 'p1' ? setPlayer1(p => ({ ...p, [field]: value })) : setPlayer2(p => ({ ...p, [field]: value }));

    const handleSpell = (player, spell) => {
        const resetPending = { Phh: false, Wow: false, Antares: false };

        if (player === 'p1') {
            setPlayer1(p => {
                const newSpell = p.spell === spell ? null : spell;
                if (['Phh', 'Wow', 'Antares'].includes(newSpell)) {
                    setPending1({ ...resetPending, [newSpell]: true });
                } else {
                    setPending1(resetPending);
                }
                return { ...p, spell: newSpell };
            });
        } else {
            setPlayer2(p => {
                const newSpell = p.spell === spell ? null : spell;
                if (['Phh', 'Wow', 'Antares'].includes(newSpell)) {
                    setPending2({ ...resetPending, [newSpell]: true });
                } else {
                    setPending2(resetPending);
                }
                return { ...p, spell: newSpell };
            });
        }
    };


    const handleError = (player) => {
        const offender = player === 'p1' ? player1 : player2;
        const opponent = player === 'p1' ? player2 : player1;
        if (!opponent.spell) return;

        const pts = pointsPerSpell[opponent.spell];

        if (player === 'p1') {
            setPlayer2(p => {
                const newScore = p.score + pts;
                let winnerDetected = false;

                if (newScore >= 8) {
                    setRoundWinner('p2');
                    setPlayer2(pp => ({ ...pp, roundsWon: pp.roundsWon + 1 }));
                    if (p.roundsWon + 1 === 2) setMatchWinner('p2');
                    winnerDetected = true;
                }

                return { ...p, score: newScore };
            });
        } else {
            setPlayer1(p => {
                const newScore = p.score + pts;
                let winnerDetected = false;

                if (newScore >= 8) {
                    setRoundWinner('p1');
                    setPlayer1(pp => ({ ...pp, roundsWon: pp.roundsWon + 1 }));
                    if (p.roundsWon + 1 === 2) setMatchWinner('p1');
                    winnerDetected = true;
                }

                return { ...p, score: newScore };
            });
        }

        setErrorMsg(`Błąd: ${offender.name || 'Zawodnik'} popełnił błąd! ${opponent.name || 'Przeciwnik'} otrzymuje ${pts} pkt.`);
        setShowError(true);
        syncState({ errorMsg: `Błąd: ${offender.name || 'Zawodnik'} popełnił błąd! ${opponent.name || 'Przeciwnik'} otrzymuje ${pts} pkt.` });

        setTimeout(() => {
            setErrorMsg('');
            setShowError(false);
            syncState({ errorMsg: '' });

            setPending1({ Phh: false, Wow: false, Antares: false });
            setPending2({ Phh: false, Wow: false, Antares: false });
            setPlayer1(p => ({ ...p, spell: null }));
            setPlayer2(p => ({ ...p, spell: null }));
        }, 3000);
    };


    const resolveFight = () => {
        if (!player1.spell || !player2.spell) return;

        const checkReuse = (player, pending) => {
            return (
                (player.spell === 'Phh' && player.usedPhh) ||
                (player.spell === 'Wow' && player.usedWow) ||
                (player.spell === 'Antares' && player.usedAntares)
            );
        };

        if (checkReuse(player1, pending1)) {
            handleError('p1');
            return;
        }
        if (checkReuse(player2, pending2)) {
            handleError('p2');
            return;
        }

        setShowSpells(true);
        syncState({ showSpells: true });

        setTimeout(() => {
            let p1Inc = 0, p2Inc = 0;
            if (player1.spell !== player2.spell) {
                if (beats[player1.spell]?.includes(player2.spell)) p1Inc = pointsPerSpell[player1.spell];
                else if (beats[player2.spell]?.includes(player1.spell)) p2Inc = pointsPerSpell[player2.spell];
            }

            setPlayer1(p => ({
                ...p,
                score: p.score + p1Inc,
                usedPhh: pending1.Phh || p.usedPhh,
                usedWow: pending1.Wow || p.usedWow,
                usedAntares: pending1.Antares || p.usedAntares
            }));

            setPlayer2(p => ({
                ...p,
                score: p.score + p2Inc,
                usedPhh: pending2.Phh || p.usedPhh,
                usedWow: pending2.Wow || p.usedWow,
                usedAntares: pending2.Antares || p.usedAntares
            }));

            let winner = null;
            if (player1.score + p1Inc >= 8) winner = 'p1';
            if (player2.score + p2Inc >= 8) winner = 'p2';

            if (winner) {
                if (winner === 'p1') {
                    setPlayer1(p => ({ ...p, roundsWon: p.roundsWon + 1 }));
                    setRoundWinner('p1');
                    if (player1.roundsWon + 1 === 2) setMatchWinner('p1');
                } else {
                    setPlayer2(p => ({ ...p, roundsWon: p.roundsWon + 1 }));
                    setRoundWinner('p2');
                    if (player2.roundsWon + 1 === 2) setMatchWinner('p2');
                }
            }

            setPending1({ Phh: false, Wow: false, Antares: false });
            setPending2({ Phh: false, Wow: false, Antares: false });
            setPlayer1(p => ({ ...p, spell: null }));
            setPlayer2(p => ({ ...p, spell: null }));
            setShowSpells(false);
            syncState({ showSpells: false });
        }, 2000);
    };

    const nextRound = () => {
        setPlayer1(p => ({
            ...p,
            score: 0,
            spell: null,
            usedPhh: false,
            usedWow: false,
            usedAntares: false
        }));
        setPlayer2(p => ({
            ...p,
            score: 0,
            spell: null,
            usedPhh: false,
            usedWow: false,
            usedAntares: false
        }));
        setRoundWinner(null);
        setPending1({ Phh: false, Wow: false, Antares: false });
        setPending2({ Phh: false, Wow: false, Antares: false });
        setCurrentRound(r => r + 1);
    };
    const resetGame = () => { setPlayer1({ ...initialPlayer }); setPlayer2({ ...initialPlayer }); setRoundWinner(null); setMatchWinner(null); setCurrentRound(1); setPending1({ Phh: false, Wow: false, Antares: false }); setPending2({ Phh: false, Wow: false, Antares: false }); };

    const renderSpellUsage = (player) => (
        <div className={styles.spellUsage}>
            <div className={`${styles.spellBox} ${player.usedPhh ? styles.used : ''}`}>Phh</div>
            <div className={`${styles.spellBox} ${player.usedWow ? styles.used : ''}`}>Wow</div>
            <div className={`${styles.spellBox} ${player.usedAntares ? styles.used : ''}`}>Antares</div>
        </div>
    );

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <h1>Panel prowadzącego</h1>
                <p>Runda {currentRound}</p>
                {matchWinner ? (
                    <h2 className={styles.overlayMessage}>
                        Zwycięzca meczu: {matchWinner === 'p1' ? player1.name : player2.name}
                    </h2>
                ) : roundWinner && (
                    <h3 className={styles.overlayMessage}>
                        Rundę wygrał: {roundWinner === 'p1' ? player1.name : player2.name}
                    </h3>
                )}
            </header>
            <main className={styles.main}>
                {[
                    { id: 'p1', player: player1, pending: pending1, opponentSpell: player2.spell },
                    { id: 'p2', player: player2, pending: pending2, opponentSpell: player1.spell }
                ].map(({ id, player, pending, opponentSpell }) => (
                    <div key={id} className={styles.playerCardWrapper}>
                        <PlayerCard
                            {...{ id, player, pending, spellGroups, houses, handleInputChange, handleSpell, handleError }}
                            isRoundOver={isRoundOver}
                            isReady={player.name.trim() !== '' && player.house.trim() !== ''}
                            renderSpellUsage={renderSpellUsage}
                            opponentSpell={opponentSpell}
                        />
                        <Notification
                            showSpell={showSpells}
                            showError={showError && errorMsg.includes(player.name)}
                            player={player}
                            errorMsg={errorMsg}
                        />
                    </div>
                ))}

            </main>

            <Controls resolveFight={resolveFight} nextRound={nextRound} resetGame={resetGame} disabled={!player1.spell || !player2.spell || isRoundOver} />
        </div>
    );
}
