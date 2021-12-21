import { ITicker } from "main/entity/ITicker";
import { Transform } from "stream";

export class CsvTickerFilter extends Transform {

  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    })
  }

  _transform(chunk: string, _encoding: string, next: Function) {
    const data = String(chunk);
    if (data.startsWith('Financial Instrument Information')) {
        const raw = chunk.split(new RegExp(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        if (raw[1] === 'Data') {
            const ticker: ITicker = {
              symbol: raw[3],
              description: raw[4],
              securityId: raw[6],
              exchange: raw[7],
              type: raw[9]
            }
            next(null, ticker);
            return;
        }
    }
    next();
  }
}
