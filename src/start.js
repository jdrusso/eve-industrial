const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // mainWindow.setMenu(null);
  // mainWindow.setMenuBarVisibility(false);

  mainWindow.loadURL(
    process.env.ELECTRON_START_URL ||
      url.format({
        pathname: path.join(__dirname, '/../src/index.html'),
        protocol: 'file:',
        slashes: true
      })
  )


    // var {PythonShell} = require('python-shell')
    //
    //
    // PythonShell.run('./src/engine.py', null, function (err, results) {
    //   if (err) throw err;
    //   console.log(results)
    //   console.log('finished');
    // });

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