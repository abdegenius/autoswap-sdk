import * as dotenv from "dotenv";
import { AutoSwappr, TOKEN_ADDRESSES } from "../src";

dotenv.config();

/**
 * Basic usage example for the AutoSwappr SDK
 * This example shows how to swap STRK for USDC using AutoSwappr
 */
async function basicUsageExample() {
  const config = {
    contractAddress: process.env.AUTOSWAPPR_CONTRACT_ADDRESS || "", // Set AUTOSWAPPR_CONTRACT_ADDRESS in your environment
    rpcUrl:
      process.env.STARKNET_RPC_URL ||
      "https://starknet-mainnet.public.blastapi.io",
    accountAddress: process.env.ACCOUNT_ADDRESS || "", // Set ACCOUNT_ADDRESS in your environment
    privateKey: process.env.PRIVATE_KEY || "" // Set PRIVATE_KEY in your environment
  };

  try {
    // Initialize the SDK
    const autoswappr = new AutoSwappr(config);
    console.log("AutoSwappr SDK initialized");

    // Execute swap
    const swapOptions = {
      amount: "2000000000000000000", // 1 STRK (18 decimals)
      isToken1: false, // STRK is token0 in STRK/USDC pool
      skipAhead: 0
    };

    console.log("Executing swap: STRK -> USDC");
    const swapResult = await autoswappr.executeSwap(
      TOKEN_ADDRESSES.STRK,
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
