import { Paper, styled, Typography } from '@mui/material';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';
import { summarySelector } from 'renderer/state/atom';
import { formatMoney, formatPercent } from '../utils/SystemExtentions';

const SummaryPaper = styled(Paper)`
  display: flex;
  flex-direction: row;
  background-color: black;
  padding: ${p => p.theme.spacing(1)};
  padding-right: 0;
  margin: 1px;
`;

const NormalNumber = styled(Typography)`
  color: ${p => p.theme.palette.background.default};
  font-weight: bold;
  margin-right: 10px;
  margin-left: auto;
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
  margin: '15px'
}));

const InfoBox = styled('div', {
  shouldForwardProp: (prop) => prop !== 'noBorder',
})<{ noBorder?: boolean }>(({ theme, noBorder }) => ({
  display: 'flex',
  flexDirection: 'column',
  width: '100%',
  minWidth: '210px',
  height: '150px',
  borderRight: (noBorder ? '' : `1px solid ${theme.palette.grey[700]}`),
  padding: '5px',
  alignItems: 'center',
  alignSelf: 'stretch',
}));

export const SummaryDetail: FC = () => {

  const summary = useRecoilValue(summarySelector);

  return (
    <SummaryPaper variant='outlined' >
      <InfoBox>
        <SumTitle variant='h5'> Invested </SumTitle>
        <NormalNumber variant='h5'>{summary.invested.formatMoney()}</NormalNumber>
      </InfoBox>
      <InfoBox>
        <SumTitle variant='h5'> Unrealized PnL </SumTitle>
          <ColoredNumber variant='h5' value={summary.unrealizedPnL}>
            {formatMoney(summary.unrealizedPnL)}
          </ColoredNumber>
          <ColoredNumber variant='h5' value={summary.unrealizedPnL}>
            {formatPercent(summary.unrealizedPnLPercent)}
          </ColoredNumber>
      </InfoBox>
      <InfoBox>
        <SumTitle variant='h5'> Realized PnL </SumTitle>
        <ColoredNumber variant='h5' value={summary.realizedPnL}>
          {summary.realizedPnL.formatMoney()}
        </ColoredNumber>
      </InfoBox>
      <InfoBox noBorder>
      <SumTitle variant='h5'> Combined PnL </SumTitle>
        <ColoredNumber variant='h5' value={summary.combinedPnL}>
          {summary.combinedPnL.formatMoney()}
        </ColoredNumber>
        <ColoredNumber variant='h5' value={summary.combinedPnL}>
          {summary.combinedPnLPercent.formatPercent()}
        </ColoredNumber>
      </InfoBox>

    </SummaryPaper>
  );
};


