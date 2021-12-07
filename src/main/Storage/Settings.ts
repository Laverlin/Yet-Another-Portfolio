import fs from 'fs'
import path from 'path'
import electron, { Rectangle } from 'electron'

/**
 * Base object to manipulate with application settings
 */
export class Setting {

  #filePath: string | undefined

  /** load setting data from file and return new entity of settings object
   * if file not found then defauld objec returns
   * @param settingType setting type object, must be derived from Setting
   */
  static load<T extends Setting>(settingType: new() => T): T {
    let setting = new settingType();
    setting.#filePath = this.createPath(settingType.name + '.json');

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

  static createPath(fileName: string) {
    const userDataPath = electron.app.getPath('userData');
    console.log(userDataPath);
    return path.join(userDataPath, fileName);
  }
}

export class AppSetting extends Setting {
  constructor() {
    super();
    this.dbFilePath = Setting.createPath('tickers.db');
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
}
