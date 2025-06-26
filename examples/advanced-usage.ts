import { AutoSwappr, TOKEN_ADDRESSES, AutoSwapprError } from "../src";

/**
 * Advanced usage example for the AutoSwappr SDK
 * This example shows error handling, gas estimation, and event listening
 */

async function advancedUsageExample() {
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

    // Set up event listener for swap successful events
    autoswappr.onSwapSuccessful((event) => {
      console.log("🎉 Swap successful event received!");
      console.log("Token from:", event.token_from_address);
      console.log("Token to:", event.token_to_address);
      console.log("Amount received:", event.token_to_amount);
      console.log("Beneficiary:", event.beneficiary);
      console.log("Provider:", event.provider);
    });

    // Example 1: Swap with gas estimation
    console.log("\n=== Example 1: Swap with gas estimation ===");
    
    const swapOptions = {
      amount: "500000000000000000", // 0.5 STRK
      isToken1: false
    };

    // Estimate gas before executing swap
    const estimatedGas = await autoswappr.estimateSwapGas(
      TOKEN_ADDRESSES.STRK,
      TOKEN_ADDRESSES.USDC,
      swapOptions
    );
    console.log("Estimated gas:", estimatedGas);

    // Example 2: Error handling
    console.log("\n=== Example 2: Error handling ===");
    
    try {
      // Try to swap with zero amount (should fail)
      await autoswappr.executeEkuboManualSwap(
        TOKEN_ADDRESSES.STRK,
        TOKEN_ADDRESSES.USDC,
        { amount: "0" }
      );
    } catch (error) {
      if (error.message.includes(AutoSwapprError.ZERO_AMOUNT)) {
        console.log("✅ Correctly caught ZERO_AMOUNT error");
      } else {
        console.log("❌ Unexpected error:", error.message);
      }
    }

    // Example 3: Check multiple token pairs
    console.log("\n=== Example 3: Check multiple token pairs ===");
    
    const tokenPairs = [
      { token0: TOKEN_ADDRESSES.STRK, token1: TOKEN_ADDRESSES.USDC, name: "STRK/USDC" },
      { token0: TOKEN_ADDRESSES.STRK, token1: TOKEN_ADDRESSES.USDT, name: "STRK/USDT" },
      { token0: TOKEN_ADDRESSES.ETH, token1: TOKEN_ADDRESSES.USDC, name: "ETH/USDC" },
      { token0: TOKEN_ADDRESSES.ETH, token1: TOKEN_ADDRESSES.USDT, name: "ETH/USDT" }
    ];

    for (const pair of tokenPairs) {
      const poolConfig = autoswappr.getPoolConfig(pair.token0, pair.token1);
      if (poolConfig) {
        console.log(`✅ ${pair.name} pool found`);
        console.log(`   Fee: ${poolConfig.fee}`);
        console.log(`   Tick spacing: ${poolConfig.tick_spacing}`);
      } else {
        console.log(`❌ ${pair.name} pool not found`);
      }
    }

    // Example 4: Batch operations
    console.log("\n=== Example 4: Batch operations ===");
    
    const tokens = [TOKEN_ADDRESSES.STRK, TOKEN_ADDRESSES.ETH, TOKEN_ADDRESSES.USDC, TOKEN_ADDRESSES.USDT];
    
    // Check support status for all tokens
    const supportPromises = tokens.map(token => autoswappr.isTokenSupported(token));
    const supportResults = await Promise.all(supportPromises);
    
    console.log("Token support status:");
    tokens.forEach((token, index) => {
      const tokenInfo = autoswappr.getTokenInfo(token);
      const supported = supportResults[index].supported;
      console.log(`   ${tokenInfo?.symbol || 'Unknown'}: ${supported ? '✅' : '❌'}`);
    });

    // Example 5: Custom pool configuration
    console.log("\n=== Example 5: Custom pool configuration ===");
    
    // Create custom swap data with specific parameters
    const customSwapData = autoswappr.createSwapData(
      TOKEN_ADDRESSES.STRK,
      TOKEN_ADDRESSES.USDC,
      {
        amount: "1000000000000000000", // 1 STRK
        isToken1: false,
        skipAhead: 0,
        sqrtRatioLimit: "18446748437148339061" // Custom sqrt ratio limit
      }
    );
    
    console.log("Custom swap data created:");
    console.log(JSON.stringify(customSwapData, null, 2));

    // Clean up event listener
    autoswappr.offSwapSuccessful();

  } catch (error) {
    console.error("Error in advanced example:", error);
  }
}

// Run the advanced example
advancedUsageExample(); 