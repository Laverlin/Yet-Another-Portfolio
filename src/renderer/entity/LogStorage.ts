import { INotification } from "main/entity/INotification";

export class LogStorage {
  private _logStorage: INotification[] = [];

  add(newRecord: INotification) {
    this._logStorage.unshift(newRecord);
  }

  get logRecords(): INotification[] {
    return this._logStorage;
  }
}

export const logStorage = new LogStorage();
