import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";
import sharp from "sharp";
import { apiRequest } from "./apiRequest";
import { IDataProvider, IImportResult } from "./IDataProvider";

export class FinancialModelingProvider implements IDataProvider {

  _apiToken: string;
  constructor(apiToken: string) {
    this._apiToken = apiToken;
  }

  get providerName(): string {
    return 'Financial Modeling Provider';
  }

  async importPortfolio(): Promise<IImportResult> {
    return Promise.resolve({
      actions: [],
      tickers: [],
      dividends: []
    })
  };

  async getMetadata(tickers: ITickerInfo[]): Promise<ITickerMetadata[]> {

    const metadata = new Array<ITickerMetadata>();
    for (let ticker of tickers.filter(t => !t.sector)) {
      const url = `https://financialmodelingprep.com/api/v3/profile/${ticker.symbol}?apikey=${this._apiToken}`
      const data = await apiRequest<ITickerMetadata[]>(url);
      if (data[0]) {
        const image = await(await fetch(data[0].image)).arrayBuffer();
        const scaled = await sharp(Buffer.from(image)).resize(32, 32, {fit:'inside'}).toBuffer()
        data[0].logoImage = `data:image;base64,${scaled.toString('base64')}`
        metadata.push(data[0])
      }
    }
    return metadata;
  }

  async getActualPrice(_: ITickerInfo[]): Promise<IPriceQuote[]> {
    return Promise.resolve([]);
  };

}
