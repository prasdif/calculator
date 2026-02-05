'use client';

import { useState, useEffect } from 'react';
import { formatCurrency } from '@/lib/calculations';
import {
    KITCHEN_BASE_RATES,
    KITCHEN_ACCESSORIES,
} from '@/lib/constants';

export default function KitchenEstimator() {
    const [estimate, setEstimate] = useState({
        runningFeet: 10,
        finish: 'laminate',
        accessories: {
            softClose: false,  
            cutleryTray: false,
            tallUnit: false,
            cornerCarousel: false,
            chimney: false,
            hob: false,
        },
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEstimate = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/estimate/kitchen', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(estimate),
                });
                const data = await response.json();
                if (data.success) {
                    setResult(data.result);
                }
            } catch (error) {
                console.error('Error fetching estimate:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchEstimate();
    }, [estimate]);

    const handleRunningFeetChange = (value) => {
        const feet = parseFloat(value) || 0;
        setEstimate((prev) => ({ ...prev, runningFeet: feet }));
    };

    const handleFinishChange = (finish) => {
        setEstimate((prev) => ({ ...prev, finish }));
    };

    const handleAccessoryChange = (accessory) => {
        setEstimate((prev) => ({
            ...prev,
            accessories: {
                ...prev.accessories,
                [accessory]: !prev.accessories[accessory],
            },
        }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Kitchen Estimator</h2>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Running Feet
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={estimate.runningFeet}
                        onChange={(e) => handleRunningFeetChange(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Finish
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {['laminate', 'membrane', 'acrylic'].map((finish) => (
                            <button
                                key={finish}
                                onClick={() => handleFinishChange(finish)}
                                className={`p-4 border-2 rounded-lg transition-all ${estimate.finish === finish
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-center">
                                    <div className="font-semibold text-gray-800 capitalize mb-1">
                                        {finish}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        Base: {formatCurrency(KITCHEN_BASE_RATES[finish])}/ft
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Add Accessories
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(KITCHEN_ACCESSORIES).map(([key, price]) => (
                            <label key={key} className="flex items-start space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                                <input
                                    type="checkbox"
                                    checked={estimate.accessories[key]}
                                    onChange={() => handleAccessoryChange(key)}
                                    className="mt-1 h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                                />
                                <div className="flex-1">
                                    <div className="font-medium text-gray-800 capitalize">
                                        {key.replace(/([A-Z])/g, ' $1').trim()}
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {formatCurrency(price)}
                                    </div>
                                </div>
                            </label>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-red-50 rounded-lg shadow-md p-6">
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500 mx-auto"></div>
                        <p className="mt-2 text-gray-600">Calculating...</p>
                    </div>
                ) : result ? (
                    <>
                        <div className="text-center mb-4">
                            <div className="text-sm text-gray-600 mb-2">Estimated Total</div>
                            <div className="text-4xl font-bold text-red-500">
                                {formatCurrency(result.total)}
                            </div>
                        </div>

                        <div className="text-center mb-6">
                            <div className="text-sm text-gray-600 mb-1">Budget Range (±10%)</div>
                            <div className="text-lg font-semibold text-gray-800">
                                {formatCurrency(result.minBudget)} – {formatCurrency(result.maxBudget)}
                            </div>
                        </div>

                        <div className="border-t border-red-200 pt-4">
                            <h3 className="font-semibold text-gray-800 mb-3">Cost Breakdown</h3>
                            <div className="space-y-2">
                                {result.breakdown.map((item, index) => (
                                    <div key={index} className="flex justify-between text-sm">
                                        <span className="text-gray-600">{item.label}</span>
                                        <span className="font-medium text-gray-800">
                                            {formatCurrency(item.amount)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="mt-6 text-xs text-center text-gray-500 italic">
                            * This is an approximate estimate and can be customized to suit your needs
                        </div>
                    </>
                ) : null}
            </div>
        </div>
    );
}
