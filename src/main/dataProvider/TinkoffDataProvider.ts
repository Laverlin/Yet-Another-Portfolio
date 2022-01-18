import OpenAPI from "@tinkoff/invest-openapi-js-sdk";
import { IAction } from "main/entity/IAction";
import { IDividend } from "main/entity/IDividend";
import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITicker } from "main/entity/ITicker";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";
import { IDataProvider, IImportResult } from "./IDataProvider";


interface TcsTicker extends ITicker{
  figi: string;
}

export class TinkoffDataProvider implements IDataProvider {

  _apiURL = 'https://api-invest.tinkoff.ru/openapi'
  _socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';
  _operationsTrade = ['Sell', 'Buy']
  _operationsDividend = ['Dividend', 'TaxDividend'];
  _allOperations = this._operationsTrade.concat(this._operationsDividend);
  _from = new Date(2021, 1, 1);
  _to = new Date();
  _api: OpenAPI;

  constructor(apiToken: string) {
    this._api = new OpenAPI({ apiURL: this._apiURL, secretToken: apiToken, socketURL: this._socketURL });
  }

  get providerName(): string {
    return 'Tinkoff Data Provider'
  }

  async importPortfolio(): Promise<IImportResult> {

    const tickers = new Array<TcsTicker>();
    const actions = new Array<IAction>();
    const dividends = new Array<IDividend>();
    var operation = await this._api.operations({from: this._from.toISOString(),to: this._to.toISOString(),});
    for(let op of operation.operations) {
      if (!op.figi || op.status !== 'Done' || op.currency !== 'USD')
        continue;

//      console.log(op);

      // add new Ticker in tickers
      //
      if (this._allOperations.includes(op.operationType || '')) {
        let tcsTicker = tickers.find(t => t.figi === op.figi);
        if (!tcsTicker) {
            const position = await this._api.searchOne({figi: op.figi});
            const ticker: TcsTicker = {
                symbol: position!.ticker || '',
                type: position!.type,
                securityId: position!.isin || '',
                ibkrContractId: '',
                description: '',
                exchange: '',
                figi: op.figi,
            }
            tickers.push(ticker);
        }
      }

      // add new action in actions
      //
      if (this._operationsTrade.includes(op.operationType || '')) {
        const quantity = op.operationType === 'Sell' ? -op.quantityExecuted! : op.quantityExecuted;
        const action = {
          symbol: tickers.find(t => t.figi === op.figi)!.symbol,
          time: new Date(op.date),
          price: op.price || 0,
          positions: quantity || 0,
          fee: op.commission?.value || 0
        }
        actions.push(action);
//        console.log(action);
      }

      // add new dividend in dividends
      //
      if (this._operationsDividend.includes(op.operationType || '')) {
        const dividend = {
          symbol: tickers.find(t => t.figi === op.figi)!.symbol,
          time: new Date(op.date),
          amount: op.payment || 0,
          description: op.operationType || ''
        };
        dividends.push(dividend);
//        console.log(dividend);
      }

    }
    return {
      tickers: tickers,
      actions: actions,
      dividends: dividends
    };
  }




  /**
   * Noop, do not use tinkoff as metadata provider
   */
  async getMetadata (_: ITickerInfo[]): Promise<ITickerMetadata[]> {
    return Promise.resolve([]);
  }

  /**
   * Noop, always returns emty price quotes as we do not want to use tinkoff as price provider
   */
  async getActualPrice (_: ITickerInfo[]): Promise<IPriceQuote[]> {
    return Promise.resolve([]);
  }

}
