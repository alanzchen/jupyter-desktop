'use strict'

import { app, BrowserWindow, dialog } from 'electron'
import { execSync, exec, spawnSync, spawn } from 'child_process'
import * as fs from 'fs'
import * as fixPath from 'fix-path'
import { basename } from 'path'

const isDevelopment = process.env.NODE_ENV !== 'production'

fixPath()

let jupyterPath;

// global reference to mainWindow (necessary to prevent window from being garbage collected)

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

function getNotebookList() {
  let list_str = execSync(`${jupyterPath} notebook list --jsonlist`).toString();
  let notebooks = JSON.parse(list_str);
  let map = new Map();
  notebooks.forEach((v, i, a) => {
    let key = v["notebook_dir"]
    let url = `${v["url"]}?token=${v["token"]}`
    map.set(key, url)
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
      proc.kill('SIGINT')
      proc.kill()
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

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  // No, we are not doing this
})

app.on('open-file', async (event, path) => {
  event.preventDefault();
  let url
  if (fs.existsSync(path) && fs.lstatSync(path).isDirectory()) {
    if (path.endsWith('/')) {
      key = path.slice(0, -1)
    }
    let map = getNotebookList()
    url = map.get(path)
    if (url) {
      createWindow(url)
    } else {
      const proc = launchJupyter(path)
      while (!url) {
        await sleep(500)
        let map = getNotebookList()
        url = map.get(path)
      }
      createWindow(url, path, proc)
    }
  } else {
    dialog.showMessageBox(null, {
      message: `${path} is not a directory!`
    })
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  console.log(process.argv);
  try {
    jupyterPath = execSync("which jupyter").toString().replace("\n", "")
    } catch (err) {
      dialog.showMessageBox(null, {
        message: `${err}`
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
  }
})
