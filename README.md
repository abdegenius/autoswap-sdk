# AutoSwappr SDK

A TypeScript SDK for interacting with the AutoSwappr contract's `ekubo_manual_swap` function on Starknet.

## Features

- 🔄 Execute Ekubo manual swaps
- 💰 Token approval and balance management
- ⛽ Gas estimation
- 📊 Pool configuration management
- 🎯 Event listening for swap success
- 🛡️ Comprehensive error handling
- 📝 TypeScript support with full type definitions

## Installation

```bash
npm install autoswap-sdk
```

## Quick Start

```typescript
import { AutoSwappr, TOKEN_ADDRESSES } from "autoswappr-sdk";

// Initialize the SDK
const autoswappr = new AutoSwappr({
  contractAddress: "AUTOSWAPPR_CONTRACT_ADDRESS",
  rpcUrl: "https://starknet-mainnet.public.blastapi.io",
  accountAddress: "YOUR_ACCOUNT_ADDRESS",
  privateKey: "YOUR_PRIVATE_KEY"
});

// Approve tokens
await autoswappr.approveTokens(TOKEN_ADDRESSES.STRK, "1000000000000000000");

// Execute swap
const result = await autoswappr.executeEkuboManualSwap(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  {
    amount: "1000000000000000000", // 1 STRK
    isToken1: false
  }
);

console.log("Swap result:", result);
```

## API Reference

### AutoSwappr Class

#### Constructor

```typescript
new AutoSwappr(config: AutoSwapprConfig)
```

**Parameters:**

- `config.contractAddress`: AutoSwappr contract address
- `config.rpcUrl`: Starknet RPC URL
- `config.accountAddress`: Your account address
- `config.privateKey`: Your private key

#### Methods

##### `executeEkuboManualSwap(tokenIn, tokenOut, options)`

Execute a manual swap on Ekubo.

```typescript
const result = await autoswappr.executeEkuboManualSwap(
  "0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d", // STRK
  "0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8", // USDC
  {
    amount: "1000000000000000000", // Amount in wei
    isToken1: false, // Whether input token is token1
    skipAhead: 0, // Skip ahead parameter
    sqrtRatioLimit: "18446748437148339061" // Custom price limit
  }
);
```

##### `executeEkuboManualSwapWithMaxFee(tokenIn, tokenOut, options, maxFee?)`

Execute a manual swap with custom max fee to avoid simulation_flags issues.

```typescript
const result = await autoswappr.executeEkuboManualSwapWithMaxFee(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  {
    amount: "1000000000000000000", // Amount in wei
    isToken1: false
  },
  "0x200000000000000" // Custom max fee (0.2 ETH in wei)
);
```

**Note**: This method is useful when encountering `simulation_flags` errors with certain RPC providers. It allows you to specify a custom max fee instead of relying on automatic fee estimation.

##### `approveTokens(tokenAddress, amount)`

Approve tokens for the AutoSwappr contract.

```typescript
await autoswappr.approveTokens(
  TOKEN_ADDRESSES.STRK,
  "1000000000000000000" // Amount in wei
);
```

##### `getTokenBalance(tokenAddress)`

Get token balance for the connected account.

```typescript
const balance = await autoswappr.getTokenBalance(TOKEN_ADDRESSES.STRK);
```

##### `getTokenAllowance(tokenAddress)`

Get token allowance for the AutoSwappr contract.

```typescript
const allowance = await autoswappr.getTokenAllowance(TOKEN_ADDRESSES.STRK);
```

##### `estimateSwapGas(tokenIn, tokenOut, options)`

Estimate gas for a swap operation.

```typescript
const gas = await autoswappr.estimateSwapGas(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  { amount: "1000000000000000000" }
);
```

##### `isTokenSupported(tokenAddress)`

Check if a token is supported by the contract.

```typescript
const { supported, priceFeedId } = await autoswappr.isTokenSupported(
  TOKEN_ADDRESSES.STRK
);
```

##### `getContractInfo()`

Get contract information including addresses and fee configuration.

```typescript
const info = await autoswappr.getContractInfo();
```

##### `createSwapData(tokenIn, tokenOut, options)`

Create swap data object for manual execution.

```typescript
const swapData = autoswappr.createSwapData(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  { amount: "1000000000000000000" }
);
```

##### Event Listening

```typescript
// Listen for swap successful events
autoswappr.onSwapSuccessful((event) => {
  console.log("Swap successful:", event);
});

// Remove event listener
autoswappr.offSwapSuccessful();
```

## Supported Token Pairs

The SDK includes predefined configurations for the following token pairs:

- **STRK/USDC**: Standard pool with 0.05% fee
- **STRK/USDT**: Pool with 0.01% fee and custom tick spacing
- **ETH/USDC**: Standard pool with 0.05% fee
- **ETH/USDT**: Standard pool with 0.05% fee

## Token Addresses

```typescript
import { TOKEN_ADDRESSES } from "autoswappr-sdk";

console.log(TOKEN_ADDRESSES.STRK); // 0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d
console.log(TOKEN_ADDRESSES.ETH); // 0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7
console.log(TOKEN_ADDRESSES.USDC); // 0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8
console.log(TOKEN_ADDRESSES.USDT); // 0x068f5c6a61730768477ced7eef7680a434a851905eeff58ee8ba2115ada38e3
```

## Error Handling

The SDK provides comprehensive error handling with specific error types:

```typescript
import { AutoSwapprError } from "autoswappr-sdk";

try {
  await autoswappr.executeEkuboManualSwap(tokenIn, tokenOut, options);
} catch (error) {
  if (error.message.includes(AutoSwapprError.INSUFFICIENT_ALLOWANCE)) {
    // Handle insufficient allowance
  } else if (error.message.includes(AutoSwapprError.UNSUPPORTED_TOKEN)) {
    // Handle unsupported token
  } else if (error.message.includes(AutoSwapprError.ZERO_AMOUNT)) {
    // Handle zero amount
  }
}
```

## Troubleshooting

### Simulation Flags Error

If you encounter an error like `missing field: "simulation_flags"`, this is a known issue with certain RPC providers and newer versions of Starknet. Use the `executeEkuboManualSwapWithMaxFee` method instead:

```typescript
// Instead of this:
await autoswappr.executeEkuboManualSwap(tokenIn, tokenOut, options);

// Use this:
await autoswappr.executeEkuboManualSwapWithMaxFee(
  tokenIn,
  tokenOut,
  options,
  "0x200000000000000" // Custom max fee
);
```

### Gas Estimation Failures

If gas estimation fails, the SDK will fall back to a reasonable default value. You can also set a custom max fee manually:

```typescript
// Set a higher max fee if needed
const result = await autoswappr.executeEkuboManualSwapWithMaxFee(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  { amount: "1000000000000000000" },
  "0x500000000000000" // 0.5 ETH max fee
);
```

### RPC Provider Issues

If you're experiencing issues with a specific RPC provider, try switching to a different one:

```typescript
const config = {
  // ... other config
  rpcUrl: "https://alpha-mainnet.starknet.io", // Alternative RPC
  // or
  rpcUrl: "https://starknet-mainnet.infura.io/v3/YOUR_PROJECT_ID"
};
```

## Examples

### Basic Usage

```typescript
import { AutoSwappr, TOKEN_ADDRESSES } from "autoswappr-sdk";

const autoswappr = new AutoSwappr({
  contractAddress: "0xYOUR_CONTRACT_ADDRESS",
  rpcUrl: "https://starknet-mainnet.public.blastapi.io",
  accountAddress: "0xYOUR_ACCOUNT_ADDRESS",
  privateKey: "0xYOUR_PRIVATE_KEY"
});

// Check balance and allowance
const balance = await autoswappr.getTokenBalance(TOKEN_ADDRESSES.STRK);
const allowance = await autoswappr.getTokenAllowance(TOKEN_ADDRESSES.STRK);

// Approve if needed
if (
  uint256.uint256ToBN(allowance) <
  uint256.uint256ToBN(uint256.bnToUint256("1000000000000000000"))
) {
  await autoswappr.approveTokens(TOKEN_ADDRESSES.STRK, "1000000000000000000");
}

// Execute swap
const result = await autoswappr.executeEkuboManualSwap(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  { amount: "1000000000000000000" }
);
```

### Advanced Usage

```typescript
// Gas estimation
const gas = await autoswappr.estimateSwapGas(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  { amount: "1000000000000000000" }
);

// Event listening
autoswappr.onSwapSuccessful((event) => {
  console.log("Swap successful:", event);
});

// Batch operations
const tokens = [TOKEN_ADDRESSES.STRK, TOKEN_ADDRESSES.ETH];
const supportPromises = tokens.map((token) =>
  autoswappr.isTokenSupported(token)
);
const supportResults = await Promise.all(supportPromises);
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Linting

```bash
npm run lint
```

## Security Considerations

1. **Private Key Management**: Never expose private keys in client-side code
2. **Token Approvals**: Only approve the amount you intend to swap
3. **Slippage Protection**: Consider implementing slippage checks
4. **Pool Validation**: Verify pool addresses and parameters before swapping
5. **Error Handling**: Implement proper error handling for failed transactions

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## Support

For support and questions, please open an issue on GitHub.
