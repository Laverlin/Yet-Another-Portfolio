import {  styled, Typography } from '@mui/material';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { summarySelector } from 'renderer/state/atom';

import { formatMoney, formatPercent } from '../utils/SystemExtentions';

const InfoContainer = styled('div')(({theme}) => ({
  WebkitAppRegion:'drag',
  display: 'flex',
  flexDirection:'row',
  '& > :last-child': {
    marginRight: '0px'
  },
  backgroundColor: theme.palette.grey[500],
}));

const NormalNumber = styled(Typography)`
  color: ${p => p.theme.palette.background.default};
  font-weight: bold;
  margin-right: 10px;
  margin-left: auto;
  margin-bottom: 8px;
`;

const ColoredNumber = styled(NormalNumber)<{ value: number }>`
  color: ${p => p.value > 0
    ? p.theme.palette.success.light
    : p.theme.palette.error.light
  };
`;

const SumTitle = styled(Typography)(({theme}) => ({
  color: theme.palette.background.default,
  fontWeight: 'bold',
  lineHeight: '40px',
  marginTop: theme.spacing(3)
}));

const InfoBox = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minWidth: '210px',
  height: '180px',
  padding: '5px',
  alignItems: 'center',
  alignSelf: 'stretch',
  backgroundColor: '#000000',
  marginRight: '1px',
}));

const Caption = styled(Typography)(({theme}) =>({
  color: theme.palette.grey[500], //'#FFFFFF',
  lineHeight: 1,
  marginLeft:'auto',
  marginRight: '10px',
}));

export const SummaryDetail: FC = () => {

  const summary = useRecoilValue(summarySelector);

  return (
    <InfoContainer>

      <InfoBox>
        <SumTitle variant='h5'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Assets </SumTitle>
        <Caption variant='caption'>invested</Caption>
        <NormalNumber variant='h5'>{summary.invested.formatMoney()}</NormalNumber>
      </InfoBox>
      <InfoBox>
        <SumTitle variant='h5'> Unrealized PnL </SumTitle>
        <Caption variant='caption'>total</Caption>
        <ColoredNumber variant='h5' value={summary.unrealizedPnL}>
          {formatMoney(summary.unrealizedPnL)}
        </ColoredNumber>
        <Caption variant='caption'>% invested</Caption>
        <ColoredNumber variant='h5' value={summary.unrealizedPnL}>
          {formatPercent(summary.unrealizedPnLPercent)}
        </ColoredNumber>
      </InfoBox>
      <InfoBox>
        <SumTitle variant='h5'> Realized PnL </SumTitle>
        <Caption variant='caption'>total</Caption>
        <ColoredNumber variant='h5' value={summary.realizedPnL}>
          {summary.realizedPnL.formatMoney()}
        </ColoredNumber>
      </InfoBox>
      <InfoBox>
        <SumTitle variant='h5'> Combined PnL </SumTitle>
        <Caption variant='caption'>total</Caption>
        <ColoredNumber variant='h5' value={summary.combinedPnL}>
          {summary.combinedPnL.formatMoney()}
        </ColoredNumber>
        <Caption variant='caption'>% invested</Caption>
        <ColoredNumber variant='h5' value={summary.combinedPnL}>
          {summary.combinedPnLPercent.formatPercent()}
        </ColoredNumber>
      </InfoBox>

    </InfoContainer>
  );
};


