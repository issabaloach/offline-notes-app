const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { marked } = require('marked'); 

// Define the storage directory
const notesDir = path.join(app.getPath('documents'), 'MyElectronNotes');

if (!fs.existsSync(notesDir)) {
    fs.mkdirSync(notesDir);
}

function createWindow() {
    const win = new BrowserWindow({
        width: 1000,
        height: 700,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false,
            contextIsolation: true
        }
    });

    win.loadFile('index.html');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit();
});

// --- API HANDLERS ---

ipcMain.handle('get-files', () => {
    return fs.readdirSync(notesDir).filter(file => file.endsWith('.md') || file.endsWith('.txt'));
});

ipcMain.handle('read-file', (event, filename) => {
    return fs.readFileSync(path.join(notesDir, filename), 'utf-8');
});

ipcMain.handle('save-file', (event, filename, content) => {
    const filePath = path.join(notesDir, filename);
    fs.writeFileSync(filePath, content);
    return filePath;
});

ipcMain.handle('delete-file', (event, filename) => {
    try {
        fs.unlinkSync(path.join(notesDir, filename));
        return true;
    } catch (err) { return false; }
});

ipcMain.handle('open-folder', (event, filename) => {
    const filePath = path.join(notesDir, filename);
    shell.showItemInFolder(filePath);
});

// <--- 2. Add this NEW handler to parse markdown
ipcMain.handle('parse-markdown', (event, text) => {
    return marked(text);
});