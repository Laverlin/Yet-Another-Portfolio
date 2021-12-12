import { Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from "@mui/material";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { FC, useState } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { tickerDetailStateAtom, tickersAtom } from "renderer/state/atom";
import { AssetGroupingToggle } from "./AssetGroupingToggle";
import { getComparator, Order } from "./Comparator";

const TablePaper = styled(Paper)(({theme}) =>({
  width: '100%',
  marginBottom: theme.spacing(1),
  border: '0px',
  borderRadius: '0px',
  overflow: 'hidden',
}));

const TableTitle = styled(Typography)(({theme}) => ({
  display: 'flex',
  width: '100%',
  backgroundColor: theme.palette.action.selected,
  padding: theme.spacing(1),
  color: theme.palette.primary.main //'white'
}));

const ScrollContainer = styled(TableContainer)(() => ({
  'overflow-y': 'overlay',
  height:'calc(100vh - 230px)'
}));

const HeaderCell = styled(TableCell)(({theme}) => ({
  backgroundColor: theme.palette.primary.main,
  minWidth:'150px',
  textAlign:'center',
  paddingRight:'0px',
}));

const HeaderTextRow = styled('div')(() => ({
  display:'flex',
  justifyContent:'center',
  whiteSpace: 'nowrap',
  width:'100%',
  fontWeight: 'bold',
  color: 'white',
}));

const Amount = styled('div', {
  shouldForwardProp: (prop) => prop !== 'colored' && prop !== 'bold' && prop != 'caption'
})<{colored?: number, bold?: boolean, caption?: boolean}>(({theme, colored, bold, caption}) => ({
  paddingLeft: theme.spacing(1),
  color: (colored || 0) === 0
    ? theme.palette.text.primary
    : (colored || 0) > 0
      ? theme.palette.success.main
      : theme.palette.error.main,
  fontWeight: bold ? 'bolder' : 'normal',
  fontSize: !caption ? '' : '0.9em',
  paddingRight: theme.spacing(2)
}));

const TickerRow = styled(Typography)(() => ({
  fontWeight: 'bold'
})) as typeof Typography

const DesctiptionRow = styled(Typography)(() => ({
  overflow: 'hidden',
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
})) as typeof Typography

const TCell = styled(TableCell)(() => ({
  width: '18%',
  maxWidth: 0
}));


export const AssetList: FC = () =>{

  const tickers = useRecoilValue(tickersAtom);
  const setTickerDetailState = useSetRecoilState(tickerDetailStateAtom);

  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<keyof ITickerInfo>('symbol');

  const handleSort = (property: keyof ITickerInfo) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const SortLabel: FC<{sortField: keyof ITickerInfo}> = ({sortField, children}) => {
    return(
      <TableSortLabel
        sx ={{
          width:'100%',
          '& .MuiTableSortLabel-icon': {color: 'white !important' },
          //paddingRight: '8px'
        }}
        active={orderBy === sortField}
        direction={orderBy === sortField ? order : 'asc'}
        onClick={() => handleSort(sortField)}
      >
        {children}
      </TableSortLabel>
    )
  }

  return (
    <TablePaper variant='outlined'>
      <TableTitle variant='h5'>
        Tickers
        <AssetGroupingToggle />
      </TableTitle>
      <ScrollContainer>
        <Table size="small" stickyHeader >
          <TableHead>
            <TableRow>

              <HeaderCell>
                <SortLabel sortField='symbol'>
                  <HeaderTextRow>Ticker</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='actualPositions'>
                  <HeaderTextRow>Positions</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='purchaseValue'>
                  <HeaderTextRow>Spent </HeaderTextRow>
                </SortLabel>
                <br />
                <SortLabel sortField='avgPrice'>
                  <HeaderTextRow>(total / per sh.)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='marketValue'>
                  <HeaderTextRow>Market</HeaderTextRow>
                </SortLabel>
                <br/>
                <SortLabel sortField='marketPrice'>
                  <HeaderTextRow>(total / per sh.)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='unrealizedPnL'>
                  <HeaderTextRow>Unrealized PnL</HeaderTextRow>
                </SortLabel>
                <br />
                <SortLabel sortField='unrealizedPnLPercent'>
                  <HeaderTextRow>(total / % spent)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='realizedPnL'>
                  <HeaderTextRow>Realized PnL</HeaderTextRow>
                </SortLabel>

                  <HeaderTextRow>(total / div)</HeaderTextRow>

              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='portfolioPercent'>
                  <HeaderTextRow>% Portfolio</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

            </TableRow>
          </TableHead>
          <TableBody>
            {[...tickers].sort(getComparator(order, orderBy))
              .map(ticker => (
              <TableRow
                key={ticker.tickerId}
                sx={{ '&:last-child td, &:last-child th': { border: 0 }, userSelect: 'none' }}
                hover
                onDoubleClick={() => setTickerDetailState({isOpen: true, tickerInfo: ticker})}
              >
                <TCell component="th" scope="row">
                  <TickerRow variant='caption' component='div' >{ticker.symbol}</TickerRow>
                  <DesctiptionRow variant='caption' component='div'> {ticker.description}</DesctiptionRow>
                </TCell>

                <TableCell align="center"><Amount bold>{ticker.actualPositions}</Amount></TableCell>

                <TableCell align="right">
                  {ticker.actualPositions > 0 && <>
                    <Amount bold>{ticker.purchaseValue.formatMoney()}</Amount>
                    <Amount caption>{ticker.avgPrice.formatMoney()}</Amount>
                  </>}
                </TableCell>

                <TableCell align="right">
                  {ticker.actualPositions > 0 && <>
                    <Amount bold>{ticker.marketValue.formatMoney()}</Amount>
                    <Amount caption>{ticker.marketPrice.formatMoney()}</Amount>
                  </>}
                </TableCell>

                <TableCell align="right">
                  {ticker.actualPositions > 0 && <>
                    <Amount bold colored={ticker.unrealizedPnL}>{ticker.unrealizedPnL.formatMoney()}</Amount>
                    <Amount caption colored={ticker.unrealizedPnL}>{ticker.unrealizedPnLPercent.formatPercent()}</Amount>
                  </>}
                </TableCell>

                <TableCell align="right">
                  <Amount bold colored={ticker.realizedPnL}>{ticker.realizedPnL.formatMoney()}</Amount>
                </TableCell>

                <TableCell align="right">
                  <Amount bold>{ticker.portfolioPercent.formatPercent()}</Amount>
                </TableCell>

              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollContainer>
    </TablePaper>
  )
}
