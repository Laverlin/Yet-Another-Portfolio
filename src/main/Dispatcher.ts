import fs from 'fs';
import { Database } from './Storage/Database';
import { CsvActionFilter, CsvDividendFilter, CsvTickerFilter } from './Storage/CsvParser';
import es from 'event-stream';
import { ITicker } from './entity/ITicker';
import { IAction } from './entity/IAction';
import { getTinkoffPortfolio } from './communication/tinkoff';
import { getLSEPrices, getUSPrices, getTickersMetadata } from './communication/marketData';
import { WebContents } from 'electron';
import { createNotification, NotificationVariant } from './entity/INotification';
import { AppSetting } from './Storage/Settings';

export class Dispatcher {

  private _webContents: WebContents;
  private _db: Database;
  private _appSetting: AppSetting;

  private constructor(mainWindow: WebContents, db: Database, appSetting: AppSetting) {
    this._webContents = mainWindow;
    this._db = db;
    this._appSetting = appSetting;
  }

  static async CreateInstance(webContents: WebContents, appSetting: AppSetting): Promise<Dispatcher> {
    const db = await Database.initialize(appSetting.dbFilePath);
    return  new Dispatcher(webContents, db, appSetting);
  }

  sendNotification = (message: string, variant: NotificationVariant = 'success') => {
    this._webContents.send('notification-r', createNotification(message, variant));
  }

  async importProfiles(files: string[] | undefined) {

    // import from IB csv file
    //
    if (files && files.length > 0) {
      let stream = fs.createReadStream(files[0], 'utf-8')
        .pipe(es.split())
        .pipe(new CsvTickerFilter());
      for await (const data of stream) {
        await this._db.insertTicker(data as ITicker);
      }

      stream = fs.createReadStream(files[0], 'utf-8')
        .pipe(es.split())
        .pipe(new CsvActionFilter());
      for await (const data of stream) {
          await this._db.insertAction(data as IAction);
      }

      stream = fs.createReadStream(files[0], 'utf-8')
        .pipe(es.split())
        .pipe(new CsvDividendFilter());
      for await (const data of stream) {
          await this._db.insertDividend(data);
      }

      this.sendNotification(`Import from Interactive Brokers done.`);
    }

    // import form Tinkoff via API
    //
    try {
      const tinkoffTickers = await getTinkoffPortfolio(this._appSetting.tinkoffAPIKey);
      for (let ticker of tinkoffTickers) {
        await this._db.insertTicker(ticker.ticker);
        for (let action of ticker.actions)
          await this._db.insertAction(action);
        for (let dividend of ticker.dividends)
          await this._db.insertDividend(dividend);
      }
      this.sendNotification(`Import from Tinkoff done.`);
    }
    catch(error) {
       this.handleError(error, 'Tinkoff');
    }


    try {
      const tickerInfos = await this._db.getTickers();
      for await (let meta of getTickersMetadata(tickerInfos, this._appSetting.financialmodelingKey)) {
        await this._db.setTickerMetadata(meta)
      }
      this.sendNotification(`Update ticker metadata done.`);
    }
    catch(error) {
      this.handleError(error, 'financialmodel');
    }
  }

  async updateActualPrice() {
    const tickerInfos = await this._db.getTickers();

    try {
      const usPrices = await getUSPrices(tickerInfos, this._appSetting.tradierKey);
      for(let usp of usPrices) {
        await this._db.setActualPrice(usp);
      }
      this.sendNotification(`Price for ${usPrices.length} updated`);
    }
    catch(error) {
      this.handleError(error, 'tradier');
    }

    try {
      for await (let lsp of getLSEPrices(tickerInfos, this._appSetting.alphavantageKey)) {
        await this._db.setActualPrice(lsp);
        this.sendNotification(`Price update, ticker: ${lsp.symbol}, price: ${lsp.price}`, 'info')
      }
    }
    catch(error) {
      this.handleError(error, 'alphavantage');
    }
  }

  async getPortfolio() {
    return await this._db.getTickers();
  }

  async getActionList(tickerId: number) {
    return await this._db.getActionList(tickerId);
  }

  private handleError(error: unknown, where: string) {
    const message = `can not get data form ${where}`
    console.error(message);
    console.error(error);
    this.sendNotification(message, 'error');
  }
}

