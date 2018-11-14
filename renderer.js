// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.
var {ipcRenderer, remote} = require('electron');
var main = remote.require("./app.js");
//remote.getCurrentWindow().toggleDevTools();
// Send async message to main process
// ipcRenderer.send('async', 1);

// Listen for async-reply message from main process
ipcRenderer.on('async-reply', (event, arg) => {
    // Print 2
    console.log(arg);
    // Send sync message to main process
    let mainValue = ipcRenderer.sendSync('sync', 3);
    // Print 4
    console.log(mainValue);
});

// Listen for main message
ipcRenderer.on('ping', (event, arg) => {
    // Print 5
    console.log(arg);
    // Invoke method directly on main process
    main.pong(6);
});
