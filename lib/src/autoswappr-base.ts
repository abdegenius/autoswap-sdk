import { ethers } from 'ethers';
import { BASE_POOL_ABI } from './contracts/base-pool-abi';
import { ERC20_ABI } from './contracts/erc20-abi';
import { AERODROME_QUOTER_ABI } from './contracts/aerodrome-quoter-abi';
import { AERODROME_ADDRESSES } from './constants/pools';
import { AutoSwapprError } from './types';
import { AERODROME_FACTORY_ABI } from './contracts/aerodrome-factory-abi';

const MAX_SQRT_RATIO = BigInt(
  '146573768332450260990424066460171061888991027224671179884494'
);

export class AutoSwapprBase {
  private readonly provider: ethers.Provider;
  private readonly signer?: ethers.Signer;

  constructor(provider: ethers.Provider, signer?: ethers.Signer) {
    if (!provider) {
      throw new Error('Provider is required');
    }
    this.provider = provider;
    this.signer = signer;
  }

  /**
   * Determines if this is a stable or volatile pool
   */
  private async getPoolType(
    poolAddress: string
  ): Promise<'stable' | 'volatile'> {
    try {
      const poolContract = new ethers.Contract(
        ethers.getAddress(poolAddress),
        BASE_POOL_ABI,
        this.provider
      );

      // Try to call stable() function - if it exists and returns true, it's a stable pool
      try {
        const isStable = await poolContract.stable();
        return isStable ? 'stable' : 'volatile';
      } catch {
        // If stable() doesn't exist, it's likely a V3-style pool
        return 'volatile';
      }
    } catch (error) {
      console.warn('Could not determine pool type, defaulting to volatile');
      return 'volatile';
    }
  }

  /**
   * Gets the correct token order for the pool
   */
  private async getTokenOrder(poolAddress: string): Promise<{
    token0: string;
    token1: string;
    usdcIsToken0: boolean;
  }> {
    const poolContract = new ethers.Contract(
      ethers.getAddress(poolAddress),
      BASE_POOL_ABI,
      this.provider
    );

    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();

    const usdcAddress = ethers.getAddress(AERODROME_ADDRESSES.USDC_ADDRESS);
    const usdcIsToken0 = token0.toLowerCase() === usdcAddress.toLowerCase();

    return {
      token0,
      token1,
      usdcIsToken0,
    };
  }

  /**
   * Estimates the output amount of cNGN for a given USDC input using the Quoter.
   */
  async estimateCNGNOutput(usdcAmount: bigint): Promise<bigint> {
    if (!this.signer) {
      throw new Error(AutoSwapprError.SIGNER_REQUIRED);
    }

    try {
      const poolAddress = AERODROME_ADDRESSES.POOL_ADDRESS;
      const poolType = await this.getPoolType(poolAddress);

      const quoterContract = new ethers.Contract(
        ethers.getAddress(AERODROME_ADDRESSES.QUOTER_ADDRESS),
        AERODROME_QUOTER_ABI,
        this.signer
      );

      if (!quoterContract) {
        throw new Error(AutoSwapprError.INVALID_QUOTER_CONFIG);
      }

      let amountOut: bigint;

      if (poolType === 'stable') {
        // Use getAmountOut for stable pools
        try {
          amountOut = await quoterContract.getAmountOut(
            usdcAmount,
            ethers.getAddress(AERODROME_ADDRESSES.USDC_ADDRESS),
            ethers.getAddress(AERODROME_ADDRESSES.CNGN_ADDRESS)
          );
        } catch (error) {
          console.warn('Quoter getAmountOut failed, trying alternative method');
          // Fallback to direct pool calculation
          const poolContract = new ethers.Contract(
            ethers.getAddress(poolAddress),
            BASE_POOL_ABI,
            this.provider
          );
          amountOut = await poolContract.getAmountOut(
            usdcAmount,
            ethers.getAddress(AERODROME_ADDRESSES.USDC_ADDRESS)
          );
        }
      } else {
        // Use quoteExactInputSingle for volatile/V3 pools
        const poolContract = new ethers.Contract(
          ethers.getAddress(poolAddress),
          BASE_POOL_ABI,
          this.provider
        );

        const tickSpacing = await poolContract.tickSpacing();

        const params = {
          tokenIn: ethers.getAddress(AERODROME_ADDRESSES.USDC_ADDRESS),
          tokenOut: ethers.getAddress(AERODROME_ADDRESSES.CNGN_ADDRESS),
          amountIn: usdcAmount,
          tickSpacing: tickSpacing,
          sqrtPriceLimitX96: 0,
        };

        const result = await quoterContract.quoteExactInputSingle(params);
        amountOut = result[0]; // First element is amountOut
      }
      return amountOut;
    } catch (error) {
      console.error('EstimateCNGNOutput error:', error);
      throw new Error(
        `Failed to estimate output: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Swaps USDC for cNGN using the appropriate swap method based on pool type.
   */
  async swapUSDCForCNGN(
    usdcAmount: bigint,
    slippageToleranceBps: number = 50,
    recipient?: string,
    deadline: number = 600
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error(AutoSwapprError.SIGNER_REQUIRED);
    }

    try {
      const signerAddress = await this.signer.getAddress();
      const recipientAddr = recipient || signerAddress;

      if (!usdcAmount || usdcAmount === 0n) {
        throw new Error(AutoSwapprError.ZERO_AMOUNT);
      }

      const poolAddress = AERODROME_ADDRESSES.POOL_ADDRESS;
      console.log('Using Pool Address:', poolAddress);

      const poolType = await this.getPoolType(poolAddress);
      console.log('Pool Type:', poolType);

      const tokenOrder = await this.getTokenOrder(poolAddress);
      console.log('Token Order:', tokenOrder);

      // Contracts
      const usdcContract = new ethers.Contract(
        ethers.getAddress(AERODROME_ADDRESSES.USDC_ADDRESS),
        ERC20_ABI,
        this.signer
      );

      const poolContract = new ethers.Contract(
        ethers.getAddress(poolAddress),
        BASE_POOL_ABI,
        this.signer
      );

      // Check USDC balance
      console.log('Checking USDC balance...');
      const usdcBalance = await usdcContract.balanceOf(signerAddress);
      console.log('USDC Balance:', ethers.formatUnits(usdcBalance, 6), 'USDC');

      if (usdcBalance < usdcAmount) {
        throw new Error(
          `Insufficient USDC: have ${ethers.formatUnits(usdcBalance, 6)}, need ${ethers.formatUnits(usdcAmount, 6)}`
        );
      }

      // Check and approve if needed
      const allowance = await usdcContract.allowance(
        signerAddress,
        poolAddress
      );
      console.log('Allowance:', ethers.formatUnits(allowance, 6), 'USDC');

      if (allowance < usdcAmount) {
        console.log('Approving USDC...');
        const approveTx = await usdcContract.approve(poolAddress, usdcAmount);
        await approveTx.wait();
        console.log('Approval confirmed:', approveTx.hash);
      }

      // Estimate output
      const expectedAmountOut = await this.estimateCNGNOutput(usdcAmount);

      // Calculate minAmountOut with slippage
      const bps = BigInt(10000);
      const slippage = BigInt(slippageToleranceBps);
      const minAmountOut = (expectedAmountOut * (bps - slippage)) / bps;

      // Calculate deadline
      const currentTime = Math.floor(Date.now() / 1000);
      const transactionDeadline = currentTime + deadline;

      let swapTx: ethers.TransactionResponse;

      if (poolType === 'stable') {
        // Use V2-style swap for stable pools
        console.log('Executing stable pool swap...');

        // For stable pools, use the swap function with routes
        const routes = [
          {
            from: AERODROME_ADDRESSES.USDC_ADDRESS,
            to: AERODROME_ADDRESSES.CNGN_ADDRESS,
            stable: true,
          },
        ];

        try {
          swapTx = await poolContract.swap(
            usdcAmount,
            minAmountOut,
            routes,
            recipientAddr,
            transactionDeadline,
            { gasLimit: 300000 }
          );
        } catch (error) {
          // Fallback to simpler swap method
          console.log('Trying alternative swap method for stable pool...');
          swapTx = await poolContract.swapExact(
            usdcAmount,
            minAmountOut,
            recipientAddr,
            transactionDeadline,
            { gasLimit: 300000 }
          );
        }
      } else {
        // Use V3-style swap for volatile pools
        console.log('Executing volatile pool swap...');

        try {
          // Get current price for sqrtPriceLimitX96
          const slot0 = await poolContract.slot0();
          const currentSqrtPriceX96 = slot0.sqrtPriceX96;

          // Set price limit (allow 10% price impact)
          const priceLimitFactor = tokenOrder.usdcIsToken0
            ? BigInt(10000) + BigInt(1000)
            : BigInt(10000) - BigInt(1000);
          let sqrtPriceLimitX96 =
            (currentSqrtPriceX96 * priceLimitFactor) / BigInt(10000);

          // Ensure within bounds
          if (sqrtPriceLimitX96 >= MAX_SQRT_RATIO) {
            sqrtPriceLimitX96 = MAX_SQRT_RATIO - BigInt(1000);
          }

          const zeroForOne = tokenOrder.usdcIsToken0;

          swapTx = await poolContract.swap(
            recipientAddr,
            zeroForOne,
            usdcAmount,
            sqrtPriceLimitX96,
            '0x',
            { gasLimit: 400000 }
          );
        } catch (error) {
          console.error('V3-style swap failed:', error);

          // Try alternative swap method
          console.log('Trying swapExactTokensForTokens...');
          swapTx = await poolContract.swapExactTokensForTokens(
            usdcAmount,
            minAmountOut,
            [
              AERODROME_ADDRESSES.USDC_ADDRESS,
              AERODROME_ADDRESSES.CNGN_ADDRESS,
            ],
            recipientAddr,
            transactionDeadline,
            { gasLimit: 300000 }
          );
        }
      }

      console.log('Swap Tx Hash:', swapTx.hash);
      return swapTx;
    } catch (error) {
      console.error(
        `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      throw error;
    }
  }
}
