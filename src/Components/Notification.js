import styles from '../styles/Host.module.css';

export default function Notification({ showSpell, showError, player, errorMsg }) {
    return (
        <>
            {showSpell && player && (
                <div className={styles.individualNotification}>
                    {player.spell}!
                </div>
            )}
            {showError && errorMsg && (
                <div className={styles.errorMsg}>
                    {errorMsg}
                </div>
            )}
        </>
    );
}
