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


let window = null;
var file = null;
var contents = null;
var openFromFile = false;
const devEnv = /electron/.test(process.argv[0]);

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Window",
        accelerator: 'Ctrl+Shift+N',
        click: async () => {
          createWindow();
        },
      },
      {
        label: "Open...",
        accelerator: 'Ctrl+O',
        click: async () => {
          const { filePaths } = await dialog.showOpenDialog({
            properties: ["openFile"],
          });
          console.log(filePaths);
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
          if (openFromFile) {

          window.webContents.send("saveFile", file);
          window.setTitle(file);
        } else if (true) {
          const { filePath } = await dialog.showSaveDialog({});
          file = filePath;
          saveAs();
        }
        },
      },
      {
        label: "Save As...",
        accelerator: 'Ctrl+Shift+S',
        click: async () => {
          const { filePath } = await dialog.showSaveDialog({});
          file = filePath;
          saveAs();
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


function saveAs () {
  // getSaveDir();
  window.webContents.send("saveFile", file);
  updateTitle(file);
  console.log(file);
}

// function getSaveDir () {
//   console.log("line 90");
//   const filePaths = await dialog.showSaveDialog();
//   console.log(filePaths)
//   console.log(filePaths.filePath)
//   file = filePaths.filePath;
//   window.setTitle(file);
// }

function logToApp (content) {
  window.webContents.send("mainConsoleLog", {content})
}

function updateTitle (file) {
  window.setTitle(file + " - MinimalistEditor");
}

function openFile (file) {
  contents = fs.readFileSync(file, "utf-8");
  window.webContents.send("fileOpened", {
    contents,
    filePath: file
  }
  );
  updateTitle(file);
  const saveFileItem = menu.getMenuItemById("save-file");
  saveFileItem.enabled = true;

  openFromFile = true;
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


app.once('ready', () => {
   if (process.platform.startsWith('win') && !devEnv && process.argv.length >= 2) {
      file = process.argv[1];


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
  const saveFileItem = menu.getMenuItemById("save-file");
  saveFileItem.enabled = true;
});
