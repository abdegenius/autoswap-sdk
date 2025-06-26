import { 
  AutoSwappr, 
  TOKEN_ADDRESSES, 
  toWei, 
  fromWei, 
  formatTokenAmount, 
  calculateSlippageTolerance,
  retry 
} from "../src";

/**
 * Example demonstrating utility functions with the AutoSwappr SDK
 */

async function utilitiesExample() {
  // Configuration
  const config = {
    contractAddress: "0xYOUR_AUTOSWAPPR_CONTRACT_ADDRESS",
    rpcUrl: "https://starknet-mainnet.public.blastapi.io",
    accountAddress: "0xYOUR_ACCOUNT_ADDRESS",
    privateKey: "0xYOUR_PRIVATE_KEY"
  };

  try {
    const autoswappr = new AutoSwappr(config);

    // Example 1: Convert decimal amounts to wei
    console.log("=== Amount Conversions ===");
    
    const strkAmount = 1.5; // 1.5 STRK
    const strkWei = toWei(strkAmount, 18); // STRK has 18 decimals
    console.log(`${strkAmount} STRK = ${strkWei} wei`);

    const usdcAmount = 100.50; // 100.50 USDC
    const usdcWei = toWei(usdcAmount, 6); // USDC has 6 decimals
    console.log(`${usdcAmount} USDC = ${usdcWei} wei`);

    // Example 2: Convert wei back to decimal
    console.log("\n=== Wei to Decimal ===");
    
    const strkDecimal = fromWei(strkWei, 18);
    console.log(`${strkWei} wei = ${strkDecimal} STRK`);

    const usdcDecimal = fromWei(usdcWei, 6);
    console.log(`${usdcWei} wei = ${usdcDecimal} USDC`);

    // Example 3: Format token amounts for display
    console.log("\n=== Formatted Amounts ===");
    
    const formattedStrk = formatTokenAmount(strkWei, 18, "STRK");
    console.log("Formatted STRK:", formattedStrk);

    const formattedUsdc = formatTokenAmount(usdcWei, 6, "USDC");
    console.log("Formatted USDC:", formattedUsdc);

    // Example 4: Calculate slippage tolerance
    console.log("\n=== Slippage Calculations ===");
    
    const expectedAmount = "1000000000"; // 1000 USDC in wei
    const slippagePercentage = 0.5; // 0.5%
    
    const minAmount = calculateSlippageTolerance(expectedAmount, slippagePercentage);
    console.log(`Expected: ${formatTokenAmount(expectedAmount, 6, "USDC")}`);
    console.log(`Min after 0.5% slippage: ${formatTokenAmount(minAmount, 6, "USDC")}`);

    // Example 5: Retry mechanism for failed operations
    console.log("\n=== Retry Mechanism ===");
    
    const swapWithRetry = async () => {
      return await retry(
        async () => {
          // Simulate a swap operation that might fail
          const random = Math.random();
          if (random < 0.7) {
            throw new Error("Simulated swap failure");
          }
          return { success: true, txHash: "0x123..." };
        },
        3, // max attempts
        1000 // delay between attempts
      );
    };

    try {
      const result = await swapWithRetry();
      console.log("Swap succeeded after retry:", result);
    } catch (error) {
      console.log("All retry attempts failed:", error.message);
    }

    // Example 6: Complete swap workflow with utilities
    console.log("\n=== Complete Swap Workflow ===");
    
    const swapAmount = 0.1; // 0.1 STRK
    const swapAmountWei = toWei(swapAmount, 18);
    
    console.log(`Swapping ${swapAmount} STRK for USDC...`);
    
    // Get token info for formatting
    const strkInfo = autoswappr.getTokenInfo(TOKEN_ADDRESSES.STRK);
    const usdcInfo = autoswappr.getTokenInfo(TOKEN_ADDRESSES.USDC);
    
    if (strkInfo && usdcInfo) {
      console.log(`Input: ${formatTokenAmount(swapAmountWei, strkInfo.decimals, strkInfo.symbol)}`);
      
      // Check balance
      const balance = await autoswappr.getTokenBalance(TOKEN_ADDRESSES.STRK);
      const balanceFormatted = formatTokenAmount(
        balance.low + balance.high, 
        strkInfo.decimals, 
        strkInfo.symbol
      );
      console.log(`Balance: ${balanceFormatted}`);
      
      // Check allowance
      const allowance = await autoswappr.getTokenAllowance(TOKEN_ADDRESSES.STRK);
      const allowanceFormatted = formatTokenAmount(
        allowance.low + allowance.high,
        strkInfo.decimals,
        strkInfo.symbol
      );
      console.log(`Allowance: ${allowanceFormatted}`);
      
      // Execute swap with retry
      const swapResult = await retry(
        async () => {
          return await autoswappr.executeEkuboManualSwap(
            TOKEN_ADDRESSES.STRK,
            TOKEN_ADDRESSES.USDC,
            {
              amount: swapAmountWei,
              isToken1: false
            }
          );
        },
        2, // max attempts
        2000 // delay between attempts
      );
      
      console.log("Swap completed successfully!");
      console.log("Delta amount0:", swapResult.delta.amount0);
      console.log("Delta amount1:", swapResult.delta.amount1);
    }

  } catch (error) {
    console.error("Error in utilities example:", error);
  }
}

// Run the example
utilitiesExample(); 