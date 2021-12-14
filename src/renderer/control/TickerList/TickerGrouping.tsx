import { IconButton, styled, TableBody, TableCell, TableRow } from "@mui/material";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { FC, useState } from "react";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";
import { Amount } from "./Amount";

interface IGroupSummary {
  spent: number,
  marketValue: number,
  unrealizedPnL: number,
  unrealizedPnLPercent: number,
  realizedPnL: number,
  portfolioPercent: number,
  dividendAmount: number,
}

const emptySummary: IGroupSummary = {
  spent: 0,
  marketValue: 0,
  portfolioPercent: 0,
  realizedPnL: 0,
  unrealizedPnL: 0,
  unrealizedPnLPercent: 0,
  dividendAmount: 0
}

interface IProp {
  tickers: ITickerInfo[],
  groupTitle: string,
  rowsRenderer: () => JSX.Element[]
}

const IconSvg = styled(SvgPath)(() => ({
  width: '18px',
  height: '18px'
}));

const ToggleCell = styled(TableCell)(() => ({
  width:'40px',
  padding: '8px',
  paddingLeft: '12px'
}));

const TickerCell = styled(TableCell)(() => ({
  paddingLeft: '0px'
}));

const NumberCell = styled(TableCell)(() => ({
  userSelect: 'text'
}));

const GroupRow = styled(TableRow)(({theme}) => ({
  userSelect: 'none',
  backgroundColor: theme.palette.action.selected
}));

const TableGroup: FC<IProp> = ({tickers, groupTitle, rowsRenderer}) => {
  const [open, setOpen] = useState(false);

  const groupSummary = tickers.reduce((acc, cur) => {
    acc.spent += cur.purchaseValue;
    acc.marketValue += cur.marketValue;
    acc.unrealizedPnL += cur.unrealizedPnL;
    acc.unrealizedPnLPercent += cur.unrealizedPnLPercent;
    acc.realizedPnL += cur.realizedPnL;
    acc.portfolioPercent += cur.portfolioPercent;
    acc.dividendAmount += cur.dividendAmount;
    return acc;
  }, {...emptySummary})

  return (
    <>
      <GroupRow>
        <ToggleCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ marginRight: '8px'}}
          >
            {open ? <IconSvg path={CommonIcon.coneUp}/> : <IconSvg path={CommonIcon.coneDown}/> }
          </IconButton>
        </ToggleCell>
        <TickerCell align='left' colSpan={2}>{groupTitle}</TickerCell>
        <NumberCell align='right'>
          <Amount bold>{groupSummary.spent.formatMoney()}</Amount>
        </NumberCell>
        <NumberCell align='right'>
        <Amount bold>{groupSummary.marketValue.formatMoney()}</Amount>
        </NumberCell>
        <NumberCell align='right'>
          <Amount bold colored={groupSummary.unrealizedPnL}>
            {groupSummary.unrealizedPnL.formatMoney()}
          </Amount>
          <Amount caption colored={groupSummary.unrealizedPnL}>
            {groupSummary.unrealizedPnLPercent.formatPercent()}
          </Amount>
        </NumberCell>
        <NumberCell align='right'>
          <Amount bold colored={groupSummary.realizedPnL}>
            {groupSummary.realizedPnL.formatMoney()}
          </Amount>
          <Amount caption>
            {groupSummary.dividendAmount.formatMoney()}
          </Amount>
        </NumberCell>
        <NumberCell align='right'>
          <Amount bold> {groupSummary.portfolioPercent.formatPercent()}</Amount>
        </NumberCell>
      </GroupRow>
      {open && rowsRenderer()}
    </>
  );
}

export const groupTickersBy = (
  tickers: ITickerInfo[],
  groupField: keyof ITickerInfo,
  tickerRowsRenderer: (tickersInGroup: ITickerInfo[]) => JSX.Element[]
) => {

  const groups = [...new Set(tickers.map(t => t[groupField]))];

  return groups.map((group, k) => {
    const groupTickers = tickers.filter(t => t[groupField] === group);
    return (
      <TableBody key={`i-${k}`}>
        <TableGroup
          tickers={groupTickers}
          groupTitle={group?.toString() || ''}
          rowsRenderer={() => tickerRowsRenderer(groupTickers)}
        />
      </TableBody>
    )
  });
}
