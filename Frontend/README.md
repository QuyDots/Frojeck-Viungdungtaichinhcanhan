# FinanceChain Flask UI (Demo)

Minimal Flask-based UI for "ỨNG DỤNG BLOCKCHAIN TRONG QUẢN LÝ TÀI CHÍNH CÁ NHÂN" with demo pages and future blockchain integration.

## Features
- Dashboard with summary and demo chart
- Add Transaction form (server-side demo handling)
- History page with demo list and filters
- Wallet connect stub using Ethers.js
- Solidity contract in `contracts/PersonalFinance.sol`

## Setup

### 1) Create and activate a virtual environment (Windows PowerShell)
```powershell
python -m venv .venv
& .\.venv\Scripts\Activate.ps1
```

### 2) Install dependencies
```powershell
pip install -r requirements.txt
```

### 3) Run the app
```powershell
python app.py
```

Open http://127.0.0.1:5000 in your browser.

## Next Steps (Blockchain Integration)
- Replace demo data with calls to the deployed contract via Ethers.js from frontend or Web3.py backend.
- Add contract address and ABI to a config file and initialize a provider/signing.
- Implement MetaMask account display and transaction submission.

### On-chain mode (how to use)

- Deploy the `PersonalFinance` contract from `/onchain` (see its README). After deploy, set the contract address in the frontend `index.html` or in the browser console:

```js
window.PERSONAL_FINANCE_CONTRACT = '0x...deployed_address...'
```

- Open frontend, connect MetaMask, go to "Add Transaction", enable "Ghi lên blockchain" and submit. The frontend will send the transaction to your contract and then fetch stored transactions for the connected address.

Warning: always use testnets for development and never commit private keys.

## Notes
- This is a UI skeleton meant to validate layout and flows.
- The smart contract is provided for deployment on Sepolia/Polygon testnets.