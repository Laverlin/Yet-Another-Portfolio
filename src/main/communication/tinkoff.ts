import OpenAPI from '@tinkoff/invest-openapi-js-sdk';
import { ITicker } from '../entity/ITicker';
import { IAction } from '../entity/IAction';
import { IDividend } from 'main/entity/IDividend';

const apiURL = 'https://api-invest.tinkoff.ru/openapi'
const socketURL = 'wss://api-invest.tinkoff.ru/openapi/md/v1/md-openapi/ws';

/*
export async function* getTickers() {

    const portfolio = await api.portfolio();
    for (let position of portfolio.positions) {
        if (position.averagePositionPrice?.currency !== 'USD')
            continue;
        const ticker: ITicker = {
            symbol: position.ticker || '',
            type: position.instrumentType,
            securityId: position.isin || '',
            description: '',
            exchange: ''
        }
        yield {...ticker, actions: getActions(position.figi, position.ticker!)};
    }
}

async function* getActions(figi: string, symbol: string) {

    const from = new Date(2021, 1, 1);
    const to = new Date();
    const operations = await api.operations({
        from: from.toISOString(),
        to: to.toISOString(),
        figi: figi
    });
    for (let operation of operations.operations) {
        if (operation.status !== 'Done' ||
            (operation.operationType !== 'Sell' && operation.operationType !== 'Buy'))
            continue;
        const quantity = operation.operationType === 'Sell'
            ? -operation.quantityExecuted!
            : operation.quantityExecuted!;
        const action: IAction = {
            symbol: symbol,
            positions: quantity,
            price: operation.price!,
            time: new Date(operation.date),
            fee: operation.commission?.value || 0
        }
        yield action;
    }
}
*/

export type TcsPortfolioEntry = {
  ticker: ITicker,
  figi: string,
  actions: IAction[],
  dividends: IDividend[]
}

const operationsTrade = ['Sell', 'Buy']
const operationsDividend = ['Dividend', 'TaxDividend'];
const allOperations = operationsTrade.concat(operationsDividend);

export const getTinkoffPortfolio = async (secretToken: string) => {

  const from = new Date(2021, 1, 1);
  const to = new Date();

  const exTickers = new Array<TcsPortfolioEntry>();
  const api = new OpenAPI({ apiURL, secretToken, socketURL });

  var operation = await api.operations({from: from.toISOString(),to: to.toISOString(),});
  for(let op of operation.operations) {
      if (op.figi && op.status === 'Done' && op.currency === 'USD' &&
        allOperations.includes(op.operationType || '')) {
          let exTicker = exTickers.find(t => t.figi === op.figi);
          if (!exTicker) {
              const position = await api.searchOne({figi: op.figi});
              const ticker: ITicker = {
                  symbol: position!.ticker || '',
                  type: position!.type,
                  securityId: position!.isin || '',
                  description: '',
                  exchange: ''
              }
              exTicker = {ticker: ticker, figi: op.figi, actions: [], dividends: []}
              exTickers.push(exTicker);
          }
          if (operationsTrade.includes(op.operationType || '')) {
            const quantity = op.operationType === 'Sell' ? -op.quantityExecuted! : op.quantityExecuted;
            exTicker.actions.push({
              symbol: exTicker.ticker.symbol,
              time: new Date(op.date),
              price: op.price || 0,
              positions: quantity || 0,
              fee: op.commission?.value || 0
            });
          }
          if (operationsDividend.includes(op.operationType || '')) {
            exTicker.dividends.push({
              symbol: exTicker.ticker.symbol,
              time: new Date(op.date),
              amount: op.payment || 0,
              description: op.operationType || ''
            });
          }
      }
  }
  return exTickers;
}
