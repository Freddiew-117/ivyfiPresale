import React, { useState, useEffect } from "react";
import { BsArrowRight, BsCurrencyBitcoin } from "react-icons/bs";
import { FaEthereum } from "react-icons/fa";
import { SiRipple, SiLitecoin } from "react-icons/si";
import { ethers } from "ethers";

// You'll need to import your contract ABI and address
import { TOKEN_SALE_ABI, TOKEN_SALE_ADDRESS } from "./../contexts/constants.js";

const TokenSale = () => {
  const [nToken, setNToken] = useState(1);
  const [contract, setContract] = useState(null);
  const [userStats, setUserStats] = useState({
    purchased: 0,
    claimable: 0,
    claimed: 0
  }

  )
  const [tokenSale, setTokenSale] = useState({
    tokenSold: 0,
    tokenSaleBalance: 0,
    presaleStatus: { isActive: false, timeRemaining: 0 },
    tokenPrice: 0,
    tokensForSale: 0
  });
  const [error, setError] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState(null);
  const [contractTokenPrice, setContractTokenPrice] = useState(null);
  const tokenPriceInHbar = 0.5; // Token price in HBAR
  const tokenPriceInTinybars = ethers.BigNumber.from(Math.floor(tokenPriceInHbar * 100_000_000)); // Convert to tinybars
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
          fetchContractData(tokenContract);
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

  const fetchContractData = async (tokenContract) => {
    try {
      const soldTokens = await tokenContract.getTokensSold();
      const remainingTokens = await tokenContract.getTokensRemaining();
      const presaleStatus = await tokenContract.getPresaleStatus();
      const price = await tokenContract.tokenPrice();
      const _tokensForSale = await tokenContract.tokensForSale();

      const signer = tokenContract.signer;
      const userAddress = await signer.getAddress();
      const [purchased, claimed, claimable] = await tokenContract.getUserBalance(userAddress);

      console.log(`User Balance:`);
      console.log(`  Purchased: ${purchased}`);
      console.log(`  Claimed: ${claimed}`);
      console.log(`  Claimable: ${claimable}`);
      setUserStats({
        purchased: purchased,
        claimable: claimable,
        claimed: claimed
      });
      setTokenSale({
        tokenSold: soldTokens.toString(),
        tokenSaleBalance: remainingTokens.toString(),
        presaleStatus,
        tokenPrice: ethers.utils.formatEther(price),
        tokensForSale : _tokensForSale.toString()
      });
      const contractPrice = await tokenContract.getTokenPriceInWei();
      setContractTokenPrice(ethers.utils.formatEther(contractPrice));
console.log("contract price", contractPrice);
    } catch (error) {
      console.error("Error fetching contract data:", error);
      setError("Failed to fetch contract data. Please try again later.");
    }
  };

  const checkContractState = async () => {
    try {
      const presaleEndTime = await contract.presaleEndTime();
      const currentTime = Math.floor(Date.now() / 1000);
      console.log(`Presale end time: ${new Date(presaleEndTime * 1000)}`);
      console.log(`Current time: ${new Date(currentTime * 1000)}`);
  
      const totalTokensSold = await contract.totalTokensSold();
      const tokensForSale = await contract.tokensForSale();
      console.log(`Tokens sold: ${totalTokensSold.toString()}`);
      console.log(`Tokens for sale: ${tokensForSale.toString()}`);
  
      const tokenPrice = await contract.getTokenPriceInWei();
      console.log(`Token price: ${ethers.utils.formatEther(tokenPrice)} HBAR`);
  
      // Use the contract's provider to get the balance
      const provider = contract.provider;
        
      const contractBalance = await provider.getBalance(contract.address);
      console.log(`Contract balance: ${ethers.utils.formatEther(contractBalance)} HBAR`);
      const [tokenBalance, ethBalance] = await contract.getContractBalance();
    
      console.log(`Token Balance: ${ethers.utils.formatUnits(tokenBalance, 18)}`);
      console.log(`HBAR Balance: ${ethers.utils.formatEther(ethBalance)}`);
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
      await checkContractState();
  
      const tokenPrice = await contract.getTokenPriceInWei();
      const totalCost = tokenPrice.mul(amount);
      console.log(`Token price: ${ethers.utils.formatEther(tokenPrice)} HBAR`);
      console.log(`Attempting to buy ${amount} tokens at ${ethers.utils.formatEther(tokenPrice)} HBAR each`);
      console.log(`Total cost: ${ethers.utils.formatEther(totalCost)} HBAR`);
  
      const signer = contract.signer;
      const balance = await signer.getBalance();
      console.log(`User's balance: ${ethers.utils.formatEther(balance)} HBAR`);
      if (balance.lt(totalCost)) {
        setError(`Insufficient balance. You need ${ethers.utils.formatEther(totalCost)} HBAR, but your balance is ${ethers.utils.formatEther(balance)} HBAR.`);
        return;
      }
  
      setTransactionStatus("Sending transaction...");
      const cost = await contract.calculateCost(amount);

      const tx = await contract.buyTokens(amount, { 
        value: cost,
        gasLimit: 100000
      });
      console.log(`Transaction hash: ${tx.hash}`);
      
      setTransactionStatus("Transaction sent. Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log("Transaction receipt:", receipt);
  
      if (receipt.status === 1) {
        console.log("Transaction confirmed");
        setTransactionStatus("Transaction confirmed. Tokens purchased successfully!");
        fetchContractData(contract);
      } else {
        console.error("Transaction failed");
        setError("Transaction failed. Please check the console for more details.");
      }
    } catch (error) {
      console.error("Error buying tokens:", error);
      if (error.reason) {
        setError(`Failed to buy tokens: ${error.reason}`);
      } else if (error.code === 'CALL_EXCEPTION') {
        setError("Transaction reverted by the contract. Please check if the presale is still ongoing and if there are enough tokens left for sale.");
      } else {
        setError(`Failed to buy tokens: ${error.message}`);
      }
    }
  };

  const percentage = (tokenSale.tokenSold / (Number(tokenSale.tokenSold) + Number(tokenSale.tokenSaleBalance))) * 100;
  const showPercentage = percentage.toFixed(2);

  return (
    <section id="token"
      className="section_token token_sale
    bg_light_dark" data-z-index="1"
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
                {tokenSale.presaleStatus.isActive ? "Active" : "Ended"}
              </p>
            </div>
            <div className="pr_box">
              <h6
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.2s">
                Time Remaining:
              </h6>
              <p
                className="animation"
                data-animation="fadeInUp"
                data-animation-delay="0.2s">
                {tokenSale.presaleStatus.isActive
                  ? `${Math.floor(tokenSale.presaleStatus.timeRemaining / 86400)} days`
                  : "Presale ended"}
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
                {userStats.purchased.toString()} IVY
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
                      aria-valuenow={percentage}
                      aria-valuemin="0"
                      aria-valuemax="100"
                      style={{ width: `${percentage}%` }}>
                      {showPercentage}%
                    </div>
                    <span className="progress_label bg-white inline_style_1">
                      <strong>{Math.trunc(tokenSale.tokensForSale/28)} IVY</strong>
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
                HBAR
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