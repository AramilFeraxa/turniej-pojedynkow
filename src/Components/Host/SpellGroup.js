import styles from '../../styles/Host.module.css';

export default function SpellGroup({ group, spells, player, id, handleSpell, isRoundOver, isReady }) {
    return (
        <div className={styles.group}>
            <h3>{group}</h3>
            {spells.map(spell => {
                return (
                    <button
                        key={spell}
                        onClick={() => handleSpell(id, spell)}
                        className={`${player.spell === spell ? styles.active : ''}`}
                        disabled={isRoundOver || !isReady}
                    >
                        {spell}
                    </button>
                );
            })}
        </div>
    );
}
