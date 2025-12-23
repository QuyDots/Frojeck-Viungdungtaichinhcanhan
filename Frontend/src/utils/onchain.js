// onchain helper: saves a hash of a message to PersonalFinanceHash contract
const CDN = 'https://cdn.jsdelivr.net/npm/ethers@6.9.0/dist/ethers.esm.min.js'
let ethersModule = null
async function ensureEthers(){
  if(ethersModule) return ethersModule
  try{
    ethersModule = await import('ethers')
    return ethersModule
  }catch(_err){
    // CDN fallback — tell Vite to ignore this dynamic import during analysis
    /* @vite-ignore */
    ethersModule = await import(CDN)
    return ethersModule
  }
}

export async function saveHashOnChain(contractAddress, message){
  const m = await ensureEthers()
  if(!window.ethereum) throw new Error('No Ethereum provider')
  // construct provider supporting ethers v6/v5
  let provider
  if(m.BrowserProvider) provider = new m.BrowserProvider(window.ethereum)
  else if(m.Web3Provider) provider = new m.Web3Provider(window.ethereum)
  else if(m.providers && m.providers.Web3Provider) provider = new m.providers.Web3Provider(window.ethereum)
  else if(m.default && m.default.BrowserProvider) provider = new m.default.BrowserProvider(window.ethereum)
  else if(m.default && m.default.Web3Provider) provider = new m.default.Web3Provider(window.ethereum)
  else throw new Error('No compatible ethers provider found')

  if(typeof provider.send === 'function') await provider.send('eth_requestAccounts', [])
  else if(window.ethereum && window.ethereum.request) await window.ethereum.request({ method: 'eth_requestAccounts' })

  const signer = provider.getSigner()
  const Contract = m.Contract ?? (m.default && m.default.Contract) ?? (m.ethers && m.ethers.Contract)
  const utils = m.utils ?? (m.default && m.default.utils) ?? (m.ethers && m.ethers.utils)
  const abi = [
    'function saveTxHash(bytes32 txHash) external',
    'event TransactionHashSaved(address indexed owner, bytes32 hash, uint256 timestamp)'
  ]
  if(!Contract) throw new Error('Contract constructor not found in ethers module')
  if(!utils) throw new Error('utils not found in ethers module')
  const contract = new Contract(contractAddress, abi, signer)
  const hash = utils.id(message)
  const tx = await contract.saveTxHash(hash)
  const receipt = await tx.wait()
  return { txHash: tx.hash, receipt }
}

export default { saveHashOnChain }
