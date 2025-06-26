import { AutoSwappr, TOKEN_ADDRESSES } from "../src";

/**
 * Basic usage example for the AutoSwappr SDK
 * This example shows how to swap STRK for USDC using the ekubo_manual_swap function
 */

async function basicUsageExample() {
  // Configuration
  const config = {
    contractAddress: "0xYOUR_AUTOSWAPPR_CONTRACT_ADDRESS", // Replace with actual contract address
    rpcUrl: "https://starknet-mainnet.public.blastapi.io",
    accountAddress: "0xYOUR_ACCOUNT_ADDRESS", // Replace with your account address
    privateKey: "0xYOUR_PRIVATE_KEY" // Replace with your private key
  };

  try {
    // Initialize the SDK
    const autoswappr = new AutoSwappr(config);

    console.log("AutoSwappr SDK initialized");
    console.log("Account address:", autoswappr.getAccountAddress());
    console.log("Contract address:", autoswappr.getContractAddress());

    // Get contract information
    const contractInfo = await autoswappr.getContractInfo();
    console.log("Contract info:", contractInfo);

    // Check if STRK is supported
    const strkSupported = await autoswappr.isTokenSupported(TOKEN_ADDRESSES.STRK);
    console.log("STRK supported:", strkSupported);

    // Get token balance
    const strkBalance = await autoswappr.getTokenBalance(TOKEN_ADDRESSES.STRK);
    console.log("STRK balance:", strkBalance);

    // Get token allowance
    const strkAllowance = await autoswappr.getTokenAllowance(TOKEN_ADDRESSES.STRK);
    console.log("STRK allowance:", strkAllowance);

    // Approve tokens if needed (uncomment to approve)
    // const approveAmount = "1000000000000000000"; // 1 STRK
    // const approvalResult = await autoswappr.approveTokens(TOKEN_ADDRESSES.STRK, approveAmount);
    // console.log("Approval result:", approvalResult);

    // Execute swap
    const swapOptions = {
      amount: "1000000000000000000", // 1 STRK (18 decimals)
      isToken1: false, // STRK is token0 in STRK/USDC pool
      skipAhead: 0
    };

    console.log("Executing swap: STRK -> USDC");
    const swapResult = await autoswappr.executeEkuboManualSwap(
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