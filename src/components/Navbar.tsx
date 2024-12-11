import { AppBar, Button, Toolbar, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import HBARLogo from "../assets/logoText.png";
import { useWalletInterface } from '../services/wallets/useWalletInterface';
import { WalletSelectionDialog } from './WalletSelectionDialog';

export default function NavBar() {
  const [open, setOpen] = useState(false);
  const { accountId, walletInterface } = useWalletInterface();

  const handleConnect = async () => {
    if (accountId) {
      walletInterface.disconnect();
    } else {
      setOpen(true);
    }
  };

  useEffect(() => {
    if (accountId) {
      setOpen(false);
    }
  }, [accountId])

  return (
    <AppBar position='relative'>
      <Toolbar>
        <div className="headerLogo">
          <img src={HBARLogo} alt='An upper case H with a line through the top' className='hbarLogoImg' />
          {/* <Typography variant="h6" color="white" pl={1} noWrap>
          IVY Finance
        </Typography> */}
          <Button
            variant='contained'
            sx={{
              ml: "15%",
              mr: "15%",
              mt: "0.5em",
              mb: "0.5em"
            }}
            onClick={handleConnect}
          >
            {accountId
              ? `Connected: ${accountId.length > 9
                ? `${accountId.slice(0, 3)}...${accountId.slice(-3)}`
                : accountId
              }`
              : 'Connect Wallet'}        </Button>
        </div>
      </Toolbar>
      <WalletSelectionDialog open={open} setOpen={setOpen} onClose={() => setOpen(false)} />
    </AppBar>
  )
}