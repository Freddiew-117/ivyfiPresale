import Footer from './components/Footer';
import CssBaseline from '@mui/material/CssBaseline';
import NavBar from './components/Navbar';
import { Box, ThemeProvider } from '@mui/material';
import { AllWalletsProvider } from './services/wallets/AllWalletsProvider';
import AppRouter from './AppRouter';
import colorBackground from './assets/colors.png';
import { theme } from './theme';
import "./App.css";
import TokenSale from './components/TokenSale';
import { useStateContext } from './contexts';
import "./styles/globals.css";
import Banner from './components/Banner';

function App() {
  const { buyToken, tokenSale, transferNativeToken } = useStateContext();  // Only destructure what you know exists

  return (
    <ThemeProvider theme={theme}>
      <AllWalletsProvider>
        <CssBaseline />
        <NavBar />
        <Banner transferNativeToken={transferNativeToken} />
        <TokenSale
          buyToken={buyToken}
          tokenSold={tokenSale.tokenSold}
          tokenSaleBalance={tokenSale.tokenSaleBalance}
          presaleStatus={tokenSale.presaleStatus}
          tokenPrice={tokenSale.tokenPrice}
          tokensForSale={tokenSale.tokensForSale}
        />
        {/* <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            minHeight: '100vh',
            backgroundColor: '#222222',
            backgroundImage: `url(${colorBackground})`,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center'
          }}
        >
          <header>
            <NavBar />
          </header>
          <Box
            flex={1}
            p={3}
          >
            <AppRouter />
          </Box>
          <Footer />
        </Box> */}
        <Footer />
      </AllWalletsProvider>
      <script src="assets/js/jquery-1.12.4.min.js" ></script>
      <script src="assets/bootstrap/js/bootstrap.min.js" ></script>
      <script src="assets/owlcarousel/js/owl.carousel.min.js" ></script>
      <script src="assets/js/magnific-popup.min.js" ></script>
      <script src="assets/js/waypoints.min.js" ></script>
      <script src="assets/js/parallax.js" ></script>
      <script src="assets/js/jquery.countdown.min.js" ></script>
      <script src="assets/js/particles.min.js" ></script>
      <script src="assets/js/jquery.dd.min.js" ></script>
      <script src="assets/js/jquery.counterup.min.js" ></script>
      <script src="assets/js/spop.min.js" ></script>


      <script src="assets/js/scripts.js" ></script>
      <script src="index.js" ></script>
    </ThemeProvider>
  );
}

export default App;