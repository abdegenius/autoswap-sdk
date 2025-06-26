import { PoolConfig } from "../types";

/**
 * Predefined pool configurations for common token pairs
 * These are based on the actual Ekubo pool configurations
 */

export const POOL_CONFIGS: Record<string, PoolConfig> = {
  // STRK/USDC pool
  "STRK_USDC": {
    token0: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK
    token1: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", // USDC
    fee: "170141183460469235273462165868118016",
    tick_spacing: 1000,
    extension: "0",
    sqrt_ratio_limit: "18446748437148339061"
  },

  // STRK/USDT pool (different configuration)
  "STRK_USDT": {
    token0: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK
    token1: "0x068f5c6a61730768477ced7eef7680a434a851905eeff58ee8ba2115ada38e3", // USDT
    fee: "34028236692093847977029636859101184",
    tick_spacing: 354892,
    extension: "1919341413504682506464537888213340599793174343085035697059721110464975114204",
    sqrt_ratio_limit: "18446748437148339061"
  },

  // ETH/USDC pool
  "ETH_USDC": {
    token0: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH
    token1: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", // USDC
    fee: "170141183460469235273462165868118016",
    tick_spacing: 1000,
    extension: "0",
    sqrt_ratio_limit: "18446748437148339061"
  },

  // ETH/USDT pool
  "ETH_USDT": {
    token0: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7", // ETH
    token1: "0x068f5c6a61730768477ced7eef7680a434a851905eeff58ee8ba2115ada38e3", // USDT
    fee: "170141183460469235273462165868118016",
    tick_spacing: 1000,
    extension: "0",
    sqrt_ratio_limit: "18446748437148339061"
  }
};

/**
 * Token addresses for common tokens
 */
export const TOKEN_ADDRESSES = {
  STRK: "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d",
  ETH: "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7",
  USDC: "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8",
  USDT: "0x068f5c6a61730768477ced7eef7680a434a851905eeff58ee8ba2115ada38e3"
};

/**
 * Token information for supported tokens
 */
export const TOKEN_INFO = {
  [TOKEN_ADDRESSES.STRK]: {
    address: TOKEN_ADDRESSES.STRK,
    symbol: "STRK",
    decimals: 18,
    name: "Starknet Token"
  },
  [TOKEN_ADDRESSES.ETH]: {
    address: TOKEN_ADDRESSES.ETH,
    symbol: "ETH",
    decimals: 18,
    name: "Ether"
  },
  [TOKEN_ADDRESSES.USDC]: {
    address: TOKEN_ADDRESSES.USDC,
    symbol: "USDC",
    decimals: 6,
    name: "USD Coin"
  },
  [TOKEN_ADDRESSES.USDT]: {
    address: TOKEN_ADDRESSES.USDT,
    symbol: "USDT",
    decimals: 6,
    name: "Tether USD"
  }
};

/**
 * Get pool configuration for a token pair
 * @param token0 First token address
 * @param token1 Second token address
 * @returns Pool configuration or null if not found
 */
export function getPoolConfig(token0: string, token1: string): PoolConfig | null {
  // Check direct match
  const directKey = `${token0}_${token1}`;
  if (POOL_CONFIGS[directKey]) {
    return POOL_CONFIGS[directKey];
  }

  // Check reverse match
  const reverseKey = `${token1}_${token0}`;
  if (POOL_CONFIGS[reverseKey]) {
    const config = POOL_CONFIGS[reverseKey];
    return {
      ...config,
      token0: config.token1,
      token1: config.token0
    };
  }

  return null;
}

/**
 * Get token info by address
 * @param address Token address
 * @returns Token info or null if not found
 */
export function getTokenInfo(address: string) {
  return TOKEN_INFO[address] || null;
} 