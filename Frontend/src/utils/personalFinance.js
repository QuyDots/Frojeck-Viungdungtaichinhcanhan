// Helper to interact with PersonalFinance smart contract
const CDN = 'https://cdn.jsdelivr.net/npm/ethers@6.9.0/dist/ethers.esm.min.js'
let ethersModule = null
async function ensureEthers(){
  if(ethersModule) return ethersModule
  try{ ethersModule = await import('ethers'); return ethersModule }catch(_){ /* @vite-ignore */ ethersModule = await import(CDN); return ethersModule }
}

// Minimal ABI matching our contract
const ABI = [
  // addTransaction giờ là payable để có thể nhận kèm ETH
  'function addTransaction(uint256 amount, bool income, string category, string note) external payable',
  'function getMyTransactions() view returns (tuple(uint256 amount,bool income,string category,string note,uint256 timestamp)[])'
]

export async function addOnchainTransaction(contractAddress, amount, income, category, note){
  if(!window.ethereum) throw new Error('No Ethereum provider')
  const m = await ensureEthers()
  const provider = (m.BrowserProvider ? new m.BrowserProvider(window.ethereum) : (m.Web3Provider ? new m.Web3Provider(window.ethereum) : new m.providers.Web3Provider(window.ethereum)))
  // request accounts
  if(typeof provider.send === 'function') await provider.send('eth_requestAccounts', [])
  else if(window.ethereum && window.ethereum.request) await window.ethereum.request({ method: 'eth_requestAccounts' })
  let signer = provider.getSigner && provider.getSigner()
  if (signer && typeof signer.then === 'function') {
    signer = await signer
  }
  const Contract = m.Contract ?? (m.default && m.default.Contract) ?? (m.ethers && m.ethers.Contract)
  if(!Contract) throw new Error('Contract constructor not found')
  const contract = new Contract(contractAddress, ABI, signer)
  // amount: số tiền người dùng nhập (có thể là số thực). Ta scale *1000 để lưu on-chain.
  // Không gửi kèm ETH trong transaction (value = 0), chỉ tốn gas,
  // tránh lỗi "insufficient funds for gas * price + value" nếu ví không đủ ETH lớn.
  const amtNumber = typeof amount === 'string' ? parseFloat(amount) : amount
  if (!amtNumber || amtNumber <= 0) throw new Error('Amount must be > 0')

  const scaledAmount = Math.round(amtNumber * 1000) // lưu: đơn vị = 0.001 (đơn vị logic nội bộ)

  // Gọi addTransaction mà KHÔNG gửi kèm ETH (value=0)
  const tx = await contract.addTransaction(scaledAmount, income, category, note)
  // wait for 1 confirmation
  const receipt = await tx.wait()

  // Chuẩn hóa một phần thông tin transaction/receipt để lưu kèm trong MongoDB và hiển thị giống ví thật
  const norm = (v) => {
    if (typeof v === 'bigint') return v.toString()
    if (!v) return v
    try { return v.toString() } catch (_e) { return v }
  }

  const txInfo = {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    nonce: norm(tx.nonce),
    chainId: norm(tx.chainId),
    gasPrice: norm(tx.gasPrice),
    value: norm(tx.value)
  }

  const receiptInfo = {
    blockNumber: norm(receipt.blockNumber),
    gasUsed: norm(receipt.gasUsed),
    status: receipt.status,
    transactionIndex: norm(receipt.transactionIndex),
    confirmations: norm(receipt.confirmations)
  }

  return { txHash: tx.hash, tx: txInfo, receipt: receiptInfo }
}

// Send ETH directly to a recipient address (value transfer)
export async function sendEth(recipient, amountEth){
  if(!window.ethereum) throw new Error('No Ethereum provider')
  const m = await ensureEthers()
  const provider = (m.BrowserProvider ? new m.BrowserProvider(window.ethereum) : (m.Web3Provider ? new m.Web3Provider(window.ethereum) : new m.providers.Web3Provider(window.ethereum)))
  // request accounts
  if(typeof provider.send === 'function') await provider.send('eth_requestAccounts', [])
  else if(window.ethereum && window.ethereum.request) await window.ethereum.request({ method: 'eth_requestAccounts' })
  let signer = provider.getSigner && provider.getSigner()
  if (signer && typeof signer.then === 'function') signer = await signer

  // parse amount to wei
  let value
  try {
    // ethers v6 exposes parseEther on module
    value = m.parseEther(String(amountEth))
  } catch (e) {
    // fallback: try m.utils.parseEther or throw
    if (m.utils && typeof m.utils.parseEther === 'function') value = m.utils.parseEther(String(amountEth))
    else throw new Error('Cannot parse amount to wei')
  }

  const tx = await signer.sendTransaction({ to: recipient, value })
  const receipt = await tx.wait()

  const norm = (v) => {
    if (typeof v === 'bigint') return v.toString()
    if (!v) return v
    try { return v.toString() } catch (_e) { return v }
  }

  const txInfo = {
    hash: tx.hash,
    from: tx.from,
    to: tx.to,
    nonce: norm(tx.nonce),
    chainId: norm(tx.chainId),
    gasPrice: norm(tx.gasPrice),
    value: norm(tx.value)
  }

  const receiptInfo = {
    blockNumber: norm(receipt.blockNumber),
    gasUsed: norm(receipt.gasUsed),
    status: receipt.status,
    transactionIndex: norm(receipt.transactionIndex),
    confirmations: norm(receipt.confirmations)
  }

  return { txHash: tx.hash, tx: txInfo, receipt: receiptInfo }
}

export async function fetchMyTransactions(contractAddress){
  if(!window.ethereum) return []
  const m = await ensureEthers()
  const provider = (m.BrowserProvider ? new m.BrowserProvider(window.ethereum) : (m.Web3Provider ? new m.Web3Provider(window.ethereum) : new m.providers.Web3Provider(window.ethereum)))
  let signer = provider.getSigner && provider.getSigner()
  if (signer && typeof signer.then === 'function') {
    signer = await signer
  }
  const Contract = m.Contract ?? (m.default && m.default.Contract) ?? (m.ethers && m.ethers.Contract)
  const contract = new Contract(contractAddress, ABI, signer)
  const txs = await contract.getMyTransactions()
  // normalize
  return txs.map(t => {
    let displayAmount
    try {
      const raw = Number(t.amount.toString())
      displayAmount = isNaN(raw) ? t.amount.toString() : (raw / 1000)
    } catch(_){
      displayAmount = t.amount.toString()
    }
    return {
      amount: String(displayAmount),
      income: t.income,
      category: t.category,
      note: t.note,
      timestamp: Number(t.timestamp)
    }
  })
}

export default { addOnchainTransaction, fetchMyTransactions }
