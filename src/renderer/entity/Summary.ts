
export default class Summary {
  invested = 0;

  unrealizedPnL = 0;

  get unrealizedPnLPercent(): number {
    return (this.unrealizedPnL / this.invested) * 100;
  }

  realizedPnL = 0;

  dividendAmount = 0;

  get combinedPnL(): number {
    return this.realizedPnL + this.unrealizedPnL;
  }

  get combinedPnLPercent(): number {
    return (this.combinedPnL / this.invested) * 100;
  }
}

