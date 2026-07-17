const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    title: "IronDesk Operations Console",
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      // Force the userAgent to identify as Electron so our client routing Selector redirects to /app
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 Electron/IronDesk'
    }
  });

  // Load the client's production build index.html
  const indexPath = path.join(__dirname, '../client/dist/index.html');
  win.loadFile(indexPath).catch(err => {
    console.error("Failed to load local index.html:", err);
    // Fallback to dev server if not built
    win.loadURL("http://localhost:5173/");
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
