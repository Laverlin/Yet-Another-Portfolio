import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";
import { useRecoilState } from "recoil";
import { pinDialogStateAtom } from "renderer/state/atom";

export function IbkrPinDialog() {
  const [open, setOpen] = useRecoilState(pinDialogStateAtom);
  const [pinValue, setPinValue] = useState('');

  const handleClose = () => {
    setOpen(false);
  };

  const handleEnter = () => {
    setOpen(false);
    window.electron.ipcRenderer.enterPin(pinValue)
  }

  return (
    <div>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Enter pin</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter pin to allow access to Interactive Brokers
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="IBKR PIN"
            type="text"
            variant="outlined"
            value={pinValue}
            onChange={(e) => setPinValue(e.target.value)}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button variant='contained' onClick={handleClose}>Cancel</Button>
          <Button variant='contained' onClick={handleEnter}>Enter</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
