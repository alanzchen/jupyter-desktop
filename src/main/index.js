'use strict'

import { app, BrowserWindow, dialog, Menu, shell } from 'electron'
import { execSync, exec } from 'child_process'
import * as fs from 'fs'
import * as fixPath from 'fix-path'
import { basename } from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

fixPath()

let jupyterPath;

const dockMenu = Menu.buildFromTemplate([
  {
    label: 'New Jupyter Lab Window',
    click () { newWindow() }
  }
])

// global reference to mainWindow (necessary to prevent window from being garbage collected)

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function getLabSessions() {
  let list_str = execSync(`${jupyterPath} lab list --jsonlist`).toString();
  console.log(list_str)
  let notebooks = JSON.parse(list_str);
  let map = new Map();
  notebooks.forEach((v, i, a) => {
    let key = v["root_dir"]
    map.set(key, v)
  })
  return map
}

function launchJupyter(path) {
  return exec(`${jupyterPath} lab --no-browser -y --notebook-dir="${path}"`)
}

function createWindow(url, path = undefined, proc = undefined) {
  let window = new BrowserWindow({webPreferences: {nodeIntegration: true}})
  if (path) {
    window.setTitle(`Jupyter Desktop - ${basename(path)}`)
  }

  window.on('page-title-updated', (evt) => {
    evt.preventDefault();
  });

  window.on('closed', () => {
    if (proc) {
      proc.kill('SIGINT')
      proc.kill('SIGTERM')
      proc.kill()
    } else if (path) {
      const pid = getLabSessions().get(path).pid
      process.kill(pid, "SIGTERM")
    }
    window = null
  })

  window.on('close', (e) => {
    if (proc) {
      let choice = dialog.showMessageBoxSync({
        type: 'question',
        buttons: ['Yes', 'No'],
        title: 'Confirm',
        message: 'Unsaved data will be lost. Are you sure you want to quit?'
      })
      if (choice === 1) {
        e.preventDefault();
      }
    }
  })

  window.webContents.on('new-window', function(e, url) {
    // make sure local urls stay in electron perimeter
    if(url.startsWith('file://')) {
      return;
    }
    // and open every other protocols on the browser      
    e.preventDefault();
    shell.openExternal(url);
  });

  window.loadURL(url)
  return window
}

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', (event, hasVisibleWindows) => {
  if (!hasVisibleWindows) {
    newWindow();
  }
})

async function openFolder(path) {
  if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
    if (path.endsWith('/')) {
      path = path.slice(0, -1)
    }
    let labSession = getLabSessions().get(path)
    if (labSession) {
      createWindow(labSession.url, path)
    } else {
      const proc = launchJupyter(path)
      while (!labSession) {
        await sleep(500)
        labSession = getLabSessions().get(path)
      }
      const url = `${labSession.url}lab?token=${labSession.token}`
      createWindow(url, path, proc)
    }
  } else {
    dialog.showMessageBox(null, {
      message: `${path} is not a directory!`
    })
  }
}

async function newWindow() {
  let path = dialog.showOpenDialogSync(null, {
    title: "Jupyter Desktop",
    message: "Select a location to launch Jupyter Lab",
    buttonLabel: "Launch Jupyter Lab",
    properties: ["openDirectory", "createDirectory"]
  })
  if (path) {
    await openFolder(path[0]);
  }
}

app.on('open-file', async (event, path) => {
  event.preventDefault()
  await openFolder(path)
})

// create main BrowserWindow when electron is ready
app.on('ready', async () => {
  app.dock.setMenu(dockMenu)
  try {
    jupyterPath = execSync("which jupyter").toString().replace("\n", "")
    console.log(jupyterPath)
    } catch (err) {
      dialog.showMessageBox(null, {
        message: `Cannot determine the path for jupyter: ${err}`
      })
  }
  if(process.argv.length > 1) {
    const arg = process.argv[1];
    if (arg.startsWith('http') || arg.startsWith('file')) {
      createWindow(arg)
    } else if (!process.argv[0].endsWith('Electron')) {
      console.warn('Jupyter Desktop: Invalid URL.')
      app.quit()
    }
  } else {
    await newWindow()
  }
})
