import React, { useState, useEffect } from "react";
import { ethers } from "ethers";

// You'll need to import your contract ABI and address
import { TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS } from "./../contexts/constants.js";

const TokenSale = () => {
  const [nToken, setNToken] = useState(1);
  const [contract, setContract] = useState(null);
  const [showPercentage, setShowPercentage] = useState(0);
  const [tokenSale, setTokenSale] = useState({
    availableTokens: 0,
    presaleActive: false,
    tokenPrice: 0,
    initialTokenAmount: 0  // Add this to track initial token amount
  });
  const [error, setError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  async function getPercentageSold() {
    try {
      // Check if contract is initialized
      if (!contract) {
        console.log("Contract not initialized");
        return 0;
      }

      // Get initial amount
      const initialAmount = await contract.initialTokenAmount();
      
      // Get current available tokens
      const availableTokens = await contract.getAvailableTokens();
      
      // Check if initial amount is set
      if (initialAmount.toString() === '0') {
        console.log("Initial amount not set yet. Call setInitialTokenAmount() first.");
        return 0;
      }
      
      // Calculate tokens sold
      const tokensSold = initialAmount.sub(availableTokens);
      
      // Calculate percentage
      const percentageSold = (tokensSold.toNumber() / initialAmount.toNumber()) * 100;
      
      return percentageSold;
    } catch (error) {
      console.error("Error calculating percentage sold:", error);
      return 0;
    }
  }

  useEffect(() => {
    const initContract = async () => {
      if (window.ethereum) {
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const provider = new ethers.providers.Web3Provider(window.ethereum);
          const signer = provider.getSigner();
          const tokenContract = new ethers.Contract(TOKEN_SALE_ADDRESS, TOKEN_SALE_ABI, signer);
          setContract(tokenContract);
  
          // Initial fetch of contract data
          await fetchContractData(tokenContract);
          
          // Safely get initial token amount
          try {
            const initialAmount = await tokenContract.initialTokenAmount();
            setTokenSale(prev => ({
              ...prev,
              initialTokenAmount: initialAmount.toString()
            }));
  
            // Calculate percentage sold only after contract is set
            console.log("A")
            const percentageSold = await calculatePercentageSold(tokenContract);
            setShowPercentage(percentageSold.toFixed(2));
          } catch (initialAmountError) {
            console.error("Error getting initial token amount:", initialAmountError);
            setShowPercentage(0);
          }
        } catch (error) {
          console.error("Failed to initialize the contract:", error);
          setError("Failed to initialize the contract. Please check your connection and try again.");
        }
      } else {
        setError("Please install MetaMask!");
      }
    };
  
    initContract();
  }, []);
  
  // Separate function to calculate percentage sold
  const calculatePercentageSold = async (contract) => {
    if (!contract) return 0;
  
    try {
      const initialAmount = await contract.initialTokenAmount();
      const availableTokens = await contract.getAvailableTokens();
  
      if (initialAmount.toString() === '0') {
        console.log("Initial amount not set yet.");
        return 0;
      }
      
      // Use BigNumber division to prevent overflow
      const tokensSold = initialAmount.sub(availableTokens);
      const percentageSold = tokensSold.mul(100).div(initialAmount).toNumber();
      
      return percentageSold;
    } catch (error) {
      console.error("Error calculating percentage sold:", error);
      return 0;
    }
  };

  const fetchContractData = async (tokenContract) => {
    try {
      const price = await tokenContract.getTokenPrice();
      const [tokenBalance, nativeBalance] = await tokenContract.getContractBalance();
      const isActive = await tokenContract.presaleActive();

      setTokenSale(prev => ({
        ...prev,
        availableTokens: tokenBalance.toString(),
        presaleActive: isActive,
        tokenPrice: ethers.utils.formatEther(price)
      }));

    } catch (error) {
      console.error("Error fetching contract data:", error);
      setError("Failed to fetch contract data. Please try again later.");
    }
  }; 

  const checkContractState = async () => {
    try {
      const tokenPrice = await contract.getTokenPrice();
      console.log(`Token price: ${ethers.utils.formatEther(tokenPrice)} HBAR`);

      const [tokenBalance, hbarBalance] = await contract.getContractBalance();
      console.log(`Token Balance: ${ethers.utils.formatUnits(tokenBalance, 18)}`);
      console.log(`HBAR Balance: ${ethers.utils.formatEther(hbarBalance)}`);
    } catch (error) {
      console.error("Error checking contract state:", error);
    }
  };

  const buyToken = async (amount) => {
    setError(null);
    setTransactionStatus(null);

    if (!contract) {
        setError("Contract not initialized. Please try again.");
        return;
    }

    try {
        // Check presale status and available tokens
        const [presaleActive, availableTokens] = await Promise.all([
            contract.presaleActive(),
            contract.getAvailableTokens(),
        ]);

        if (!presaleActive) {
            setError("Presale is not currently active.");
            return;
        }

        if (availableTokens.lt(amount)) {
            setError("Requested token amount exceeds available tokens.");
            return;
        }

        // Calculate cost
        const amountInWei = ethers.utils.parseUnits(amount.toString(), 18);
        const cost = await contract.calculateCost(amountInWei);
        const signer = contract.signer;
        const balance = await signer.getBalance();

        console.log(`Cost: ${ethers.utils.formatEther(cost)}`);
        console.log(`Balance: ${ethers.utils.formatEther(balance)}`);

        if (balance.lt(cost)) {
            setError("Insufficient balance to complete the transaction.");
            return;
        }

        // Estimate gas
        const estimatedGas = await contract.estimateGas.buyTokens(amount, { value: cost });

        setTransactionStatus("Sending transaction...");
        const tx = await contract.buyTokens(amount, {
            value: cost,
            gasLimit: estimatedGas.add(10000), // Add buffer to avoid reversion
        });

        setTransactionStatus("Transaction sent. Awaiting confirmation...");
        const receipt = await tx.wait();

        if (receipt.status === 1) {
            setTransactionStatus("Tokens purchased successfully!");
            // Optionally refresh token balance
            const tokenBalance = await contract.token.balanceOf(signer.getAddress());
            console.log("Updated Token Balance:", ethers.utils.formatUnits(tokenBalance, 18));
        } else {
            setError("Transaction failed.");
        }
    } catch (error) {
        console.error("Error:", error);
        const errorMessage = error.reason || error.message || "An unknown error occurred.";
        setError(errorMessage);
    }
};



  return (
    <section id="token"
    className={`section_token token_sale bg_light_dark ${tokenSale.presaleActive ? '' : 'blurred'}`} data-z-index="1"
      data-parallax="scroll"
      data-image-src="assets/images/token_bg.png">
      <div className="area">
        <div className="container ">
          <ul className="circles">
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
            <li></li>
          </ul>
          <div className="row">
            <div className="col-lg-6 offset-lg-3 
        col-md-12 col-sm-12">
              <div className="title_default_light title_border text-center">
                <h4 className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Token Sale
                </h4>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Participate in our token sale to acquire IVY tokens. The sale is governed by a smart contract ensuring fairness and transparency.
                </p>
              </div>
            </div>
          </div>
          <div className="row align-items-center">
            <div className="col-lg-3">
              <div className="pr_box">
                <h6
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Presale Status:
                </h6>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  {tokenSale.presaleActive ? "Active" : "Inactive"}
                </p>
              </div>

              <div className="pr_box">
                <h6
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Token exchange rate
                </h6>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  1 HBAR = {1 / tokenSale.tokenPrice} IVY
                </p>
              </div>
              <div className="pr_box">
                <h6
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Purchased Tokens
                </h6>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  { } IVY
                </p>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="token_sale res_md_mb_40
          res_md_mt_40 res_sm_mb_30 res_sm_mt_30"
              >
                <div className="animation tk_countdown text-center token_countdown_bg"
                  data-animation="fadeInUp"
                  data-animation-delay="0.1s">

                  <div className="field_form">
                    <div className="row">
                      <h4 className="title1">
                        Select the ammount of tokens you want to buy
                      </h4>
                      <div className="form-group col-md-12 animation"
                        data-animation="fadeInUp"
                        data-animation-delay="1.4s"
                      >
                        <input type="number" required
                          placeholder="1"
                          id="first-name"
                          min={1}
                          className="form-control"
                          onChange={(e) => setNToken(e.target.value)}
                          name="token"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="tk_counter_inner">
                    <div
                      className=" progress animation"
                      data-animation="fadeInUp"
                      data-animation-delay="1.3s"
                    >
                      <div
                        className="progress-bar
              progress-bar-striped gradient"
                        role="progressbar"
                        aria-valuenow={showPercentage}
                        aria-valuemin="0"
                        aria-valuemax="100"
                        style={{ width: `${showPercentage}%` }}>
                        {showPercentage}%
                      </div>
                      <span className="progress_label bg-white inline_style_1">
                        <strong>25% IVY</strong>
                      </span>
                      {/* <span className="progress_label bg-white inline_style_2">
                      <strong>{tokenSale.tokenSaleBalance} IVY</strong>
                    </span> */}
                      <span className="progress_min_val">
                        Soft Cap
                      </span>
                      <span className="progress_max_val">
                        Sale Raised
                      </span>
                    </div>
                    <a onClick={() => buyToken(nToken)}
                      className="btn btn-default btn-radius animation"
                      data-animation="fadeInUp"
                      data-animation-delay="0.1s">
                      Buy Tokens
                    </a>
                    <ul className="icon_list list_none d-flex justify-content-center">
                      <li
                        className="animation"
                        data-animation="fadeInUp"
                        data-animation-delay="0.5s">
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="pr_box">
                <h6
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Current Token Price:
                </h6>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  {tokenSale.tokenPrice} HBAR
                </p>
              </div>
              <div className="pr_box">
                <h6
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Total Tokens Sold
                </h6>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  {tokenSale.tokenSold} IVY ({showPercentage}%)
                </p>
              </div>
              <div className="pr_box">
                <h6
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  Acceptable currency:
                </h6>
                <p
                  className="animation"
                  data-animation="fadeInUp"
                  data-animation-delay="0.2s">
                  HBAR, status: {transactionStatus}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TokenSale;