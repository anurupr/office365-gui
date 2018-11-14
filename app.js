// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const { exec } = require('child_process')
const fs = require('fs')
const constants = require('./constants')
console.log(constants)
require('electron-reload')(__dirname, {
    // Note that the path to electron may vary according to the main file
    electron: require(`${__dirname}/node_modules/electron`)
});
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({width: 800, height: 600})

  // and load the index.html of the app.
  mainWindow.loadFile('index.html')
  //mainWindow.setMenu(null)
  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })


  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})


app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})


app.disableHardwareAcceleration()
console.log('userDataPath', app.getPath('userData'));
// Listen for async message from renderer process
ipcMain.on('async', (event, arg) => {
    // Print 1
    console.log(arg);
    // Reply on async message from renderer process
    event.sender.send('async-reply', 2);
});

// Listen for sync message from renderer process
ipcMain.on('sync', (event, arg) => {
    // Print 3
    console.log(arg);
    // Send value synchronously back to renderer process
    event.returnValue = 4;
    // Send async message to renderer process
    mainWindow.webContents.send('ping', 5);
});

// Make method externaly visible
exports.pong = arg => {
    //Print 6
    console.log(arg);
}

ipcMain.on('call-ps-creds', (event, arg) => {
  console.log('calling call-ps-creds')
  exec(constants.POWERSHELL_COMMAND + ' powershell-scripts/Add-Credentials.ps1', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      return;
    }

    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  });
});

getPSProfile = (cb) => {
  exec(constants.POWERSHELL_COMMAND + ' -command "$profile"', (err, stdout, stderr) => {
    console.log('stdout ${stdout}')
    console.log('stderr ${stderr}')
    if (err) { return cb(null) }
    if (stdout) {
      cb(stdout)
    } else if (stderr) {
      cb(false)
    }
  });
}

getPSCredsFolder = (cb) => {
  exec(constants.POWERSHELL_COMMAND + ' -command "$KeyPath"', (err, stdout, stderr) => {
    if (err) { console.error(err); return cb(null) }
    console.log('stdout ${stdout}')
    console.log('stderr ${stderr}')
    if (stdout) {
      cb(stdout)
    } else if (stderr) {
      cb(false)
    }
  });
}

ipcMain.on('get-ps-creds', (event, arg) => {
  console.log('calling get-ps-creds')
  getPSCredsFolder((folder) => {
    console.log('folder', folder)
    if (folder != null && folder !== false) {
      fs.readdir(folder.replace(/(\r\n\t|\n|\r\t|\r)/gm,""), (err, files) => {
        if (err) { return  console.error(err) }
        if (files && files.length > 0) {
          mainWindow.webContents.send('get-ps-creds-cb', JSON.stringify(files))
        }
      })
    }
  });
});


// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
