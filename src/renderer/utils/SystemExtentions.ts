export { }
declare global {
    export interface Number {
        formatMoney(): string;
        formatPercent(): string;
    }
}

Number.prototype.formatMoney = function (this: number) {
  return new Intl.NumberFormat('de-DE',{style: 'currency', currency: 'USD'}).format(this);
};

Number.prototype.formatPercent = function (this: number) {
  return new Intl.NumberFormat('de-DE',{maximumFractionDigits: 2}).format(this) + ' %';
};

export const formatMoney = (money: number) => {
  return new Intl.NumberFormat('de-DE',{style: 'currency', currency: 'USD'}).format(money);
}

export const formatPercent = (percent: number) => {
  return new Intl.NumberFormat('de-DE',{maximumFractionDigits: 2}).format(percent) + ' %';
}



