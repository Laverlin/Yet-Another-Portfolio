import { styled } from "@mui/material";

export const Amount = styled('div', {
  shouldForwardProp: (prop) => prop !== 'colored' && prop !== 'bold' && prop != 'caption'
})<{colored?: number, bold?: boolean, caption?: boolean}>(({theme, colored, bold, caption}) => ({
  paddingLeft: theme.spacing(1),
  color: (colored || 0) === 0
    ? theme.palette.text.primary
    : (colored || 0) > 0
      ? theme.palette.success.main
      : theme.palette.error.main,
  fontWeight: bold ? 'bolder' : 'normal',
  fontSize: !caption ? '' : '0.9em',
  paddingRight: theme.spacing(2)
}));
