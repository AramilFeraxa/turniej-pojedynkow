import styles from '../../styles/Audience.module.css';
import xifangLogo from '../../images/herb_xifang.png';
import semperosLogo from '../../images/herb_semperos.png';
import antaresLogo from '../../images/herb_antares.png';
import imerusLogo from '../../images/herb_imerus.png';
import logoHY from '../../images/logo-hugo-yorck.png';

const houseLogoMap = {
    Xifang: xifangLogo,
    Semperos: semperosLogo,
    Antares: antaresLogo,
    Imerus: imerusLogo
};

export default function AudiencePlayerCard({ player, borderColor, renderSpellBoxes }) {
    const logoSrc = houseLogoMap[player.house] || logoHY;

    return (
        <section className={`${styles.playerCard} ${borderColor}`}>
            {logoSrc && (
                <img src={logoSrc.src} alt={`${player.house} logo`} className={styles.houseLogo} />
            )}
            <h2>{player.name}</h2>
            <p>Dom: <strong>{player.house}</strong></p>
            <p>Punkty: <strong>{player.score}</strong></p>
            <p>Wygrane rundy: <strong>{player.roundsWon}</strong></p>
            {renderSpellBoxes(player)}
        </section>
    );
}
