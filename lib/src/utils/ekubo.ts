import { PoolConfig } from '../types';

/**
 * Response structure from Ekubo API for pools
 */
export interface EkuboPoolResponse {
  topPools: EkuboPool[];
}

/**
 * Individual pool data from Ekubo API
 */
export interface EkuboPool {
  fee: string;
  tick_spacing: number;
  extension: string;
  volume0_24h: string;
  volume1_24h: string;
  fees0_24h: string;
  fees1_24h: string;
  tvl0_total: string;
  tvl1_total: string;
  tvl0_delta_24h: string;
  tvl1_delta_24h: string;
  depth0: string;
  depth1: string;
  depth_percent: number;
}

/**
 * Fetches pools from the Ekubo API for a specific token pair
 * @param token0 First token address
 * @param token1 Second token address
 * @param options Optional parameters for fetching pools
 * @returns Promise with pool data from the API
 */
export async function fetchEkuboTopPools(
  token0: string,
  token1: string
): Promise<EkuboPoolResponse> {
  const baseUrl = 'https://mainnet-api.ekubo.org/pair';
  const url = new URL(`${baseUrl}/${token0}/${token1}/pools`);

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data as EkuboPoolResponse;
  } catch (error) {
    throw new Error(
      `Failed to fetch pools from Ekubo API: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Converts Ekubo pool data to the internal PoolConfig format
 * @param ekuboPool Pool data from Ekubo API
 * @returns PoolConfig object
 */
export function convertEkuboTopPoolToConfig(
  token0: string,
  token1: string,
  ekuboPool: EkuboPool
): PoolConfig {
  return {
    token0,
    token1,
    fee: ekuboPool.fee,
    tick_spacing: ekuboPool.tick_spacing,
    extension: ekuboPool.extension,
    sqrt_ratio_limit: '18446748437148339061',
  };
}

/**
 * Fetches and converts pools to PoolConfig format
 * @param token0 First token address
 * @param token1 Second token address
 * @returns Promise with array of PoolConfig objects
 */
export async function getTopPoolAsConfig(
  token0: string,
  token1: string
): Promise<PoolConfig> {
  const response = await fetchEkuboTopPools(token0, token1);
  return convertEkuboTopPoolToConfig(token0, token1, response.topPools[0]);
}
