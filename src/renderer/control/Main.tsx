import { } from '../utils/SystemExtentions';
import { FC, useEffect, useState } from 'react';
import { useSetRecoilState } from 'recoil';
import { logDialogAtom, tickersAtom } from 'renderer/state/atom';
import { SummaryDetail } from './SummaryDetail';

import { SpeedDial, SpeedDialAction, SpeedDialIcon, styled,  } from '@mui/material';

import { useSnackbar } from 'notistack';
import { SvgPath } from 'renderer/utils/SvgPath';
import { CommonIcon } from 'renderer/utils/CommonIcon';

import { LogViewer } from './LogViewer';
import { logStorage } from 'renderer/entity/LogStorage';
import { TickerDetails } from './TickerDetails';
import { SystemButtons } from './SystemButtons';
import { AssetList } from './TickerList/AssetList';


const MenuDial = styled(SpeedDial)(() =>({
  WebkitAppRegion:'no-drag',
  position: 'absolute',
  top:'8px',
  left:'8px',
}));

export const Main: FC = () => {
  const setTickers = useSetRecoilState(tickersAtom);
  const setLogViewState = useSetRecoilState(logDialogAtom);

  const { enqueueSnackbar } = useSnackbar();
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.onReceiveNotification(m => {
      logStorage.add(m);
      enqueueSnackbar(m.message, { variant: m.vriant });
    });

    window.electron.ipcRenderer.onReceivePortfolio(tickers => {
      setTickers(tickers);
      //setIsLoading(false);
    });

    window.electron.ipcRenderer.loadPortfolio();

    return function cleanup() {
      window.electron.ipcRenderer.removeNotificationListeners();
      window.electron.ipcRenderer.removePortfolioListeners();
    };
  }, []);

  const refresh = () => {
    //setIsLoading(true);
    window.electron.ipcRenderer.refreshPortfolio();
  }

  const importOperations = () => {
    //setIsLoading(true);
    window.electron.ipcRenderer.importOperations();
  }

  const actions = [
    { icon: <SvgPath path={CommonIcon.refresh} />, name: 'Refresh Prices', onclick: refresh },
    { icon: <SvgPath path={CommonIcon.import} />, name: 'Import Operations', onclick: importOperations },
    { icon: <SvgPath path={CommonIcon.log} />, name: 'View Log', onclick: () => setLogViewState(true) },
  ];

  return (
    <div>

      <SummaryDetail />
      <SystemButtons />
      <MenuDial
        ariaLabel="SpeedDial"
        icon={<SpeedDialIcon />}
        direction='down'
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
      </MenuDial>

      <AssetList />


      <LogViewer />


      <TickerDetails />
    </div>
  );
};


