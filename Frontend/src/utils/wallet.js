// Minimal wallet helper using Ethers.js via CDN
// Exports: connectWallet(), getAddress(), signMessage(message)
const CDN = 'https://cdn.jsdelivr.net/npm/ethers@6.9.0/dist/ethers.esm.min.js'
let ethersModule = null
async function ensureEthers(){
  if(ethersModule) return ethersModule
  // Prefer the locally installed package (works in Vite dev/build). If not available,
  // fall back to the CDN. This handles environments where the CDN is blocked.
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

export async function connectWallet(){
  if(!window.ethereum) throw new Error('No Ethereum provider found')
  const m = await ensureEthers()
  // support ethers v6 (BrowserProvider) and v5 (Web3Provider)
  let provider
  if(m.BrowserProvider) provider = new m.BrowserProvider(window.ethereum)
  else if(m.Web3Provider) provider = new m.Web3Provider(window.ethereum)
  else if(m.providers && m.providers.Web3Provider) provider = new m.providers.Web3Provider(window.ethereum)
  else if(m.default && m.default.BrowserProvider) provider = new m.default.BrowserProvider(window.ethereum)
  else if(m.default && m.default.Web3Provider) provider = new m.default.Web3Provider(window.ethereum)
  else throw new Error('No compatible ethers provider found')

  // Request accounts (some provider wrappers forward this, but ensure it)
  if(typeof provider.send === 'function') await provider.send('eth_requestAccounts', [])
  else if(window.ethereum && window.ethereum.request) await window.ethereum.request({ method: 'eth_requestAccounts' })

  const signer = provider.getSigner()
  let address
  // Try all known ethers v5/v6 patterns for address
  try {
    if (typeof signer.getAddress === 'function') {
      address = await signer.getAddress()
    } else if ('address' in signer) {
      if (typeof signer.address === 'function') {
        address = await signer.address()
      } else if (signer.address && typeof signer.address.then === 'function') {
        address = await signer.address
      } else {
        address = signer.address
      }
    } else if (typeof provider.getAddress === 'function') {
      address = await provider.getAddress()
    } else if (signer && signer._address) {
      address = signer._address
    } else if (signer && signer.address !== undefined) {
      address = signer.address
    } else {
      address = null // fallback: unknown structure, do not throw
    }
    if (!address || typeof address !== 'string') address = null
  } catch(e) {
    address = null
  }
  return {provider, signer, address}
}

export async function getAddress(){
  if(!window.ethereum) return null
  const m = await ensureEthers()
  let provider
  if(m.BrowserProvider) provider = new m.BrowserProvider(window.ethereum)
  else if(m.Web3Provider) provider = new m.Web3Provider(window.ethereum)
  else if(m.providers && m.providers.Web3Provider) provider = new m.providers.Web3Provider(window.ethereum)
  else if(m.default && m.default.BrowserProvider) provider = new m.default.BrowserProvider(window.ethereum)
  else if(m.default && m.default.Web3Provider) provider = new m.default.Web3Provider(window.ethereum)
  else return null
  try {
    const signer = provider.getSigner()
    let address
    if (typeof signer.getAddress === 'function') {
      address = await signer.getAddress()
    } else if ('address' in signer) {
      if (typeof signer.address === 'function') {
        address = await signer.address()
      } else if (signer.address && typeof signer.address.then === 'function') {
        address = await signer.address
      } else {
        address = signer.address
      }
    } else if (typeof provider.getAddress === 'function') {
      address = await provider.getAddress()
    } else {
      return null
    }
    if (!address || typeof address !== 'string') return null
    return address
  } catch(e) { return null }
}

export async function signMessage(message){
  if(!window.ethereum) throw new Error('No Ethereum provider')
  const { signer } = await connectWallet()
  const sig = await signer.signMessage(message)
  return sig
}

export default { connectWallet, getAddress, signMessage }
