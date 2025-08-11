# AutoSwappr SDK

A TypeScript SDK for interacting with the AutoSwappr contract's `manual_swap` function on Starknet.

## Features

- 🔄 Execute swaps
- 📊 Pool configuration management
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

// Execute swap
const result = await autoswappr.executeSwap(
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

##### `executeSwap(tokenIn, tokenOut, options)`

Execute a swap.

```typescript
const result = await autoswappr.executeSwap(
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
  await autoswappr.executeSwap(tokenIn, tokenOut, options);
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

## Examples

### Basic Usage

```typescript
import { AutoSwappr, TOKEN_ADDRESSES } from "autoswappr-sdk";

const autoswappr = new AutoSwappr({
  contractAddress: "AUTOSWAPPR_CONTRACT_ADDRESS",
  rpcUrl: "https://starknet-mainnet.public.blastapi.io",
  accountAddress: "YOUR_ACCOUNT_ADDRESS",
  privateKey: "0xYOUR_PRIVATE_KEY"
});

// Execute swap
const result = await autoswappr.executeSwap(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  { amount: "1000000000000000000" }
);
```

## Development

### Building

```bash
yarn build
```

## Security Considerations

1. **Private Key Management**: Never expose private keys in client-side code
2. **Slippage Protection**: Consider implementing slippage checks
3. **Pool Validation**: Verify pool addresses and parameters before swapping
4. **Error Handling**: Implement proper error handling for failed transactions

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
