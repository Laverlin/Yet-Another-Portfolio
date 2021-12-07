import { IActionItem } from "main/entity/IActoinItem";
import { INotification } from "main/entity/INotification";
import { ITickerInfo } from "main/entity/ITickerInfo";


declare global {
  interface Window {
    electron: Electron;
  }
}

export interface Electron {
  ipcRenderer: IpcRenderer;
}

export interface IpcRenderer {
  importOperations(): void;
  loadPortfolio(): void;
  refreshPortfolio(): void;
  onReceivePortfolio(func: (content: ITickerInfo[]) => void): void;
  onReceiveNotification(func: (notification: INotification) => void): void;
  removeNotificationListeners() : void;
  removePortfolioListeners() : void;
  loadActions(tickerId: number): void;
  onReceiveActions(func: (actions: IActionItem[]) => void): void;

  /*
  requestFile(filePath: string, contentType: FileContentType): void;
  onReceiveContent(func: (content: string, contentType: FileContentType) => void): void;
  */
  writeFile<T>(filePath: string, content: T): void;
}
