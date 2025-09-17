import { ethers } from 'ethers';
import { AutoSwapprBase } from '../src/autoswappr-base';
import { AERODROME_ADDRESSES } from '../src/constants/pools';
import { ERC20_ABI } from '../src/contracts/erc20-abi';
import { BASE_POOL_ABI } from '../src/contracts/base-pool-abi';

const provider = new ethers.JsonRpcProvider(
  'https://base-mainnet.g.alchemy.com/v2/R5lM3z9hqTvwIho_42szo'
);

const private_key =
  '10793503651efe4a27a5f8d13bf06e3a7c456bea7b982f02b1d5d164f6b8ed11';
const signer = new ethers.Wallet(private_key, provider);

async function testSwap() {
  try {
    console.log('Initializing AutoSwappr...');
    const sdk = new AutoSwapprBase(provider, signer);

    // Start with a smaller amount for testing
    const usdcAmount = 1_000_000n; // 1 USDC
    console.log(`Testing swap of ${ethers.formatUnits(usdcAmount, 6)} USDC`);

    // First, let's verify our wallet has USDC
    const usdcContract = new ethers.Contract(
      AERODROME_ADDRESSES.USDC_ADDRESS,
      ERC20_ABI,
      provider
    );

    const balance = await usdcContract.balanceOf(await signer.getAddress());
    const symbol = await usdcContract.symbol();
    console.log(`Wallet ${symbol} balance: ${ethers.formatUnits(balance, 6)}`);

    if (balance < usdcAmount) {
      console.error(
        `Insufficient ${symbol} balance. Need at least ${ethers.formatUnits(usdcAmount, 6)} ${symbol}`
      );
      return;
    }

    // Test estimation first
    console.log('\nTesting price estimation...');
    try {
      const estimatedOutput = await sdk.estimateCNGNOutput(usdcAmount);
      console.log(
        'Estimation successful:',
        ethers.formatUnits(estimatedOutput, 18),
        'cNGN'
      );

      // If estimation works, proceed with actual swap
      console.log('\nProceeding with swap...');
      const tx = await sdk.swapUSDCForCNGN(
        usdcAmount,
        100, // 1% slippage
        undefined, // use signer address, will be set on swap
        1800 // 30 minutes deadline
      );

      console.log('Swap transaction submitted:', tx.hash);
      console.log('Waiting for confirmation...');

      const receipt = await tx.wait();
      console.log('Swap completed successfully!');
      console.log('Swap receipt:', receipt);
      console.log('Block:', receipt?.blockNumber);
      console.log('Gas used:', receipt?.gasUsed.toString());
    } catch (estimationError) {
      console.error('Price estimation failed:', estimationError);

      // If estimation fails, the pool might not exist or have different parameters
      console.log('\nTrying to diagnose the issue...');

      // Check if pool exists and has the expected tokens
      const poolContract = new ethers.Contract(
        AERODROME_ADDRESSES.POOL_ADDRESS,
        BASE_POOL_ABI,
        provider
      );

      try {
        const token0 = await poolContract.token0();
        const token1 = await poolContract.token1();
        const liquidity = await poolContract.liquidity();

        console.log('Pool token0:', token0);
        console.log('Pool token1:', token1);
        console.log('Expected USDC:', AERODROME_ADDRESSES.USDC_ADDRESS);
        console.log('Expected cNGN:', AERODROME_ADDRESSES.CNGN_ADDRESS);
        console.log('Pool liquidity:', liquidity.toString());

        if (liquidity === 0n) {
          console.error('Pool has no liquidity!');
        }
      } catch (poolError) {
        console.error('Could not read pool information:', poolError);
        console.log(
          'The pool address might be incorrect or the pool might not exist.'
        );
      }
    }
  } catch (error) {
    console.error('Test failed with error:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
  }
}

async function main() {
  console.log('Starting Aerodrome swap test...');
  console.log('Network: Base Mainnet');
  console.log('Pool Address:', AERODROME_ADDRESSES.POOL_ADDRESS);
  console.log('USDC Address:', AERODROME_ADDRESSES.USDC_ADDRESS);
  console.log('cNGN Address:', AERODROME_ADDRESSES.CNGN_ADDRESS);
  console.log('Wallet Address:', await signer.getAddress());

  await testSwap();
}

main().catch(console.error);
