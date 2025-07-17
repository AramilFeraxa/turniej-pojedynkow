const { app, BrowserWindow, screen, dialog, Menu } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

let mainWindow, audienceWindow;
let manualCheck = false;

const isMac = process.platform === 'darwin';

const template = [
    ...(isMac ? [{ role: 'appMenu' }] : []),
    {
        label: 'Help',
        submenu: [
            {
                label: 'Sprawdź aktualizacje',
                click: () => {
                    manualCheck = true;
                    autoUpdater.checkForUpdates();
                    dialog.showMessageBox({
                        type: 'info',
                        title: 'Sprawdzanie aktualizacji',
                        message: 'Trwa sprawdzanie dostępnych aktualizacji...'
                    });
                }
            }
        ]
    }
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

function createWindows() {
    const displays = screen.getAllDisplays();
    const primaryDisplay = displays[0];
    const secondaryDisplay = displays[1] || primaryDisplay;

    mainWindow = new BrowserWindow({
        title: "Turniej Pojedynków",
        x: primaryDisplay.bounds.x,
        y: primaryDisplay.bounds.y,
        width: 1280,
        height: 720,
        webPreferences: { nodeIntegration: false }
    });

    audienceWindow = new BrowserWindow({
        title: "Turniej Pojedynków - Widownia",
        x: secondaryDisplay.bounds.x,
        y: secondaryDisplay.bounds.y,
        width: 1280,
        height: 720,
        webPreferences: { nodeIntegration: false }
    });

    mainWindow.loadFile(path.join(__dirname, '../out/host.html'));
    audienceWindow.loadFile(path.join(__dirname, '../out/audience.html'));
}

app.whenReady().then(() => {
    createWindows();

    autoUpdater.checkForUpdates();

    autoUpdater.on('update-available', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Aktualizacja dostępna',
            message: 'Nowa wersja jest dostępna i zostanie pobrana w tle.'
        });
    });

    autoUpdater.on('update-not-available', () => {
        if (manualCheck) {
            dialog.showMessageBox({
                type: 'info',
                title: 'Aktualizacje',
                message: 'Masz już najnowszą wersję.'
            });
            manualCheck = false;
        }
    });

    autoUpdater.on('update-downloaded', () => {
        dialog.showMessageBox({
            type: 'info',
            title: 'Aktualizacja gotowa',
            message: 'Aplikacja zostanie zrestartowana i zaktualizowana.'
        }).then(() => {
            autoUpdater.quitAndInstall();
        });
    });

    autoUpdater.on('error', (err) => {
        console.error('🔥 Błąd autoUpdater:', err);
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
