/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import { } from '../renderer/utils/SystemExtentions';
import 'core-js/stable';
import 'regenerator-runtime/runtime';
import path from 'path';
import fs from 'fs';
import { app, BrowserWindow, ipcMain, Menu } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { resolveHtmlPath } from './util';
import { Dispatcher } from './dataProvider/Dispatcher';
import { PortfolioAppSetting, Setting } from './Storage/Settings';
import { SystemCommand } from './entity/SystemCommand';
import { TinkoffDataProvider } from './dataProvider/TinkoffDataProvider';
import { FinancialModelingProvider } from './dataProvider/FinancialModelingProvider';
import { TradierComProvider } from './dataProvider/TradierComProvider';
import { AlphaVantageProvider } from './dataProvider/AlphaVantageProvider';
import { IbkrDataProvider } from './dataProvider/IbkrDataProvider';
import { NotifyManager } from './NotifyManager';

export default class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDevelopment =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDevelopment) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const appSetting = Setting.load(PortfolioAppSetting);

const createWindow = async () => {
  if (isDevelopment) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };


  let { x, y, width, height } = appSetting.windowSize;

  Menu.setApplicationMenu(null);
  mainWindow = new BrowserWindow({
    show: false,
    x: x,
    y: y,
    width: width,
    height: height,
    minWidth: 1000,
    minHeight: 400,
    frame: false,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
    },
  });

  mainWindow.on('resize', () => {
    appSetting.windowSize = mainWindow!.getBounds();
    appSetting.save();
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

(async () =>{
  await app.whenReady();
  await createWindow();
  app.on('activate', async () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) await createWindow();
  });

  const notifyManager = new NotifyManager(mainWindow!.webContents);
  const dispatcher = await Dispatcher.CreateInstance(notifyManager, appSetting.dbFilePath);
  dispatcher.addDataProvider(
    new IbkrDataProvider(ipcMain, appSetting.ibkrSetting, appSetting.appFolder, notifyManager)
  );
  dispatcher.addDataProvider(new TinkoffDataProvider(appSetting.tinkoffAPIKey));
  dispatcher.addDataProvider(new FinancialModelingProvider(appSetting.financialmodelingKey));
  dispatcher.addDataProvider(new TradierComProvider(appSetting.tradierKey));
  dispatcher.addDataProvider(new AlphaVantageProvider(appSetting.alphavantageKey));

  ipcMain.on('import-m', async (_event ) => {
    //const files = dialog.showOpenDialogSync({properties: ['openFile']});
    await dispatcher.importOperations();
    await dispatcher.updateActualPrice();
    mainWindow?.webContents.send('portfolio-r', await dispatcher.getPortfolio());
    notifyManager.send('Import is done.');
  });

  ipcMain.on('refresh-m', async (_event ) => {
    await dispatcher.updateActualPrice();
    mainWindow?.webContents.send('portfolio-r', await dispatcher.getPortfolio());
    notifyManager.send('Market value update is done.');
  });

  ipcMain.on('load-m', async (_event ) => {
    mainWindow?.webContents.send('portfolio-r', await dispatcher.getPortfolio());
    notifyManager.send('Portfolio Loaded');
  });

  ipcMain.on('loadActions-m', async (_, tickerId: number) =>{
    mainWindow?.webContents.send('actions-r', await dispatcher.getActionList(tickerId));
  });

  ipcMain.on('systemCommand-m', (_, command: SystemCommand) => {
    switch (command) {
      case 'close':
        app.quit();
        break;
      case 'minimize':
        mainWindow?.minimize();
        break;
      case 'maximize':
        mainWindow?.maximize();
        break;
      case 'restore':
        mainWindow?.restore();
        break;
      default:
        throw Error('unknown command');
    }
  })
})();


ipcMain.on('ipc-readFile', (_event, filePath: string, contentType: string) => {
  const content = fs.readFileSync(filePath, 'utf-8');
  mainWindow?.webContents.send('ipc-toRender', content, contentType);
});

ipcMain.on('ipc-writeFile', (_event, filePath: string, content: any) => {
  fs.writeFileSync(filePath, JSON.stringify(content));
});



