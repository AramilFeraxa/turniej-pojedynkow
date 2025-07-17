import styles from '../../styles/Host.module.css';

export default function Controls({ resolveFight, nextRound, resetGame, disabled }) {
    return (
        <div className={styles.controls}>
            <button onClick={resolveFight} disabled={disabled}>Zatwierdź</button>
            <button onClick={nextRound}>Nowa Runda</button>
            <button onClick={resetGame}>Nowa Gra</button>
        </div>
    );
}
