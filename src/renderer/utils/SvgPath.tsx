import { SvgIcon, SvgIconTypeMap } from "@mui/material"
import { OverridableComponent } from "@mui/material/OverridableComponent"

interface Props {
  path: string;
  viewBox ?: string;
};

export const SvgPath: OverridableComponent<SvgIconTypeMap<Props, "svg">>  = (props: Props) => {
  return <SvgIcon {...props} viewBox = {props.viewBox}><path d = {props.path} /></SvgIcon>
}
