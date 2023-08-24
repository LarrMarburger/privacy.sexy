// Initializes Electron's main process, always runs in the background, and manages the main window.

import {
  app, protocol, BrowserWindow, shell, screen,
} from 'electron';
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer';
import log from 'electron-log';
import { validateRuntimeSanity } from '@/infrastructure/RuntimeSanity/SanityChecks';
import { setupAutoUpdater } from './Update/Updater';
import {
  APP_ICON_PATH, PRELOADER_SCRIPT_PATH, RENDERER_HTML_PATH, RENDERER_URL,
} from './ElectronConfig';

const isDevelopment = !app.isPackaged;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let win: BrowserWindow | null;

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } },
]);

setupLogger();
validateRuntimeSanity({
  validateMetadata: true,
});

function createWindow() {
  // Create the browser window.
  const size = getWindowSize(1650, 955);
  win = new BrowserWindow({
    width: size.width,
    height: size.height,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: PRELOADER_SCRIPT_PATH,
    },
    icon: APP_ICON_PATH,
  });

  win.setMenuBarVisibility(false);
  configureExternalsUrlsOpenBrowser(win);
  loadApplication(win);

  win.on('closed', () => {
    win = null;
  });
}

let macOsQuit = false;
// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform === 'darwin'
    && !macOsQuit) {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    return;
  }
  app.quit();
});

if (process.platform === 'darwin') {
  // On macOS we application quit is stopped if user does not Cmd + Q
  // But we still want to be able to use app.quit() and quit the application
  // on menu bar, after updates etc.
  app.on('before-quit', () => {
    macOsQuit = true;
  });
}

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow();
  }
});

app.on('ready', async () => {
  if (isDevelopment) {
    try {
      await installExtension(VUEJS_DEVTOOLS);
    } catch (e) {
      log.error('Vue Devtools failed to install:', e.toString());
    }
  }
  createWindow();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit();
      }
    });
  } else {
    process.on('SIGTERM', () => {
      app.quit();
    });
  }
}

function loadApplication(window: BrowserWindow) {
  if (RENDERER_URL) { // Populated in a dev server during development
    loadUrlWithNodeWorkaround(win, RENDERER_URL);
  } else {
    loadUrlWithNodeWorkaround(win, RENDERER_HTML_PATH);
  }
  if (isDevelopment) {
    window.webContents.openDevTools();
  } else {
    const updater = setupAutoUpdater();
    updater.checkForUpdates();
  }
  // Do not remove [WINDOW_INIT]; it's a marker used in tests.
  log.info('[WINDOW_INIT] Main window initialized and content loading.');
}

function configureExternalsUrlsOpenBrowser(window: BrowserWindow) {
  window.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Workaround for https://github.com/electron/electron/issues/19554 otherwise fs does not work
function loadUrlWithNodeWorkaround(window: BrowserWindow, url: string) {
  setTimeout(() => {
    window.loadURL(url);
  }, 10);
}

function getWindowSize(idealWidth: number, idealHeight: number) {
  let { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // To ensure not creating a screen bigger than current screen size
  // Not using "enableLargerThanScreen" as it's macOS only (see https://www.electronjs.org/docs/api/browser-window)
  width = Math.min(width, idealWidth);
  height = Math.min(height, idealHeight);
  return { width, height };
}

function setupLogger(): void {
  log.transports.file.level = 'silly';
  if (!isDevelopment) {
    Object.assign(console, log.functions); // override console.log, console.warn etc.
  }
}
