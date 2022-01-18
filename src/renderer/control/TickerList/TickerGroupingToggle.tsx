import { styled, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { FC, } from "react";
import { useRecoilState } from "recoil";
import { groupFiledNameAtom } from "renderer/state/atom";

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

  const [groupField, setGroupField] = useRecoilState(groupFiledNameAtom);

  return (
    <GroupingDiv>
      <Typography variant='overline' color='primary'>
        &nbsp;group by&nbsp;&nbsp;
      </Typography>

      <ToggleButtonGroup
        color="primary"
        value={groupField}
        exclusive
        onChange = {(_, value) => setGroupField(value)}
      >
        <GroupToggleButton size='small' value='sector'>sector</GroupToggleButton>
        <GroupToggleButton size='small' value='industry'>industry</GroupToggleButton>
        <GroupToggleButton size='small' value='customGroup'>custom</GroupToggleButton>
      </ToggleButtonGroup>
    </GroupingDiv>
  )
}
