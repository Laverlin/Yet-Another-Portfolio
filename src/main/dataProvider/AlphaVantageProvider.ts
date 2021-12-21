import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";
import { apiRequest } from "./apiRequest";
import { IDataProvider, IImportResult } from "./IDataProvider";

export class AlphaVantageProvider implements IDataProvider {

  _apiToken: string;
  constructor(apiToken: string) {
    this._apiToken = apiToken;
  }

  get providerName(): string {
    return 'AlphaVantage Provider'
  }

  async importPortfolio(): Promise<IImportResult> {
    return Promise.resolve({
      actions: [],
      tickers: [],
      dividends: []
    })
  };

  /**
   * Noop, do not use Tradier as metadata provider
   */
   async getMetadata (_: ITickerInfo[]): Promise<ITickerMetadata[]> {
    return Promise.resolve([]);
  }


  async getActualPrice(tickers: ITickerInfo[]): Promise<IPriceQuote[]> {

    const quotes = new Array<IPriceQuote>();
    for (let ticker of tickers.filter(t => t.exchange.startsWith('LSE') && t.actualPositions > 0)) {
      const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker.symbol}.LON&apikey=${this._apiToken}`;
      const data = await apiRequest<{'Global Quote': { '05. price': string }}>(url);
      if (data['Global Quote']) {
        const price = parseFloat(data['Global Quote']['05. price']);
        console.log(`ticker: ${ticker.symbol}, price: ${price}`);
        quotes.push({symbol: ticker.symbol, price: price});
      }
    }
    return quotes;
  }
}
