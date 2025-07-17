import { useState, useEffect } from 'react';
import styles from '../styles/Host.module.css';
import "../app/globals.css";

export default function Host() {
    const initialPlayer = {
        name: '',
        house: '',
        spell: null,
        score: 0,
        roundsWon: 0,
        usedPhh: false,
        usedWow: false,
        usedAntares: false,
    };

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

    const spellGroups = {
        podstawowe: ['Aetos', 'Iskos', 'Olor'],
        obronne: ['Phh', 'Wow'],
        specjalne: ['Antares'],
    };

    const houses = ['Antares', 'Imerus', 'Semperos', 'Xifang']

    const pointsPerSpell = {
        Aetos: 2,
        Iskos: 2,
        Olor: 2,
        Phh: 1,
        Wow: 1,
        Antares: 3,
    };

    const beats = {
        Iskos: ['Aetos'],
        Aetos: ['Olor'],
        Olor: ['Iskos'],
        Phh: ['Aetos', 'Iskos', 'Olor'],
        Wow: ['Aetos', 'Iskos', 'Olor'],
        Antares: ['Phh', 'Wow'],
    };

    const syncState = (extra = {}) => {
        const state = {
            players: { p1: player1, p2: player2 },
            currentRound,
            roundWinner,
            matchWinner,
            showSpells: extra.showSpells ?? showSpells,
            showError,
            errorMsg: extra.errorMsg || errorMsg,
        };
        localStorage.setItem('turniejState', JSON.stringify(state));
    };

    useEffect(() => {
        syncState();
    }, [player1, player2, currentRound, roundWinner, matchWinner, showSpells]);

    const handleInputChange = (player, field, value) => {
        if (player === 'p1') setPlayer1(p => ({ ...p, [field]: value }));
        else setPlayer2(p => ({ ...p, [field]: value }));
    };

    const handleSpell = (player, spell) => {
        if (player === 'p1') {
            setPlayer1(p => ({ ...p, spell }));
            if (spell === 'Phh' || spell === 'Wow' || spell === 'Antares') {
                setPending1(p => ({ ...p, [spell]: true }));
            }
        } else {
            setPlayer2(p => ({ ...p, spell }));
            if (spell === 'Phh' || spell === 'Wow' || spell === 'Antares') {
                setPending2(p => ({ ...p, [spell]: true }));
            }
        }
    };

    const handleError = (player) => {
        const offender = player === 'p1' ? player1 : player2;
        const opponent = player === 'p1' ? player2 : player1;
        if (!opponent.spell) return;
        const pts = pointsPerSpell[opponent.spell];
        if (player === 'p1') {
            setPlayer2(p => ({ ...p, score: p.score + pts }));
        } else {
            setPlayer1(p => ({ ...p, score: p.score + pts }));
        }
        setErrorMsg(`Błąd: ${offender.name || 'Zawodnik'} popełnił błąd! ${opponent.name || 'Przeciwnik'} otrzymuje ${pts} pkt.`);
        setShowError(true);
        syncState({ errorMsg: `Błąd: ${offender.name || 'Zawodnik'} popełnił błąd! ${opponent.name || 'Przeciwnik'} otrzymuje ${pts} pkt.` });
        setTimeout(() => {
            setErrorMsg('');
            setShowError(false);
            syncState({ errorMsg: '' });
        }, 3000);
    };

    const resolveFight = () => {
        if (!player1.spell || !player2.spell) return;

        setShowSpells(true);
        syncState({ showSpells: true });

        setTimeout(() => {
            let p1Inc = 0;
            let p2Inc = 0;

            if (player1.spell === player2.spell) {
                // remis
            } else if (beats[player1.spell]?.includes(player2.spell)) {
                p1Inc = pointsPerSpell[player1.spell];
            } else if (beats[player2.spell]?.includes(player1.spell)) {
                p2Inc = pointsPerSpell[player2.spell];
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

    const resetGame = () => {
        setPlayer1({ ...initialPlayer });
        setPlayer2({ ...initialPlayer });
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
        setMatchWinner(null);
        setCurrentRound(1);
        setPending1({ Phh: false, Wow: false, Antares: false });
        setPending2({ Phh: false, Wow: false, Antares: false });
    };

    return (
        <div className={styles.wrapper}>
            <header className={styles.header}>
                <h1>Panel prowadzącego</h1>
                <p>Runda {currentRound}</p>
                {matchWinner && <h2 className={styles.highlight}>Zwycięzca meczu: {player1.name}</h2>}
                {roundWinner && <h3 className={styles.subHighlight}>Rundę wygrał: {player1.name}</h3>}
            </header>

            <main className={styles.main}>
                {[{ id: 'p1', player: player1, pending: pending1 }, { id: 'p2', player: player2, pending: pending2 }].map(({ id, player, pending }) => (
                    <section key={id} className={styles.playerCard}>
                        <h2>{id === 'p1' ? 'Zawodnik 1' : 'Zawodnik 2'}</h2>
                        <input placeholder="Imię i nazwisko" value={player.name} onChange={e => handleInputChange(id, 'name', e.target.value)} />
                        <select value={player.house} onChange={e => handleInputChange(id, 'house', e.target.value)}>
                            <option value="">Wybierz dom</option>
                            {houses.map(house => (
                                <option key={house} value={house}>{house}</option>
                            ))}
                        </select>
                        {Object.entries(spellGroups).map(([group, spells]) => (
                            <div key={group} className={styles.group}>
                                <h3>{group}</h3>
                                {spells.map(spell => {
                                    const used =
                                        (spell === 'Phh' && player.usedPhh) ||
                                        (spell === 'Wow' && player.usedWow) ||
                                        (spell === 'Antares' && player.usedAntares);

                                    return (
                                        <button
                                            key={spell}
                                            onClick={() => handleSpell(id, spell)}
                                            className={`${player.spell === spell ? styles.active : ''} ${used ? styles.disabledButton : ''}`}
                                            disabled={used}
                                        >
                                            {spell}
                                        </button>
                                    );
                                })}
                            </div>
                        ))}
                        <div className={styles.pointBox}>
                            <p>Punkty: <strong>{player.score}</strong> | Rundy: <strong>{player.roundsWon}</strong></p>
                        </div>
                        <button className={styles.errorButton} onClick={() => handleError(id)}>Błąd</button>
                    </section>
                ))}
            </main>

            <div className={styles.controls}>
                <button onClick={resolveFight} disabled={!player1.spell || !player2.spell}>Zatwierdź</button>
                <button onClick={nextRound}>Nowa Runda</button>
                <button onClick={resetGame}>Nowa Gra</button>
            </div>

            {showSpells && <div className={styles.notification}>{player1.name} rzucił {player1.spell} & {player2.name} rzucił {player2.spell}</div>}
            {errorMsg && <div className={styles.errorMsg}>{errorMsg}</div>}
        </div>
    );
}
