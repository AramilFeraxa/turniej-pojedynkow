const { app, BrowserWindow, screen } = require('electron');
const path = require('path');

let mainWindow, audienceWindow;

function createWindows() {
    const displays = screen.getAllDisplays();
    const primaryDisplay = displays[0];
    const secondaryDisplay = displays[1] || primaryDisplay;

    mainWindow = new BrowserWindow({
        x: primaryDisplay.bounds.x,
        y: primaryDisplay.bounds.y,
        width: 1280,
        height: 720,
        webPreferences: { nodeIntegration: false }
    });

    audienceWindow = new BrowserWindow({
        x: secondaryDisplay.bounds.x,
        y: secondaryDisplay.bounds.y,
        width: 1280,
        height: 720,
        webPreferences: { nodeIntegration: false }
    });

    mainWindow.loadFile(path.join(__dirname, '../out/host.html'));
    audienceWindow.loadFile(path.join(__dirname, '../out/audience.html'));
}

app.whenReady().then(createWindows);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});
