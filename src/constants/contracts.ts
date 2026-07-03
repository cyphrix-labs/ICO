export const CONTRACTS = {
  CHAIN_ID: 56,
  CHAIN_NAME: "BNB Smart Chain Mainnet",
  RPC_URL: "https://binance.llamarpc.com",
  PRESALE_ADDRESS: "0xf86F5C82a13b332B4b89e32131A39964e6d8Cc83",
  USDT_ADDRESS: "0x55d398326f99059fF775485246999027B3197955",
  DMX_ADDRESS: "0x906DfaB01976d0d4f04fe2547d97E0c9ba69e6BB",
};

export const ABIS = {
  ERC20: [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function allowance(address owner, address spender) view returns (uint256)",
    "function balanceOf(address account) view returns (uint256)",
    "function decimals() view returns (uint8)",
  ],
  PRESALE: [
    "function buyTokens(uint256 _amt, address _ref, string _email) external",
    "function sellBack(uint256 _amt) external",
    "function currentPhaseIndex() view returns (uint256)",
    "function phases(uint256 index) view returns (uint256 totalCap, uint256 sold, uint256 price, bool isActive)",
    "function newsHeadline() view returns (string)",
    "function userEmails(address user) view returns (string)",
    "function registerEmail(string _email) external",
  ],
};
