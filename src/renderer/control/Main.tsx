import { } from '../utils/SystemExtentions';
import { FC, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { logDialogAtom, tickersAtom } from 'renderer/state/atom';
import { SummaryDetail } from './SummaryDetail';
import { TickerList } from './TickerList';
import { SpeedDial, SpeedDialAction, SpeedDialIcon, styled, ToggleButton, ToggleButtonGroup, Typography } from '@mui/material';
import { ITickerInfo } from 'main/entity/ITickerInfo';
import { useSnackbar } from 'notistack';
import { SvgPath } from 'renderer/utils/SvgPath';
import { CommonIcon } from 'renderer/utils/CommonIcon';
import { Loader } from './Loader';
import { LogViewer } from './LogViewer';
import { logStorage } from 'renderer/entity/LogStorage';
import { TickerDetails } from './TickerDetails';

const RefreshHeader = styled('div')(({theme}) => ({
  display: 'flex',
  padding: theme.spacing(1),
  marginRight: '1px',
  marginLeft: '1px',
  //backgroundColor: theme.palette.action.selected,
  alignItems: 'center',
  transform: 'translateZ(0px)',
  flexGrow: 1,
  minHeight: '70px',
}));

const GroupToggleButton = styled(ToggleButton)(({theme}) => ({
  fontWeight: 'bold',
  height: '30px',
  color: theme.palette.primary.main,
  '&.MuiToggleButton-root.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main)
  }
}));

const GroupingDiv = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
}));

export const Main: FC = () => {
  const setTickers = useSetRecoilState(tickersAtom);
  const setLogViewState = useSetRecoilState(logDialogAtom);

  const [groupingState, setGroupingState] = useState('' as keyof ITickerInfo | '');
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.onReceiveNotification(m => {
      logStorage.add(m);
      enqueueSnackbar(m.message, { variant: m.vriant });
    });

    window.electron.ipcRenderer.onReceivePortfolio(tickers => {
      setTickers(tickers);
      setIsLoading(false);
    });

    window.electron.ipcRenderer.loadPortfolio();

    return function cleanup() {
      window.electron.ipcRenderer.removeNotificationListeners();
      window.electron.ipcRenderer.removePortfolioListeners();
    };
  }, []);

  const handleGroupingState = (value: keyof ITickerInfo | '') => {
    setGroupingState(value);
  };

  const refresh = () => {
    setIsLoading(true);
    window.electron.ipcRenderer.refreshPortfolio();
  }

  const importOperations = () => {
    setIsLoading(true);
    window.electron.ipcRenderer.importOperations();
  }

  const actions = [
    { icon: <SvgPath path={CommonIcon.refresh} />, name: 'Refresh Prices', onclick: refresh },
    { icon: <SvgPath path={CommonIcon.import} />, name: 'Import Operations', onclick: importOperations },
    { icon: <SvgPath path={CommonIcon.log} />, name: 'View Log', onclick: () => setLogViewState(true) },
  ];

  return (
    <div>

      <RefreshHeader>

        <GroupingDiv>
          <Typography variant='overline' color='primary'>
            &nbsp;group by&nbsp;&nbsp;
          </Typography>

          <ToggleButtonGroup
            color="primary"
            value={groupingState}
            exclusive
            onChange = {(_, v) => handleGroupingState(v)}
          >
            <GroupToggleButton size='small' value='sector'>sector</GroupToggleButton>
            <GroupToggleButton size='small' value='industry'>industry</GroupToggleButton>
            <GroupToggleButton size='small' value='customGroup'>custom</GroupToggleButton>
          </ToggleButtonGroup>
        </GroupingDiv>

        <Loader ishidden={!isLoading}/>

        <SpeedDial
          ariaLabel="SpeedDial"
          sx={{ position: 'absolute', right: '16px', }}
          icon={<SpeedDialIcon />}
          direction='left'
          onClose={() => setMenuOpen(false)}
          onOpen={() => setMenuOpen(true)}
          open={isMenuOpen}
        >
          {actions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick= {_ => {
                action.onclick();
                setMenuOpen(false);
              }}
            />
          ))}
        </SpeedDial>
      </RefreshHeader>
      <LogViewer />
      <SummaryDetail />
      <TickerList grouping={groupingState} />
      <TickerDetails />
    </div>
  );
};


