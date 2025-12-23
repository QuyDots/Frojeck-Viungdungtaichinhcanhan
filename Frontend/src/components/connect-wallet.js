// Small Connect Wallet UI component
// Usage: import('/src/components/connect-wallet.js').then(mod => mod.mount(targetElement))
import Wallet from '/src/utils/wallet.js'

export function mount(target){
  const container = document.createElement('div')
  container.className = 'connect-wallet'

  const btn = document.createElement('button')
  btn.type = 'button'
  btn.className = 'cw-btn'
  btn.textContent = 'Kết nối ví'

  const addr = document.createElement('span')
  addr.className = 'cw-addr muted'
  addr.style.marginLeft = '8px'

  btn.addEventListener('click', async ()=>{
    try{
      const info = await Wallet.connectWallet()
      addr.textContent = info.address
      btn.textContent = 'Đã kết nối'
    }catch(e){
      alert('Kết nối ví lỗi: ' + (e && e.message ? e.message : e))
    }
  })

  // try display existing address
  Wallet.getAddress().then(a=>{ if(a){ addr.textContent = a; btn.textContent = 'Đã kết nối' } })

  container.appendChild(btn)
  container.appendChild(addr)
  target.appendChild(container)
  return { btn, addr, container }
}

export default { mount }
