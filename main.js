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
var force_quit = false;
const devEnv = /electron/.test(process.argv[0]);
var contentChanged = false;

const template = [
  {
    label: "File",
    submenu: [
      {
        label: "New Window",
        accelerator: 'Ctrl+Shift+N',
        click: async () => {
          // createWindow();
          // logToApp(app.getAppPath("exe"));
          const { shell } = require('electron')
          shell.openPath(process.argv[0])
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
          if(process.platform.startsWith('win') && !devEnv && contentChanged){
            const { exec } = require("child_process");
            // console.log(process.argv.join(" ").concat(" ", file))
            exec(process.argv[0].concat(" ", file), (error, data, getter) => {
            	if(error){
            		console.log("error",error.message);
            		return;
            	}
            	if(getter){
            		console.log("data",data);
            		return;
            	}
            	console.log("data",data);

            });
          } else {
            openFile(file);
          }

        },
      },
      {
        id: "save-file",
        enabled: false,
        accelerator: 'Ctrl+S',
        label: "Save",
        click: saveClick,
      },
      {
        id: "save-as",
        label: "Save As...",
        accelerator: 'Ctrl+Shift+S',
        click: async () => {
          await saveAsClick()
        },
      },
      { type: 'separator' },
      {
        label: "DevTools",
        accelerator: 'Ctrl+Shift+I',
        click: async () => { window.webContents.openDevTools() },
      },
      {
        label: "Exit",
        accelerator: 'Ctrl+W',
        click: async () => { app.quit() },
      },
    ],
  },
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);


async function saveClick () {
  if (openFromFile) {
    window.webContents.send("saveFile", file);
    updateTitle(file);
    contentChanged = false;
    out = true;
  } else {
    const  out  = await saveAsClick()
  }
  // console.log(out)
  // out = Promise.resolve(1);
  return out;
}

async function saveAsClick () {
    const { canceled, filePath } = await dialog.showSaveDialog({
      filters: [{
      name: 'Text Documents',
      extensions: ['txt']
    }]
    });
    file = filePath;
    if(!canceled) {
      window.webContents.send("saveFile", file);
      updateTitle(file);
      contentChanged = false;
      openFromFile = true;
      out = true;
    } else {
      out = false;
    }
    // console.log(out);
    return out;
}

// function saveAs () {
//   // getSaveDir();
//   console.log("save as called.")
//   window.webContents.send("saveFile", file);
//   updateTitle(file);
//   console.log(file);
// }


function logToApp (content) {
  window.webContents.send("mainConsoleLog", {content})
}

function updateTitle (file) {
  window.setTitle(file + " - MinimalistEditor");
}


function openFile (file) {


  const languageEncoding = require("detect-file-encoding-and-language");
  languageEncoding(file).then((fileInfo) => {
    const {encoding} = fileInfo
    console.log(encoding);

    //
    //
    //
    // contents = fs.readFileSync(file, "utf-8");
    contentsBuffer = fs.readFileSync(file)
    // encoding = detectCharacterEncoding(contentsBuffer);
    contents = contentsBuffer.toString(encoding);
    // .toString(encoding);
    window.webContents.send("fileOpened", {
      contents,
      filePath: file
    }
    );
    updateTitle(file);
    //
    //
    //
  });

  const saveFileItem = menu.getMenuItemById("save-file");
  saveFileItem.enabled = true;

  openFromFile = true;
  contentChanged = false;
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


  window.on('close', async (event) => {
      if(!force_quit && contentChanged){
          // Handle menu-item or keyboard shortcut quit here
          event.preventDefault();
          const { response } =  await dialog.showMessageBox({
            message: "Do you want to save changes?",
            buttons: ["Save", "Don't Save", "Cancel"]
          });
          switch (response) {
            case 0:
              saveRes = await saveClick();
              if(saveRes) {
                force_quit = true;
                app.quit();
              }
              break;
            case 1:
              force_quit = true;
              app.quit();
              break;
            case 2:
              // console.log(response);
              break;
          }
      }
  });

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
  contentChanged = true;
  window.setTitle("*" + window.title);
  const saveFileItem = menu.getMenuItemById("save-file");
  saveFileItem.enabled = true;
});
