import { apiUrl } from '../config/api.js';

let txChart = null;
export const allTransactions = [];
export const allBlocks = [];

// Dark mode toggle
export function toggleDarkMode() {
  document.documentElement.classList.toggle('dark-mode');
  localStorage.setItem('darkMode', document.documentElement.classList.contains('dark-mode'));
}

// Restore dark mode preference
export function initDarkMode() {
  if (localStorage.getItem('darkMode') === 'true') {
    document.documentElement.classList.add('dark-mode');
  }
}

// Tab switching
export function switchTab(tabName) {
  document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(el => el.classList.remove('active'));
  document.getElementById(tabName).classList.add('active');
  event.target.classList.add('active');
  
  if (tabName === 'dashboard' && !txChart) {
    setTimeout(initChart, 100);
  }
}

// Update statistics
export function updateStats() {
  const totalTx = allTransactions.length + allBlocks.reduce((sum, b) => sum + b.transactions.length, 0);
  document.getElementById('statTotal').textContent = totalTx;
  document.getElementById('statBlocks').textContent = allBlocks.length;
}

// Update status indicator
export function updateStatus(status) {
  const el = document.getElementById('statStatus');
  if (status === 'online') {
    el.textContent = '🟢 Online';
    el.style.color = 'var(--success)';
  } else {
    el.textContent = '🔴 Offline';
    el.style.color = 'var(--error)';
  }
}

// Show message
export function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  el.innerHTML = `<div class="message ${type}">${text}</div>`;
  if (type === 'success') {
    setTimeout(() => el.innerHTML = '', 5000);
  }
}

// Fill recipient field with currently connected wallet address
export async function fillRecipientWithWallet() {
  const input = document.getElementById('recipient');
  if (!input) return;
  try {
    if (!window.ethereum) {
      showMessage('addStatus', 'Không tìm thấy MetaMask. Vui lòng cài đặt hoặc bật tiện ích.', 'error');
      return;
    }

    // Đảm bảo module ví đã được load
    if (!window.wallet) {
      try {
        const mod = await import('/src/utils/wallet.js');
        window.wallet = mod;
      } catch (e) {
        showMessage('addStatus', 'Không tải được module ví. Hãy tải lại trang.', 'error');
        return;
      }
    }

    // Thử lấy địa chỉ hiện tại trước
    let addr = typeof window.wallet.getAddress === 'function'
      ? await window.wallet.getAddress()
      : null;

    // Nếu chưa có (chưa connect), yêu cầu MetaMask connect
    if (!addr && typeof window.wallet.connectWallet === 'function') {
      try {
        const info = await window.wallet.connectWallet();
        addr = info && info.address ? info.address : null;
      } catch (e) {
        // user likely rejected or provider blocked
        const m = e && (e.message || String(e));
        showMessage('addStatus', 'Không lấy được địa chỉ ví. Hãy mở MetaMask và cho phép kết nối (hoặc bấm "Kết nối ví" ở góc trên).', 'error');
        console.warn('connectWallet failed:', m);
        return;
      }
    }

    if (!addr) {
      showMessage('addStatus', 'Không lấy được địa chỉ ví. Hãy mở MetaMask và cho phép kết nối, rồi thử lại.', 'error');
      return;
    }

    // Ghi đè ô "Người nhận" bằng đúng địa chỉ ví
    input.readOnly = false;
    input.value = addr;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  } catch (e) {
    alert('Lỗi lấy địa chỉ ví: ' + (e && e.message ? e.message : e));
  }
}

// Bật/tắt chế độ on-chain để cập nhật gợi ý ô "Người nhận"
export function onchainToggleChanged(isOn) {
  const recipientInput = document.getElementById('recipient');
  const hint = document.getElementById('recipientHint');
  const walletBtn = document.getElementById('fillWalletBtn');

  if (!recipientInput) return;

  if (isOn) {
    recipientInput.placeholder = 'Địa chỉ ví (nên dùng ví MetaMask)';
    if (hint) {
      hint.textContent = 'On-chain: nên dùng địa chỉ ví thật. Bạn có thể bấm "Dùng địa chỉ ví" để tự động lấy từ MetaMask.';
    }
    if (walletBtn) walletBtn.disabled = false;
    const note = document.getElementById('recipientWalletNote');
    if (note) note.textContent = 'Lưu ý: giao dịch on-chain sẽ được ký bởi ví đang kết nối (msg.sender). Nếu muốn ghi dưới địa chỉ khác, hãy chuyển tài khoản trong MetaMask.';
  } else {
    recipientInput.placeholder = 'Ví dụ: bob hoặc địa chỉ ví';
    if (hint) {
      hint.textContent = 'Có thể nhập tên hoặc địa chỉ ví bất kỳ.';
    }
    if (walletBtn) walletBtn.disabled = false;
    const note = document.getElementById('recipientWalletNote');
    if (note) note.textContent = '';
  }
}

// Render transactions
export function renderTransactions() {
  const container = document.getElementById('txList');
  if (allTransactions.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Chưa có giao dịch nào</p></div>';
    return;
  }
  container.innerHTML = allTransactions.map(tx => {
    // Trạng thái: đã gửi, đã xác nhận, đã nhận, ...
    let status = 'Đã gửi';
    if (tx.confirmed || tx.status === 'confirmed') status = 'Đã xác nhận';
    else if (tx.status === 'pending') status = 'Đang chờ';
    else if (tx.status === 'failed') status = 'Thất bại';
    // Thời gian
    let time = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString('vi-VN') : '';
    // Hash
    let hash = tx.hash ? `<div class='tx-hash'>Hash: <span title='${tx.hash}'>${tx.hash.slice(0,10)}...${tx.hash.slice(-6)}</span></div>` : '';
    // Số lượng
    let amount = tx.amount ? tx.amount : '';
    // Quy đổi USD (giả sử 1 ETH = 2000 USD)
    let usdText = '';
    const ETH_TO_USD = 2000;
    if (typeof amount === 'string') amount = parseFloat(amount);
    if (!isNaN(amount)) {
      usdText = `<span class='tx-usd'>(~$${(amount * ETH_TO_USD).toLocaleString('en-US', {maximumFractionDigits:2})})</span>`;
    }
    // Mô tả
    let desc = tx.desc || '';
    return `<div class="transaction-item">
      <div class="tx-info">
        <div class="tx-from-to">${tx.sender} → ${tx.recipient}</div>
        <div class="tx-status"><span class="tx-status-label">${status}</span>${time ? ' | ' + time : ''}</div>
        ${hash}
        ${desc ? `<div class='tx-desc'>${desc}</div>` : ''}
      </div>
      <div class="tx-amount">${amount > 0 ? '+' : ''}${amount} ${usdText}</div>
    </div>`
  }).join('');
}

// Render blocks
export function renderBlocks() {
  const container = document.getElementById('blockList');
  if (allBlocks.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Chưa có block nào</p></div>';
    return;
  }
  container.innerHTML = allBlocks.map((block, i) =>
    `<div class="block-item">
      <div class="block-info">
        <div class="block-index">Block #${i}</div>
        <div class="block-meta">${new Date(block.timestamp * 1000).toLocaleString('vi-VN')} | ${block.transactions.length} giao dịch</div>
      </div>
      <button class="block-count" data-block-index="${i}">${block.transactions.length} TX</button>
    </div>`
  ).join('');

  // Gắn sự kiện click để hiện chi tiết blockchain cho từng block
  const buttons = container.querySelectorAll('.block-count');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.getAttribute('data-block-index'), 10);
      if (!Number.isNaN(idx)) showBlockDetails(idx);
    });
  });
}

function showBlockDetails(blockIndex) {
  const block = allBlocks[blockIndex];
  const detailCard = document.getElementById('blockDetails');
  const body = document.getElementById('blockDetailsBody');
  if (!block || !detailCard || !body) return;

  const ts = block.timestamp ? new Date(block.timestamp * 1000).toLocaleString('vi-VN') : '';
  const shortAddr = (addr) => {
    if (!addr || typeof addr !== 'string') return '';
    return addr.length > 14 ? addr.slice(0, 8) + '...' + addr.slice(-6) : addr;
  };

  const detailsHtml = (block.transactions || []).map((tx, idx) => {
    const onchain = tx.onchain || {};
    const hash = tx.hash;
    const amount = tx.amount ?? '';
    const sender = onchain.from || tx.sender || '';
    const recipient = onchain.to || tx.recipient || '';

    let hashHtml = '';
    if (hash) {
      const isSepolia = onchain.chainId === '11155111' || onchain.chainId === 11155111;
      const explorer = isSepolia ? `https://sepolia.etherscan.io/tx/${hash}` : null;
      const label = `${hash.slice(0, 10)}...${hash.slice(-6)}`;
      hashHtml = explorer
        ? `<div class="tx-hash">Hash: <a href="${explorer}" target="_blank" rel="noopener">${label}</a></div>`
        : `<div class="tx-hash">Hash: <span>${label}</span></div>`;
    }

    const gasUsed = onchain.gasUsed ?? '?';
    const gasPrice = onchain.gasPrice ?? '';
    const value = onchain.value ?? '0';
    const confirmations = onchain.confirmations ?? '';
    const blockNo = onchain.blockNumber ?? block.index;

    return `<div class="tx-detail">
      <div><strong>TX #${idx + 1}</strong> • Block #${blockNo ?? ''} • ${ts}</div>
      <div class="tx-meta">From: ${shortAddr(sender)} → To: ${shortAddr(recipient)}</div>
      ${hashHtml}
      <div class="tx-meta">Gas used: ${gasUsed}${gasPrice ? ' • Gas price: ' + gasPrice : ''} • Value: ${value} wei${confirmations ? ' • ' + confirmations + ' xác nhận' : ''}</div>
      <div class="tx-meta">Số tiền logic: ${amount}</div>
    </div>`;
  }).join('') || '<div class="empty-state"><p>Block này chưa có giao dịch</p></div>';

  body.innerHTML = `<div><strong>Block #${block.index ?? blockIndex}</strong> • ${ts}</div>` + detailsHtml;
  detailCard.style.display = 'block';
}

// Render recent transactions
export function renderRecentTx() {
  const container = document.getElementById('txList');
  if (allBlocks.length === 0) {
    container.innerHTML = '<div class="empty-state"><p>Chưa có block/giao dịch nào</p></div>';
    return;
  }
  // Lấy địa chỉ ví hiện tại (nếu có)
  let currentAddress = window.wallet && window.wallet.getAddress ? null : null;
  if(window.wallet && typeof window.wallet.getAddress === 'function') {
    // getAddress trả về Promise
    window.wallet.getAddress().then(addr => { currentAddress = addr; rerender(); });
  }
  function rerender() {
    container.innerHTML = allBlocks.map((block, i) => {
      const blockTime = block.timestamp ? new Date(block.timestamp * 1000).toLocaleString('vi-VN') : '';
      return `<div class="block-group">
        <div class="block-header">
          <b>Block #${i}</b> <span class="block-time">${blockTime}</span> <span class="block-tx-count">(${block.transactions.length} giao dịch)</span>
        </div>
        <div class="block-tx-list">
          ${block.transactions.length === 0 ? '<div class="empty-state">Không có giao dịch</div>' : block.transactions.map(tx => {
            const onchain = tx.onchain || {};
            const shortAddr = (addr) => {
              if (!addr || typeof addr !== 'string') return '';
              return addr.length > 14 ? addr.slice(0, 8) + '...' + addr.slice(-6) : addr;
            };

            let status = 'Đã gửi';
            if (tx.confirmed || tx.status === 'confirmed') status = 'Đã xác nhận';
            else if (tx.status === 'pending') status = 'Đang chờ';
            else if (tx.status === 'failed') status = 'Thất bại';
            let time = tx.timestamp ? new Date(tx.timestamp * 1000).toLocaleString('vi-VN') : '';
            let hash = '';
            if (tx.hash) {
              const isSepolia = onchain.chainId === 11155111 || onchain.chainId === '11155111';
              const explorer = isSepolia ? `https://sepolia.etherscan.io/tx/${tx.hash}` : null;
              const label = `${tx.hash.slice(0,10)}...${tx.hash.slice(-6)}`;
              if (explorer) {
                hash = `<div class='tx-hash'>Hash: <a href='${explorer}' target='_blank' rel='noopener' title='${tx.hash}'>${label}</a></div>`;
              } else {
                hash = `<div class='tx-hash'>Hash: <span title='${tx.hash}'>${label}</span></div>`;
              }
            }
            let amount = tx.amount ? tx.amount : '';
            let desc = tx.desc || '';
            // Phân loại gửi/nhận
            let type = '';
            let icon = '';
            let amountStr = '';
            if(currentAddress && tx.sender && tx.sender.toLowerCase() === currentAddress.toLowerCase()) {
              type = 'outgoing'; icon = '🔻'; amountStr = `<span class='tx-out'>-${amount}</span>`;
            } else if(currentAddress && tx.recipient && tx.recipient.toLowerCase() === currentAddress.toLowerCase()) {
              type = 'incoming'; icon = '🔺'; amountStr = `<span class='tx-in'>+${amount}</span>`;
            } else {
              type = 'other'; icon = '🔄'; amountStr = amount;
            }
            // Số confirmations (nếu có)
            let conf = (onchain.confirmations !== undefined ? `<span class='tx-conf'>${onchain.confirmations} xác nhận</span>` : (tx.confirmations !== undefined ? `<span class='tx-conf'>${tx.confirmations} xác nhận</span>` : ''));
            // Block height: ưu tiên blockNumber on-chain, fallback index trong chain MongoDB
            let blockNo = onchain.blockNumber !== undefined && onchain.blockNumber !== null ? onchain.blockNumber : block.index;
            let blockHeight = blockNo !== undefined ? `<span class='tx-block'>Block #${blockNo}</span>` : '';

            // Thông tin chi tiết giống ví: from/to, gas, value
            let metaLines = '';
            if (onchain.from || onchain.to) {
              metaLines += `<div class='tx-meta'>From: ${shortAddr(onchain.from)} → To: ${shortAddr(onchain.to)}</div>`;
            }
            if (onchain.gasUsed || onchain.gasPrice || onchain.value) {
              const gasUsed = onchain.gasUsed ?? '?';
              const gasPrice = onchain.gasPrice ?? '';
              const value = onchain.value ?? '0';
              metaLines += `<div class='tx-meta'>Gas used: ${gasUsed}${gasPrice ? ' • Gas price: ' + gasPrice : ''} • Value: ${value} wei</div>`;
            }
            return `<div class="transaction-item ${type}">
              <div class="tx-info">
                <div class="tx-from-to">${icon} ${tx.sender} → ${tx.recipient}</div>
                <div class="tx-status"><span class="tx-status-label">${status}</span>${time ? ' | ' + time : ''} ${conf} ${blockHeight}</div>
                ${hash}
                ${metaLines}
                ${desc ? `<div class='tx-desc'>${desc}</div>` : ''}
              </div>
              <div class="tx-amount">${amountStr}</div>
            </div>`
          }).join('')}
        </div>
      </div>`
    }).join('');
  }
  // Nếu chưa có address, render tạm, khi có address sẽ rerender lại
  rerender();

  const blockLabels = allBlocks.map((_, i) => `Block ${i}`);
  const txCounts = allBlocks.map(b => b.transactions.length);

  if (txChart) txChart.destroy();

  txChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: blockLabels.length > 0 ? blockLabels : ['Chưa có data'],
      datasets: [{
        label: 'Số giao dịch',
        data: txCounts.length > 0 ? txCounts : [0],
        backgroundColor: 'rgba(52, 152, 219, 0.6)',
        borderColor: 'rgba(52, 152, 219, 1)',
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { stepSize: 1 }
        }
      }
    }
  });
}

// Load all data
export async function loadData() {
  try {
    const res = await fetch(apiUrl('/api/transactions'));
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    
    allTransactions.length = 0;
    allTransactions.push(...(data.current || []));
    allBlocks.length = 0;
    allBlocks.push(...(data.chain || []));

    updateStats();
    renderTransactions();
    renderBlocks();
    renderRecentTx();
    updateStatus('online');
  } catch (err) {
    updateStatus('offline');
    console.error('Load error:', err);
  }
}

// Add transaction
export async function addTransaction() {
  // Xóa thông báo cũ (nếu có)
  const statusEl = document.getElementById('addStatus');
  if (statusEl) statusEl.innerHTML = '';

  let sender = document.getElementById('sender').value.trim();
  const recipient = document.getElementById('recipient').value.trim();
  const amountRaw = document.getElementById('amount').value.trim();
  const amount = parseFloat(amountRaw.replace(',', '.'));
  const onchain = document.getElementById('onchainToggle') ? document.getElementById('onchainToggle').checked : false;
  const contractAddr = window.PERSONAL_FINANCE_CONTRACT || null;
  const desc = document.getElementById('desc') ? document.getElementById('desc').value.trim() : '';
  const signWithWallet = document.getElementById('signWithWallet') ? document.getElementById('signWithWallet').checked : false;
  const sendEth = document.getElementById('sendEthCheckbox') ? document.getElementById('sendEthCheckbox').checked : false;

  // If on-chain mode is requested, prefer the connected wallet as the sender
  if (onchain && window.wallet && typeof window.wallet.getAddress === 'function') {
    try {
      const waddr = await window.wallet.getAddress();
      if (waddr) {
        // override sender input so user sees it
        document.getElementById('sender').value = waddr;
        // re-read local sender from DOM to ensure we use the connected address
        sender = document.getElementById('sender').value.trim();
      }
    } catch (e) {
      // ignore if cannot read wallet address
    }
  }


  // Kiểm tra dữ liệu đầu vào
  if (!sender) {
    showMessage('addStatus', 'Vui lòng nhập "Người gửi"', 'error');
    return;
  }
  if (!recipient) {
    showMessage('addStatus', 'Vui lòng nhập "Người nhận" (địa chỉ ví)', 'error');
    return;
  }
  if (!amountRaw || Number.isNaN(amount) || amount <= 0) {
    showMessage('addStatus', 'Vui lòng nhập số tiền hợp lệ (> 0)', 'error');
    return;
  }

  try {
    if (onchain) {
      if (!contractAddr) {
        showMessage('addStatus', 'Chưa cấu hình địa chỉ smart contract (PERSONAL_FINANCE_CONTRACT)', 'error');
        return;
      }
      // send to blockchain using personalFinance helper or direct ETH transfer
      const pf = await import('/src/utils/personalFinance.js')
      const income = sender.toLowerCase() === recipient.toLowerCase() ? true : false
      let result = null
      let txHash = null
      let txMeta = null

      if (sendEth) {
        try {
          // send ETH directly to recipient
          result = await pf.sendEth(recipient, amount)
          txHash = result && result.txHash ? result.txHash : null
          txMeta = {
            hash: txHash,
            from: result && result.tx ? result.tx.from : undefined,
            to: result && result.tx ? result.tx.to : recipient,
            nonce: result && result.tx ? result.tx.nonce : undefined,
            chainId: result && result.tx ? result.tx.chainId : undefined,
            gasPrice: result && result.tx ? result.tx.gasPrice : undefined,
            value: result && result.tx ? result.tx.value : undefined,
            blockNumber: result && result.receipt ? result.receipt.blockNumber : undefined,
            gasUsed: result && result.receipt ? result.receipt.gasUsed : undefined,
            status: result && result.receipt ? result.receipt.status : undefined,
            confirmations: result && result.receipt ? result.receipt.confirmations : undefined
          }
        } catch (e) {
          showMessage('addStatus', `✗ Lỗi gửi ETH: ${e && e.message ? e.message : e}`, 'error')
          return
        }
      } else {
        // prepare note to include recipient and optional desc so it's visible on-chain
        const noteForOnchain = (desc ? `${desc} | ` : '') + `to:${recipient}`;
        // Ghi giao dịch lên contract
        result = await pf.addOnchainTransaction(contractAddr, amount, income, 'general', noteForOnchain)
        txHash = result && result.txHash ? result.txHash : null
        txMeta = {
          hash: txHash,
          from: result && result.tx ? result.tx.from : undefined,
          to: result && result.tx ? (result.tx.to || contractAddr) : contractAddr,
          nonce: result && result.tx ? result.tx.nonce : undefined,
          chainId: result && result.tx ? result.tx.chainId : undefined,
          gasPrice: result && result.tx ? result.tx.gasPrice : undefined,
          value: result && result.tx ? result.tx.value : undefined,
          blockNumber: result && result.receipt ? result.receipt.blockNumber : undefined,
          gasUsed: result && result.receipt ? result.receipt.gasUsed : undefined,
          status: result && result.receipt ? result.receipt.status : undefined,
          confirmations: result && result.receipt ? result.receipt.confirmations : undefined
        }
      }

      // Sau khi on-chain OK, gửi thêm về backend để lưu MongoDB (kèm txHash + metadata nếu có)
      try {
        const payload = { sender, recipient, amount, tx_hash: txHash, tx_meta: txMeta };
        if (desc) payload.desc = desc;
        if (signWithWallet && window.wallet && typeof window.wallet.signMessage === 'function') {
          try {
            const message = `${sender}|${recipient}|${amount}|${desc}|${Date.now()}`;
            const sig = await window.wallet.signMessage(message);
            const addr = await window.wallet.getAddress();
            payload.signature = sig;
            payload.message = message;
            payload.address = addr;
          } catch (e) {
            console.warn('Wallet sign failed:', e);
          }
        }

        const res = await fetch(apiUrl('/api/transactions'), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (!data.ok) {
          throw new Error(data.error || 'Lưu MongoDB thất bại');
        }
        showMessage('addStatus', `✓ On-chain: ${result.txHash} & lưu MongoDB`, 'success');
      } catch (e) {
        // On-chain thành công nhưng backend lỗi
        showMessage('addStatus', `✓ On-chain: ${result.txHash}, nhưng lỗi MongoDB: ${e.message}`, 'error');
        return;
      }

      document.getElementById('sender').value = '';
      document.getElementById('recipient').value = '';
      document.getElementById('amount').value = '';
      if (document.getElementById('desc')) document.getElementById('desc').value = '';
      if (document.getElementById('signWithWallet')) document.getElementById('signWithWallet').checked = false;
      setTimeout(async ()=>{ await loadData(); }, 800);
    } else {
      const payload = { sender, recipient, amount };
      if (desc) payload.desc = desc;
      if (signWithWallet && window.wallet && typeof window.wallet.signMessage === 'function') {
        try {
          const message = `${sender}|${recipient}|${amount}|${desc}|${Date.now()}`;
          const sig = await window.wallet.signMessage(message);
          const addr = await window.wallet.getAddress();
          payload.signature = sig;
          payload.message = message;
          payload.address = addr;
        } catch (e) {
          console.warn('Wallet sign failed:', e);
        }
      }
      const res = await fetch(apiUrl('/api/transactions'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.ok) {
        showMessage('addStatus', '✓ Giao dịch thành công! Block đã được mine.', 'success');
        document.getElementById('sender').value = '';
        document.getElementById('recipient').value = '';
        document.getElementById('amount').value = '';
        if (document.getElementById('desc')) document.getElementById('desc').value = '';
        if (document.getElementById('signWithWallet')) document.getElementById('signWithWallet').checked = false;
        setTimeout(loadData, 500);
      } else {
        showMessage('addStatus', `✗ Lỗi: ${data.error}`, 'error');
      }
    }
  } catch (err) {
    // Xử lý riêng trường hợp bạn bấm Hủy trên MetaMask
    const code = err && (err.code || (err.info && err.info.code) || (err.error && err.error.code));
    const msg = err && err.message ? err.message : String(err);

    if (code === 'ACTION_REJECTED' || code === 4001 || msg.includes('ACTION_REJECTED') || msg.includes('user denied')) {
      showMessage('addStatus', 'Bạn đã hủy giao dịch trên MetaMask (không có gì bị gửi).', 'error');
      return;
    }

    showMessage('addStatus', `✗ Lỗi: ${msg}`, 'error');
  }
}
