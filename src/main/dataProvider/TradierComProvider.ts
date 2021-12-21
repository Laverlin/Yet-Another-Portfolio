import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";
import { apiRequest } from "./apiRequest";
import { IDataProvider, IImportResult } from "./IDataProvider";

export class TradierComProvider implements IDataProvider {

  _apiToken: string;
  constructor(apiToken: string) {
    this._apiToken = apiToken;
  }

  get providerName(): string {
    return 'Tradier.com Provider'
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
    const symbols = tickers.filter(t => !t.exchange.startsWith('LSE') && t.actualPositions > 0)
    .map(t => t.symbol).join(',');
    const url = `https://sandbox.tradier.com/v1/markets/quotes?symbols=${symbols}&greeks=false`;
    const data = await apiRequest<{quotes: { quote: [{symbol:string, last: number}]}}>(
      url,
      { headers: {
        'Authorization': this._apiToken,
        'Accept': 'application/json'
      }
    });
    return data.quotes.quote.map(q => {return {symbol: q.symbol, price: q.last} as IPriceQuote});
  }

}
