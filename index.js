console.log("Page loading.");
// console.log(process.argv);
const { ipcRenderer } = require("electron");
const fs = require("fs");






let openedFilePath;
const containerElm = document.getElementById('container');

var contentChanged = false;

containerElm.addEventListener('input', function(){
   // console.clear()
   // console.log("changed")
   if(!contentChanged) {
     contentChanged = true;
     ipcRenderer.send("contentChanged");
   }
})



ipcRenderer.on("fileOpened", (event, { contents, filePath }) => {
  openedFilePath = filePath;
  containerElm.value = contents;
});

ipcRenderer.on("saveFile", (event) => {
  const currentContainerValue =  containerElm.value;
  fs.writeFileSync(openedFilePath, currentContainerValue, "utf-8");
  contentChanged = false;
  console.log("File saved.")
});


// console from main
ipcRenderer.on("mainConsoleLog", (event, {content}) => {
  console.log("main: " + content);
});
