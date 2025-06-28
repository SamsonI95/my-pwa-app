import { openDB } from 'idb';

const DB_NAME = 'inventory-db';
const STORE_NAME = 'items';
// const API_URL = 'http://localhost:3001/api/items';
const API_URL = '/api/items';

export async function getDB() {
    return openDB(DB_NAME, 1, {
        upgrade(db) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        },
    });
}

export async function getItems() {
    const db = await getDB();
    return db.getAll(STORE_NAME);
}

export async function addItem(item, isOnline) {
    const db = await getDB();
    return db.add(STORE_NAME, { ...item, pending: !isOnline });
}

export async function updateItem(item, isOnline) {
    const db = await getDB();
    return db.put(STORE_NAME, { ...item, pending: !isOnline });
}

export async function deleteItem(id) {
    const db = await getDB();
    return db.delete(STORE_NAME, id);
}

// --- API functions ---
export async function fetchRemoteItems() {
    const res = await fetch(API_URL);
    return res.json();
}

export async function addRemoteItem(item) {
    const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return res.json();
}

export async function updateRemoteItem(item) {
    const res = await fetch(`${API_URL}/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
    });
    return res.json();
}

export async function deleteRemoteItem(id) {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
}

// --- Sync local pending items to remote API ---
export async function syncPendingItems() {
    const db = await getDB();
    const all = await db.getAll(STORE_NAME);
    for (const item of all) {
        if (item.pending) {
            try {
                // Try to find the item on the server
                const res = await fetch(`${API_URL}/${item.id}`);
                if (res.ok) {
                    // Item exists on server, update it
                    await updateRemoteItem(item);
                    await db.put(STORE_NAME, { ...item, pending: false });
                } else {
                    // Item does not exist on server, POST as new
                    const { id: _, ...itemWithoutId } = item;
                    const remote = await addRemoteItem(itemWithoutId);
                    // Remove the old local item and add the new one with the remote ID
                    await db.delete(STORE_NAME, item.id);
                    await db.put(STORE_NAME, { ...remote, pending: false });
                }
            } catch {
                // Could not sync, keep pending
            }
        }
    }
}