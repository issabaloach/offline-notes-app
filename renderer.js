const fileListEl = document.getElementById('file-list');
const filenameInput = document.getElementById('filename-input');
const contentInput = document.getElementById('file-content');
const previewArea = document.getElementById('preview-area');
const searchBox = document.getElementById('search-box');
const btnSave = document.getElementById('btn-save');
const btnNew = document.getElementById('btn-new');
const btnToggle = document.getElementById('btn-toggle');

let isPreviewMode = false;
let allFiles = [];

// 1. Load Files
async function loadFiles() {
    allFiles = await window.notesAPI.getFiles();
    renderFileList(allFiles);
}

function renderFileList(files) {
    fileListEl.innerHTML = '';
    files.forEach(file => {
        const item = document.createElement('div');
        item.className = 'file-item';
        
        // Highlight active file
        if(filenameInput.value === file) item.classList.add('active');

        const textSpan = document.createElement('span');
        textSpan.innerText = file;
        textSpan.onclick = () => loadNote(file);

        const deleteBtn = document.createElement('span');
        deleteBtn.innerText = '🗑';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteNote(file);
        };

        item.appendChild(textSpan);
        item.appendChild(deleteBtn);
        fileListEl.appendChild(item);
    });
}

async function loadNote(filename) {
    const content = await window.notesAPI.readFile(filename);
    filenameInput.value = filename;
    contentInput.value = content;
    // Highlight the selection in sidebar
    loadFiles(); 
    if(isPreviewMode) updatePreview();
}

// 2. THE NEW SAVE LOGIC
btnSave.addEventListener('click', async () => {
    let filename = filenameInput.value.trim();
    const content = contentInput.value;

    if (!filename) { alert('Please enter a filename!'); return; }

    // AUTO-FIX: Add .md if missing
    if (!filename.endsWith('.md')) {
        filename += '.md';
        filenameInput.value = filename; // Update the input box so user sees it
    }

    // A) VISUAL FEEDBACK: Change button to "Saving..."
    const originalText = btnSave.innerText;
    btnSave.innerText = "⏳ Saving...";
    btnSave.style.background = "#28a745"; // Green color
    btnSave.disabled = true;

    // B) Wait a tiny bit (simulated network lag) to show the animation
    await new Promise(r => setTimeout(r, 500));

    // C) Actual Save
    await window.notesAPI.saveFile(filename, content);

    // D) Refresh Sidebar immediately
    await loadFiles();

    // E) Redirect/Open Folder (Optional - asks user or just does it)
    // Uncomment the line below if you want it to ALWAYS open the folder
    // window.notesAPI.openFolder(filename); 

    // F) Reset Button
    btnSave.innerText = "✔ Saved!";
    setTimeout(() => {
        btnSave.innerText = originalText;
        btnSave.style.background = ""; // Reset color
        btnSave.disabled = false;
    }, 1500);
});

// 3. New Note
btnNew.addEventListener('click', () => {
    filenameInput.value = '';
    contentInput.value = '';
    contentInput.focus();
    loadFiles(); // Remove highlights
});

// 4. Delete
async function deleteNote(filename) {
    if(confirm(`Delete ${filename}?`)) {
        await window.notesAPI.deleteFile(filename);
        if(filenameInput.value === filename) {
            filenameInput.value = '';
            contentInput.value = '';
        }
        loadFiles();
    }
}

// 5. Search
searchBox.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase();
    const filteredFiles = allFiles.filter(file => file.toLowerCase().includes(query));
    renderFileList(filteredFiles);
});

async function updatePreview() {
    const rawMarkdown = contentInput.value;
    const html = await window.notesAPI.parseMarkdown(rawMarkdown);
    previewArea.innerHTML = html;
}

btnToggle.addEventListener('click', async () => { 
    isPreviewMode = !isPreviewMode;
    if (isPreviewMode) {
        await updatePreview(); 
        contentInput.style.display = 'none';
        previewArea.style.display = 'block';
        btnToggle.innerText = '✎ Edit';
    } else {
        contentInput.style.display = 'block';
        previewArea.style.display = 'none';
        btnToggle.innerText = '👁 Preview';
    }
});

// Start
loadFiles();