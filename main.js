const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const { platform } = require('os');
const path = require('path');
const { readFromJson, writeToJson } = require('./BookStorageManager');
const { generateBookMetaData } = require('./BookMetaDataGenerator');
const { event } = require('jquery');
let win;
let currentViewedBook;
let currentViewedBookPath;


function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 0,
        height: 0,
        webPreferences: {
            nodeIntegration: true,
            enableRemoteModule: true,
            contextIsolation: false,
        },
        resizable: false
    });


    // Event function that resizes the Electron Window
    ipcMain.on('resize', (event, width, height) => {
        win.setResizable(true);
        win.setSize(width, height);
        win.setResizable(false);
    });

    // Event function that opens OS File Explorer Dialog
    ipcMain.handle('open-file-dialog', async (event) => {
        const result = await dialog.showOpenDialog({
            properties: ['openFile']
        });

        return result.filePaths;
    });

    // Event function that loads library books from JSON file
    ipcMain.handle('load-book-library', async (event) => {
        const bookList = readFromJson();
        return bookList;
    });

    // Event function that writes library books to JSON file
    ipcMain.handle('write-book-library', (event, data) => {
        writeToJson(data);
    });

    //  Event of opening a book file
    ipcMain.handle('open-book', (event, bookName, bookFilePath) => {
        currentViewedBook = bookName;
        currentViewedBookPath = bookFilePath;
        console.log(currentViewedBook);
        console.log(currentViewedBookPath);
    });

    // Event function that generates Book Metadata as a Dictionary
    ipcMain.handle('generate-book-metadata', async (event, bookFilePath) => {
        const bookMetaData = await generateBookMetaData(bookFilePath);
        return bookMetaData;
    });

    // Event which return current opened book info
    ipcMain.handle('get-opened-book-info', async (event) => {
        return [currentViewedBook, currentViewedBookPath, path.extname(currentViewedBookPath)];
    });

    // Event function to unable or disable the resizeable property and minimum size
    ipcMain.handle('modify-resizeable', async (event, status, height, width) => {
        win.unmaximize();
        win.setResizable(status);
        win.setMinimumSize(height, width);
    });

    // and load the index.html of the app.
    win.loadFile('src/Resources/MainInterface.html');
    win.setMenuBarVisibility(false);


    //Quit app when main BrowserWindow Instance is closed
    win.on('closed', function () {
        app.quit();
    });
}

app.disableHardwareAcceleration();


// This method will be called when the Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow);


// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})

