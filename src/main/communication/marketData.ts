import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";
import sharp from 'Sharp';

const apiRequest = async <T>(url: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(url, options);
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return await (response.json() as Promise<T>);
};

export const getUSPrices = async (tickers: ITickerInfo[], apiKey: string): Promise<IPriceQuote[]> => {
  const symbols = tickers.filter(t => !t.exchange.startsWith('LSE') && t.actualPositions > 0)
    .map(t => t.symbol).join(',');
  const url = `https://sandbox.tradier.com/v1/markets/quotes?symbols=${symbols}&greeks=false`;
  const data = await apiRequest<{quotes: { quote: [{symbol:string, last: number}]}}>(
    url,
    { headers: {
      'Authorization': apiKey,
      'Accept': 'application/json'
    }
  });
  return data.quotes.quote.map(q => {return {symbol: q.symbol, price: q.last} as IPriceQuote});
}

export async function* getLSEPrices(tickers: ITickerInfo[], apiKey: string) {
  for (let ticker of tickers.filter(t => t.exchange.startsWith('LSE') && t.actualPositions > 0)) {
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker.symbol}.LON&apikey=${apiKey}`;
    const data = await apiRequest<{'Global Quote': { '05. price': string }}>(url);
    if (data['Global Quote']) {
      const price = parseFloat(data['Global Quote']['05. price']);
      console.log(`ticker: ${ticker.symbol}, price: ${price}`);
      yield {symbol: ticker.symbol, price: price} as IPriceQuote
    }
  }
};

export async function* getTickersMetadata(tickers: ITickerInfo[], apiKey: string) {
  for (let ticker of tickers.filter(t => !t.sector)) {
    const url = `https://financialmodelingprep.com/api/v3/profile/${ticker.symbol}?apikey=${apiKey}`
    const data = await apiRequest<ITickerMetadata[]>(url);
    if (data[0]) {
      const image = await(await fetch(data[0].image)).arrayBuffer();
      const scaled = await sharp(Buffer.from(image)).resize(32, 32, {fit:'inside'}).toBuffer()
      data[0].logoImage = `data:image;base64,${scaled.toString('base64')}`
      yield data[0];
    }
  }

}
