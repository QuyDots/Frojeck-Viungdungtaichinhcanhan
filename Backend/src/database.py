from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB connection
MONGO_URI = os.getenv('MONGO_URI', 'mongodb://localhost:27017')
MONGO_DB_NAME = os.getenv('MONGO_DB_NAME', 'financechain')

# Async client for FastAPI
async_client = None
async_db = None

# Sync client for initial setup
sync_client = None
sync_db = None


def to_serializable(doc):
    """Convert ObjectId and datetime (including nested) to JSON-serializable values."""
    if isinstance(doc, dict):
        new_doc = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                new_doc[key] = str(value)
            elif isinstance(value, datetime):
                new_doc[key] = value.isoformat()
            elif isinstance(value, list):
                new_doc[key] = [to_serializable(item) for item in value]
            elif isinstance(value, dict):
                new_doc[key] = to_serializable(value)
            else:
                new_doc[key] = value
        return new_doc
    return doc

def init_mongodb():
    """Initialize MongoDB connection"""
    global async_client, async_db, sync_client, sync_db
    
    # Async client for FastAPI endpoints
    async_client = AsyncIOMotorClient(MONGO_URI)
    async_db = async_client[MONGO_DB_NAME]
    
    # Sync client for startup operations
    sync_client = MongoClient(MONGO_URI)
    sync_db = sync_client[MONGO_DB_NAME]
    
    # Create collections if not exist
    collections = sync_db.list_collection_names()
    if 'transactions' not in collections:
        sync_db.create_collection('transactions')
    if 'blocks' not in collections:
        sync_db.create_collection('blocks')
    if 'payments' not in collections:
        sync_db.create_collection('payments')
    
    print(f"✓ MongoDB connected: {MONGO_DB_NAME}")
    return async_db, sync_db

def get_async_db():
    """Get async database instance"""
    return async_db

def get_sync_db():
    """Get sync database instance"""
    return sync_db

async def close_mongodb():
    """Close MongoDB connection"""
    if async_client:
        async_client.close()
    if sync_client:
        sync_client.close()

# Transaction operations
async def save_transaction(transaction_data):
    """Save transaction to MongoDB"""
    db = get_async_db()
    transaction_data['created_at'] = datetime.utcnow()
    result = await db.transactions.insert_one(transaction_data)
    return str(result.inserted_id)

# Payment operations
async def save_payment(payment_data):
    """Save a payment request to MongoDB"""
    db = get_async_db()
    payment_data['created_at'] = datetime.utcnow()
    result = await db.payments.insert_one(payment_data)
    return str(result.inserted_id)

async def get_all_payments():
    """Get all payments from MongoDB"""
    db = get_async_db()
    cursor = db.payments.find().sort('created_at', -1)
    payments = []
    async for doc in cursor:
        payments.append(to_serializable(doc))
    return payments

async def get_payment(payment_id):
    """Get a single payment by id"""
    db = get_async_db()
    try:
        doc = await db.payments.find_one({'_id': ObjectId(payment_id)})
    except Exception:
        return None
    return to_serializable(doc) if doc else None

async def update_payment(payment_id, update_dict):
    """Update payment document"""
    db = get_async_db()
    try:
        res = await db.payments.update_one({'_id': ObjectId(payment_id)}, {'$set': update_dict})
    except Exception:
        return False
    return res.modified_count > 0

async def get_all_transactions():
    """Get all transactions from MongoDB"""
    db = get_async_db()
    cursor = db.transactions.find().sort('created_at', -1)
    transactions = []
    async for doc in cursor:
        transactions.append(to_serializable(doc))
    return transactions

async def clear_transactions():
    """Clear all pending transactions"""
    db = get_async_db()
    await db.transactions.delete_many({'mined': False})

# Block operations
async def save_block(block_data):
    """Save block to MongoDB"""
    db = get_async_db()
    block_data['created_at'] = datetime.utcnow()
    result = await db.blocks.insert_one(block_data)
    return str(result.inserted_id)

async def get_all_blocks():
    """Get all blocks from MongoDB"""
    db = get_async_db()
    cursor = db.blocks.find().sort('index', 1)
    blocks = []
    async for doc in cursor:
        blocks.append(to_serializable(doc))
    return blocks

def get_block_count_sync():
    """Get block count (sync version for startup)"""
    db = get_sync_db()
    return db.blocks.count_documents({})

async def get_block_count():
    """Get block count"""
    db = get_async_db()
    return await db.blocks.count_documents({})
