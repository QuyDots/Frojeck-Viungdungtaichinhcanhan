# Onchain (Hardhat) for FinanceChain

This folder contains a small Hardhat setup and a `PersonalFinanceHash` contract that emits an event with a tx hash.

Quick steps (from this folder):

1. Install dependencies

```bash
npm install
```

2. Start local node

```bash
npx hardhat node
```

3. Deploy to local node

```bash
npx hardhat run --network localhost scripts/deploy.js
```

4. Use the printed contract address in frontend to call `saveTxHash`.

Notes:
# Onchain (Hardhat) for FinanceChain

This folder contains a Hardhat setup and the `PersonalFinance` contract for storing personal finance transactions on-chain.

Quick steps (from this folder):

1. Install dependencies

```bash
npm install
```

2. Create `.env` in this folder with:

```
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
PRIVATE_KEY=0xYOUR_PRIVATE_KEY
```

3. Compile and deploy to a network (example: Sepolia)

```bash
npx hardhat run --network sepolia scripts/deploy_pf.js
```

4. Copy the deployed contract address and set it in the frontend `index.html` (or in browser console):

```js
window.PERSONAL_FINANCE_CONTRACT = '0x...deployed_address...'
```

5. Open the frontend, connect MetaMask (use the same account that deployed or any account), then use the "Ghi lên blockchain" toggle in the Add Transaction page to store transactions on-chain.

Security notes:

- Never commit `.env` or your private key to source control.
- Using testnets is recommended for development.
- For large data consider storing off-chain (IPFS) and saving only a hash on-chain.
