import { ITickerInfo } from "main/entity/ITickerInfo";

export interface ITickerDetailState {
  isOpen: boolean
  tickerInfo: ITickerInfo | undefined
}

export const tickerDetailClose: ITickerDetailState = {
  isOpen: false,
  tickerInfo: undefined
}
