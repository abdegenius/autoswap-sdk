# AutoSwap SDK Demo

This demo project tests the published `autoswap-sdk` package from npm.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp env.example .env
   ```

   Then edit `.env` with your actual credentials.

3. **Run the demo:**
   ```bash
   npm start
   ```

## What the Demo Tests

The demo script (`index.ts`) tests the following SDK functionality:

- ✅ **SDK Import**: Verifies the package can be imported successfully
- 📋 **Token Information**: Displays available tokens and their addresses
- 🏊 **Pool Configurations**: Shows pool configurations for different token pairs
- 🔧 **Utility Functions**: Tests helper functions like `toWei`, `fromWei`, `formatTokenAmount`
- 🏊 **Pool & Token Info**: Tests functions to get specific pool and token information
- 🔗 **AutoSwappr Class**: Demonstrates how to configure the main SDK class
- ⚠️ **Error Types**: Shows available error types and enums

## Expected Output

When you run the demo, you should see output similar to:

```
🚀 AutoSwap SDK Demo
====================

✅ SDK imported successfully

📋 Available Tokens:
TOKEN_ADDRESSES: { ... }
TOKEN_INFO: { ... }

🏊 Pool Configurations:
POOL_CONFIGS: { ... }

🔧 Testing Utility Functions:
toWei("1.5", 18) = 1500000000000000000
fromWei("1500000000000000000", 18) = 1.5
formatTokenAmount("1500000000000000000", 18, 4) = 1.5000
isValidTokenAddress("0x1234567890123456789012345678901234567890") = true
isValidAmount("1.5") = true

🏊 Testing Pool and Token Info:
Pool config for ...: { ... }
Token info for ...: { ... }

🔗 Testing AutoSwappr Class:
AutoSwappr config created: { ... }
Note: Full AutoSwappr functionality requires valid network credentials

⚠️ Available Error Types:
AutoSwapprError: { ... }
FeeType: { ... }

🎉 Demo completed successfully!
```

## Troubleshooting

If you encounter issues:

1. **Import errors**: Make sure the `autoswap-sdk` package is published and accessible
2. **Type errors**: Check that TypeScript is properly configured
3. **Runtime errors**: Verify your environment variables are set correctly

## Next Steps

To test full functionality with real transactions:

1. Set up a StarkNet account with funds
2. Configure real RPC URL and contract addresses
3. Add transaction signing logic to the demo
4. Test actual swap operations

## Development

- **Watch mode**: `npm run dev` - runs the demo in watch mode
- **Build**: `npm run build` - compiles TypeScript to JavaScript
