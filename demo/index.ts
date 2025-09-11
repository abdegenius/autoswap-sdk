import * as dotenv from "dotenv";
import ethers from "ethers";
import { AutoSwappr, AutoSwapprBase, TOKEN_ADDRESSES } from "autoswap-sdk";
dotenv.config();

/**
 * Basic usage example for the AutoSwappr SDK
 * This example shows how to swap STRK for USDC using AutoSwappr
 */
async function basicUsageExample() {
  const autoswapprContractAddress = process.env.AUTOSWAPPR_CONTRACT_ADDRESS;
  if (!autoswapprContractAddress) {
    console.error("Missing Autoswappr Contract Address");
    return;
  }

  const accountAddress = process.env.ACCOUNT_ADDRESS;
  if (!accountAddress) {
    console.error("Missing Account Address");
    return;
  }

  const rpcUrl = process.env.STARKNET_RPC_URL;
  if (!rpcUrl) {
    console.error("Missing RPC url");
    return;
  }

  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("Missing private key");
    return;
  }

  const config = {
    contractAddress: autoswapprContractAddress,
    rpcUrl,
    accountAddress,
    privateKey,
  };

  try {
    const autoswappr = new AutoSwappr(config);
    console.log("AutoSwappr SDK initialized");

    const swapOptions = {
      amount: "0.00001", //
    };

    console.log("Executing swap: ETH -> USDC");
    const swapResult = await autoswappr.executeSwap(
      TOKEN_ADDRESSES.ETH,
      TOKEN_ADDRESSES.USDC,
      swapOptions
    );

    console.log("Swap result:", swapResult);
  } catch (error) {
    console.error("Error:", error);
  }
}

async function convertUSDC2CNGN() {
  const rpcUrl = process.env.BASE_RPC_URL;
  if (!rpcUrl) {
    console.error("Missing RPC url");
    return;
  }

  const privateKey = process.env.BASE_PRIVATE_KEY;
  if (!privateKey) {
    console.error("Missing private key");
    return;
  }

  try {
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const signer = new ethers.Wallet(privateKey, provider);
    const autoswapprBase = new AutoSwapprBase(provider, signer);
    console.log("AutoSwappr Base SDK initialized");

    // Estimate
    const usdcAmount = ethers.parseUnits("10", 6); // 10 USDC
    const estimated = await autoswapprBase.estimateCNGNOutput(usdcAmount);
    console.log(`Expected: ${ethers.formatUnits(estimated, 6)} cNGN`);

    // Swap if estimate looks good
    if (estimated > 0n) {
      console.log("Executing swap: USDC -> CNGN");
      const tx = await autoswapprBase.swapUSDCForCNGN(usdcAmount, 50); // 0.5% slippage
      await tx.wait();
      console.log("Swap result:", tx);
    }
    console.log("Estimated NGN value less than 0");
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the example
basicUsageExample();
convertUSDC2CNGN();
