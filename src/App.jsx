import React, { useEffect, useState } from 'react'
import './App.css'
import { getItems, addItem, updateItem, syncPendingItems, fetchRemoteItems, getDB, addRemoteItem, updateRemoteItem, } from './inventoryStore'

function App() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ name: "", quantity: "" });
  const [editingId, setEditingId] = useState(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    loadItems();
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      syncAndFetch();
    } else {
      loadItems();
    }
  }, [isOnline]);

  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  async function handleOnline() {
    setIsOnline(true);
  }
  async function handleOffline() {
    setIsOnline(false);
  }

  async function loadItems() {
    setItems(await getItems());
  }

  async function syncAndFetch() {
    await syncPendingItems();
    // Fetch remote items and update local DB
    const remoteItems = await fetchRemoteItems();

    // Update local IndexedDB to match remote
    const db = await getDB();
    const tx = db.transaction('items', 'readwrite');
    await tx.store.clear();
    for (const item of remoteItems) {
      await tx.store.put({ ...item, pending: false });
    }
    await tx.done;

    // Always reload from local DB to ensure IDs are in sync
    setItems(await getItems());
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (editingId) {
      if (isOnline) {
        await updateRemoteItem({ id: editingId, ...form });
        await syncAndFetch();
      } else {
        await updateItem({ id: editingId, ...form }, isOnline);
        await loadItems();
      }
    } else {
      if (isOnline) {
        await addRemoteItem(form);
        await syncAndFetch();
      } else {
        await addItem(form, isOnline);
        await loadItems();
      }
    }
    setForm({ name: "", quantity: "" });
    setEditingId(null);
  }

  // function handleEdit(item) {
  //   setForm({ name: item.name, quantity: item.quantity });
  //   setEditingId(item.id);
  // }

  // async function handleDelete(id) {
  //   if (isOnline) {
  //     await deleteRemoteItem(id);
  //     await syncAndFetch();
  //   } else {
  //     await deleteItem(id);
  //     await loadItems();
  //   }
  // }

  const totalPages = Math.ceil(items.length / itemsPerPage);
  const paginatedItems = items.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="lg:min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-2">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center text-gray-900 dark:text-white">Inventory Management</h1>
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="text-sm sm:text-base text-gray-700 dark:text-gray-200">
            Status: <span className={isOnline ? "text-green-600" : "text-red-600"}>{isOnline ? "Online" : "Offline"}</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="mb-6 grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white col-span-1 sm:col-span-2"
            placeholder="Item name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            className="border border-gray-300 dark:border-gray-700 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-gray-700 dark:text-white col-span-1"
            placeholder="Quantity"
            type="number"
            min="1"
            value={form.quantity}
            onChange={e => setForm({ ...form, quantity: e.target.value })}
            required
          />
          <div className="flex gap-2 col-span-1">
            <button className="cursor-pointer w-full bg-blue-500 hover:bg-blue-600 text-white px-2 py-2 rounded transition-colors duration-150 text-sm font-semibold" type="submit">
              {editingId ? "Update" : "Add"}
            </button>
            {editingId && (
              <button className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 px-2 py-2 rounded transition-colors duration-150 text-sm font-semibold" onClick={() => { setForm({ name: "", quantity: "" }); setEditingId(null); }} type="button">
                Cancel
              </button>
            )}
          </div>
        </form>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {paginatedItems.length === 0 && (
            <li className="py-6 text-center text-gray-500 dark:text-gray-400">No items in inventory.</li>
          )}
          {paginatedItems.map(item => (
            <li key={item.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 gap-2">
              <span className="flex-1 text-gray-900 dark:text-white">
                <b>{item.name}</b> <span className="text-gray-500 dark:text-gray-300">(Qty: {item.quantity})</span>
                {item.pending && <span className="ml-2 text-yellow-600 text-xs">Pending Sync</span>}
              </span>
              {/* <span className="flex gap-2">
                <button className="cursor-pointer text-blue-600 hover:underline text-sm font-medium" onClick={() => handleEdit(item)} disabled={item.pending}>Edit</button>
                <button className="cursor-pointer text-red-600 hover:underline text-sm font-medium" onClick={() => handleDelete(item.id)} disabled={item.pending}>Delete</button>
              </span> */}
            </li>
          ))}
        </ul>
        <div className="text-white not-odd:flex justify-center items-center gap-2 mt-4">
          <button
            className="px-3 py-1 rounded bg-gray-500 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
          >
            Prev
          </button>
          <span className="mx-2 text-sm">
            Page {currentPage} of {totalPages}
          </span>
          <button
            className="px-3 py-1 rounded bg-gray-500 disabled:opacity-50"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
