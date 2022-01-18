import { styled, TableCell, TableRow, Typography } from "@mui/material";
import React from "react";
import { FC } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { livePriceAtom, tickerAtom, tickerDetailStateAtom, totalMarketValueSelector, unrealisedPnLPercentSelector, unrealisedPnLSelector } from "renderer/state/atom";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";
import { Amount } from "./Amount";

const Symbol = styled(Typography)(() => ({
  fontWeight: 'bold'
})) as typeof Typography

const Desctiption = styled(Typography)(() => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})) as typeof Typography

const TickerCell = styled(TableCell)(() => ({
  paddingLeft: 0,
  userSelect: 'text',
  maxWidth: 0
}));

const NumberCell = styled(TableCell)(() => ({
  userSelect: 'text',
  paddingLeft: 0,
  //paddingRight: 0
}));

const IconCell = styled('div')(() => ({
  padding: '0px',
  width: '40px',
  height:'40px',
  display: 'flex',
  justifyContent:'center',
  alignItems:'center'
}));



export const TickerTableRowNoMemo: FC<{tickerId: number}> = ({tickerId}) => {

  const setTickerDetailState = useSetRecoilState(tickerDetailStateAtom);
  const ticker = useRecoilValue(tickerAtom(tickerId));
  const marketValue = useRecoilValue(totalMarketValueSelector(tickerId));
  const unrealizedPnL = useRecoilValue(unrealisedPnLSelector(tickerId));
  const unrealizedPnLPercent = useRecoilValue(unrealisedPnLPercentSelector(tickerId));
  const livePrice = useRecoilValue(livePriceAtom(tickerId));

  console.log(`row : ${ticker.symbol}`);

  return(
    <TableRow
      hover
      sx={{userSelect: 'none'}}
      onDoubleClick={() => {
        window.getSelection()?.empty();
        setTickerDetailState({isOpen: true, tickerInfo: ticker})
      }}
    >

      <TableCell sx={{padding:'8px'}}>
        <IconCell>
          {ticker.logoImage
            ? <img src={ticker.logoImage} />
            : <SvgPath width='32px' height='32px' path={CommonIcon.close} />
          }
        </IconCell>
      </TableCell>
      <TickerCell component="th" scope="row">
          <Symbol variant='caption' component='div'>{ticker.symbol}</Symbol>
          <Desctiption variant='caption' component='div'> {ticker.description}</Desctiption>
      </TickerCell>

      <NumberCell align="center" ><Amount bold>{ticker.actualPositions}</Amount></NumberCell>

      <NumberCell align="center">
        {ticker.actualPositions > 0 && <>
          <Amount bold colored={livePrice.dayChange}>
            {(livePrice.dayChange * ticker.actualPositions).formatMoney()}
          </Amount>
          <Amount caption colored={livePrice.dayChangePercent}>
            {livePrice.dayChangePercent.formatPercent()}
          </Amount>
        </>}
      </NumberCell>

      <NumberCell align="right">
        {ticker.actualPositions > 0 && <>
          <Amount bold>{marketValue.formatMoney()}</Amount>
          <Amount caption>{ticker.marketPrice.formatMoney()}</Amount>
        </>}
      </NumberCell>

      <NumberCell align="right">
        {ticker.actualPositions > 0 && <>
          <Amount bold>{ticker.purchaseValue.formatMoney()}</Amount>
          <Amount caption>{ticker.avgPrice.formatMoney()}</Amount>
        </>}
      </NumberCell>

      <NumberCell align="right">
        {ticker.actualPositions > 0 && <>
          <Amount bold colored={unrealizedPnL}>{unrealizedPnL.formatMoney()}</Amount>
          <Amount caption colored={unrealizedPnL}>{unrealizedPnLPercent.formatPercent()}</Amount>
        </>}
      </NumberCell>

      <NumberCell align="right">
        <Amount bold colored={ticker.realizedPnL}>{ticker.realizedPnL.formatMoney()}</Amount>
        <Amount caption>{ticker.dividendAmount.formatMoney()}</Amount>
      </NumberCell>

      <NumberCell align="right">
        <Amount bold>{ticker.portfolioPercent.formatPercent()}</Amount>
      </NumberCell>

    </TableRow>
  )
}

export const TickerTableRow = React.memo(TickerTableRowNoMemo);
