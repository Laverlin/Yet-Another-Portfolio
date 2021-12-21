import { Dialog, DialogContent, DialogTitle, Grid, IconButton } from "@mui/material";
import { FC } from "react";
import { useRecoilState } from "recoil";
import { logStorage } from "renderer/entity/LogStorage";
import { logDialogAtom } from "renderer/state/atom";
import { CommonIcon } from "renderer/utils/CommonIcon";
import { SvgPath } from "renderer/utils/SvgPath";

export const LogViewer: FC = () => {

  const [isLogViewOpen, setLogViewState] = useRecoilState(logDialogAtom);

  return (
    <Dialog
      onClose={() => setLogViewState(false)}
      open={isLogViewOpen}
      maxWidth ='lg'
      fullWidth
      scroll='paper'
      disableRestoreFocus = {true}
    >
      <DialogTitle>
        Log Records
        <IconButton
          onClick={() => setLogViewState(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <SvgPath path={CommonIcon.close} />
        </IconButton>
      </DialogTitle>
      <DialogContent>

        <Grid container direction='column' >
          {logStorage.logRecords.map((logRecord, i) =>
            <Grid key={i} container direction='row'>
              <Grid item xs={2}>{logRecord.severity}</Grid>
              <Grid item xs={4}>{logRecord.time.toLocaleString()}</Grid>
              <Grid item xs={6}>{logRecord.message}</Grid>
            </Grid>
          )}
        </Grid>
      </DialogContent>
    </Dialog>
  )
}
