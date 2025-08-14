import { AutoSwappr, TOKEN_ADDRESSES } from '../src';

describe('AutoSwappr', () => {
  const mockConfig = {
    contractAddress:
      '0x1234567890123456789012345678901234567890123456789012345678901234',
    rpcUrl: 'https://starknet-mainnet.public.blastapi.io',
    accountAddress:
      '0xabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdefabcdef',
    privateKey:
      '0x1234567890123456789012345678901234567890123456789012345678901234',
  };

  describe('Constructor', () => {
    it('should initialize correctly with valid config', () => {
      const autoswappr = new AutoSwappr(mockConfig);
      expect(autoswappr).toBeInstanceOf(AutoSwappr);
    });

    it('should initialize with empty contract address (validation happens later)', () => {
      const autoswappr = new AutoSwappr({
        ...mockConfig,
        contractAddress: '',
      });
      expect(autoswappr).toBeInstanceOf(AutoSwappr);
    });
  });

  describe('Pool Configuration', () => {
    it('should get pool config for valid token pair', () => {
      const autoswappr = new AutoSwappr(mockConfig);
      const poolConfig = autoswappr.getPoolConfig(
        TOKEN_ADDRESSES.STRK,
        TOKEN_ADDRESSES.USDC
      );
      expect(poolConfig).toBeDefined();
    });

    it('should return null for invalid token pair', () => {
      const autoswappr = new AutoSwappr(mockConfig);
      const poolConfig = autoswappr.getPoolConfig('0xinvalid', '0xinvalid2');
      expect(poolConfig).toBeNull();
    });
  });

  describe('Swap Data Creation', () => {
    it('should create valid swap data', () => {
      const autoswappr = new AutoSwappr(mockConfig);
      const swapData = autoswappr.createSwapData(
        TOKEN_ADDRESSES.STRK,
        TOKEN_ADDRESSES.USDC,
        { amount: '1000000000000000000' }
      );

      expect(swapData).toHaveProperty('params');
      expect(swapData).toHaveProperty('pool_key');
      expect(swapData).toHaveProperty('caller');
      expect(swapData.params).toHaveProperty('amount');
      expect(swapData.params).toHaveProperty('sqrt_ratio_limit');
      expect(swapData.params).toHaveProperty('is_token1');
      expect(swapData.params).toHaveProperty('skip_ahead');
    });

    it('should throw error for invalid pool config', () => {
      const autoswappr = new AutoSwappr(mockConfig);
      expect(() => {
        autoswappr.createSwapData('0xinvalid', '0xinvalid2', {
          amount: '1000000000000000000',
        });
      }).toThrow();
    });
  });
});
