import { } from '../utils/SystemExtentions';
import { FC, useEffect, useState } from 'react';
import { useRecoilCallback, useSetRecoilState } from 'recoil';
import { livePriceAtom, logDialogAtom, pinDialogStateAtom, tickerAtom, tickerIdsAtom } from 'renderer/state/atom';
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
import { IbkrPinDialog } from './IbkrPinDialog';
import { ITickerInfo } from 'main/entity/ITickerInfo';
import { ILivePrice } from 'main/entity/ILivePrice';


const MenuDial = styled(SpeedDial)(() =>({
  WebkitAppRegion:'no-drag',
  position: 'absolute',
  top:'8px',
  left:'8px',
}));

export const Main: FC = () => {
  const setTickerIds = useSetRecoilState(tickerIdsAtom);
  const setTicker = useRecoilCallback(({set}) => (ticker: ITickerInfo) => {
    set(tickerAtom(ticker.tickerId), ticker);
  });

  const livePriceHandler = useRecoilCallback(({set}) => (livePrice: ILivePrice) => {
    console.log('got update');
    console.log(livePrice);
    set(tickerAtom(livePrice.tickerId), cur => { return {...cur, marketPrice: livePrice.lastPrice}});
    set(livePriceAtom(livePrice.tickerId), livePrice);
  })

  const setLogViewState = useSetRecoilState(logDialogAtom);
  const setIbkrPinDialog = useSetRecoilState(pinDialogStateAtom);

  const { enqueueSnackbar } = useSnackbar();
  const [isMenuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    window.electron.ipcRenderer.onReceiveNotification(m => {
      logStorage.add(m);
      enqueueSnackbar(m.message, { variant: m.severity });
    });

    window.electron.ipcRenderer.onReceivePortfolio(tickers => {
      tickers.forEach(ticker => setTicker(ticker));
      setTickerIds(tickers.map(t => t.tickerId));
      //setIsLoading(false);
    });


    window.electron.ipcRenderer.onReceiveLivePrice(livePrice => livePriceHandler(livePrice));

    window.electron.ipcRenderer.loadPortfolio();

    return function cleanup() {
      window.electron.ipcRenderer.removeNotificationListeners();
      window.electron.ipcRenderer.removePortfolioListeners();
    };
  }, []);

  const refresh = () => {
    //setIsLoading(true);
    window.electron.ipcRenderer.refreshPortfolio();
    //ibkrSocket && ibkrSocket.subscribeOnTicker('265598');
  }

  const importOperations = () => {
    //setIsLoading(true);
    window.electron.ipcRenderer.importOperations();
    setIbkrPinDialog(true);
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

      <IbkrPinDialog/>

    </div>
  );
};


