/**
 * AutoSwappr Contract ABI
 * Generated from the Cairo contract interface
 */

export const AUTOSWAPPR_ABI = [
  {
    name: "ekubo_manual_swap",
    type: "function",
    inputs: [
      {
        name: "swap_data",
        type: "tuple",
        components: [
          {
            name: "params",
            type: "tuple",
            components: [
              {
                name: "amount",
                type: "tuple",
                components: [
                  { name: "mag", type: "core::integer::u128" },
                  { name: "sign", type: "core::bool" }
                ]
              },
              { name: "sqrt_ratio_limit", type: "core::integer::u128" },
              { name: "is_token1", type: "core::bool" },
              { name: "skip_ahead", type: "core::integer::u32" }
            ]
          },
          {
            name: "pool_key",
            type: "tuple",
            components: [
              { name: "token0", type: "core::starknet::contract_address::ContractAddress" },
              { name: "token1", type: "core::starknet::contract_address::ContractAddress" },
              { name: "fee", type: "core::integer::u128" },
              { name: "tick_spacing", type: "core::integer::u32" },
              { name: "extension", type: "core::felt252" }
            ]
          },
          { name: "caller", type: "core::starknet::contract_address::ContractAddress" }
        ]
      }
    ],
    outputs: [
      {
        name: "result",
        type: "tuple",
        components: [
          {
            name: "delta",
            type: "tuple",
            components: [
              {
                name: "amount0",
                type: "tuple",
                components: [
                  { name: "mag", type: "core::integer::u128" },
                  { name: "sign", type: "core::bool" }
                ]
              },
              {
                name: "amount1",
                type: "tuple",
                components: [
                  { name: "mag", type: "core::integer::u128" },
                  { name: "sign", type: "core::bool" }
                ]
              }
            ]
          }
        ]
      }
    ],
    state_mutability: "external"
  },
  {
    name: "get_token_from_status_and_value",
    type: "function",
    inputs: [
      { name: "token_from", type: "core::starknet::contract_address::ContractAddress" }
    ],
    outputs: [
      { name: "supported", type: "core::bool" },
      { name: "price_feed_id", type: "core::felt252" }
    ],
    state_mutability: "view"
  },
  {
    name: "contract_parameters",
    type: "function",
    inputs: [],
    outputs: [
      {
        name: "info",
        type: "tuple",
        components: [
          { name: "fees_collector", type: "core::starknet::contract_address::ContractAddress" },
          { name: "fibrous_exchange_address", type: "core::starknet::contract_address::ContractAddress" },
          { name: "avnu_exchange_address", type: "core::starknet::contract_address::ContractAddress" },
          { name: "oracle_address", type: "core::starknet::contract_address::ContractAddress" },
          { name: "owner", type: "core::starknet::contract_address::ContractAddress" },
          { name: "fee_type", type: "core::integer::u8" },
          { name: "percentage_fee", type: "core::integer::u16" }
        ]
      }
    ],
    state_mutability: "view"
  },
  {
    name: "SwapSuccessful",
    type: "event",
    inputs: [
      { name: "token_from_address", type: "core::starknet::contract_address::ContractAddress", indexed: true },
      { name: "token_from_amount", type: "core::integer::u256", indexed: false },
      { name: "token_to_address", type: "core::starknet::contract_address::ContractAddress", indexed: true },
      { name: "token_to_amount", type: "core::integer::u256", indexed: false },
      { name: "beneficiary", type: "core::starknet::contract_address::ContractAddress", indexed: true },
      { name: "provider", type: "core::starknet::contract_address::ContractAddress", indexed: true }
    ]
  }
];

/**
 * ERC20 Token ABI for token approvals and balance checks
 */
export const ERC20_ABI = [
  {
    name: "approve",
    type: "function",
    inputs: [
      { name: "spender", type: "core::starknet::contract_address::ContractAddress" },
      { name: "amount", type: "core::integer::u256" }
    ],
    outputs: [{ name: "success", type: "core::bool" }],
    state_mutability: "external"
  },
  {
    name: "allowance",
    type: "function",
    inputs: [
      { name: "owner", type: "core::starknet::contract_address::ContractAddress" },
      { name: "spender", type: "core::starknet::contract_address::ContractAddress" }
    ],
    outputs: [{ name: "remaining", type: "core::integer::u256" }],
    state_mutability: "view"
  },
  {
    name: "balance_of",
    type: "function",
    inputs: [{ name: "account", type: "core::starknet::contract_address::ContractAddress" }],
    outputs: [{ name: "balance", type: "core::integer::u256" }],
    state_mutability: "view"
  },
  {
    name: "decimals",
    type: "function",
    inputs: [],
    outputs: [{ name: "decimals", type: "core::integer::u8" }],
    state_mutability: "view"
  },
  {
    name: "symbol",
    type: "function",
    inputs: [],
    outputs: [{ name: "symbol", type: "core::felt252" }],
    state_mutability: "view"
  },
  {
    name: "name",
    type: "function",
    inputs: [],
    outputs: [{ name: "name", type: "core::felt252" }],
    state_mutability: "view"
  }
]; 