import SpellGroup from './SpellGroup';
import styles from '../../styles/Host.module.css';

export default function PlayerCard({
    id, player, pending, spellGroups, houses, handleInputChange, handleSpell, handleError, isRoundOver, isReady
}) {
    return (
        <section className={styles.playerCard}>
            <h2>{id === 'p1' ? 'Zawodnik 1' : 'Zawodnik 2'}</h2>
            <input placeholder="Imię i nazwisko" value={player.name} onChange={e => handleInputChange(id, 'name', e.target.value)} />
            <select value={player.house} onChange={e => handleInputChange(id, 'house', e.target.value)}>
                <option value="">Wybierz dom</option>
                {houses.map(house => (
                    <option key={house} value={house}>{house}</option>
                ))}
            </select>
            {Object.entries(spellGroups).map(([group, spells]) => (
                <SpellGroup
                    key={group}
                    group={group}
                    spells={spells}
                    player={player}
                    id={id}
                    handleSpell={handleSpell}
                    isRoundOver={isRoundOver}
                    isReady={isReady}
                />
            ))}
            <div className={styles.pointBox}>
                <p>Punkty: <strong>{player.score}</strong> | Rundy: <strong>{player.roundsWon}</strong></p>
            </div>
            <button className={styles.errorButton} disabled={isRoundOver || !isReady || !player.spell} onClick={() => handleError(id)}>Błąd</button>
        </section>
    );
}
