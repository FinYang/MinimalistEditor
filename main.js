const {app, BrowserWindow, Menu, dialog, ipcMain} = require('electron')
const path = require('path')
const url = require('url')
const fs = require("fs")

require('electron-reload')(__dirname
//   , {
//   electron: path.join(__dirname, 'node_modules', '.bin', 'electron.cmd')
// }
);

let window = null;

var file = null;

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
          // console.log(filePaths);
          file = filePaths[0];
          // console.log(file);
          const contents = fs.readFileSync(file, "utf-8");
          // console.log(contents);
          window.webContents.send("fileOpened", {
            contents,
            filePath: file
          }
        );
        window.setTitle(file + " - MinimalistEditor");
        const saveFileItem = menu.getMenuItemById("save-file");
        saveFileItem.enabled = true;
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
        click: async () => {},
      },
      { type: 'separator' },
      {
        label: "Exit",
        click: async () => { app.quit() },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

app.once('ready', () => {
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
  })

  window.webContents.openDevTools();

})


ipcMain.on("contentChanged", (event) => {
  window.setTitle("*" + window.title);
});
