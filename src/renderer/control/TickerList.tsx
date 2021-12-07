import { FC, useState } from 'react'; // eslint-disable-line
import DataGrid, { Column, FormatterProps, GroupFormatterProps, SortColumn} from 'react-data-grid';
import { makeStyles  } from '@mui/styles';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { tickerDetailStateAtom, tickersAtom } from 'renderer/state/atom';
import { styled, useTheme} from '@mui/material';
import { ITickerInfo } from 'main/entity/ITickerInfo';
import { groupBy as rowGrouper } from 'lodash';


const NormalCell = styled('div')`
  margin-left: auto;
`

const TickerGrid = styled(DataGrid)`
  --row-hover-background-color: ${p => p.theme.palette.action.hover};
  --row-selected-background-color: ${p => p.theme.palette.action.selected};
  --row-selected-hover-background-color: ${p => p.theme.palette.action.selected};
  --selection-color: transparent;
  --header-background-color: ${p => p.theme.palette.action.hover};
  min-height: calc(100vh - 260px) !important;
  overflow-y: overlay;
` as typeof DataGrid;

const BoldContent = styled('div')`
  ${p => p.theme.typography.body1}
  font-weight: bold;
  font-size: 14px;
  line-height: 1.2;
  margin-top: 2px;
`;

const CaptionContent = styled('div')`
  ${p => p.theme.typography.body1}
  font-size: 10px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-spaces: nowrap;
  overflow: hidden;
`;

const MainPriceDiv = styled('div')`
  ${p => p.theme.typography.body1}
  font-weight: bold;
  font-size: 13px;
  line-height: 1.4;
  margin-left: auto;
`

const SecondaryPriceDiv = styled('div')`
  ${p => p.theme.typography.body1}
  font-size: 11px;
  line-height: 1.3;
  margin-left: auto;
`
const ColoredNumber = styled('span')<{ value: number }>`
  color: ${p => p.value > 0
    ? p.theme.palette.success.main
    : p.value === 0 ? p.theme.palette.text.primary : p.theme.palette.error.main
  };
`;

const GroupPriceDiv = styled('div')`
  ${p => p.theme.typography.body1}
  font-size: 13px;
  line-height: 35px;
  margin-left: auto;
  width: 100%;
  display: flex;
  justify-content: end;
`


const tickerCellFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  return (
    <>
      <BoldContent>{props.row.symbol}</BoldContent>
      <CaptionContent>{props.row.description}</CaptionContent>
    </>
  );
}

const intCellFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  const value = props.row[props.column.key as keyof ITickerInfo];
  return <NormalCell>{value}</NormalCell>;
}

const floatCellFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  const value = props.row[props.column.key as keyof ITickerInfo] as number;
  return <NormalCell><ColoredNumber value={value}>{value.formatMoney()}</ColoredNumber></NormalCell>;
}

const purchasePriceFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  if (props.row.actualPositions === 0)
    return null;
  return (
    <>
      <MainPriceDiv>{props.row.purchaseValue.formatMoney()}</MainPriceDiv>
      <SecondaryPriceDiv>{props.row.avgPrice.formatMoney()}</SecondaryPriceDiv>
    </>
  );
}

const marketValueFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  if (props.row.actualPositions === 0)
    return null;
  return (
    <>
      <MainPriceDiv>{props.row.marketValue.formatMoney()}</MainPriceDiv>
      <SecondaryPriceDiv>{props.row.marketPrice.formatMoney()}</SecondaryPriceDiv>
    </>
  );
}

const uPnLFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  if (props.row.actualPositions === 0)
    return null;
  return (
    <>
        <MainPriceDiv>
          <ColoredNumber value = {props.row.unrealizedPnL}>
            {props.row.unrealizedPnL.formatMoney()}
          </ColoredNumber>
        </MainPriceDiv>
        <SecondaryPriceDiv>
          <ColoredNumber value = {props.row.unrealizedPnL}>
            {props.row.unrealizedPnLPercent.formatPercent()}
          </ColoredNumber>
        </SecondaryPriceDiv>
    </>
  );
}

const percentFormatter = (props: FormatterProps<ITickerInfo, unknown>) => {
  return (
    <>
      <NormalCell>{props.row.portfolioPercent.formatPercent()}</NormalCell>
    </>
  );
}

const groupSummaryFormatter = (
  props: GroupFormatterProps<ITickerInfo, unknown>,
  field: keyof ITickerInfo,
  isColored = true,
  isMoneyFormatter = true
) => {
  const total = props.childRows.reduce((acc, cur) => acc + (cur[field] as number), 0);
  return (
    <GroupPriceDiv>
      <ColoredNumber value = {isColored ? total : 0}>
        {isMoneyFormatter ? total.formatMoney() : total.formatPercent()}
      </ColoredNumber>
    </GroupPriceDiv>
  )
}

interface IProp {
  grouping: keyof ITickerInfo | '';
}

export const TickerList: FC<IProp> = ({ grouping }) => {

  const theme = useTheme();
  const useStyles = makeStyles({
    cellHeader: {
      display: 'flex',
      fontWeight: 'bold',
      fontSize: '.9rem',
      lineHeight: '1.3',
      color: 'white',
      whiteSpace: 'break-spaces',
      alignItems:'center',
      justifyContent:'center',
      backgroundColor: theme.palette.primary.main,
    },
    cell: {
      borderRight: '0px',
      display: 'flex',
      flexDirection:'column',
    },
  });

  const tickers = useRecoilValue(tickersAtom);
  const setTickerDetailState = useSetRecoilState(tickerDetailStateAtom);

  const [selectedRows, setSelectedRows] = useState<Set<string>>(
    () => new Set()
  );
  const [sortColumns, setSortColumns] = useState<readonly SortColumn[]>([]);

  const classes = useStyles();

  const columns: Column<ITickerInfo>[] = [
    {
      key: 'symbol',
      name: 'Ticker ',
      //frozen: true,
      formatter: tickerCellFormatter,
      headerCellClass: classes.cellHeader,
      resizable: true,
      sortable: true,
    },
    { key: 'actualPositions',
      name: 'Positions ',
      formatter: intCellFormatter,
      cellClass: classes.cell,
      headerCellClass: classes.cellHeader,
      resizable: true,
      sortable: true,
    },
    { key: 'avgPrice',
      name: 'Purch. Value / Avg. Price',
      formatter: purchasePriceFormatter,
      cellClass: classes.cell,
      headerCellClass: classes.cellHeader,
      resizable: true,
    },
    { key: 'marketValue',
      name: 'Market Value / Actual Price',
      formatter: marketValueFormatter,
      cellClass: classes.cell,
      headerCellClass: classes.cellHeader,
      resizable: true,
      sortable: true,
      groupFormatter: props => groupSummaryFormatter(props, 'marketValue', false)
    },

    { key: 'unrealizedPnL',
      name: 'Unrealized PnL ',
      formatter: uPnLFormatter,
      cellClass: classes.cell,
      headerCellClass: classes.cellHeader,
      resizable: true,
      sortable: true,
      groupFormatter: props => groupSummaryFormatter(props, 'unrealizedPnL')
    },
    { key: 'realizedPnL',
      name: 'Realized PnL ',
      formatter: floatCellFormatter,
      cellClass: classes.cell,
      headerCellClass: classes.cellHeader,
      resizable: true,
      sortable: true,
      groupFormatter: props => groupSummaryFormatter(props, 'realizedPnL')
    },
    { key: 'portfolioPercent',
      name: '% Portfolio ',
      formatter: percentFormatter,
      cellClass: classes.cell,
      headerCellClass: classes.cellHeader,
      resizable: true,
      sortable: true,
      groupFormatter: props => groupSummaryFormatter(props, 'portfolioPercent', false, false)
    },
  ];

  if (grouping === 'sector')
    columns.unshift({
      key: 'sector',
      name: 'Sector ',
      headerCellClass: classes.cellHeader,
      cellClass: classes.cell,
      resizable: true,
      sortable: true,
      width: '25%',
    });

  if (grouping === 'industry')
    columns.unshift({
      key: 'industry',
      name: 'Industry ',
      headerCellClass: classes.cellHeader,
      cellClass: classes.cell,
      resizable: true,
      sortable: true,
      width: '25%',
    }
  );

  if (grouping === 'customGroup')
    columns.unshift({
      key: 'customGroup',
      name: 'Custom ',
      headerCellClass: classes.cellHeader,
      cellClass: classes.cell,
      resizable: true,
      sortable: true,
      width: '20%',
    }
  );


  const rowKeyGetter = (row: ITickerInfo) => row.symbol;

  const handleRowClick = (row: ITickerInfo) => {
    const newSelection = new Set([row.symbol]);
    setSelectedRows(newSelection);
  };

  const handleShowTicker = (row: ITickerInfo) => {
    setTickerDetailState({isOpen: true, tickerInfo: row});
  }

  const sortedTickers = [...tickers];
  if (sortColumns.length > 0) {
    const sortKey = sortColumns[0].columnKey as keyof ITickerInfo;
    sortedTickers.sort((a, b) => {
    return  parseInt(a[sortKey].toString())
      ? sortColumns[0].direction === 'ASC'
        ? (a[sortKey] as number) - (b[sortKey] as number)
        : (b[sortKey] as number) - (a[sortKey] as number)
      : sortColumns[0].direction === 'ASC'
        ? (a[sortKey].toString()).localeCompare(b[sortKey].toString())
        : (b[sortKey].toString()).localeCompare(a[sortKey].toString());
    });
  }

  const [expandedGroupIds, setExpandedGroupIds] = useState<ReadonlySet<unknown>>(
    () => new Set<unknown>()
  );
  return (
    <div >
      <TickerGrid

        columns={columns}
        rows={sortedTickers}
        rowKeyGetter={rowKeyGetter}
        selectedRows={selectedRows}
        onRowClick={handleRowClick}
        onRowDoubleClick={handleShowTicker}
        onSelectedRowsChange={setSelectedRows}
        headerRowHeight={70}
        sortColumns={sortColumns}
        onSortColumnsChange={setSortColumns}
        rowGrouper={rowGrouper}
        groupBy={[grouping]}
        expandedGroupIds={expandedGroupIds}
        onExpandedGroupIdsChange={setExpandedGroupIds}

      />
    </div>
  );
};
