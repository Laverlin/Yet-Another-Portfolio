import { IAction } from "main/entity/IAction";
import { IDividend } from "main/entity/IDividend";
import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITicker } from "main/entity/ITicker";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";

export interface IImportResult {
  tickers: ITicker[];
  actions: IAction[];
  dividends: IDividend[];
}

export interface IDataProvider {
  providerName: string;
  importPortfolio: () => Promise<IImportResult>;
  getMetadata: (tickers: ITickerInfo[]) => Promise<ITickerMetadata[]>;
  getActualPrice: (tickers: ITickerInfo[]) => Promise<IPriceQuote[]>;
}
