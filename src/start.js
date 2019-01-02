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

  console.log(process.env.ELECTRON_START_URL)
  console.log(__dirname)

  mainWindow.loadURL(
    process.env.ELECTRON_START_URL ||
      url.format({
        pathname: path.join(__dirname, '/index.html'),
        protocol: 'file:',
        slashes: true
      })
  )


    console.log("Starting shell")
    console.log(process.resourcesPath + '/app/build/engine.py')

    var {PythonShell} = require('python-shell')


    // PythonShell.run(process.resourcesPath + '/../public/engine.py', null, function (err, results) {
    // PythonShell.run(process.resourcesPath + '/../../../../public/engine.py', null, function (err, results) {
    PythonShell.run(process.resourcesPath + '/app/build/engine.py', null, function (err, results) {
      if (err) throw err;
      console.log(results)
      console.log('finished');
    });

    console.log("Shell started")

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
