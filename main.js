const { app, BrowserWindow, Menu } = require('electron');
const net = require('net');

function checkInternetConnection() {
    return new Promise((resolve) => {
        const client = net.createConnection({ port: 53, host: '8.8.8.8' }, () => {
            client.end();
            resolve(true);
        });

        client.on('error', () => {
            resolve(false);
        });

        client.setTimeout(3000, () => {
            client.destroy();
            resolve(false);
        });
    });
}

async function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        show: false,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
        },
        icon: 'assets/deepseek.ico',
    });

    mainWindow.loadFile('pages/preloader.html');
    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    const checkAndUpdateWindow = async () => {
        const isConnected = await checkInternetConnection();
        const currentURL = mainWindow.webContents.getURL();

        if (isConnected){
            if (
                !currentURL.startsWith('https://chat.deepseek.com/') &&
                !currentURL.startsWith('https://accounts.google.com/')
            ) {
                mainWindow.loadURL('https://chat.deepseek.com');
            }
        } else {
            if (!currentURL.endsWith('pages/no-internet.html')) {
                mainWindow.loadFile('pages/no-internet.html');
            }
        }
    };

    await checkAndUpdateWindow();
    setInterval(checkAndUpdateWindow, 1000);
}

app.whenReady().then(() => {
    Menu.setApplicationMenu(null);
    createWindow();
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});