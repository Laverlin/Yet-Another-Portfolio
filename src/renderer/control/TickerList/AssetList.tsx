import { Button, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from "@mui/material";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { FC } from "react";
import { useRecoilState, useRecoilValue, useSetRecoilState} from "recoil";
import { groupFiledNameAtom, groupsSelector, orderByAtom, orderDirectionAtom, sortedTikerSelector, tickerAtom } from "renderer/state/atom";
import { TickerGroupRow } from "./TickerGroupRow";
import { AssetGroupingToggle } from "./TickerGroupingToggle";
import { TickerTableRow } from "./TickerTableRow";

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
  minWidth:'100px',
  width:'100px',
  textAlign:'center',
  paddingRight:'0px',
  paddingLeft:'12px',
}));

const ToggleHeaderCell = styled(HeaderCell)(() => ({
  minWidth:'40px',
  maxWidth:'40px',
  width:'40px',
}));

const HeaderTextRow = styled(Typography)(() => ({
  display:'flex',
  justifyContent:'center',
  whiteSpace: 'nowrap',
  width:'100%',
  color: 'white',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
}));



export const AssetList: FC = () =>{

  const tickerIds = useRecoilValue(sortedTikerSelector);
  const groupFieldName = useRecoilValue(groupFiledNameAtom);
  const groupList = useRecoilValue(groupsSelector);

  const [orderDirection, setOrderDirection] = useRecoilState(orderDirectionAtom);
  const [orderBy, setOrderBy] = useRecoilState(orderByAtom);

  const handleSort = (property: keyof ITickerInfo) => {
    const isAsc = orderBy === property && orderDirection === 'asc';
    setOrderDirection(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const setValue = useSetRecoilState(tickerAtom(1));

  const handleAction = () =>{
    setValue(cur => {
        let n = {...cur};
        n.marketPrice += 1;
        return n;
      });
  }

  const SortLabel: FC<{sortField: keyof ITickerInfo}> = ({sortField, children}) => {
    return(
      <TableSortLabel
        sx ={{
          width:'100%',
          '& .MuiTableSortLabel-icon': {color: 'white !important' },
        }}
        active={orderBy === sortField}
        direction={orderBy === sortField ? orderDirection : 'asc'}
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
        <Button onClick={handleAction} variant = 'contained'>Action</Button>
        <AssetGroupingToggle />
      </TableTitle>
      <ScrollContainer>
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>

              <ToggleHeaderCell>&nbsp;</ToggleHeaderCell>
              <HeaderCell sx={{width:'100%'}}>
                <SortLabel sortField='symbol'>
                  <HeaderTextRow variant='caption'>Ticker</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell >
                <SortLabel sortField='actualPositions'>
                  <HeaderTextRow variant='caption'>Positions</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='marketValue'>
                  <HeaderTextRow variant='caption'>Day change</HeaderTextRow>
                </SortLabel>
                <br/>
                <SortLabel sortField='marketPrice'>
                  <HeaderTextRow variant='caption'>(total / %)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='marketValue'>
                  <HeaderTextRow variant='caption'>Market</HeaderTextRow>
                </SortLabel>
                <br/>
                <SortLabel sortField='marketPrice'>
                  <HeaderTextRow variant='caption'>(total / per sh.)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='purchaseValue'>
                  <HeaderTextRow variant='caption'>Spent </HeaderTextRow>
                </SortLabel>
                <br />
                <SortLabel sortField='avgPrice'>
                  <HeaderTextRow variant='caption'>(total / per sh.)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='unrealizedPnL'>
                  <HeaderTextRow variant='caption'>Unrealized PnL</HeaderTextRow>
                </SortLabel>
                <br />
                <SortLabel sortField='unrealizedPnLPercent'>
                  <HeaderTextRow variant='caption'>(total / % spent)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='realizedPnL'>
                  <HeaderTextRow variant='caption'>Realized PnL</HeaderTextRow>
                </SortLabel>
                <br/>
                <SortLabel sortField='dividendAmount'>
                  <HeaderTextRow variant='caption'>(total / div)</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

              <HeaderCell>
                <SortLabel sortField='portfolioPercent'>
                  <HeaderTextRow variant='caption'>% Portfolio</HeaderTextRow>
                </SortLabel>
              </HeaderCell>

            </TableRow>
          </TableHead>
            {(groupFieldName)
              ? groupList.map(groupSummary => <TickerGroupRow key={groupSummary.groupTitle} groupSummary={groupSummary} />)
              : <TableBody>
                  {tickerIds.map(tickerId => <TickerTableRow key={tickerId} tickerId={tickerId} />)}
                </TableBody>
            }
         </Table>
      </ScrollContainer>
    </TablePaper>
  )
}


