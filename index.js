const { ipcRenderer } = require("electron");
const fs = require("fs");


let openedFilePath;
const containerElm = document.getElementById('container');

ipcRenderer.on("fileOpened", (event, { contents, filePath }) => {
  openedFilePath = filePath;
  containerElm.value = contents;
});

ipcRenderer.on("saveFile", (event) => {
  const currentContainerValue =  containerElm.value;
  fs.writeFileSync(openedFilePath, currentContainerValue, "utf-8")
});
