const electron = require('electron');
let { ipcRenderer } = electron;

document.addEventListener("DOMContentLoaded", function () {
    // resize window to a suitable size
    ipcRenderer.send('resize', 600, 200);
});