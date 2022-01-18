import puppeteer, { Page} from 'puppeteer';
import { IPriceQuote } from "main/entity/IPriceQuote";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { ITickerMetadata } from "main/entity/ITickerMetadata";
import { IDataProvider, IImportResult } from "./IDataProvider";
import { IpcMain, IpcMainEvent } from 'electron';
import path from 'path';
import fs from 'fs';
import { IbkrSetting } from 'main/Storage/Settings';
import { ITicker } from 'main/entity/ITicker';
import { IAction } from 'main/entity/IAction';
import { IDividend } from 'main/entity/IDividend';
import es from 'event-stream';
import { CsvActionFilter } from './IbkrProvider/CsvActionFilter';
import { CsvDividendFilter } from './IbkrProvider/CsvDividendFilter';
import { CsvTickerFilter } from './IbkrProvider/CsvTickerFilter';
import { NotifyManager } from 'main/NotifyManager';

export class IbkrDataProvider implements IDataProvider {

  private _ipcMain: IpcMain;
  private _ibkrSetting: IbkrSetting;
  private _appFolder: string;
  private _nofityManager: NotifyManager;
  constructor(
    ipcMain: IpcMain, ibkrSetting: IbkrSetting, appFolder: string, notifyManager: NotifyManager
  ) {
    this._ipcMain = ipcMain;
    this._appFolder = appFolder;
    this._ibkrSetting = ibkrSetting;
    this._nofityManager = notifyManager;
  }

  get providerName(): string {
    return 'Interactive Brokers Provider';
  }

  async importPortfolio(): Promise<IImportResult> {

    try {
      const page = await this.loginIbkr();
      this._nofityManager.send('login to Ibkr', 'info');

      const pin = await this.waitForEvent<string>('ibkrPin-m');
      this._nofityManager.send(`got pin: ${pin}`, 'info');

      await this.downloadReport(page, pin);
      this._nofityManager.send('download report', 'info');

      const fileName = this.getDownloadedFile();
      this._nofityManager.send(`found file: ${fileName} `, 'info');

      if (fileName) {
        const results = this.parseCsvFile(fileName);
        return results;
      }
    }
    catch(error) {
      console.error(error);
      this._nofityManager.send(`Error: ${error}`, 'error');
    }

    return {tickers:[], actions: [], dividends: []}
  }

  /**
   * Noop, do not use IBKR as metadata provider
   */
  async getMetadata (_: ITickerInfo[]): Promise<ITickerMetadata[]> {
    return Promise.resolve([]);
  }

  /**
   * Noop, always returns emty price quotes as we do not want to use IBKR as price provider
   */
  async getActualPrice (_: ITickerInfo[]): Promise<IPriceQuote[]> {
    return Promise.resolve([]);
  }

  private async loginIbkr(): Promise<Page> {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    page.client().send('Page.setDownloadBehavior', {behavior: 'allow', downloadPath: this._appFolder});
    await page.goto('https://www.interactivebrokers.co.uk/sso/Login?RL=1');
    //await page.waitForSelector('#btn_accept_cookies');
    //await page.click('#btn_accept_cookies');
    await page.waitForTimeout(3000);
    //await page.waitForSelector('#user_name');

    await page.type('#user_name', this._ibkrSetting.login);
    await page.type('#password', this._ibkrSetting.password);

    await page.click('#submitForm');
    return page;
  }


  private waitForEvent<T>(
    channel: string,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const success = (_event: IpcMainEvent, val: T) => {
        console.log(`success resolved: ${val}`);
        this._ipcMain.off('error', fail);
        resolve(val);
      };
      const fail = (_event: IpcMainEvent, err: Error) => {
        console.log(`fail rejected: ${err}`);
        this._ipcMain.off(channel, success);
        reject(err);
      };
      this._ipcMain.once(channel, success);
      this._ipcMain.once('error', fail);
    });
  }

  private async downloadReport(page: Page, pin: string) {

    await page.type('#chlginput', pin);
    await page.click('#submitForm');
    await page.waitForNavigation(); // <------------------------- Wait for Navigation
    await page.waitForTimeout(5000);

    await page.goto('https://www.interactivebrokers.co.uk/AccountManagement/AmAuthentication?action=Reports');
    await page.waitForTimeout(5000); // <------------------------- Wait for Navigation

    await page.evaluate(() => {
      const elements = document.querySelectorAll('div.form-bordered>div>div.col-xs-4.col-sm-3.col-md-3.col-lg-3>p>span>a');
      const targetElement = elements[0];
      targetElement && (targetElement as HTMLElement).click();
    });
    await page.waitForTimeout(4000);

    await page.select('select', 'string:DATE_RANGE');
    await page.waitForSelector('input[name=fromDate]');
    await page.focus('input[name=fromDate]');
    await page.waitForTimeout(500);
    for(let i=0; i<20; i++)
        await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');
    await page.select(`select[ng-change='ctrl.formatChange()']`, 'string:13');
    await page.click(`am-button[btn-text=Run]`);
    await page.waitForTimeout(4000);
  }

  private getDownloadedFile(): string {
    const files = fs.readdirSync(this._appFolder)
      .filter((file) => path.extname(file) === '.csv' && fs.lstatSync(path.join(this._appFolder, file)).isFile())
      .map((file) => ({ file, mtime: fs.lstatSync(path.join(this._appFolder, file)).mtime }))
      .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
    return files ? path.join(this._appFolder, files[0].file) : '';
  }


  private async parseCsvFile(fileName: string): Promise<IImportResult> {

    const tickers = new Array<ITicker>();
    const actions = new Array<IAction>();
    const dividends = new Array<IDividend>();

    let stream = fs.createReadStream(fileName, 'utf-8')
      .pipe(es.split())
      .pipe(new CsvTickerFilter());
    for await (const data of stream) {
      tickers.push(data);
    }

    stream = fs.createReadStream(fileName, 'utf-8')
      .pipe(es.split())
      .pipe(new CsvActionFilter());
    for await (const data of stream) {
        actions.push(data);
    }

    stream = fs.createReadStream(fileName, 'utf-8')
      .pipe(es.split())
      .pipe(new CsvDividendFilter());
    for await (const data of stream) {
        dividends.push(data);
    }

    return { tickers, actions, dividends }
  }
}

