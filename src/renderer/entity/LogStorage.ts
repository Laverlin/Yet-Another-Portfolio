import { INotification } from "main/NotifyManager";

export class LogStorage {
  private _logStorage: INotification[] = [];

  add(newRecord: INotification) {
    this._logStorage.push(newRecord);
  }

  get logRecords(): INotification[] {
    return this._logStorage;
  }
}

export const logStorage = new LogStorage();
