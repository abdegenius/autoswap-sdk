import { Account, cairo, CallData, Contract, RpcProvider } from "starknet";
import {
  AutoSwapprConfig,
  SwapData,
  SwapOptions,
  ContractInfo,
  PoolConfig,
  AutoSwapprError
} from "./types";
import { AUTOSWAPPR_ABI } from "./contracts/autoswappr-abi";
import { getPoolConfig } from "./constants/pools";

/**
 * AutoSwappr SDK for interacting with the AutoSwappr Contract
 */
export class AutoSwappr {
  private provider: RpcProvider;
  private account: Account;
  private autoswapprContract: Contract;
  private config: AutoSwapprConfig;

  constructor(config: AutoSwapprConfig) {
    this.config = config;
    this.provider = new RpcProvider({ nodeUrl: config.rpcUrl });
    this.account = new Account(
      this.provider,
      config.accountAddress,
      config.privateKey
    );

    this.autoswapprContract = new Contract(
      AUTOSWAPPR_ABI,
      config.contractAddress,
      this.account
    );
  }

  /**
   * Get contract information
   * @returns Contract information including addresses and fee configuration
   */
  async getContractInfo(): Promise<ContractInfo> {
    try {
      const result = await this.autoswapprContract.contract_parameters();
      return {
        fees_collector: result.fees_collector,
        fibrous_exchange_address: result.fibrous_exchange_address,
        avnu_exchange_address: result.avnu_exchange_address,
        oracle_address: result.oracle_address,
        owner: result.owner,
        fee_type: result.fee_type,
        percentage_fee: result.percentage_fee
      };
    } catch (error) {
      throw new Error(`Failed to get contract info: ${error}`);
    }
  }

  /**
   * Get pool configuration for a token pair
   * @param token0 First token address
   * @param token1 Second token address
   * @returns Pool configuration or null if not found
   */
  getPoolConfig(token0: string, token1: string): PoolConfig | null {
    return getPoolConfig(token0, token1);
  }

  /**
   * Create swap data for ekubo_manual_swap
   * @param tokenIn Input token address
   * @param tokenOut Output token address
   * @param options Swap options
   * @returns SwapData object
   */
  createSwapData(
    tokenIn: string,
    tokenOut: string,
    options: SwapOptions
  ): SwapData {
    // Get pool configuration
    const poolConfig = this.getPoolConfig(tokenIn, tokenOut);
    if (!poolConfig) {
      throw new Error(AutoSwapprError.INVALID_POOL_CONFIG);
    }

    // Determine if input token is token1
    const isToken1 = options.isToken1 ?? tokenIn === poolConfig.token1;

    // Create swap parameters
    const swapParams = {
      amount: {
        mag: cairo.uint256(options.amount),
        sign: false
      },
      sqrt_ratio_limit: options.sqrtRatioLimit || poolConfig.sqrt_ratio_limit,
      is_token1: isToken1,
      skip_ahead: options.skipAhead || 0
    };

    // Create pool key
    const poolKey = {
      token0: poolConfig.token0,
      token1: poolConfig.token1,
      fee: poolConfig.fee,
      tick_spacing: poolConfig.tick_spacing,
      extension: poolConfig.extension
    };

    return {
      params: swapParams,
      pool_key: poolKey,
      caller: this.account.address
    };
  }

  /**
   * Execute swap
   * @param tokenIn Input token address
   * @param tokenOut Output token address
   * @param options Swap options
   * @returns Swap result
   */
  async executeSwap(tokenIn: string, tokenOut: string, options: SwapOptions) {
    try {
      // Validate inputs
      if (!options.amount || options.amount === "0") {
        throw new Error(AutoSwapprError.ZERO_AMOUNT);
      }

      // Create swap data
      const swapData = this.createSwapData(tokenIn, tokenOut, options);

      const approveCall = {
        contractAddress: tokenIn,
        entrypoint: "approve",
        calldata: CallData.compile({
          spender: this.config.contractAddress,
          amount: cairo.uint256(options.amount)
        })
      };

      const swapCall = {
        contractAddress: this.config.contractAddress,
        entrypoint: "ekubo_manual_swap",
        calldata: CallData.compile({
          swapData
        })
      };

      const result = await this.account.execute(
        [approveCall, swapCall],
        undefined,
        {
          maxFee: "100000000000000"
        }
      );

      return { result };
    } catch (error) {
      console.error("Swap failed:", error);
      throw error;
    }
  }
}
