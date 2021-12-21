import { IAction } from "main/entity/IAction";
import { Transform } from "stream";

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
