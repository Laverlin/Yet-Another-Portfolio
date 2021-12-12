import { IconButton, styled } from "@mui/material";
import { FC, useState } from "react";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";

const ButtonGroup = styled('div')(()=>({
  display: 'flex',
  position: 'absolute',
  top: '0px',
  right: '0px',
  //left:'0px',
  backgroundColor:'black',
  justifyContent:'right'
}));

const SysButton = styled(IconButton)(({theme})=>({
  WebkitAppRegion:'no-drag',
  height: theme.spacing(3),
  width: theme.spacing(3 + 2),
  borderRadius:0,
  color: '#FFFFFF',
  "&:hover": {
    backgroundColor: '#313131'
  },
}));

const SysCloseButton = styled(SysButton)(({theme})=>({
  "&:hover": {
    backgroundColor: theme.palette.error.main,
  },
}));

const SysIcon = styled(SvgPath)(() => ({
  height: 10,
  width: 10
}));

export const SystemButtons: FC = () => {

  const [isMaximized, setIsMaximized] = useState(false);

  return (
    <ButtonGroup>
        <SysButton
          onClick = {() => {window.electron.ipcRenderer.systemCommand('minimize')}}
        >
          <SysIcon path = {CommonIcon.minimizeThin} />
        </SysButton>
        <SysButton
          onClick = {() => {
            isMaximized
              ? window.electron.ipcRenderer.systemCommand('restore')
              : window.electron.ipcRenderer.systemCommand('maximize');
            setIsMaximized(!isMaximized);
          }}
        >
          { isMaximized
            ? <SysIcon path = {CommonIcon.restoreThin} />
            : <SysIcon path = {CommonIcon.maximizeThin} />
          }
        </SysButton>
        <SysCloseButton
          onClick={() => {window.electron.ipcRenderer.systemCommand('close')}}
        >
          <SysIcon path = {CommonIcon.xMarkThin} />
        </SysCloseButton>
    </ButtonGroup>
  )
}
