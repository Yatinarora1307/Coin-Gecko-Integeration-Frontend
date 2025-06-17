'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

type Coin = {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  image: string;
};

export default function CoinsPage() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:3005/coins') // your Node.js backend endpoint
      .then((res) => res.json())
      .then((data) => {
        setCoins(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading coins...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Top Coins</h1>
      <ul className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {coins?.length > 0  && coins.map((coin) => (
          <li key={coin.id} className="border p-4 rounded shadow hover:shadow-lg">
            <Link href={`/coins/${coin.id}`}>
              <div className="flex items-center gap-4 cursor-pointer">
             
                <div>
                  <h2 className="text-lg font-semibold">{coin.name} ({coin.symbol.toUpperCase()})</h2>

                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
