import { WebContents } from "electron";

export type NotificationSeverity = 'success' | 'error' | 'warning' | 'info';

export interface INotification {
  message: string;
  severity: NotificationSeverity;
  time: Date;
  source: string;
}

export class NotifyManager {
  private _webContents: WebContents;
  constructor(webContents: WebContents) {
    this._webContents = webContents;
  }

  send(message: string, severity: NotificationSeverity = 'success', source = '') {
    const notificaton = {
      message: message,
      severity: severity,
      time: new Date(),
      source: source
    };

    this._webContents.send('notification-r', notificaton);
  }
}
