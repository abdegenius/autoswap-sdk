import { AutoSwappr, TOKEN_ADDRESSES, AutoSwapprError } from "../src";

describe("AutoSwappr SDK", () => {
  let autoswappr: AutoSwappr;

  beforeEach(() => {
    // Mock configuration for testing
    const config = {
      contractAddress: "0x1234567890123456789012345678901234567890123456789012345678901234",
      rpcUrl: "https://starknet-mainnet.public.blastapi.io",
      accountAddress: "0x0987654321098765432109876543210987654321098765432109876543210987",
      privateKey: "0x1111111111111111111111111111111111111111111111111111111111111111"
    };

    autoswappr = new AutoSwappr(config);
  });

  describe("Configuration", () => {
    it("should initialize with correct configuration", () => {
      expect(autoswappr.getAccountAddress()).toBe("0x0987654321098765432109876543210987654321098765432109876543210987");
      expect(autoswappr.getContractAddress()).toBe("0x1234567890123456789012345678901234567890123456789012345678901234");
    });
  });

  describe("Token Information", () => {
    it("should get token info for STRK", () => {
      const tokenInfo = autoswappr.getTokenInfo(TOKEN_ADDRESSES.STRK);
      expect(tokenInfo).toEqual({
        address: TOKEN_ADDRESSES.STRK,
        symbol: "STRK",
        decimals: 18,
        name: "Starknet Token"
      });
    });

    it("should return null for unknown token", () => {
      const tokenInfo = autoswappr.getTokenInfo("0x0000000000000000000000000000000000000000000000000000000000000000");
      expect(tokenInfo).toBeNull();
    });
  });

  describe("Pool Configuration", () => {
    it("should get pool config for STRK/USDC", () => {
      const poolConfig = autoswappr.getPoolConfig(TOKEN_ADDRESSES.STRK, TOKEN_ADDRESSES.USDC);
      expect(poolConfig).toBeDefined();
      expect(poolConfig?.token0).toBe(TOKEN_ADDRESSES.STRK);
      expect(poolConfig?.token1).toBe(TOKEN_ADDRESSES.USDC);
      expect(poolConfig?.fee).toBe("170141183460469235273462165868118016");
      expect(poolConfig?.tick_spacing).toBe(1000);
    });

    it("should get pool config for reverse order", () => {
      const poolConfig = autoswappr.getPoolConfig(TOKEN_ADDRESSES.USDC, TOKEN_ADDRESSES.STRK);
      expect(poolConfig).toBeDefined();
      expect(poolConfig?.token0).toBe(TOKEN_ADDRESSES.STRK);
      expect(poolConfig?.token1).toBe(TOKEN_ADDRESSES.USDC);
    });

    it("should return null for unsupported pair", () => {
      const poolConfig = autoswappr.getPoolConfig(
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x1111111111111111111111111111111111111111111111111111111111111111"
      );
      expect(poolConfig).toBeNull();
    });
  });

  describe("Swap Data Creation", () => {
    it("should create valid swap data", () => {
      const swapData = autoswappr.createSwapData(
        TOKEN_ADDRESSES.STRK,
        TOKEN_ADDRESSES.USDC,
        {
          amount: "1000000000000000000",
          isToken1: false
        }
      );

      expect(swapData).toBeDefined();
      expect(swapData.params.amount.mag).toBe("1000000000000000000");
      expect(swapData.params.amount.sign).toBe(false);
      expect(swapData.params.is_token1).toBe(false);
      expect(swapData.pool_key.token0).toBe(TOKEN_ADDRESSES.STRK);
      expect(swapData.pool_key.token1).toBe(TOKEN_ADDRESSES.USDC);
      expect(swapData.caller).toBe(autoswappr.getAccountAddress());
    });

    it("should throw error for invalid pool config", () => {
      expect(() => {
        autoswappr.createSwapData(
          "0x0000000000000000000000000000000000000000000000000000000000000000",
          "0x1111111111111111111111111111111111111111111111111111111111111111",
          { amount: "1000000000000000000" }
        );
      }).toThrow(AutoSwapprError.INVALID_POOL_CONFIG);
    });
  });

  describe("Error Types", () => {
    it("should have correct error constants", () => {
      expect(AutoSwapprError.INSUFFICIENT_ALLOWANCE).toBe("INSUFFICIENT_ALLOWANCE");
      expect(AutoSwapprError.UNSUPPORTED_TOKEN).toBe("UNSUPPORTED_TOKEN");
      expect(AutoSwapprError.ZERO_AMOUNT).toBe("ZERO_AMOUNT");
      expect(AutoSwapprError.INVALID_POOL_CONFIG).toBe("INVALID_POOL_CONFIG");
      expect(AutoSwapprError.INSUFFICIENT_BALANCE).toBe("INSUFFICIENT_BALANCE");
      expect(AutoSwapprError.SWAP_FAILED).toBe("SWAP_FAILED");
      expect(AutoSwapprError.INVALID_INPUT).toBe("INVALID_INPUT");
    });
  });

  describe("Token Addresses", () => {
    it("should have correct token addresses", () => {
      expect(TOKEN_ADDRESSES.STRK).toBe("0x04718f5a0fc34cc1af16a1cdee98ffb20c31f5cd61d6ab07201858f4287c938d");
      expect(TOKEN_ADDRESSES.ETH).toBe("0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7");
      expect(TOKEN_ADDRESSES.USDC).toBe("0x053c91253bc9682c04929ca02ed00b3e423f6710d2ee7e0d5ebb06f3ecf368a8");
      expect(TOKEN_ADDRESSES.USDT).toBe("0x068f5c6a61730768477ced7eef7680a434a851905eeff58ee8ba2115ada38e3");
    });
  });
}); 