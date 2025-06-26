import { Contract } from "starknet";

/**
 * Ekubo i129 amount structure with magnitude and sign
 */
export interface I129 {
  mag: string; // Magnitude as string (u128)
  sign: boolean; // Sign (false = positive, true = negative)
}

/**
 * Ekubo swap parameters
 */
export interface SwapParameters {
  amount: I129; // Amount to swap with magnitude and sign
  sqrt_ratio_limit: string; // Price limit for the swap (u128)
  is_token1: boolean; // Whether the input token is token1
  skip_ahead: number; // Skip ahead parameter (u32)
}

/**
 * Ekubo pool key structure
 */
export interface PoolKey {
  token0: string; // First token in the pool
  token1: string; // Second token in the pool
  fee: string; // Pool fee in basis points (u128)
  tick_spacing: number; // Tick spacing for the pool (u32)
  extension: string; // Pool extension parameter (felt252)
}

/**
 * Ekubo delta structure for swap results
 */
export interface Delta {
  amount0: I129; // Amount of token0
  amount1: I129; // Amount of token1
}

/**
 * Swap data structure for ekubo_manual_swap function
 */
export interface SwapData {
  params: SwapParameters;
  pool_key: PoolKey;
  caller: string;
}

/**
 * Swap result structure returned by ekubo_manual_swap function
 */
export interface SwapResult {
  delta: Delta;
}

/**
 * Fee type enum
 */
export enum FeeType {
  Fixed = 0,
  Percentage = 1,
}

/**
 * Contract information structure
 */
export interface ContractInfo {
  fees_collector: string;
  fibrous_exchange_address: string;
  avnu_exchange_address: string;
  oracle_address: string;
  owner: string;
  fee_type: FeeType;
  percentage_fee: number;
}

/**
 * Swap successful event structure
 */
export interface SwapSuccessfulEvent {
  token_from_address: string;
  token_from_amount: { low: string; high: string };
  token_to_address: string;
  token_to_amount: { low: string; high: string };
  beneficiary: string;
  provider: string;
}

/**
 * Configuration for the AutoSwappr SDK
 */
export interface AutoSwapprConfig {
  contractAddress: string;
  rpcUrl: string;
  accountAddress: string;
  privateKey: string;
}

/**
 * Token information for supported tokens
 */
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

/**
 * Pool configuration for different token pairs
 */
export interface PoolConfig {
  token0: string;
  token1: string;
  fee: string;
  tick_spacing: number;
  extension: string;
  sqrt_ratio_limit: string;
}

/**
 * Swap options for configuring the swap
 */
export interface SwapOptions {
  amount: string; // Amount in wei (with decimals)
  isToken1?: boolean; // Whether input token is token1 (defaults to false)
  skipAhead?: number; // Skip ahead parameter (defaults to 0)
  sqrtRatioLimit?: string; // Custom sqrt ratio limit
}

/**
 * Error types for the SDK
 */
export enum AutoSwapprError {
  INSUFFICIENT_ALLOWANCE = "INSUFFICIENT_ALLOWANCE",
  UNSUPPORTED_TOKEN = "UNSUPPORTED_TOKEN",
  ZERO_AMOUNT = "ZERO_AMOUNT",
  INVALID_POOL_CONFIG = "INVALID_POOL_CONFIG",
  INSUFFICIENT_BALANCE = "INSUFFICIENT_BALANCE",
  SWAP_FAILED = "SWAP_FAILED",
  INVALID_INPUT = "INVALID_INPUT",
} 