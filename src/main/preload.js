const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    systemCommand(command) {
      ipcRenderer.send('systemCommand-m', command);
    },

    importOperations() {
      ipcRenderer.send('import-m');
    },

    loadPortfolio() {
      ipcRenderer.send('load-m');
    },

    refreshPortfolio() {
      ipcRenderer.send('refresh-m');
    },

    loadActions(tickerId) {
      ipcRenderer.send('loadActions-m', tickerId);
    },

    onReceivePortfolio(func) {
      ipcRenderer.on('portfolio-r', (event, ...args) => func(...args));
    },

    onReceiveLivePrice(func) {
      ipcRenderer.on('livePrice-r', (event, ...args) => func(...args));
    },

    onReceiveNotification(func) {
      ipcRenderer.on('notification-r', (event, ...args) => func(...args));
    },

    removeNotificationListeners() {
      ipcRenderer.removeAllListeners('notification-r');
    },

    removePortfolioListeners() {
      ipcRenderer.removeAllListeners('portfolio-r');
    },

    onReceiveActions(func) {
      ipcRenderer.once('actions-r', (event, ...args) => func(...args));
    },

    enterPin(pin) {
      ipcRenderer.send('ibkrPin-m', pin);
    },


    requestFile(filePath, contentType) {
      ipcRenderer.send('ipc-readFile', filePath, contentType);
    },

    onReceiveContent(func) {
      ipcRenderer.once('ipc-toRender', (event, ...args) => func(...args));
    },

    writeFile(filePath, content) {
      ipcRenderer.send('ipc-writeFile', filePath, content);
    },

    on(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        //
        ipcRenderer.on(channel, (event, ...args) => func(...args));
      }
    },
    once(channel, func) {
      const validChannels = ['ipc-example'];
      if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender`
        ipcRenderer.once(channel, (event, ...args) => func(...args));
      }
    },
  },
});
