import { render } from 'react-dom';
import { MemoryRouter as Router, Switch, Route } from 'react-router-dom';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { RecoilRoot } from 'recoil';
import { Main } from './control/Main';
import { SnackbarProvider } from 'notistack';
// import GlobalObserver from './control/GlobalObserver';


let appTheme = createTheme({
  components:{
    MuiCssBaseline:{
      styleOverrides: {
        body: {
          overflow: 'hidden'
        },
        "&::-webkit-scrollbar" : {
          width: '10px'
        },
        "&::-webkit-scrollbar-track": {
          background: 'transparent',
        },
        "&::-webkit-scrollbar-button": {
          height: '4px'
        },
        "&::-webkit-scrollbar-thumb": {
          background: 'transparent',
          borderRadius: '10px',
          backgroundClip: 'padding-box',
          borderRight: '2px transparent solid',
          borderLeft: '2px transparent solid'
        },
        "&:hover": {
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: 'rgba(180, 180, 180, 0.6)'
          }
        },
      }
    }
  },
  palette: {
//    primary: {
      // main: '#3a506b',
//    },
    action: {
      selected: '#E6F5FF', //'rgba(0, 118, 210, 0.08)', //'#d6f6dd',
      hover: '#E6F5FF55', //'rgba(0, 118, 210, 0.03)', //'rgba(40, 140, 140, 0.02)',
    }
  },

});

render(
  <RecoilRoot>
    {/* <GlobalObserver /> */}
    <Router>
      <ThemeProvider theme={appTheme} >
        <CssBaseline />
        <SnackbarProvider
          maxSnack={5}
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
          }}
        >
          <Switch>
            <Route path="/" component={Main} />
          </Switch>
        </SnackbarProvider>
      </ThemeProvider>
    </Router>
  </RecoilRoot>,
  document.getElementById('root')
);
