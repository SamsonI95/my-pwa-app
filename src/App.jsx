import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);
    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
    };
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">React PWA</h1>
        <p className={`mt-4 text-lg font-medium ${isOnline ? 'text-green-500' : 'text-red-500'}`}>
          {isOnline ? 'You are online ✅' : 'You are offline ❌'}
        </p>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Try turning off your internet and reloading the app.</p>
      </div>
    </div>
  );
}

export default App;
