import { Dialog, DialogContent, DialogTitle, IconButton, Paper, styled, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import { IActionItem } from "main/entity/IActoinItem";
import { FC, useEffect, useState } from "react";
import { useRecoilState } from "recoil";
import { tickerDetailStateAtom } from "renderer/state/atom";
import { tickerDetailClose } from "renderer/state/ITickerDetailState";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";


const CardRow = styled('div')(({theme}) => ({
  display: 'flex',
  flexDirection: 'row',
  width: '100%',
  color: theme.palette.text.primary,
  '& div:first-child': {
    marginLeft: '0px'
  },
  '& div:last-child': {
    marginRight: '0px'
  }
}));

const Card = styled('div')(({theme}) => ({
  display: 'flex',
  flexDirection: 'column',
  color: theme.palette.text.primary,
  padding: theme.spacing(1),
  margin: '2px',
  minWidth: '160px',
  width: '100%',
  backgroundColor: theme.palette.action.selected,
}));

const TextRow = styled(Typography)(() => ({
  display: 'flex',
  width: '100%',
}))

const Num = styled('span')(() => ({
  marginLeft: 'auto',
  paddingLeft: '8px',
  fontWeight: 'bolder',
}));

const ColoredNum = styled(Num, {
  shouldForwardProp: (prop) => prop !== 'value'
})<{ value: number }>(({theme, value}) => ({
  color: value === 0
    ? theme.palette.text.primary
    : value > 0
      ? theme.palette.success.main
      : theme.palette.error.main
}));

const TablePaper = styled(Paper)`
  width: 100%;
  margin-bottom: 8px;
  margin-top: 2px;
  border: 0;
`;
const HeaderCell = styled(TableCell)(({theme}) => ({
  backgroundColor: theme.palette.action.selected,
}));
const TableTitle = styled(Typography)(({theme}) => ({
  backgroundColor: theme.palette.action.selected,
  padding: theme.spacing(1),
}));
const ScrollContainer = styled(TableContainer)`
  overflow-y: overlay;
  min-width: 800px;
  max-height: 400px;
`;

export const TickerDetails: FC = () => {
  const [tickerDetailState, setTickerDetailState] = useRecoilState(tickerDetailStateAtom);
  const [tickerActions, setTickerActions] = useState<IActionItem[]>([]);

  useEffect(() => {
    if (tickerDetailState.isOpen && tickerDetailState.tickerInfo){
      window.electron.ipcRenderer.onReceiveActions(a => {
        setTickerActions(a);
      });
      window.electron.ipcRenderer.loadActions(tickerDetailState.tickerInfo.tickerId);
    }
  }, [tickerDetailState.tickerInfo, tickerDetailState.isOpen])

  const tickerInfo = tickerDetailState.tickerInfo;
  if (!tickerInfo)
    return null;
  return(
    <Dialog
      onClose={() => setTickerDetailState(tickerDetailClose)}
      open={tickerDetailState.isOpen}
      maxWidth ='lg'
      fullWidth
      scroll='paper'
      disableRestoreFocus = {true}
    >
      <DialogTitle>
        <b>{tickerInfo.symbol}</b> ({tickerInfo.securityId})
        <Typography variant='body1' component='span'>
          &nbsp;{tickerInfo.description}
        </Typography>
        <IconButton
          onClick={() => setTickerDetailState(tickerDetailClose)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <SvgPath path={CommonIcon.close} />
        </IconButton>
      </DialogTitle>
      <DialogContent sx={{overflowY: 'hidden'}}>
        <CardRow>
          <Card>
            <Typography variant='h6'>Positions</Typography>
            <Num>{tickerInfo.actualPositions}</Num>
          </Card>
          <Card>
            <Typography variant='h6'>Spent</Typography>
            <TextRow>total <Num>{tickerInfo.purchaseValue.formatMoney()}</Num></TextRow>
            <TextRow>per share <Num>{tickerInfo.avgPrice.formatMoney()}</Num></TextRow>
          </Card>
          <Card>
            <Typography variant='h6'>Market Value</Typography>
            <TextRow>total <Num>{tickerInfo.marketValue.formatMoney()}</Num></TextRow>
            <TextRow>per share <Num>{tickerInfo.marketPrice.formatMoney()}</Num></TextRow>
          </Card>
          <Card>
            <Typography variant='h6'>Unrealized PnL</Typography>
            <TextRow>
              amount
              <ColoredNum value={tickerInfo.unrealizedPnL}>
                {tickerInfo.unrealizedPnL.formatMoney()}
              </ColoredNum>
            </TextRow>
            <TextRow>
              % of spent
              <ColoredNum value={tickerInfo.unrealizedPnL}>
                {tickerInfo.unrealizedPnLPercent.formatPercent()}
              </ColoredNum>
            </TextRow>
          </Card>
          <Card>
            <Typography variant='h6'>Realized PnL</Typography>
            <TextRow>
              total
              <ColoredNum value={tickerInfo.realizedPnL}>
                {tickerInfo.realizedPnL.formatMoney()}
              </ColoredNum>
            </TextRow>
            <TextRow>
              dividends
              <ColoredNum value={tickerInfo.dividendAmount}>
                {tickerInfo.dividendAmount.formatMoney()}
              </ColoredNum>
            </TextRow>
          </Card>
        </CardRow>

        <TablePaper variant='outlined'>
          <TableTitle variant='h6'>Operations</TableTitle>
          <ScrollContainer>
            <Table sx={{ minWidth: 800 }} size="small" stickyHeader >
              <TableHead>
                <TableRow>
                  <HeaderCell>Time</HeaderCell>
                  <HeaderCell align="right">Positions</HeaderCell>
                  <HeaderCell align="right">Residual</HeaderCell>
                  <HeaderCell align="right">Amount</HeaderCell>
                  <HeaderCell align="right">Fee</HeaderCell>
                  <HeaderCell align="right">Spent</HeaderCell>
                  <HeaderCell align="right">Earned</HeaderCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {tickerActions.map((action, i) => (
                  <TableRow
                    key={i}
                    sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                  >
                    <TableCell component="th" scope="row">
                      <Typography variant='caption'>
                      {(new Date(action.time)).toLocaleString()}
                      <br />
                      {action.description}
                      </Typography>
                    </TableCell>
                    <TableCell align="right"><Num>{action.positions}</Num></TableCell>
                    <TableCell align="right"><Num>{action.actualPositions}</Num></TableCell>
                    <TableCell align="right"><Num>{action.price.formatMoney()}</Num></TableCell>
                    <TableCell align="right"><Num>{action.fee.formatMoney()}</Num></TableCell>
                    <TableCell align="right"><Num>{action.purchaseValue.formatMoney()}</Num></TableCell>
                    <TableCell align="right">
                      <ColoredNum value={action.realizedPnL}>{action.realizedPnL.formatMoney()}</ColoredNum>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollContainer>
        </TablePaper>

      </DialogContent>
    </Dialog>
  )
}
