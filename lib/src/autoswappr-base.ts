import { ethers } from 'ethers';
import { BASE_POOL_ABI } from './contracts/base-pool-abi';
import { USDC_ABI } from './contracts/usdc-abi';
import { ERC20_ABI } from './contracts/erc20-abi';
import { AERODOME_QUOTER_ABI } from './contracts/aerodrome-quoter-abi';
import { TOKEN_ADDRESSES } from './constants/pools';

const MIN_SQRT_RATIO = 4295128739n + 1n;
const MAX_SQRT_RATIO = 1461446703485210103287273052203988822378723970342n - 1n;

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
   * Estimates the output amount of cNGN for a given USDC input using the Quoter.
   * @param usdcAmount Amount of USDC to swap (in wei, considering decimals).
   * @returns Estimated cNGN output amount (BigInt).
   */
  async estimateCNGNOutput(usdcAmount: bigint): Promise<bigint> {
    try {
      const poolContract = new ethers.Contract(
        TOKEN_ADDRESSES.AERODROME_POOL_ADDRESS,
        BASE_POOL_ABI,
        this.provider
      );
      const fee = await poolContract.fee();

      const quoterContract = new ethers.Contract(
        TOKEN_ADDRESSES.AERODROME_QUOTER_ADDRESS,
        AERODOME_QUOTER_ABI,
        this.provider
      );

      // Quote with no price limit (0)
      const amountOut = await quoterContract.quoteExactInputSingle(
        TOKEN_ADDRESSES.AERODROME_USDC_ADDRESS,
        TOKEN_ADDRESSES.AERODROME_CNGN_ADDRESS,
        fee,
        usdcAmount,
        0
      );

      return amountOut;
    } catch (error) {
      throw new Error(
        `Failed to estimate output: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Swaps USDC for cNGN using the pool's swap function.
   * @param usdcAmount Amount of USDC to swap (in wei, considering decimals).
   * @param slippageToleranceBps Slippage tolerance in basis points (e.g., 50 = 0.5%).
   * @param recipient Optional recipient address, defaults to signer's address.
   * @param deadline Optional transaction deadline in seconds from now (default 10 minutes).
   * @returns Transaction response.
   */
  async swapUSDCForCNGN(
    usdcAmount: bigint,
    slippageToleranceBps: number = 50,
    recipient?: string,
    deadline: number = 600
  ): Promise<ethers.TransactionResponse> {
    if (!this.signer) {
      throw new Error('Signer is required for transactions');
    }

    try {
      const signerAddress = await this.signer.getAddress();
      const recipientAddr = recipient || signerAddress;

      // Contracts
      const usdcContract = new ethers.Contract(
        TOKEN_ADDRESSES.AERODROME_USDC_ADDRESS,
        ERC20_ABI,
        this.signer
      );
      const poolContract = new ethers.Contract(
        TOKEN_ADDRESSES.AERODROME_POOL_ADDRESS,
        BASE_POOL_ABI,
        this.signer
      );

      // Verify pool tokens
      const token0 = await poolContract.token0();
      const token1 = await poolContract.token1();
      if (
        token0.toLowerCase() !==
          TOKEN_ADDRESSES.AERODROME_CNGN_ADDRESS.toLowerCase() ||
        token1.toLowerCase() !==
          TOKEN_ADDRESSES.AERODROME_USDC_ADDRESS.toLowerCase()
      ) {
        throw new Error('Pool does not match USDC and cNGN tokens');
      }

      // Check and approve if necessary
      const allowance = await usdcContract.allowance(
        signerAddress,
        TOKEN_ADDRESSES.AERODROME_POOL_ADDRESS
      );
      if (allowance < usdcAmount) {
        const approveTx = await usdcContract.approve(
          TOKEN_ADDRESSES.AERODROME_POOL_ADDRESS,
          usdcAmount
        );
        await approveTx.wait();
      }

      // Get current sqrtPrice and fee
      const slot0 = await poolContract.slot0();
      const currentSqrtPriceX96 = slot0.sqrtPriceX96;
      const fee = await poolContract.fee();

      // Estimate output for slippage calculation
      const expectedAmountOut = await this.estimateCNGNOutput(usdcAmount);

      // Calculate minAmountOut
      const bps = BigInt(10000);
      const slippage = BigInt(slippageToleranceBps);
      const minAmountOut = (expectedAmountOut * (bps - slippage)) / bps;

      // Approximate sqrtPriceLimit for slippage protection
      // Since zeroForOne = false (swapping token1 to token0), add for max price
      const factor = bps + slippage / 2n; // Approximate sqrt(1 + slippage) ≈ 1 + slippage/2
      let sqrtPriceLimitX96 = (currentSqrtPriceX96 * factor) / bps;
      if (sqrtPriceLimitX96 > MAX_SQRT_RATIO) {
        sqrtPriceLimitX96 = MAX_SQRT_RATIO;
      }

      // Swap parameters
      const zeroForOne = false; // token1 (USDC) to token0 (cNGN)
      const amountSpecified = usdcAmount; // Positive for exact input
      const data = '0x'; // No callback data

      // Execute swap 
      const swapTx = await poolContract.swap(
        recipientAddr,
        zeroForOne,
        amountSpecified,
        sqrtPriceLimitX96,
        data
      );

      return swapTx;

      // NOTE: Aerodrome pool swap doesn't have deadline, but we can set tx deadline via gas params if needed
    } catch (error) {
      throw new Error(
        `Swap failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
