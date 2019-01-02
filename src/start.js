const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // mainWindow.setMenu(null);
  mainWindow.setMenuBarVisibility(true);

  console.log("Starting in " + __dirname)

  mainWindow.loadURL(
    process.env.ELECTRON_START_URL ||
      url.format({
        pathname: path.join(__dirname, '/index.html'),
        protocol: 'file:',
        slashes: true
      })
  )

  console.log(process.resourcesPath + '/../public/engine')
  let serverProc = require('child_process').execFile(process.resourcesPath + '/../public/engine')
  serverProc.stdout.on('data', function(data) {
      console.log(data.toString());
  // console.log(serverProc)
});

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})
