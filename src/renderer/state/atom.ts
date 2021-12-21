import { ITickerInfo } from 'main/entity/ITickerInfo';
import { INotification } from 'main/NotifyManager';
import { atom, DefaultValue, selector } from 'recoil'; // eslint-disable-line
import Summary from 'renderer/entity/Summary';
import { ITickerDetailState, tickerDetailClose } from './ITickerDetailState';

export const tickersAtom = atom({
  key: 'tickersAtom',
  default: [] as ITickerInfo[],
});

const replaceItemAtIndex = (
  arr: ITickerInfo[],
  index: number,
  newValue: ITickerInfo
) => {
  return [...arr.slice(0, index), newValue, ...arr.slice(index + 1)];
};

export const tickerSelector = selector<ITickerInfo>({
  key: 'tickerSelector',
  get: ({ get }) => get(tickersAtom)[0],
  set: ({ set, get }, updated) => {
    if (updated instanceof DefaultValue) return;
    const tickers = get(tickersAtom);
    const index = tickers.findIndex((t) => t.symbol === updated.symbol);
    if (index > -1) {
      const newTickers = replaceItemAtIndex(tickers, index, updated);
      set(tickersAtom, [...newTickers]);
    }
  },
});

export const summarySelector = selector<Summary>({
  key: 'summarySelector',
  get: ({ get }) => get(tickersAtom).reduce((summary: Summary, ticker: ITickerInfo) => {
    summary.invested += ticker.purchaseValue;
    summary.realizedPnL += ticker.realizedPnL;
    summary.unrealizedPnL += ticker.unrealizedPnL;
    summary.dividendAmount += ticker.dividendAmount;
    return summary;
  }, new Summary())
})


export const notificationLogAtom = atom({
  key: 'notificationLogAtom',
  default: [] as INotification[]
})

export const logDialogAtom = atom({
  key: 'logDialogAtom',
  default: false
})

export const tickerDetailStateAtom = atom<ITickerDetailState>({
  key: 'tickerDetailStateAtom',
  default: tickerDetailClose
})

export const groupFieldAtom = atom<keyof ITickerInfo | ''>({
  key: 'groupFieldAtom',
  default: ''
})

export const pinDialogStateAtom = atom<boolean>({
  key: 'pinDialogStateAtom',
  default: false
})
