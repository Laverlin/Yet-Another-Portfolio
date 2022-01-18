import { Database } from '../Storage/Database';
import { IDataProvider } from './IDataProvider';
import { NotifyManager } from 'main/NotifyManager';
import { ITickerInfo } from 'main/entity/ITickerInfo';
import { TvWebSocketClient } from './TvWebSocketClient';
import { ILivePrice } from 'main/entity/ILivePrice';

export class Dispatcher {

  private _notifyManager: NotifyManager;
  private _db: Database;
  private _dataProviders: IDataProvider[] = [];
  private _tvWebSocketClient: TvWebSocketClient;
  private _onNotifyLivePrice: (livePrice: ILivePrice) => void;

  private constructor(
    notifyManager: NotifyManager,
    db: Database,
    onNotifyLivePrice: (livePrice: ILivePrice) => void
  ) {
    this.livePriceHandler = this.livePriceHandler.bind(this);
    this._notifyManager = notifyManager;
    this._db = db;
    this._onNotifyLivePrice = onNotifyLivePrice;
    this._tvWebSocketClient = new TvWebSocketClient(this.livePriceHandler);
  }

  static async CreateInstance(
    notifyManager: NotifyManager,
    dbFilePath: string,
    onNotifyLivePrice: (livePrice: ILivePrice) => void
  ): Promise<Dispatcher> {
    const db = await Database.initialize(dbFilePath);
    return  new Dispatcher(notifyManager, db, onNotifyLivePrice);
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
          await this._db.setActualPrice(price.price, price.symbol);
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

  subscribeOnLivePrice(tickers: ITickerInfo[]) {
    tickers
      .filter(ticker => ticker.actualPositions > 0)
      .forEach(ticker => this._tvWebSocketClient.subscribeOnTicker(ticker));
  }

  private async livePriceHandler(livePrice: ILivePrice) {
    await this._db.setActualPrice(livePrice.lastPrice, livePrice.symbol);
    this._onNotifyLivePrice(livePrice);
  }

  private handleError(error: unknown, where: string) {
    const message = `can not get data form ${where}`
    console.error(message);
    console.error(error);
    this._notifyManager.send(message, 'error');
  }
}

