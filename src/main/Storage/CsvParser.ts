import { IDividend } from 'main/entity/IDividend';
import {Transform} from 'stream';
import { IAction } from '../entity/IAction';
import { ITicker } from '../entity/ITicker';


export class CsvActionFilter extends Transform {

  constructor() {
    super({
      readableObjectMode: true,
      writableObjectMode: true,
    })
  }

  _transform(chunk: string, _encoding: string, next: Function) {
    const data = String(chunk);
    if (data.startsWith('Trades')) {
        const raw = chunk.split(new RegExp(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
        if (raw[1] === 'Data') {
            const action: IAction = {
              symbol: raw[5],
              time: new Date(this.parseDate(raw[6])),
              positions: parseFloat(raw[7]),
              price: parseFloat(raw[8]),
              fee: parseFloat(raw[11]),
            }
            next(null, action);
            return;
        }
    }
    next();
  }

  private parseDate(value: string) {
      const dt = value.replace(new RegExp('"', 'g'), '').split(', ');
      const transformed = `${dt[0]}T${dt[1]}`;
      return Date.parse(transformed);
  }
}


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

  export class CsvDividendFilter extends Transform {

    constructor() {
      super({
        readableObjectMode: true,
        writableObjectMode: true,
      })
    }

    _transform(chunk: string, _encoding: string, next: Function) {
      const data = String(chunk);
      if (data.startsWith('Dividends') || data.startsWith('Withholding Tax')) {
          const raw = chunk.split(new RegExp(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/));
          if (raw[1] === 'Data' && raw[2] === 'USD') {
              const divident: IDividend = {
                time: new Date(Date.parse(raw[3])),
                symbol: this.parseSymbol(raw[4]),
                description: raw[4],
                amount: parseFloat(raw[5])
              }
              next(null, divident);
              return;
          }
      }
      next();
    }

    private parseSymbol(description: string): string {
      return description.split('(')[0];
    }
  }
