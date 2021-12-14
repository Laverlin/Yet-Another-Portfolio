import { styled, TableCell, TableRow, Typography } from "@mui/material";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { FC } from "react";
import { useSetRecoilState } from "recoil";
import { tickerDetailStateAtom } from "renderer/state/atom";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";
import { Amount } from "./Amount";
import { getComparator, Order } from "./Comparator";

const Symbol = styled(Typography)(() => ({
  fontWeight: 'bold'
})) as typeof Typography

const Desctiption = styled(Typography)(() => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})) as typeof Typography

const TickerCell = styled(TableCell)(() => ({
  width: '18%',
  paddingLeft: 0,
  userSelect: 'text',
  maxWidth: 0
}));

const NumberCell = styled(TableCell)(() => ({
  userSelect: 'text',
}));

const IconCell = styled('div')(() => ({
  padding: '0px',
  width: '40px',
  height:'40px',
  display: 'flex',
  justifyContent:'center',
  alignItems:'center'
}));


const TickerTableRow: FC<{ticker:ITickerInfo}> = ({ticker}) => {

  const setTickerDetailState = useSetRecoilState(tickerDetailStateAtom);

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

      <NumberCell align="center"><Amount bold>{ticker.actualPositions}</Amount></NumberCell>

      <NumberCell align="right">
        {ticker.actualPositions > 0 && <>
          <Amount bold>{ticker.purchaseValue.formatMoney()}</Amount>
          <Amount caption>{ticker.avgPrice.formatMoney()}</Amount>
        </>}
      </NumberCell>

      <NumberCell align="right">
        {ticker.actualPositions > 0 && <>
          <Amount bold>{ticker.marketValue.formatMoney()}</Amount>
          <Amount caption>{ticker.marketPrice.formatMoney()}</Amount>
        </>}
      </NumberCell>

      <NumberCell align="right">
        {ticker.actualPositions > 0 && <>
          <Amount bold colored={ticker.unrealizedPnL}>{ticker.unrealizedPnL.formatMoney()}</Amount>
          <Amount caption colored={ticker.unrealizedPnL}>{ticker.unrealizedPnLPercent.formatPercent()}</Amount>
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


export const tickerRowsRenderer = (
  tickers: ITickerInfo[],
  order: Order,
  orderBy: keyof ITickerInfo
) => {

  return (
    [...tickers].sort(getComparator(order, orderBy))
      .map(ticker => <TickerTableRow key={ticker.tickerId} ticker={ticker} />)
  )
}
