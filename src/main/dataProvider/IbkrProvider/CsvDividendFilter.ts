import { IDividend } from "main/entity/IDividend";
import { Transform } from "stream";

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
