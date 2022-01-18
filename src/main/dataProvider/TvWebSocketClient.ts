import WebSocket, {Event, MessageEvent} from 'ws';
import crypto from 'crypto';
import { ILivePrice } from 'main/entity/ILivePrice';
import { ITickerInfo } from 'main/entity/ITickerInfo';

export class TvWebSocketClient {

  private webSocket: WebSocket;
  private pendingMessages = new Array<string>();
  private sessionId;
  private livePriceHandler;
  private tickerIds: { [key: string]: number } = {};


  constructor(livePriceHandler: (livePrice: ILivePrice) => void) {
    this.onOpen = this.onOpen.bind(this);
    this.onMessage = this.onMessage.bind(this);
    this.onError = this.onError.bind(this);

    this.livePriceHandler = livePriceHandler;
    this.sessionId = this.generateSessionId();

    this.webSocket = new WebSocket(
      'wss://data.tradingview.com/socket.io/websocket',
      {headers: {['Origin']: 'https://data.tradingview.com'}
    });
    this.webSocket.onmessage = this.onMessage;
    this.webSocket.onopen = this.onOpen;
    this.webSocket.onerror = this.onError;
  }

  subscribeOnTicker(ticker: ITickerInfo) {
    const tvTickerId = `${ticker.exchange}:${ticker.symbol}`;
    this.tickerIds[tvTickerId] = ticker.tickerId;
    this.sendMessage('quote_add_symbols', [tvTickerId]);
  }

  closeSocket() {
    this.webSocket.close()
  }

  private generateSessionId() {
      return `qs_${crypto.randomBytes(12).toString('hex')}`;
  }

  private sendRawMessage(content: string) {
      const message = `~m~${content.length.toString()}~m~${content}`;

      if (this.webSocket.readyState === WebSocket.OPEN) {
        console.log(message);
        this.webSocket.send(message);
      }
      else {
        this.pendingMessages.push(message);
      }
  }

  private sendMessage(method: string, params: string[]) {
      const content = JSON.stringify({m: method, p: [this.sessionId].concat(params)});
      this.sendRawMessage(content);
  }

  private parseTvResponse(rawResponse: string) {
    return rawResponse
      .replace(/~h~/g, '').split(/~m~[0-9]{1,}~m~/g)
      .map((p) => {
        if (!p) return false;
        try {
          return JSON.parse(p);
        } catch (error) {
          console.warn('Cant parse', p);
          return false;
        }
      })
      .filter((p) => p);
  }

  private onOpen(_: Event) {
    console.log('open!');

    this.sendMessage('quote_create_session', []);
	  this.sendMessage('quote_set_fields', ['lp','ch','chp','open_price','prev_close_price','rch', 'rchp', 'rtc']);

    while(this.pendingMessages.length > 0) {
      const message = this.pendingMessages.shift();
      message && this.webSocket.send(message);
    }
  }

  private onError(event: Event) {
    console.log('error');
    console.log(event);
  }

  private onMessage(event: MessageEvent) {
    console.log('on message');
    console.log(event.data.toString());

    const parsedPacket = this.parseTvResponse(event.data.toString());

    parsedPacket.forEach(packet => {
      if (typeof packet === 'number') {
          this.sendRawMessage(`~h~${packet}`);
      }
      if (packet.m && packet.p) {
        const params = packet.p[1];
        if (params.s === 'ok') {
            const livePrice: ILivePrice = {
                tickerId: this.tickerIds[params.n],
                symbol: params.n.split(':')[1],
                lastPrice: parseFloat(params.v.lp),
                dayChange: parseFloat(params.v.ch),
                dayChangePercent: parseFloat(params.v.chp)
            };
            console.log(livePrice);
            this.livePriceHandler(livePrice);
        }
      }
    })
  }
}


