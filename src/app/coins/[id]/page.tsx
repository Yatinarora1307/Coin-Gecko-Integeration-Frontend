'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-date-fns';

type CoinDetail = {
    id: string;
    name: string;
    symbol: string;
    image: { large: string };
    description: { en: string };
    market_data: {
        current_price: { usd: number };
        market_cap: { usd: number };
        price_change_percentage_24h: number;
    };
};

export default function CoinDetailPage() {
    const { id } = useParams<{ id: string }>();
    const [coin, setCoin] = useState<CoinDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const chartRef = useRef<HTMLCanvasElement | null>(null);
    const chartInstance = useRef<Chart | null>(null);
    useEffect(() => {
        if (!id) return;
    
        async function fetchCoin() {
            try {
                const res = await fetch(`http://localhost:3005/coins/${id}`);
                const data = await res.json();
                setCoin(data);
            } catch (err) {
                console.error("Error fetching coin:", err);
            } finally {
                setLoading(false); 
            }
        }
    
        fetchCoin();
    }, [id]);
    
    useEffect(() => {
        if (!id || !coin || !chartRef.current) return;
    
        async function fetchChartData() {
            const res = await fetch(`http://localhost:3004/coins/${id}/chart`);
            const data = await res.json();
    
            const prices = data.prices.map(([timestamp, price]: [number, number]) => ({
                x: new Date(timestamp),
                y: price.toFixed(2),
            }));
    
            if(!chartRef.current){
                return;
            }
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }
    
            const ctx = chartRef.current.getContext('2d');
            if (!ctx) return;
    
            chartInstance.current = new Chart(ctx, {
                type: 'line',
                data: {
                    datasets: [
                        {
                            label: 'Price (USD)',
                            data: prices,
                            borderColor: 'rgba(75,192,192,1)',
                            backgroundColor: 'rgba(75,192,192,0.2)',
                            tension: 0.3,
                        },
                    ],
                },
                options: {
                    responsive: true,
                    scales: {
                        x: {
                            type: 'time',
                            time: {
                                unit: 'day',
                            },
                            title: {
                                display: true,
                                text: 'Date',
                            },
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Price in USD',
                            },
                        },
                    },
                },
            });
        }
    
        fetchChartData();
    }, [id, coin]);
    
    if (loading) return <p>Loading coin details...</p>;
    if (!coin) return <p>Coin not found</p>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">
                {coin.name} ({coin?.symbol?.toUpperCase()})
            </h1>
            <img src={coin?.image?.large} alt={coin.name} className="w-20 h-20 my-4" />
            <p
                dangerouslySetInnerHTML={{
                    __html: coin.description.en.split('. ')[0] + '.',
                }}
            />
            <p className="mt-2">💵 Price: ${coin.market_data.current_price.usd}</p>
            <p>📊 Market Cap: ${coin.market_data.market_cap.usd}</p>
            <p>📈 24h Change: {coin.market_data.price_change_percentage_24h}%</p>

            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Price Chart (Last 7 Days)</h2>
                <canvas ref={chartRef} />
            </div>
        </div>
    );
}
