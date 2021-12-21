
import { Database } from '../Storage/Database';
import { IDataProvider } from './IDataProvider';
import { NotifyManager } from 'main/NotifyManager';

export class Dispatcher {

  private _notifyManager: NotifyManager;
  private _db: Database;
  private _dataProviders: IDataProvider[] = [];

  private constructor(notifyManager: NotifyManager, db: Database) {
    this._notifyManager = notifyManager;
    this._db = db;
  }

  static async CreateInstance(
    notifyManager: NotifyManager,
    dbFilePath: string
  ): Promise<Dispatcher> {
    const db = await Database.initialize(dbFilePath);
    return  new Dispatcher(notifyManager, db);
  }

  addDataProvider(provider: IDataProvider) {
    this._dataProviders.push(provider);
  }



  async importOperations() {
    try {
      for (const provider of this._dataProviders) {
        const portfolio = await provider.importPortfolio();
        for (const ticker of portfolio.tickers)
          await this._db.insertTicker(ticker);
        this._notifyManager.send(`import tickers from ${provider.providerName} done`);

        for (const action of portfolio.actions)
          await this._db.insertAction(action);
          this._notifyManager.send(`import actions from ${provider.providerName} done`);

        for (const dividend of portfolio.dividends)
          await this._db.insertDividend(dividend);
          this._notifyManager.send(`import dividends from ${provider.providerName} done`);
      }
    }
    catch(error) {
      this.handleError(error, 'import operations');
    }

    try {
      const tickerInfos = await this._db.getTickers();
      for (const provider of this._dataProviders) {
        const metadata = await provider.getMetadata(tickerInfos)
        for (const metaInstance of metadata)
          await this._db.setTickerMetadata(metaInstance)
          this._notifyManager.send(`import metadate from ${provider.providerName} done`);
      }
    }
    catch (error) {
      this.handleError(error, 'import metadata');
    }

  }

  async updateActualPrice() {
    const tickerInfos = await this._db.getTickers();

    try {

      for (const provider of this._dataProviders) {
        const priceQuotes = await provider.getActualPrice(tickerInfos);
        for(const price of priceQuotes)
          await this._db.setActualPrice(price);
          this._notifyManager.send(`Price for ${priceQuotes.length} from ${provider.providerName} updated`);
      }
    }
    catch(error) {
      this.handleError(error, 'price update');
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
    this._notifyManager.send(message, 'error');
  }
}

