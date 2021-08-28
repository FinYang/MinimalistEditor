const {app, BrowserWindow, Menu, dialog} = require('electron')
const path = require('path')
const url = require('url')
const fs = require("fs")

let window = null

require('electron-reload')(__dirname)


const template = [
  {
    label: "File",
    submenu: [
      {
        id: "save-file",
        enabled: false,
        accelerator: 'Ctrl+S',
        label: "Save File",
        click: async () => {
          window.webContents.send("saveFile");
        },
      },
      {
        label: "Open File",
        accelerator: 'Ctrl+O',
        click: async () => {
          const filePaths = await dialog.showOpenDialog({
            properties: ["openFile"],
          });
          const file = filePaths[0];
          const contents = fs.readFileSync(file, "utf-8");
          // console.log(contents);
          window.webContents.send("fileOpened", {
            contents,
            filePath: file
          }
        );
        const saveFileItem = menu.getMenuItemById("save-file");
        saveFileItem.enabled = true;
        },
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
    webPreferences: {
      nodeIntegration: true,
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

  // window.webContents.openDevTools();
})
