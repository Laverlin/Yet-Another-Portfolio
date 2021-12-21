import fs from 'fs'
import path from 'path'
import electron, { Rectangle } from 'electron'

/**
 * Base object to manipulate with application settings
 */
export class Setting {

  #filePath: string | undefined

  /** load setting data from file and return new entity of settings object
   * if file not found then defauld object returns
   * @param settingType setting type object, must be derived from Setting
   */
  static load<T extends Setting>(settingType: new() => T): T {
    let setting = new settingType();
    setting.#filePath = setting.createPath(settingType.name + '.json');

    return fs.existsSync(setting.#filePath)
      ? Object.assign(setting, JSON.parse(fs.readFileSync(setting.#filePath, 'utf-8')))
      : setting;
  }

  /** save setting data to file
   */
  save() {
    if (!this.#filePath)
      throw 'file path must be initialised, call load before save'

    fs.writeFileSync(this.#filePath, JSON.stringify(this));
  }

  createPath(fileName: string) {
    const userDataPath = this.appFolder;
    return path.join(userDataPath, fileName);
  }

  /**
   * returns application folder
   */
  get appFolder(): string {
    return electron.app.getPath('userData');
  }
}

export class IbkrSetting {
  login: string = '';
  password: string = '';
}

export class PortfolioAppSetting extends Setting {
  constructor() {
    super();
    this.dbFilePath = this.createPath('tickers.db');
  }

  windowSize: Rectangle = {
    width: 1450,
    height: 800,
    x: 100,
    y: 100
  };
  dbFilePath: string;
  tinkoffAPIKey: string = '';
  alphavantageKey: string = '';
  tradierKey: string = '';
  financialmodelingKey: string = '';
  ibkrSetting = new IbkrSetting();
}
