import { ILivePrice } from 'main/entity/ILivePrice';
import { ITickerInfo } from 'main/entity/ITickerInfo';
import { INotification } from 'main/NotifyManager';
import { atom, atomFamily, selector, selectorFamily, } from 'recoil'; // eslint-disable-line
import Summary from 'renderer/entity/Summary';
import {  getComparator, OrderDirection } from './Comparator';
import { GroupSummary } from './GroupSummary';
import { ITickerDetailState, tickerDetailClose } from './ITickerDetailState';

export const tickerIdsAtom = atom<number[]>({
  key: 'tickerIdsAtom',
  default: [] as number[]
});

export const tickerAtom = atomFamily<ITickerInfo, number>({
  key: 'tickerSelector',
  default: {
    actualPositions: 0,
    avgPrice: 0,
    customGroup: '',
    description: '',
    dividendAmount: 0,
    exchange: '',
    industry:'',
    logoImage:'',
    marketPrice: 0,
    marketValue: 0,
    portfolioPercent: 0,
    purchaseValue: 0,
    realizedPnL: 0,
    sector: '',
    securityId: '',
    ibkrContractId: '',
    symbol: '',
    tickerId: 0,
    type: '',
    unrealizedPnL: 0,
    unrealizedPnLPercent: 0,
   } as ITickerInfo
});

export const totalMarketValueSelector = selectorFamily<number, number>({
  key: 'totalMarketValueSelector',
  get: (tickerId) => ({get}) => {
    const ticker = get(tickerAtom(tickerId));
    return ticker.marketPrice * ticker.actualPositions;
  }
});

export const unrealisedPnLSelector = selectorFamily<number, number>({
  key: 'unrealisedPnLSelector',
  get: (tickerId) => ({get}) => {
    const ticker = get(tickerAtom(tickerId));
    return get(totalMarketValueSelector(tickerId)) - ticker.purchaseValue;
  }
});

export const unrealisedPnLPercentSelector = selectorFamily<number, number>({
  key: 'unrealisedPnLPercentSelector',
  get: (tickerId) => ({get}) => {
    const ticker = get(tickerAtom(tickerId));
    return (get(totalMarketValueSelector(tickerId)) / ticker.purchaseValue - 1) * 100;
  }
});

export const livePriceAtom = atomFamily<ILivePrice, number>({
  key: 'livePriceAtom',
  default: tickerId => {
    return {
      tickerId: tickerId,
      symbol: '',
      lastPrice: 0,
      dayChange: 0,
      dayChangePercent: 0
    }
  }
});


export const orderDirectionAtom = atom<OrderDirection>({
  key: 'orderDirectionAtom',
  default: 'asc'
});

export const orderByAtom = atom<keyof ITickerInfo>({
  key: 'orderByAtom',
  default: 'symbol'
})

export const sortedTikerSelector = selector<number[]>({
  key: 'sortedTikerSelector',
  get: ({get}) =>
    get(tickerIdsAtom)
      .map(tickerId => get(tickerAtom(tickerId)))
      .sort(getComparator(get(orderDirectionAtom), get(orderByAtom)))
      .map(ticketInfo => ticketInfo.tickerId)
});


export const groupFiledNameAtom = atom<keyof ITickerInfo | ''>({
  key: 'GroupFiledNameAtom',
  default: ''
})

export const groupsSelector = selector<GroupSummary[]>({
  key: 'groupsSelector',
  get: ({get}) => {

    const groupFieldName = get(groupFiledNameAtom) as keyof ITickerInfo;
    const tickers = get(tickerIdsAtom).map(tickerId => get(tickerAtom(tickerId)));
    const groups = [...new Set(tickers.map(t => t[groupFieldName]))];

    return groups.map(group => {
      const groupTickers = tickers.filter(t => t[groupFieldName] === group);
      const groupSummary = groupTickers.reduce((acc, ticker) => {
        acc.spent += ticker.purchaseValue;
        acc.marketValue += get(totalMarketValueSelector(ticker.tickerId));
        acc.unrealizedPnL += get(unrealisedPnLSelector(ticker.tickerId));
        acc.realizedPnL += ticker.realizedPnL;
        acc.portfolioPercent += ticker.portfolioPercent;
        acc.dividendAmount += ticker.dividendAmount;
        return acc;
      }, new GroupSummary());
      groupSummary.unrealizedPnLPercent = (groupSummary.marketValue / groupSummary.spent - 1) * 100;
      groupSummary.groupTitle = group?.toString();
      return groupSummary;
    });
  }
});

export const groupTickersSelector = selectorFamily<number[], string>({
  key: 'groupTickersSelector',
  get: (groupTitle) => ({get}) => {
    const tickers = get(tickerIdsAtom).map(tickerId => get(tickerAtom(tickerId)));
    return tickers
      .filter(ticker => ticker[get(groupFiledNameAtom) as keyof ITickerInfo] === groupTitle)
      .sort(getComparator(get(orderDirectionAtom), get(orderByAtom)))
      .map(ticker => ticker.tickerId)
  }
})

export const summarySelector = selector<Summary>({
  key: 'summarySelector',
  get: ({ get }) => get(tickerIdsAtom).reduce((summary: Summary, tickerId: number) => {
    summary.invested += get(tickerAtom(tickerId)).purchaseValue;
    summary.realizedPnL += get(tickerAtom(tickerId)).realizedPnL;
    summary.unrealizedPnL += get(unrealisedPnLSelector(tickerId));
    summary.dividendAmount += get(tickerAtom(tickerId)).dividendAmount;
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

export const pinDialogStateAtom = atom<boolean>({
  key: 'pinDialogStateAtom',
  default: false
})
