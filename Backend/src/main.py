import os
import json
import logging
from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse, HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from colorama import Fore, Style, init as colorama_init
import time
from contextlib import asynccontextmanager
from .database import (
    init_mongodb, close_mongodb, 
    save_transaction, get_all_transactions, clear_transactions,
    save_block, get_all_blocks, get_block_count_sync,
    save_payment, get_all_payments, get_payment, update_payment,
)

# eth signature verification
try:
    from eth_account.messages import encode_defunct
    from eth_account import Account
except Exception:
    encode_defunct = None
    Account = None

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_mongodb()
    seed_data()
    yield
    # Shutdown
    await close_mongodb()

app = FastAPI(title="Backend API", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
colorama_init(autoreset=True)

CHAIN = None  # Deprecated: Now using MongoDB

def seed_data():
    seed_file = os.path.join(os.path.dirname(__file__), '..', 'seed.json')
    seed_file = os.path.abspath(seed_file)
    use_sample = os.environ.get('SEED_SAMPLE') == '1'
    seeded = False
    
    # Check if DB already has data
    existing_blocks = get_block_count_sync()
    if existing_blocks > 0:
        print(Fore.CYAN + f'[seed] Database already has {existing_blocks} blocks, skipping seed')
        return True
    
    from .database import get_sync_db
    db = get_sync_db()
    
    if use_sample:
        # Sample data
        tx1 = {"sender": "alice", "recipient": "bob", "amount": 10, "mined": True}
        tx2 = {"sender": "carol", "recipient": "dave", "amount": 7, "mined": True}
        db.transactions.insert_many([tx1, tx2])
        
        block_data = {
            "index": 0,
            "timestamp": time.time(),
            "transactions": [tx1, tx2]
        }
        db.blocks.insert_one(block_data)
        print(Fore.CYAN + '[seed] Loaded sample seed data from env SEED_SAMPLE=1')
        seeded = True
        
    elif os.path.exists(seed_file):
        try:
            with open(seed_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            # Handle both array and object formats
            transactions = data if isinstance(data, list) else data.get('transactions', [])
            
            tx_docs = []
            for tx in transactions:
                # Support both old format (owner/category) and new format (sender/recipient)
                if 'sender' in tx and 'recipient' in tx:
                    tx_docs.append({
                        "sender": tx['sender'],
                        "recipient": tx['recipient'],
                        "amount": tx['amount'],
                        "mined": True
                    })
                elif 'owner' in tx:
                    # Convert old format
                    owner = tx['owner']
                    category = tx.get('category', 'unknown')
                    amount = tx['amount']
                    if tx.get('isIncome'):
                        tx_docs.append({"sender": category, "recipient": owner, "amount": amount, "mined": True})
                    else:
                        tx_docs.append({"sender": owner, "recipient": category, "amount": amount, "mined": True})
            
            if tx_docs:
                db.transactions.insert_many(tx_docs)
                block_data = {
                    "index": 0,
                    "timestamp": time.time(),
                    "transactions": tx_docs
                }
                db.blocks.insert_one(block_data)
                print(Fore.CYAN + f"[seed] Loaded {len(tx_docs)} transactions from {seed_file}")
                seeded = True
        except Exception as e:
            print(Fore.RED + f"[seed] Failed to load seed data: {e}")
    else:
        print(Fore.YELLOW + '[seed] No seed.json; starting with empty chain')
    return seeded

@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log đơn giản: in 1 dòng cho mỗi request (ngoại trừ /devtools)
    path = request.url.path or ""
    response = await call_next(request)

    if not path.startswith('/devtools'):
        addr = request.client.host if request.client else "-"
        status = response.status_code
        # Không dùng màu ANSI (PowerShell đôi khi không hiển thị) — in dạng đơn giản
        print(f'{addr} - "{request.method} {path} HTTP/1.1" {status}')

    return response

@app.get("/")
def index():
    html = (
        "<!doctype html><html lang=\"vi\"><head><meta charset=\"utf-8\">"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">"
        "<title>Backend API</title></head><body>"
        "<h1>Backend đang chạy</h1>"
        "<p>API health: <code>/api/health</code></p>"
        "<p>UI ở <a href=\"http://127.0.0.1:5001\">http://127.0.0.1:5001</a></p>"
        "</body></html>"
    )
    return HTMLResponse(content=html)

@app.get("/api/health")
def health():
    return JSONResponse({"status": "ok"})

@app.get("/api/transactions")
async def transactions_get():
    pending = await get_all_transactions()
    blocks = await get_all_blocks()
    return JSONResponse({
        "current": pending,
        "chain": blocks,
    })

@app.post("/api/transactions")
async def transactions_post(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "invalid JSON"}, status_code=400)

    if not isinstance(body, dict):
        return JSONResponse({"ok": False, "error": "expected JSON object"}, status_code=400)

    sender = body.get('sender')
    recipient = body.get('recipient')
    amount = body.get('amount')
    tx_hash = body.get('tx_hash')  # optional on-chain tx hash
    tx_meta = body.get('tx_meta')  # optional on-chain metadata (from/to, gas, block, ...)
    # optional on-chain signature fields
    signature = body.get('signature')
    signed_message = body.get('message')
    signer_address = body.get('address')
    
    if sender and recipient and amount is not None:
        # Save transaction
        tx_data = {
            "sender": sender,
            "recipient": recipient,
            "amount": amount,
            "mined": False,
        }
        # attach on-chain tx hash + metadata if provided
        if tx_hash:
            tx_data["hash"] = tx_hash
        if isinstance(tx_meta, dict):
            tx_data["onchain"] = tx_meta
        # If signature provided, verify it matches signer_address
        if signature and signed_message and signer_address and Account is not None:
            try:
                msg = encode_defunct(text=signed_message)
                recovered = Account.recover_message(msg, signature=signature)
                if recovered.lower() != signer_address.lower():
                    return JSONResponse({"ok": False, "error": "signature mismatch"}, status_code=400)
                # attach wallet info
                tx_data['wallet_address'] = signer_address
                tx_data['signature'] = signature
                tx_data['signed_message'] = signed_message
            except Exception as e:
                return JSONResponse({"ok": False, "error": f"signature verify failed: {e}"}, status_code=400)
        from bson import ObjectId
        tx_id = await save_transaction(tx_data)
        # Log transaction saved
        try:
            print(f"[tx] Saved transaction {tx_id} {sender}->{recipient} amount={amount}")
        except Exception:
            # Best-effort logging
            pass
        
        # Mine block with this transaction
        from .database import get_block_count
        block_index = await get_block_count()

        # Tạo label dễ đọc cho block, ví dụ: "Alice → Bob (Block #3)"
        label = f"{sender} → {recipient} (Block #{block_index})"

        block_data = {
            "index": block_index,
            "timestamp": time.time(),
            "transactions": [tx_data],
            "label": label,
        }
        block_id = await save_block(block_data)
        # Log block mined
        try:
            print(f"[block] Mined block #{block_index} id={block_id} label='{label}' txs={len(block_data.get('transactions', []))}")
        except Exception:
            pass
        # Mark transaction as mined
        from .database import get_async_db
        db = get_async_db()
        await db.transactions.update_one({"_id": ObjectId(tx_id)}, {"$set": {"mined": True, "block_id": block_id}})
        try:
            print(f"[block] Marked tx {tx_id} as mined in block {block_id}")
        except Exception:
            pass
        return JSONResponse({"ok": True, "transaction_id": tx_id, "block_id": block_id})
    
    return JSONResponse({"ok": False, "error": "missing fields"}, status_code=400)


@app.get("/api/payments")
async def payments_list():
    payments = await get_all_payments()
    return JSONResponse({"payments": payments})


@app.get("/api/payments/{payment_id}")
async def payment_detail(payment_id: str):
    payment = await get_payment(payment_id)
    if not payment:
        return JSONResponse({"ok": False, "error": "not found"}, status_code=404)
    return JSONResponse({"payment": payment})


@app.post("/api/payments")
async def payments_create(request: Request):
    try:
        body = await request.json()
    except Exception:
        return JSONResponse({"ok": False, "error": "invalid JSON"}, status_code=400)

    payer = body.get('payer')
    payee = body.get('payee')
    amount = body.get('amount')
    currency = body.get('currency', 'USD')

    if not (payer and payee and amount is not None):
        return JSONResponse({"ok": False, "error": "missing fields"}, status_code=400)

    payment = {
        "payer": payer,
        "payee": payee,
        "amount": amount,
        "currency": currency,
        "status": "pending",
        "created_at": time.time()
    }

    payment_id = await save_payment(payment)

    # Create a blockchain transaction and mine a block immediately (simple integration)
    tx_data = {
        "sender": payer,
        "recipient": payee,
        "amount": amount,
        "mined": False
    }
    tx_id = await save_transaction(tx_data)

    from .database import get_block_count
    block_index = await get_block_count()
    label = f"{payer} → {payee} (Block #{block_index})"
    block_data = {
        "index": block_index,
        "timestamp": time.time(),
        "transactions": [tx_data],
        "label": label,
    }
    block_id = await save_block(block_data)

    # mark tx mined
    from .database import get_async_db
    from bson import ObjectId
    db = get_async_db()
    await db.transactions.update_one({"_id": ObjectId(tx_id)}, {"$set": {"mined": True, "block_id": block_id}})

    # update payment status and link tx/block
    await update_payment(payment_id, {"status": "confirmed", "transaction_id": tx_id, "block_id": block_id, "confirmed_at": time.time()})

    return JSONResponse({"ok": True, "payment_id": payment_id, "transaction_id": tx_id, "block_id": block_id})


@app.post("/api/payments/{payment_id}/confirm")
async def payments_confirm(payment_id: str):
    payment = await get_payment(payment_id)
    if not payment:
        return JSONResponse({"ok": False, "error": "not found"}, status_code=404)
    if payment.get('status') == 'confirmed':
        return JSONResponse({"ok": False, "error": "already confirmed"}, status_code=400)

    # create tx + block similarly
    tx_data = {
        "sender": payment.get('payer'),
        "recipient": payment.get('payee'),
        "amount": payment.get('amount'),
        "mined": False
    }
    tx_id = await save_transaction(tx_data)
    from .database import get_block_count
    block_index = await get_block_count()
    label = f"{payment.get('payer')} → {payment.get('payee')} (Block #{block_index})"
    block_data = {"index": block_index, "timestamp": time.time(), "transactions": [tx_data], "label": label}
    block_id = await save_block(block_data)

    from .database import get_async_db
    from bson import ObjectId
    db = get_async_db()
    await db.transactions.update_one({"_id": ObjectId(tx_id)}, {"$set": {"mined": True, "block_id": block_id}})

    await update_payment(payment_id, {"status": "confirmed", "transaction_id": tx_id, "block_id": block_id, "confirmed_at": time.time()})

    return JSONResponse({"ok": True, "payment_id": payment_id, "transaction_id": tx_id, "block_id": block_id})

if __name__ == "__main__":
    print("Run with: uvicorn src.main:app --host 127.0.0.1 --port 5000 --reload")