'use client';

import { useState, useEffect } from 'react';

const TO_METERS = {
    'mm': 0.001,
    'cm': 0.01,
    'm': 1,
    'km': 1000,
    'in': 0.0254,
    'ft': 0.3048,
    'yd': 0.9144,
    'mi': 1609.344
};

const FROM_METERS = {
    'mm': 1000,
    'cm': 100,
    'm': 1,
    'km': 0.001,
    'in': 39.3701,
    'ft': 3.28084,
    'yd': 1.09361,
    'mi': 0.000621371
};

const UNIT_LABELS = {
    'mm': 'millimeters (mm)',
    'cm': 'centimeters (cm)',
    'm': 'meters (m)',
    'km': 'kilometers (km)',
    'in': 'inches (in)',
    'ft': 'feet (ft)',
    'yd': 'yards (yd)',
    'mi': 'miles (mi)'
};

const FROM_SQ_METERS = {
    'mm2': 1000000,
    'cm2': 10000,
    'm2': 1,
    'km2': 0.000001,
    'in2': 1550.0031,
    'ft2': 10.76391041671,
    'yd2': 1.1959900463011,
    'mi2': 3.8610215854245e-7,
    'a': 0.01,
    'da': 0.001,
    'ha': 0.0001,
    'ac': 0.000247105
};

const AREA_UNIT_LABELS = {
    'mm2': 'square millimeters (mm²)',
    'cm2': 'square centimeters (cm²)',
    'm2': 'square meters (m²)',
    'km2': 'square kilometers (km²)',
    'in2': 'square inches (in²)',
    'ft2': 'square feet (ft²)',
    'yd2': 'square yards (yd²)',
    'mi2': 'square miles (mi²)',
    'a': 'ares (a)',
    'da': 'decares (da)',
    'ha': 'hectares (ha)',
    'ac': 'acres (ac)'
};

export default function DiagonalCalculatorSecond() {

    const [values, setValues] = useState({
        l: 4.0,
        w: 3.5,
        d: 0,
    });

    // Separate units state
    const [units, setUnits] = useState({
        l: 'm',
        w: 'm',
        d: 'm',
        area: 'm2',
        perimeter: 'm'
    });

    const [results, setResults] = useState(null);
    const [globalUnit, setGlobalUnit] = useState(null);

    // Initial Calculation on mount to sync D with L/W
    useEffect(() => {
        recalculateFromDimensions(values.l, values.w);
    }, []);

    const handleGlobalUnitChange = (newUnit) => {
        if (!newUnit) {
            setGlobalUnit(null);
            return;
        }

        setGlobalUnit(newUnit);

        // Map linear unit to area unit if possible
        const linearToArea = {
            'mm': 'mm2',
            'cm': 'cm2',
            'm': 'm2',
            'km': 'km2',
            'in': 'in2',
            'ft': 'ft2',
            'yd': 'yd2',
            'mi': 'mi2'
        };
        const newAreaUnit = linearToArea[newUnit] || units.area;

        // Convert all inputs to this new unit for display
        // We must do this carefully to avoid math drift, but since logic is driven by
        // recalculateFromDimensions, we essentially just shift the "View".

        // 1. Get current values in meters
        const l_val = parseFloat(values.l) || 0;
        const w_val = parseFloat(values.w) || 0;
        const d_val = parseFloat(values.d) || 0;

        const l_m = l_val * TO_METERS[units.l];
        const w_m = w_val * TO_METERS[units.w];
        const d_m = d_val * TO_METERS[units.d]; // or calculated

        // 2. Convert to new unit
        const l_new = l_m * FROM_METERS[newUnit];
        const w_new = w_m * FROM_METERS[newUnit];
        const d_new = d_m * FROM_METERS[newUnit];

        // 3. Update State
        setUnits({
            l: newUnit,
            w: newUnit,
            d: newUnit,
            area: newAreaUnit,
            perimeter: newUnit
        });

        setValues({
            l: parseFloat(l_new.toFixed(2)),
            w: parseFloat(w_new.toFixed(2)),
            d: parseFloat(d_new.toFixed(2))
        });
    };

    // Core Logic: Update derived values based on L and W
    const recalculateFromDimensions = (l, w) => {
        const l_val = parseFloat(l);
        const w_val = parseFloat(w);

        if (isNaN(l_val) || isNaN(w_val)) {
            setValues(prev => ({ ...prev, l: l, w: w }));
            return;
        }

        const l_m = l_val * TO_METERS[units.l];
        const w_m = w_val * TO_METERS[units.w];

        const d_m = Math.sqrt(l_m * l_m + w_m * w_m);

        const d_display_val = d_m * FROM_METERS[units.d];

        setValues(prev => ({
            ...prev,
            l: l,
            w: w,
            d: parseFloat(d_display_val.toFixed(2))
        }));

        updateResults(l_m, w_m, d_m);
    };

    const recalculateFromDiagonal = (d) => {
        const l_val = parseFloat(values.l) || 0;
        const w_val = parseFloat(values.w) || 0;

        const l_m_current = l_val * TO_METERS[units.l];
        const w_m_current = w_val * TO_METERS[units.w];
        const d_m_current = Math.sqrt(l_m_current * l_m_current + w_m_current * w_m_current);

        const d_input_val = parseFloat(d);
        if (isNaN(d_input_val)) {
            setValues(prev => ({ ...prev, d: d }));
            return;
        }

        const d_m_new = d_input_val * TO_METERS[units.d];

        if (d_m_current === 0) {
            setValues(prev => ({ ...prev, d: d }));
            return;
        }

        const ratio = d_m_new / d_m_current;

        const l_m_new = l_m_current * ratio;
        const w_m_new = w_m_current * ratio;

        const l_new = l_m_new * FROM_METERS[units.l];
        const w_new = w_m_new * FROM_METERS[units.w];

        setValues(prev => ({
            ...prev,
            d: d,
            l: parseFloat(l_new.toFixed(2)),
            w: parseFloat(w_new.toFixed(2))
        }));

        updateResults(l_m_new, w_m_new, d_m_new);
    };

    const updateResults = (l_m, w_m, d_m) => {
        setResults({
            diagonal_m: d_m,
            area_m2: l_m * w_m,
            perimeter_m: 2 * (l_m + w_m)
        });
    };

    // Handlers
    const handleLChange = (val) => recalculateFromDimensions(val, values.w);
    const handleWChange = (val) => recalculateFromDimensions(values.l, val);
    const handleDChange = (val) => recalculateFromDiagonal(val);

    const handleUnitChange = (key, unit) => {
        const currentVal = parseFloat(values[key]) || 0;
        const currentUnit = units[key];

        const valInMeters = currentVal * TO_METERS[currentUnit];
        const newVal = valInMeters * FROM_METERS[unit];

        setUnits(prev => ({ ...prev, [key]: unit }));
        setValues(prev => ({ ...prev, [key]: parseFloat(newVal.toFixed(2)) }));
    };


    return (
        <div className="min-h-screen bg-gray-50 text-slate-800 font-sans p-6 py-12">
            <div className="max-w-lg mx-auto">
                <div className="mb-6 pb-4 border-b border-gray-200">
                    <h1 className="text-2xl font-semibold text-slate-800 mb-4">Diagonal Calculator</h1>

                    {/* Global Unit Converter */}
                    <div className="flex items-center gap-3 bg-white p-3 rounded-md border border-gray-200 shadow-sm">
                        <label className="text-slate-600 text-sm font-medium whitespace-nowrap">Convert all units to:</label>
                        <select
                            value={globalUnit || 'm'} // Default to meter if not set, though it should be set on init
                            onChange={(e) => handleGlobalUnitChange(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-1.5 text-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
                        >
                            {Object.keys(TO_METERS).map(u => (
                                <option key={u} value={u}>{UNIT_LABELS[u]}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Main Card */}
                <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm border border-gray-200">

                    {/* Length */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">Length (L)</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                min="0"
                                value={values.l}
                                onChange={(e) => handleLChange(e.target.value)}
                                className="block w-full rounded-l-md border-gray-300 border border-r-0 focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2.5"
                            />
                            <div className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-slate-500 flex items-center min-w-[3rem] justify-center">
                                {units.l}
                            </div>
                        </div>
                    </div>

                    {/* Width */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">Width (W)</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                min="0"
                                value={values.w}
                                onChange={(e) => handleWChange(e.target.value)}
                                className="block w-full rounded-l-md border-gray-300 border border-r-0 focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2.5"
                            />
                            <div className="rounded-r-md border border-l-0 border-gray-300 bg-gray-50 px-3 py-2 text-sm text-slate-500 flex items-center min-w-[3rem] justify-center">
                                {units.w}
                            </div>
                        </div>
                    </div>

                    {/* Area Result */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">Area</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                readOnly
                                value={results ? (results.area_m2 * FROM_SQ_METERS[units.area]).toFixed(2) : '-'}
                                className="block w-full rounded-l-md border-gray-300 border border-r-0 bg-gray-50 text-slate-700 font-medium focus:outline-none sm:text-sm px-3 py-2.5"
                            />
                            <div className="rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 py-2 text-sm text-slate-600 font-medium flex items-center min-w-[3rem] justify-center">
                                {units.area.replace('2', '²').replace('3', '³')}
                            </div>
                        </div>
                    </div>

                    {/* Perimeter Result */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-600">Perimeter</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                readOnly
                                value={results ? (results.perimeter_m * FROM_METERS[units.perimeter]).toFixed(2) : '-'}
                                className="block w-full rounded-l-md border-gray-300 border border-r-0 bg-gray-50 text-slate-700 font-medium focus:outline-none sm:text-sm px-3 py-2.5"
                            />
                            <div className="rounded-r-md border border-l-0 border-gray-300 bg-gray-100 px-3 py-2 text-sm text-slate-600 font-medium flex items-center min-w-[3rem] justify-center">
                                {units.perimeter}
                            </div>
                        </div>
                    </div>

                    {/* Diagonal Results - Separator */}
                    <div className="border-t border-gray-100 my-2"></div>

                    {/* Diagonal - Input/Result */}
                    <div className="space-y-1">
                        <label className="block text-sm font-medium text-slate-700">Diagonal (d)</label>
                        <div className="flex rounded-md shadow-sm">
                            <input
                                type="number"
                                min="0"
                                value={values.d}
                                onChange={(e) => handleDChange(e.target.value)}
                                className="block w-full rounded-l-md border-slate-400 border border-r-0 bg-slate-50 font-medium text-slate-900 focus:border-slate-500 focus:ring-slate-500 sm:text-sm p-2.5"
                            />
                            <div className="rounded-r-md border border-l-0 border-slate-400 bg-slate-100 px-3 py-2 text-sm text-slate-700 font-medium flex items-center min-w-[3rem] justify-center">
                                {units.d}
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">Editing diagonal scales L and W proportionately.</p>
                    </div>

                </div>
            </div>
        </div>
    );
}   