const {app, BrowserWindow, Menu, dialog, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const fs = require("fs")

require('electron-reload')(__dirname
//   , {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
// }
);
// app.disableHardwareAcceleration();

console.log("test main");

let window = null;




var file = null;

var contents = null;





const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Window",
        accelerator: 'Ctrl+Shift+N',
        click: async () => {},
      },
      {
        label: "Open...",
        accelerator: 'Ctrl+O',
        click: async () => {
          const { filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"],
          });
          file = filePaths[0];
          openFile(file);

        },
      },
      {
        id: "save-file",
        enabled: false,
        accelerator: 'Ctrl+S',
        label: "Save",
        click: async () => {
          window.webContents.send("saveFile");
          window.setTitle(file);
        },
      },
      {
        label: "Save As...",
        accelerator: 'Ctrl+Shift+S',
        click: async () => {


        },
      },
      { type: 'separator' },
      {
        label: "DevTools",
        click: async () => { window.webContents.openDevTools() },
      },
      {
        label: "Exit",
        click: async () => { app.quit() },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);




function logToApp (content) {
  window.webContents.send("mainConsoleLog", {content})
}

function openFile (file) {
  contents = fs.readFileSync(file, "utf-8");
  window.webContents.send("fileOpened", {
    contents,
    filePath: file
  }
  );
  window.setTitle(file + " - MinimalistEditor");
  const saveFileItem = menu.getMenuItemById("save-file");
  saveFileItem.enabled = true;
}

function createWindow() {
  window = new BrowserWindow({
    width: 760,
    height: 760,
    show: false,
    resizable: true,
    autoHideMenuBar: true,
    title: "MinimalistEditor",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })


  window.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  window.once('ready-to-show', () => {
    window.show()
    // app.quit();
  })
  logToApp("For some reason the first logToApp doesn't show.");
}

var openFromFile = false;
const devEnv = /electron/.test(process.argv[0]);
app.once('ready', () => {
   if (process.platform.startsWith('win') && !devEnv && process.argv.length >= 2) {
      file = process.argv[1];

      openFromFile = true;
      createWindow();

      openFile(file);

   } else {
      createWindow();
   }


   logToApp("openFromFile: " + openFromFile);
   logToApp("devEnv: " + devEnv);
   logToApp(process.argv);
});





ipcMain.on("contentChanged", (event) => {
  window.setTitle("*" + window.title);
});
