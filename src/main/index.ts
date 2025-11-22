import { app, BrowserWindow } from 'electron'
import { WindowManager } from './managers/WindowManager'

const windowManager = new WindowManager()

app.whenReady().then(() => {
  windowManager.createMainWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    windowManager.createMainWindow()
  }
})
