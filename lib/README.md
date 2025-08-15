# AutoSwappr SDK

A TypeScript SDK for interacting with the AutoSwappr contract.

## Features

- 🔄 Execute swaps
- 📝 TypeScript support with full type definitions

## Installation

```bash
npm install autoswap-sdk
```

## AutoSwappr Contract Address

```
0x5b08cbdaa6a2338e69fad7c62ce20204f1666fece27288837163c19320b9496
```

## Quick Start

```typescript
import { AutoSwappr, TOKEN_ADDRESSES } from 'autoswappr-sdk';

// Initialize the SDK
const autoswappr = new AutoSwappr({
  contractAddress: 'AUTOSWAPPR_CONTRACT_ADDRESS',
  rpcUrl: 'https://starknet-mainnet.public.blastapi.io',
  accountAddress: 'YOUR_ACCOUNT_ADDRESS',
  privateKey: 'YOUR_PRIVATE_KEY',
});

// Execute swap
const result = await autoswappr.executeSwap(
  TOKEN_ADDRESSES.STRK,
  TOKEN_ADDRESSES.USDC,
  {
    amount: '1000000000000000000', // 1 STRK
    isToken1: false,
  }
);

console.log('Swap result:', result);
```

## Security Considerations

1. **Private Key Management**: Never expose private keys in client-side code

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
