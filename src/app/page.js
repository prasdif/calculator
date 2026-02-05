import Link from 'next/link';
import { Home, UtensilsCrossed, Shirt, Square } from 'lucide-react';

export default function HomePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="max-w-7xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-5xl font-bold text-gray-900 mb-4">
                        Get an estimate for your home
                    </h1>
                    <p className="text-xl text-gray-600">
                        Calculate the approximate cost of doing up your interiors
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <Home className="w-10 h-10 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            Full Home
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Get an approximate costing for your full home interiors.
                        </p>
                        <Link
                            href="/estimator/fullhome"
                            className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors text-center"
                        >
                            CALCULATE
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <UtensilsCrossed className="w-10 h-10 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            Kitchen
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Get an approximate costing for your kitchen interior.
                        </p>
                        <Link
                            href="/estimator/kitchen"
                            className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors text-center"
                        >
                            CALCULATE
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center">
                                <Shirt className="w-10 h-10 text-red-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            Wardrobe
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Get an approximate costing for your wardrobe.
                        </p>
                        <Link
                            href="/estimator/wardrobe"
                            className="block w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-6 rounded-full transition-colors text-center"
                        >
                            CALCULATE
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                                <Square className="w-10 h-10 text-blue-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            Diagonal Calculator
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Calculate diagonal and parameters of a rectangle.
                        </p>
                        <Link
                            href="/estimator/diagonal-calculator"
                            className="block w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-full transition-colors text-center"
                        >
                            CALCULATE
                        </Link>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8 hover:shadow-xl transition-shadow">
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
                                <Square className="w-10 h-10 text-indigo-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3 text-center">
                            Diagonal Calculator V2
                        </h2>
                        <p className="text-gray-600 mb-6 text-center">
                            Enhanced version with unit comparison list.
                        </p>
                        <Link
                            href="/estimator/diagonal-calculator-second"
                            className="block w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-3 px-6 rounded-full transition-colors text-center"
                        >
                            CALCULATE V2
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
