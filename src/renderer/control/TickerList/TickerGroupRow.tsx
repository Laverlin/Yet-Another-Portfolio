import { IconButton, styled, TableBody, TableCell, TableRow } from "@mui/material";
import React from "react";
import { FC, useState } from "react";
import { useRecoilValue} from "recoil";
import { groupTickersSelector } from "renderer/state/atom";
import { GroupSummary } from "renderer/state/GroupSummary";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";
import { Amount } from "./Amount";
import { TickerTableRow } from "./TickerTableRow";

interface IProp {
  groupSummary: GroupSummary
}

const IconSvg = styled(SvgPath)(() => ({
  width: '18px',
  height: '18px'
}));

const ToggleCell = styled(TableCell)(() => ({
  width:'40px',
  minWidth:'40px',
  padding: '8px',
  paddingLeft: '12px'
}));

const TickerCell = styled(TableCell)(() => ({
  paddingLeft: '0px',
  maxWidth: 0
}));

const NumberCell = styled(TableCell)(() => ({
  userSelect: 'text',
  paddingLeft: 0,
}));

const GroupRow = styled(TableRow)(({theme}) => ({
  userSelect: 'none',
  backgroundColor: theme.palette.action.selected
}));

export const TickerGroupRowNoMemo: FC<IProp> = ({groupSummary}) => {

  const tickerIds = useRecoilValue(groupTickersSelector(groupSummary.groupTitle));

  const [open, setOpen] = useState(false);

  return (
    <TableBody>
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
        <TickerCell align='left' colSpan={3}>{groupSummary.groupTitle}</TickerCell>

        <NumberCell align='right'>
          <Amount bold>{groupSummary.marketValue > 0 && groupSummary.marketValue.formatMoney()}</Amount>
        </NumberCell>

        <NumberCell align='right'>
          <Amount bold>{groupSummary.spent > 0 && groupSummary.spent.formatMoney()}</Amount>
        </NumberCell>

        <NumberCell align='right'>
          <Amount bold colored={groupSummary.unrealizedPnL}>
            {groupSummary.unrealizedPnL !== 0 && groupSummary.unrealizedPnL.formatMoney()}
          </Amount>
          <Amount caption colored={groupSummary.unrealizedPnL}>
            {groupSummary.unrealizedPnL !== 0 && groupSummary.unrealizedPnLPercent.formatPercent()}
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
      {open && tickerIds.map(tickerId => <TickerTableRow key={tickerId} tickerId={tickerId} />)}
    </TableBody>
  );
}

export const TickerGroupRow = React.memo(TickerGroupRowNoMemo);

