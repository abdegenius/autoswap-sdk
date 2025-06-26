import { uint256 } from "starknet";

/**
 * Utility functions for the AutoSwappr SDK
 */

/**
 * Convert a decimal amount to wei (raw token amount)
 * @param amount Decimal amount (e.g., 1.5)
 * @param decimals Number of decimal places (e.g., 18 for STRK, 6 for USDC)
 * @returns Amount in wei as string
 */
export function toWei(amount: number | string, decimals: number): string {
  const amountStr = amount.toString();
  const [whole, fraction = ""] = amountStr.split(".");
  
  // Pad fraction with zeros if needed
  const paddedFraction = fraction.padEnd(decimals, "0").slice(0, decimals);
  
  return whole + paddedFraction;
}

/**
 * Convert wei amount to decimal
 * @param weiAmount Amount in wei as string
 * @param decimals Number of decimal places
 * @returns Decimal amount as number
 */
export function fromWei(weiAmount: string, decimals: number): number {
  const weiStr = weiAmount.toString();
  
  if (weiStr.length <= decimals) {
    // Pad with leading zeros
    const padded = weiStr.padStart(decimals + 1, "0");
    return parseFloat("0." + padded.slice(-decimals));
  }
  
  const whole = weiStr.slice(0, -decimals);
  const fraction = weiStr.slice(-decimals);
  
  return parseFloat(whole + "." + fraction);
}

/**
 * Format token amount for display
 * @param weiAmount Amount in wei as string
 * @param decimals Number of decimal places
 * @param symbol Token symbol
 * @returns Formatted string
 */
export function formatTokenAmount(weiAmount: string, decimals: number, symbol: string): string {
  const amount = fromWei(weiAmount, decimals);
  return `${amount.toLocaleString()} ${symbol}`;
}

/**
 * Validate token address format
 * @param address Token address to validate
 * @returns True if valid, false otherwise
 */
export function isValidTokenAddress(address: string): boolean {
  // Starknet addresses are 64 characters long and start with 0x
  return /^0x[a-fA-F0-9]{64}$/.test(address);
}

/**
 * Validate amount is positive and non-zero
 * @param amount Amount to validate
 * @returns True if valid, false otherwise
 */
export function isValidAmount(amount: string): boolean {
  const num = parseFloat(amount);
  return !isNaN(num) && num > 0;
}

/**
 * Convert Uint256 to string
 * @param uint256Value Uint256 object
 * @returns String representation
 */
export function uint256ToString(uint256Value: { low: string; high: string }): string {
  return uint256.uint256ToBN(uint256Value).toString();
}

/**
 * Convert string to Uint256
 * @param value String value
 * @returns Uint256 object
 */
export function stringToUint256(value: string): { low: string; high: string } {
  const uint256Value = uint256.bnToUint256(value);
  return {
    low: uint256Value.low.toString(),
    high: uint256Value.high.toString()
  };
}

/**
 * Calculate percentage of an amount
 * @param amount Base amount as string
 * @param percentage Percentage (e.g., 1.5 for 1.5%)
 * @returns Calculated amount as string
 */
export function calculatePercentage(amount: string, percentage: number): string {
  const amountBN = BigInt(amount);
  const percentageBN = BigInt(Math.floor(percentage * 100)); // Convert to basis points
  const result = (amountBN * percentageBN) / BigInt(10000);
  return result.toString();
}

/**
 * Calculate slippage tolerance
 * @param amount Base amount as string
 * @param slippagePercentage Slippage percentage (e.g., 0.5 for 0.5%)
 * @returns Minimum amount after slippage as string
 */
export function calculateSlippageTolerance(amount: string, slippagePercentage: number): string {
  const amountBN = BigInt(amount);
  const slippageBN = BigInt(Math.floor(slippagePercentage * 100));
  const tolerance = (amountBN * slippageBN) / BigInt(10000);
  return (amountBN - tolerance).toString();
}

/**
 * Sleep utility for async operations
 * @param ms Milliseconds to sleep
 * @returns Promise that resolves after specified time
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Retry utility for failed operations
 * @param fn Function to retry
 * @param maxAttempts Maximum number of attempts
 * @param delay Delay between attempts in milliseconds
 * @returns Promise that resolves with function result
 */
export async function retry<T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: Error;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === maxAttempts) {
        throw lastError;
      }
      
      console.log(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }
  
  throw lastError!;
} 