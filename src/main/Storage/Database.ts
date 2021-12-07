import sqlite3 from 'sqlite3'
import { open } from 'sqlite'
import { ITicker } from '../entity/ITicker';
import { IAction } from '../entity/IAction';
import { ITickerInfo } from '../entity/ITickerInfo';
import { IPriceQuote } from 'main/entity/IPriceQuote';
import { ITickerMetadata } from 'main/entity/ITickerMetadata';
import { IDividend } from 'main/entity/IDividend';
import { IActionItem } from 'main/entity/IActoinItem';

export class Database {
  private dbFile: string;
  private async open() {
    return await open({
      filename: this.dbFile,
      driver: sqlite3.Database
    });
  }

  private constructor(dbFile: string) {
    this.dbFile = dbFile;
  }

  private async execute<T = void>(query: string, isExpectResult = false): Promise<void | T> {
    const db = await this.open();
    try {
      return isExpectResult
        ? await db.all<T>(query)
        : await db.exec(query);
    }
    catch(e) {
      console.error(e);
    }
    finally{
      await db.close();
    }
  }

  static async initialize(dbFile: string) {
    const database = new Database(dbFile);

    await database.execute(`
      CREATE TABLE IF NOT EXISTS ticker(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        symbol TEXT,
        description TEXT,
        industry TEXT,
        sector TEXT,
        customGroup TEXT,
        securityId TEXT,
        exchange TEXT,
        type TEXT,
        marketPrice REAL,
        UNIQUE(symbol)
      )`
    );
    await database.execute(`
      CREATE TABLE IF NOT EXISTS action(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tickerId INTEGER,
        time INTEGER,
        positions INTEGER,
        price REAL,
        fee REAL,
        UNIQUE (tickerId, time, positions)
      );`
    );
    await database.execute(`
      CREATE TABLE IF NOT EXISTS dividend(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        time INTEGER,
        tickerId INTEGER,
        amount REAL,
        description TEXT,
        UNIQUE (tickerId, time, amount)
      );`
    );
    return database;
  }

  async insertTicker(ticker: ITicker) {
    const query = `
      INSERT INTO ticker(symbol, description, securityId, exchange, type)
      VALUES ('${ticker.symbol}', '${ticker.description}', '${ticker.securityId}', '${ticker.exchange}', '${ticker.type}')
      ON CONFLICT (symbol) DO NOTHING
    `;
    await this.execute(query);
  }

  async insertAction(action: IAction) {
    const query = `
      INSERT INTO action(tickerId, time, positions, price, fee)
      SELECT id, '${action.time.valueOf()}', '${action.positions}', '${action.price}', '${action.fee}'
      FROM ticker WHERE symbol = '${action.symbol}'
      ON CONFLICT (tickerId, time, positions) DO NOTHING
    `;
    await this.execute(query);
  }

  async getTickers() {
    const query = `
    WITH rowCte (tickerId, time, positions, price, fee, rowId)
    AS (SELECT tickerId, time, positions, price, fee,
            ROW_NUMBER() OVER(PARTITION BY tickerId ORDER BY time) rowId
        FROM action
    ),
        avgCte (rowId, tickerId, time, positions, price, actualPositions, purchaseValue, avgPrice, realizedPnL)
    AS (SELECT rowId, tickerId, time, positions, price, positions as actualPositions, price * positions - fee as purchaseValue,
            (price * positions - fee) / positions as avgPrice, 0 as realizedPnL
        FROM rowCte WHERE rowId = 1
        UNION ALL
        SELECT rowCte.rowId, rowCte.tickerId, rowCte.time, rowCte.positions, rowCte.price, avgCte.actualPositions + rowCte.positions,
            CASE WHEN rowCte.positions > 0 THEN
                avgCte.avgPrice * avgCte.actualPositions + rowCte.price * rowCte.positions - fee
            ELSE
                avgCte.avgPrice * (avgCte.actualPositions + rowCte.positions)
            END,
            CASE WHEN rowCte.positions > 0 THEN
                (avgCte.avgPrice * avgCte.actualPositions + rowCte.price * rowCte.positions - fee) / (avgCte.actualPositions + rowCte.positions)
            ELSE
                avgCte.avgPrice
            END,
            CASE WHEN rowCte.positions < 0 THEN
                avgCte.realizedPnL + avgCte.avgPrice * rowCte.positions - (rowCte.price * rowCte.positions - rowCte.fee)
            ELSE
                avgCte.realizedPnL
            END
        FROM avgCte INNER JOIN rowCte
        ON rowCte.tickerId = avgCte.tickerId AND rowCte.rowId = avgCte.rowId + 1
    ),
        tickerCte (tickerId, symbol, description, industry, sector, customGroup, securityId, exchange, type, marketPrice,
            actualPositions, purchaseValue, avgPrice, realizedPnL, marketValue, unrealizedPnL, unrealizedPnLPercent)
    AS (SELECT t.Id, t.symbol, t.description,
            ifnull(t.industry, ''), ifnull(t.sector, ''), ifnull(t.customGroup, ''), t.securityId, t.exchange,
            t.type, ifnull(t.marketPrice, 0), a.actualPositions, a.purchaseValue, a.avgPrice, a.realizedPnL,
            ifnull(a.actualPositions * t.marketPrice, 0) as marketValue,
            ifnull(a.actualPositions * t.marketPrice - a.purchaseValue, 0) as unrealizedPnL,
            ifnull((a.actualPositions * t.marketPrice - a.purchaseValue) / a.purchaseValue * 100, 0) as unrealizedPnLPercent
        FROM ticker t INNER JOIN avgCte a ON t.id = a.tickerId
        INNER JOIN
        (SELECT tickerId, max(rowId) maxRowId
            FROM avgCte
            GROUP BY tickerId
        ) at ON a.rowId = at.maxRowId and a.tickerId = at.tickerId
    )
    SELECT tickerId, symbol, description, industry, sector, customGroup, securityId, exchange, type,
        actualPositions, marketPrice, purchaseValue, avgPrice, marketValue, unrealizedPnL, unrealizedPnLPercent,
        realizedPnL + ifnull((SELECT SUM(amount) FROM Dividend d WHERE tickerCte.tickerId = d.tickerId), 0) as realizedPnL,
        ifnull(marketValue / (SELECT sum(marketValue) FROM tickerCte) * 100, 0) as portfolioPercent,
        ifnull((SELECT SUM(amount) FROM Dividend d WHERE tickerCte.tickerId = d.tickerId), 0) as dividendAmount
    FROM tickerCte
     `;
    return await this.execute<ITickerInfo[]>(query, true) as ITickerInfo[];
  }


  async setActualPrice(quote: IPriceQuote) {
    const query = `UPDATE ticker set marketPrice=${quote.price} WHERE symbol='${quote.symbol}'`;
    await this.execute(query);
  }

  async setTickerMetadata(meta: ITickerMetadata) {
    const query = `
      UPDATE ticker SET
        description='${meta.companyName}',
        sector='${meta.sector}',
        industry='${meta.industry}'
      WHERE symbol='${meta.symbol}'
    `;
    await this.execute(query);
  }

  async insertDividend(dividend: IDividend) {
    const query = `
    INSERT INTO dividend(tickerId, time, amount, description)
    SELECT id, '${dividend.time.valueOf()}', '${dividend.amount}', '${dividend.description}'
    FROM ticker WHERE symbol = '${dividend.symbol}'
    ON CONFLICT (tickerId, time, amount) DO NOTHING
  `;
  await this.execute(query);
  }

  async getActionList(tickerId: number) {
    const query = `
    WITH sCte (tickerId, time, positions, price, fee, description)
    AS (SELECT tickerId, time, positions, price, fee, CASE WHEN positions > 0 THEN 'buy' ELSE 'sell' END FROM action
        UNION ALL
       SELECT tickerId, time, 0, amount, 0, CASE WHEN amount > 0 THEN 'dividend payment' ELSE 'dividend tax' END FROM dividend
    ),
        rowCte (tickerId, time, positions, price, fee, description, rowId)
    AS (SELECT *, ROW_NUMBER() OVER(PARTITION BY tickerId ORDER BY time) rowId
        FROM sCte
    ),
        avgCte (rowId, tickerId, time, positions, price, fee, actualPositions, purchaseValue, avgPrice, realizedPnL, description)
    AS (SELECT rowId, tickerId, time, positions, price, fee, positions as actualPositions,
        price * positions - fee as purchaseValue, (price * positions - fee) / positions as avgPrice, 0, description
        FROM rowCte WHERE rowId = 1
        UNION ALL
        SELECT rowCte.rowId, rowCte.tickerId, rowCte.time, rowCte.positions, rowCte.price, rowCte.fee, avgCte.actualPositions + rowCte.positions,
            CASE WHEN rowCte.positions > 0 THEN
                avgCte.avgPrice * avgCte.actualPositions + rowCte.price * rowCte.positions - rowCte.fee
            ELSE
                avgCte.avgPrice * (avgCte.actualPositions + rowCte.positions)
            END,
            CASE WHEN rowCte.positions > 0 THEN
                (avgCte.avgPrice * avgCte.actualPositions + rowCte.price * rowCte.positions - rowCte.fee) / (avgCte.actualPositions + rowCte.positions)
            ELSE
                avgCte.avgPrice
            END,
            CASE WHEN rowCte.positions < 0 THEN
                avgCte.realizedPnL + avgCte.avgPrice * rowCte.positions - (rowCte.price * rowCte.positions - rowCte.fee)
            WHEN rowCte.positions = 0 THEN
                avgCte.realizedPnL + rowCte.price
            ELSE
                avgCte.realizedPnL
            END,
            rowCte.description
        FROM avgCte INNER JOIN rowCte
        ON rowCte.tickerId = avgCte.tickerId AND rowCte.rowId = avgCte.rowId + 1
    )
    SELECT time, positions, price, fee, actualPositions, purchaseValue, realizedPnL, description
    FROM avgCte WHERE tickerId = '${tickerId}'
    `;
    return await this.execute<IActionItem[]>(query, true) as IActionItem[];
  }
}
