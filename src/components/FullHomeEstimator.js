'use client';

import { useState, useEffect } from 'react';

const BHK_BEDROOM_COUNT = {
    '1BHK': 1,
    '2BHK': 2,
    '3BHK': 3,
    '4BHK': 4,
    '5BHK+': 5,
};

const BHK_BATHROOM_COUNT = {
    '1BHK': 1,
    '2BHK': 2,
    '3BHK': 2,
    '4BHK': 3,
    '5BHK+': 4,
};

const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(amount);
};

export default function FullHomeEstimator() {
    const [estimate, setEstimate] = useState({
        bhkType: '2BHK',
        bhkSize: 'small',
        includeKitchen: false,
        includeWardrobe: false,
        includeTVUnit: false,
        includeBed: false,
    });

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchEstimate = async () => {
            setLoading(true);
            try {
                const response = await fetch('/api/estimate/fullhome', {
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

    const handleBHKTypeChange = (bhkType) => {
        setEstimate((prev) => ({ ...prev, bhkType }));
    };

    const handleBHKSizeChange = (bhkSize) => {
        setEstimate((prev) => ({ ...prev, bhkSize }));
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Full Home Estimator</h2>

            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select BHK Type
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                        {['1BHK', '2BHK', '3BHK', '4BHK', '5BHK+'].map((bhk) => (
                            <button
                                key={bhk}
                                onClick={() => handleBHKTypeChange(bhk)}
                                className={`p-3 border-2 rounded-lg transition-all ${estimate.bhkType === bhk
                                        ? 'border-red-400 bg-red-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                <div className="text-center font-semibold text-gray-800">{bhk}</div>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Select Size
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <button
                            onClick={() => handleBHKSizeChange('small')}
                            className={`p-4 border-2 rounded-lg transition-all ${estimate.bhkSize === 'small'
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="font-semibold text-gray-800 mb-1">Small</div>
                                <div className="text-sm text-gray-600">Below 1800 sq ft</div>
                            </div>
                        </button>

                        <button
                            onClick={() => handleBHKSizeChange('large')}
                            className={`p-4 border-2 rounded-lg transition-all ${estimate.bhkSize === 'large'
                                    ? 'border-red-400 bg-red-50'
                                    : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className="text-center">
                                <div className="font-semibold text-gray-800 mb-1">Large</div>
                                <div className="text-sm text-gray-600">Above 1800 sq ft</div>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-4">
                        Your home includes:
                    </div>
                    <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            Living Room
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {BHK_BEDROOM_COUNT[estimate.bhkType]} Bedroom{BHK_BEDROOM_COUNT[estimate.bhkType] > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            {BHK_BATHROOM_COUNT[estimate.bhkType]} Bathroom{BHK_BATHROOM_COUNT[estimate.bhkType] > 1 ? 's' : ''}
                        </div>
                        <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-400 rounded-full mr-3"></div>
                            Dining Area
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Optional Add-ons
                    </label>
                    <div className="space-y-3">
                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={estimate.includeKitchen}
                                onChange={(e) =>
                                    setEstimate((prev) => ({
                                        ...prev,
                                        includeKitchen: e.target.checked,
                                        kitchen: e.target.checked
                                            ? {
                                                runningFeet: 8,
                                                finish: 'laminate',
                                                accessories: {
                                                    softClose: false,
                                                    cutleryTray: false,
                                                    tallUnit: false,
                                                    cornerCarousel: false,
                                                    chimney: false,
                                                    hob: false,
                                                },
                                            }
                                            : undefined,
                                    }))
                                }
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">Include Kitchen</div>
                                <div className="text-xs text-gray-500">
                                    Add modular kitchen with customizable options
                                </div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={estimate.includeWardrobe}
                                onChange={(e) =>
                                    setEstimate((prev) => ({
                                        ...prev,
                                        includeWardrobe: e.target.checked,
                                        wardrobe: e.target.checked
                                            ? {
                                                runningFeet: 7,
                                                type: 'swing',
                                                finish: 'laminate',
                                                accessories: {
                                                    drawerSet: false,
                                                    mirrorShutter: false,
                                                    loft: false,
                                                    softCloseHinges: false,
                                                },
                                            }
                                            : undefined,
                                    }))
                                }
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">Include Wardrobe</div>
                                <div className="text-xs text-gray-500">
                                    Add custom wardrobe with storage solutions
                                </div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={estimate.includeTVUnit}
                                onChange={(e) =>
                                    setEstimate((prev) => ({
                                        ...prev,
                                        includeTVUnit: e.target.checked,
                                        tvUnit: e.target.checked
                                            ? {
                                                runningFeet: 6,
                                                closedStorage: false,
                                            }
                                            : undefined,
                                    }))
                                }
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                            />
                            <div className="flex-1">
                                <div className="font-medium text-gray-800">Include TV Unit</div>
                                <div className="text-xs text-gray-500">Add wall-mounted TV unit</div>
                            </div>
                        </label>

                        <label className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                            <input
                                type="checkbox"
                                checked={estimate.includeBed}
                                onChange={(e) =>
                                    setEstimate((prev) => ({
                                        ...prev,
                                        includeBed: e.target.checked,
                                        bed: e.target.checked
                                            ? {
                                                hydraulicStorage: false,
                                                headboard: false,  
                                            }
                                            : undefined,
                                    }))
                                }
                                className="h-4 w-4 text-red-500 focus:ring-red-500 border-gray-300 rounded"
                            />  
                            <div className="flex-1"> 
                                <div className="font-medium text-gray-800">Include Bed</div>
                                <div className="text-xs text-gray-500">Add platform bed with storage</div>
                            </div>
                        </label>
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