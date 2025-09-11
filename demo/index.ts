import * as dotenv from "dotenv";
import { AutoSwappr, TOKEN_ADDRESSES } from "autoswap-sdk";

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
    privateKey
  };

  try {
    const autoswappr = new AutoSwappr(config);
    console.log("AutoSwappr SDK initialized");

    const swapOptions = {
      amount: "0.00001" //
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

// Run the example
basicUsageExample();
