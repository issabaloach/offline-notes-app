const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('notesAPI', {
    getFiles: () => ipcRenderer.invoke('get-files'),
    readFile: (filename) => ipcRenderer.invoke('read-file', filename),
    saveFile: (filename, content) => ipcRenderer.invoke('save-file', filename, content),
    deleteFile: (filename) => ipcRenderer.invoke('delete-file', filename),
    openFolder: (filename) => ipcRenderer.invoke('open-folder', filename),
    
    // We now ask the main process to do the parsing
    parseMarkdown: (text) => ipcRenderer.invoke('parse-markdown', text)
});