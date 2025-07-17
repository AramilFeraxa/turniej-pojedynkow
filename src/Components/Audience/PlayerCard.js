import styles from '../../styles/Audience.module.css';

export default function AudiencePlayerCard({ player, borderColor, renderSpellBoxes }) {
    return (
        <section className={`${styles.playerCard} ${borderColor}`}>
            <h2>{player.name}</h2>
            <p>Dom: <strong>{player.house}</strong></p>
            <p>Punkty: <strong>{player.score}</strong></p>
            <p>Wygrane rundy: <strong>{player.roundsWon}</strong></p>
            {renderSpellBoxes(player)}
        </section>
    );
}
