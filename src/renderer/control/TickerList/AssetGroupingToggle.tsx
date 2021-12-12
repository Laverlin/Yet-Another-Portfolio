import { styled, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { ITickerInfo } from "main/entity/ITickerInfo";
import { FC, useState } from "react";

const GroupToggleButton = styled(ToggleButton)(({theme}) => ({
  fontWeight: 'bold',
  height: '30px',
  color: theme.palette.primary.main,
  '&.MuiToggleButton-root.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.getContrastText(theme.palette.primary.main)
  },
}));

const GroupingDiv = styled('div')(() => ({
  display: 'flex',
  flexDirection: 'row',
  marginLeft: 'auto',
}));

export const AssetGroupingToggle: FC = () => {

  const [groupingState, setGroupingState] = useState('' as keyof ITickerInfo | '');

  return (
    <GroupingDiv>
      <Typography variant='overline' color='primary'>
        &nbsp;group by&nbsp;&nbsp;
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={groupingState}
        exclusive
        onChange = {(_, value) => setGroupingState(value)}
      >
        <GroupToggleButton size='small' value='sector'>sector</GroupToggleButton>
        <GroupToggleButton size='small' value='industry'>industry</GroupToggleButton>
        <GroupToggleButton size='small' value='customGroup'>custom</GroupToggleButton>
      </ToggleButtonGroup>
    </GroupingDiv>
  )
}
