import { Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from "@mui/material";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { FC, useState } from "react";
import { useRecoilValue } from "recoil";
import { groupFieldAtom, tickersAtom } from "renderer/state/atom";
import { AssetGroupingToggle } from "./TickerGroupingToggle";
import { Order } from "./Comparator";
import { groupTickersBy } from "./TickerGrouping";
import { tickerRowsRenderer } from "./TickerRow";

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

const ScrollContainer = styled(TableContainer)`
  overflow-y: overlay;
  height: calc(100vh - 230px);
`;

const HeaderCell = styled(TableCell)(({theme}) => ({
  backgroundColor: theme.palette.primary.main,
  minWidth:'140px',
  textAlign:'center',
  paddingRight:'0px',
}));

const ToggleHeaderCell = styled(HeaderCell)(() => ({
  minWidth:'40px',
  maxWidth:'40px',
  width:'40px',
}));

const HeaderTextRow = styled('div')(() => ({
  display:'flex',
  justifyContent:'center',
  whiteSpace: 'nowrap',
  width:'100%',
  fontWeight: 'bold',
  color: 'white',
}));



export const AssetList: FC = () =>{

  const tickers = useRecoilValue(tickersAtom);
  const groupField = useRecoilValue(groupFieldAtom);

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
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>

              <ToggleHeaderCell></ToggleHeaderCell>
              <HeaderCell width='18%'>
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
                <br/>
                <SortLabel sortField='dividendAmount'>
                  <HeaderTextRow>(total / div)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='portfolioPercent'>
                  <HeaderTextRow>% Portfolio</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

            </TableRow>
          </TableHead>
            {(groupField)
              ? groupTickersBy(
                  tickers,
                  groupField,
                  groupTickers => tickerRowsRenderer(groupTickers, order, orderBy)
                )
              : <TableBody>{tickerRowsRenderer(tickers, order, orderBy)}</TableBody>
            }
         </Table>
      </ScrollContainer>
    </TablePaper>
  )
}
