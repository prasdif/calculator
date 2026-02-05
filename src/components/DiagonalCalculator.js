'use client';

import { useState, useEffect, useRef } from 'react';

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



export default function DiagonalCalculator() {
    const [inputs, setInputs] = useState({
        longerSide: 3,
        shorterSide: 2,
        longerUnit: 'cm',
        shorterUnit: 'cm'
    });
    const canvasRef = useRef(null);
    const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragCorner, setDragCorner] = useState(null); // 'TL', 'TR', 'BL', 'BR'

    const [areaUnit, setAreaUnit] = useState('cm2');
    const [perimeterUnit, setPerimeterUnit] = useState('cm');
    const [angleUnit, setAngleUnit] = useState('deg');
    const [radiusUnit, setRadiusUnit] = useState('cm');
    const [diagonalUnit, setDiagonalUnit] = useState('cm');
    const [visualizationUnit, setVisualizationUnit] = useState('cm');

    const [results, setResults] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        calculateResults();
    }, [inputs]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx = canvas.getContext("2d");

            // Match canvas to container size
            const width = canvas.offsetWidth;
            const height = canvas.offsetHeight;
            canvas.width = width;
            canvas.height = height;

            const l_raw = inputs.longerSide > 0 ? inputs.longerSide : 0;
            const w_raw = inputs.shorterSide > 0 ? inputs.shorterSide : 0;

            // Normalize to meters for correct aspect ratio rendering
            const l = l_raw * TO_METERS[inputs.longerUnit];
            const w = w_raw * TO_METERS[inputs.shorterUnit];

            ctx.clearRect(0, 0, width, height);

            if (l === 0 || w === 0 || width === 0 || height === 0) return;

            // Draw Space
            const padding = 60;
            const availableSize = Math.min(width, height) - padding * 2;

            if (availableSize <= 0) return;

            const realDiagonal = Math.sqrt(l * l + w * w);
            const scale = availableSize / realDiagonal;

            const rectW = l * scale;
            const rectH = w * scale;

            const radius = (realDiagonal * scale) / 2;

            const cx = width / 2;
            const cy = height / 2;

            const x = cx - rectW / 2;
            const y = cy - rectH / 2;

            // Store corners for hit detection
            canvas.corners = {
                TL: { x: x, y: y },
                TR: { x: x + rectW, y: y },
                BL: { x: x, y: y + rectH },
                BR: { x: x + rectW, y: y + rectH }
            };
            canvas.scale = scale;
            canvas.center = { x: cx, y: cy };

            // Outer Circle
            ctx.setLineDash([6, 6]);
            ctx.strokeStyle = "#cbd5e1";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.setLineDash([]);

            // Rectangle
            ctx.fillStyle = "rgba(251,191,36,0.2)";
            ctx.strokeStyle = "#f59e0b";
            ctx.lineWidth = 2.5;
            ctx.beginPath();
            ctx.rect(x, y, rectW, rectH);
            ctx.fill();
            ctx.stroke();

            // Diagonals
            ctx.setLineDash([4, 4]);
            ctx.strokeStyle = "#6b7280";
            ctx.lineWidth = 2;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + rectW, y + rectH);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(x + rectW, y);
            ctx.lineTo(x, y + rectH);
            ctx.stroke();

            ctx.setLineDash([]);

            // Angle Arc
            const arcRadius = 30;
            const startAngle = Math.atan2(-rectH / 2, rectW / 2);
            const endAngle = Math.atan2(-rectH / 2, -rectW / 2);

            ctx.strokeStyle = "#ef4444";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(cx, cy, arcRadius, startAngle, endAngle);
            ctx.stroke();

            // Draw corner handles
            const handleRadius = 8;
            Object.entries(canvas.corners).forEach(([name, corner]) => {
                const isActive = isDragging && dragCorner === name;
                ctx.fillStyle = isActive ? "#ef4444" : "#3b82f6";
                ctx.strokeStyle = "#fff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(corner.x, corner.y, isActive ? handleRadius + 2 : handleRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.stroke();
            });

            // Text
            ctx.fillStyle = "#374151";
            ctx.font = "14px sans-serif";
            ctx.textAlign = "center";

            ctx.fillText(`l = ${inputs.longerSide}`, cx, y - 10);

            ctx.textAlign = "right";
            ctx.fillText(`w = ${inputs.shorterSide}`, x - 10, cy);

            ctx.textAlign = "center";
            ctx.fillStyle = "#6b7280";
            ctx.fillText(`r = ${results ? results.circumcircleRadius : ""}`, cx, cy + radius + 25);
        };

        // Draw immediately
        draw();

        // Add resize listener
        window.addEventListener('resize', draw);

        return () => {
            window.removeEventListener('resize', draw);
        };

    }, [inputs.longerSide, inputs.shorterSide, inputs.longerUnit, inputs.shorterUnit, results?.circumcircleRadius, isDragging, dragCorner]);



    const calculateResults = () => {
        const { longerSide, shorterSide, longerUnit, shorterUnit } = inputs;

        // Validation
        if (longerSide <= 0 || shorterSide <= 0) {
            setError('Both sides must be greater than 0');
            setResults(null);
            return;
        }

        // Convert both sides to meters for calculation
        const toMeters = {
            'mm': 0.001,
            'cm': 0.01,
            'm': 1,
            'km': 1000,
            'in': 0.0254,
            'ft': 0.3048,
            'yd': 0.9144,
            'mi': 1609.344
        };

        const longerSideInMeters = longerSide * toMeters[longerUnit];
        const shorterSideInMeters = shorterSide * toMeters[shorterUnit];

        if (shorterSideInMeters >= longerSideInMeters) {
            setError('The longer side must be greater than the shorter side!');
            setResults(null);
            return;
        }

        setError('');

        // Calculate diagonal using Pythagorean theorem (in meters)
        const diagonalInMeters = Math.sqrt(Math.pow(longerSideInMeters, 2) + Math.pow(shorterSideInMeters, 2));

        // Calculate area (in square meters)
        const areaInSqMeters = longerSideInMeters * shorterSideInMeters;

        // Calculate perimeter (in meters)
        const perimeterInMeters = 2 * (longerSideInMeters + shorterSideInMeters);

        // Calculate angle between diagonals (in degrees)
        // Using: tan(α/2) = longer/shorter (matches Omni Calculator convention)
        const angleRadians = 2 * Math.atan(longerSideInMeters / shorterSideInMeters);
        const angleDegrees = angleRadians * (180 / Math.PI);

        // Calculate circumcircle radius (half of diagonal, in meters)
        const circumcircleRadiusInMeters = diagonalInMeters / 2;

        // Convert back to the original longer unit for display
        const fromMeters = {
            'mm': 1000,
            'cm': 100,
            'm': 1,
            'km': 0.001,
            'in': 39.3701,
            'ft': 3.28084,
            'yd': 1.09361,
            'mi': 0.000621371
        };

        // Convert area to base unit squared (longerUnit²)
        const areaInBaseUnit = areaInSqMeters * Math.pow(fromMeters[longerUnit], 2);

        setResults({
            area: areaInBaseUnit,
            perimeter: (perimeterInMeters * fromMeters[longerUnit]).toFixed(2),
            angleBetweenDiagonals: angleDegrees.toFixed(2),
            circumcircleRadius: (circumcircleRadiusInMeters * fromMeters[longerUnit]).toFixed(2),
            diagonal: (diagonalInMeters * fromMeters[longerUnit]).toFixed(2)
        });
    };

    const handleInputChange = (field, value) => {
        setInputs(prev => ({
            ...prev,
            [field]: parseFloat(value) || 0
        }));
    };

    const handleUnitChange = (field, unit) => {
        setInputs(prev => ({
            ...prev,
            [field]: unit
        }));
    };

    const stretchLonger = (factor) => {
        setInputs(prev => ({
            ...prev,
            longerSide: Math.max(0.1, +(prev.longerSide * factor).toFixed(2))
        }));
    };

    const stretchShorter = (factor) => {
        setInputs(prev => ({
            ...prev,
            shorterSide: Math.max(0.1, +(prev.shorterSide * factor).toFixed(2))
        }));
    };

    const resetCalculator = () => {
        setInputs({
            longerSide: 0,
            shorterSide: 0,
            longerUnit: 'cm',
            shorterUnit: 'cm'
        });
        setAreaUnit('cm2');
        setPerimeterUnit('cm');
        setAngleUnit('deg');
        setRadiusUnit('cm');
        setDiagonalUnit('cm');
        setError('');
    };

    // Convert area from base unit (current input unit squared) to target area unit
    const convertArea = (areaInBaseUnit, targetUnit) => {
        // First, get the area in square meters as reference
        const { longerUnit } = inputs;
        let areaInSqMeters = areaInBaseUnit;

        // Convert from current unit² to m²
        const toSqMeters = {
            'mm': 0.000001,
            'cm': 0.0001,
            'm': 1,
            'km': 1000000,
            'in': 0.00064516,
            'ft': 0.09290304,
            'yd': 0.83612736,
            'mi': 2589988.110336
        };

        areaInSqMeters = areaInBaseUnit * toSqMeters[longerUnit];

        // Convert from m² to target unit
        const fromSqMeters = {
            'mm2': 1000000,
            'cm2': 10000,
            'm2': 1,
            'km2': 0.000001,
            'in2': 1550.0031,
            'ft2': 10.763910417,
            'yd2': 1.1959900463,
            'mi2': 0.00000038610215855,
            'a': 0.01,        // ares
            'da': 0.001,      // decares
            'ha': 0.0001,     // hectares
            'ac': 0.000247105 // acres
        };

        return (areaInSqMeters * fromSqMeters[targetUnit]).toFixed(2);
    };

    const handleAreaUnitChange = (newUnit) => {
        setAreaUnit(newUnit);
    };

    // Convert perimeter from base unit to target unit
    const convertPerimeter = (perimeterInBaseUnit, targetUnit) => {
        const { longerUnit } = inputs;

        // Convert to meters first
        const toMeters = {
            'mm': 0.001,
            'cm': 0.01,
            'm': 1,
            'km': 1000,
            'in': 0.0254,
            'ft': 0.3048,
            'yd': 0.9144,
            'mi': 1609.344
        };

        const perimeterInMeters = perimeterInBaseUnit * toMeters[longerUnit];

        // Convert from meters to target unit
        const fromMeters = {
            'mm': 1000,
            'cm': 100,
            'm': 1,
            'km': 0.001,
            'in': 39.3701,
            'ft': 3.28084,
            'yd': 1.09361,
            'mi': 0.000621371
        };

        return (perimeterInMeters * fromMeters[targetUnit]).toFixed(2);
    };

    const handlePerimeterUnitChange = (newUnit) => {
        setPerimeterUnit(newUnit);
    };

    // Convert angle from degrees to target unit
    const convertAngle = (angleInDegrees, targetUnit) => {
        const angle = parseFloat(angleInDegrees);
        let result;

        switch (targetUnit) {
            case 'deg':
                result = angle;
                break;
            case 'rad':
                result = angle * (Math.PI / 180);
                break;
            case 'gon':
                result = angle * (10 / 9); // 1 degree = 10/9 gradians
                break;
            case 'turn':
                result = angle * (Math.PI / 180); // Convert to radians, then display as × π rad
                break;
            default:
                result = angle;
        }

        return result.toFixed(2);
    };

    const handleAngleUnitChange = (newUnit) => {
        setAngleUnit(newUnit);
    };

    // Convert radius from base unit to target unit (reuse perimeter conversion logic)
    const convertRadius = (radiusInBaseUnit, targetUnit) => {
        const { longerUnit } = inputs;

        // Convert to meters first
        const toMeters = {
            'mm': 0.001,
            'cm': 0.01,
            'm': 1,
            'km': 1000,
            'in': 0.0254,
            'ft': 0.3048,
            'yd': 0.9144,
            'mi': 1609.344
        };

        const radiusInMeters = radiusInBaseUnit * toMeters[longerUnit];

        // Convert from meters to target unit
        const fromMeters = {
            'mm': 1000,
            'cm': 100,
            'm': 1,
            'km': 0.001,
            'in': 39.3701,
            'ft': 3.28084,
            'yd': 1.09361,
            'mi': 0.000621371
        };

        return (radiusInMeters * fromMeters[targetUnit]).toFixed(2);
    };

    const handleRadiusUnitChange = (newUnit) => {
        setRadiusUnit(newUnit);
    };

    // Convert diagonal from base unit to target unit (same logic as radius/perimeter)
    const convertDiagonal = (diagonalInBaseUnit, targetUnit) => {
        const { longerUnit } = inputs;

        // Convert to meters first
        const toMeters = {
            'mm': 0.001,
            'cm': 0.01,
            'm': 1,
            'km': 1000,
            'in': 0.0254,
            'ft': 0.3048,
            'yd': 0.9144,
            'mi': 1609.344
        };

        const diagonalInMeters = diagonalInBaseUnit * toMeters[longerUnit];

        // Convert from meters to target unit
        const fromMeters = {
            'mm': 1000,
            'cm': 100,
            'm': 1,
            'km': 0.001,
            'in': 39.3701,
            'ft': 3.28084,
            'yd': 1.09361,
            'mi': 0.000621371
        };

        return (diagonalInMeters * fromMeters[targetUnit]).toFixed(2);
    };

    const handleDiagonalUnitChange = (newUnit) => {
        setDiagonalUnit(newUnit);
    };

    return (
        <div className="max-w-5xl mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                    Diagonal of a Rectangle calculator
                </h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column - Inputs */}
                <div className="space-y-6">
                    {/* Longer Side Input */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Longer side (l)
                            </label>
                            <select
                                suppressHydrationWarning
                                value={inputs.longerUnit}
                                onChange={(e) => handleUnitChange('longerUnit', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="mm">millimeters (mm)</option>
                                <option value="cm">centimeters (cm)</option>
                                <option value="m">meters (m)</option>
                                <option value="km">kilometers (km)</option>
                                <option value="in">inches (in)</option>
                                <option value="ft">feet (ft)</option>
                                <option value="yd">yards (yd)</option>
                                <option value="mi">miles (mi)</option>
                            </select>
                        </div>
                        <input
                            suppressHydrationWarning
                            type="number"
                            step="0.01"
                            value={inputs.longerSide}
                            onChange={(e) => handleInputChange('longerSide', e.target.value)}
                            className={`w-full px-4 py-3 text-lg border ${error && error.includes('longer')
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {error && error.includes('longer') && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span className="text-red-500">⚠</span> {error}
                            </p>
                        )}
                    </div>

                    {/* Shorter Side Input */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-medium text-gray-700">
                                Shorter side (w)
                            </label>
                            <select
                                suppressHydrationWarning
                                value={inputs.shorterUnit}
                                onChange={(e) => handleUnitChange('shorterUnit', e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="mm">millimeters (mm)</option>
                                <option value="cm">centimeters (cm)</option>
                                <option value="m">meters (m)</option>
                                <option value="km">kilometers (km)</option>
                                <option value="in">inches (in)</option>
                                <option value="ft">feet (ft)</option>
                                <option value="yd">yards (yd)</option>
                                <option value="mi">miles (mi)</option>
                            </select>
                        </div>
                        <input
                            suppressHydrationWarning
                            type="number"
                            step="0.01"
                            value={inputs.shorterSide}
                            onChange={(e) => handleInputChange('shorterSide', e.target.value)}
                            className={`w-full px-4 py-3 text-lg border ${error && error.includes('shorter')
                                ? 'border-red-300 bg-red-50'
                                : 'border-gray-300'
                                } rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                        />
                        {error && error.includes('shorter') && (
                            <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                                <span className="text-red-500">⚠</span> {error}
                            </p>
                        )}
                    </div>

                    {/* Results Display */}
                    {results && (
                        <div className="space-y-4">
                            <AreaResultCard
                                value={results.area}
                                selectedUnit={areaUnit}
                                onUnitChange={handleAreaUnitChange}
                                convertArea={convertArea}
                            />
                            <PerimeterResultCard
                                value={results.perimeter}
                                selectedUnit={perimeterUnit}
                                onUnitChange={handlePerimeterUnitChange}
                                convertPerimeter={convertPerimeter}
                            />
                            <AngleResultCard
                                value={results.angleBetweenDiagonals}
                                selectedUnit={angleUnit}
                                onUnitChange={handleAngleUnitChange}
                                convertAngle={convertAngle}
                            />
                            <RadiusResultCard
                                value={results.circumcircleRadius}
                                selectedUnit={radiusUnit}
                                onUnitChange={handleRadiusUnitChange}
                                convertRadius={convertRadius}
                            />
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="w-full">
                        <button
                            onClick={resetCalculator}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Clear all changes
                        </button>
                    </div>
                </div>

                {/* Right Column - Visualization */}
                <div className="space-y-6">
                    {/* Rectangle Visualization */}
                    <div className="bg-white rounded-lg shadow-md p-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-4">Visualization</h3>

                        <div className="relative w-full aspect-square bg-gray-50 rounded-lg flex items-center justify-center p-8">

                            <canvas
                                ref={canvasRef}
                                className="absolute inset-0 w-full h-full cursor-pointer"
                                style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                                onMouseDown={(e) => {
                                    const canvas = canvasRef.current;
                                    if (!canvas || !canvas.corners) return;

                                    const rect = canvas.getBoundingClientRect();
                                    const mouseX = e.clientX - rect.left;
                                    const mouseY = e.clientY - rect.top;

                                    // Check if clicked on any corner
                                    const handleRadius = 12; // slightly larger hit area
                                    for (const [name, corner] of Object.entries(canvas.corners)) {
                                        const dx = mouseX - corner.x;
                                        const dy = mouseY - corner.y;
                                        if (Math.sqrt(dx * dx + dy * dy) < handleRadius) {
                                            setIsDragging(true);
                                            setDragCorner(name);
                                            break;
                                        }
                                    }
                                }}
                                onMouseMove={(e) => {
                                    if (!isDragging || !dragCorner) return;

                                    const canvas = canvasRef.current;
                                    if (!canvas) return;

                                    const rect = canvas.getBoundingClientRect();
                                    const mouseX = e.clientX - rect.left;
                                    const mouseY = e.clientY - rect.top;

                                    const cx = canvas.center.x;
                                    const cy = canvas.center.y;
                                    const scale = canvas.scale; // px/m

                                    // Calculate new dimensions based on mouse position (in meters)
                                    let newL_m, newW_m;

                                    // Distance from center to mouse (considering which corner is being dragged)
                                    const dx = Math.abs(mouseX - cx);
                                    const dy = Math.abs(mouseY - cy);

                                    newL_m = (dx * 2) / scale;
                                    newW_m = (dy * 2) / scale;

                                    // Ensure minimum size
                                    newL_m = Math.max(1e-9, newL_m);
                                    newW_m = Math.max(1e-9, newW_m);

                                    // Convert from meters back to selected units
                                    const newL = newL_m / TO_METERS[inputs.longerUnit];
                                    const newW = newW_m / TO_METERS[inputs.shorterUnit];

                                    // Make sure longerSide remains longer (normalize logic)
                                    // We compare dimensions in METERS for correctness, but store in UNITS
                                    if (newL_m >= newW_m) {
                                        setInputs(prev => ({
                                            ...prev,
                                            longerSide: +newL.toFixed(2),
                                            shorterSide: +newW.toFixed(2)
                                        }));
                                    } else {
                                        // Swap
                                        setInputs(prev => ({
                                            ...prev,
                                            longerSide: +newW.toFixed(2), // was width, now length
                                            shorterSide: +newL.toFixed(2)  // was length, now width
                                        }));
                                    }
                                }}
                                onMouseUp={() => {
                                    setIsDragging(false);
                                    setDragCorner(null);
                                }}
                                onMouseLeave={() => {
                                    setIsDragging(false);
                                    setDragCorner(null);
                                }}
                            />

                        </div>


                        <div className="mt-4 flex justify-end">
                            <select
                                value={visualizationUnit}
                                onChange={(e) => setVisualizationUnit(e.target.value)}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="mm">millimeters (mm)</option>
                                <option value="cm">centimeters (cm)</option>
                                <option value="m">meters (m)</option>
                                <option value="km">kilometers (km)</option>
                                <option value="in">inches (in)</option>
                                <option value="ft">feet (ft)</option>
                                <option value="yd">yards (yd)</option>
                                <option value="mi">miles (mi)</option>
                            </select>
                        </div>
                    </div>
                    {/* Diagonal Result - Highlighted */}
                    {results && (
                        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-center mb-3">
                                <h3 className="text-lg font-semibold text-gray-800">Diagonal (d)</h3>
                                <select
                                    value={diagonalUnit}
                                    onChange={(e) => handleDiagonalUnitChange(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="mm">millimeters (mm)</option>
                                    <option value="cm">centimeters (cm)</option>
                                    <option value="m">meters (m)</option>
                                    <option value="km">kilometers (km)</option>
                                    <option value="in">inches (in)</option>
                                    <option value="ft">feet (ft)</option>
                                    <option value="yd">yards (yd)</option>
                                    <option value="mi">miles (mi)</option>
                                </select>
                            </div>
                            <div className="text-5xl font-bold text-blue-600">
                                {convertDiagonal(results.diagonal, diagonalUnit)}
                            </div>
                        </div>
                    )}

                    {/* Info Box */}
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-2 rounded h-fit">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-yellow-800">
                                    Check out 25 similar 2d geometry calculators
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    );
}




function ResultCard({ label, value, unit }) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">{label}</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{value}</span>
                    <select
                        disabled
                        value={unit}
                        className="px-2 py-1 bg-gray-100 border border-gray-300 rounded text-sm text-gray-600"
                    >
                        <option>{unit}</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function AreaResultCard({ value, selectedUnit, onUnitChange, convertArea }) {
    const convertedValue = convertArea(value, selectedUnit);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Area</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{convertedValue}</span>
                    <select
                        value={selectedUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="mm2">square millimeters (mm²)</option>
                        <option value="cm2">square centimeters (cm²)</option>
                        <option value="m2">square meters (m²)</option>
                        <option value="km2">square kilometers (km²)</option>
                        <option value="in2">square inches (in²)</option>
                        <option value="ft2">square feet (ft²)</option>
                        <option value="yd2">square yards (yd²)</option>
                        <option value="mi2">square miles (mi²)</option>
                        <option value="a">ares (a)</option>
                        <option value="da">decares (da)</option>
                        <option value="ha">hectares (ha)</option>
                        <option value="ac">acres (ac)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function PerimeterResultCard({ value, selectedUnit, onUnitChange, convertPerimeter }) {
    const convertedValue = convertPerimeter(value, selectedUnit);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Perimeter</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{convertedValue}</span>
                    <select
                        value={selectedUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="mm">millimeters (mm)</option>
                        <option value="cm">centimeters (cm)</option>
                        <option value="m">meters (m)</option>
                        <option value="km">kilometers (km)</option>
                        <option value="in">inches (in)</option>
                        <option value="ft">feet (ft)</option>
                        <option value="yd">yards (yd)</option>
                        <option value="mi">miles (mi)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function AngleResultCard({ value, selectedUnit, onUnitChange, convertAngle }) {
    const convertedValue = convertAngle(value, selectedUnit);

    // Format the display value for turn radians
    const displayValue = selectedUnit === 'turn'
        ? `${(parseFloat(convertedValue) / Math.PI).toFixed(2)} × π`
        : convertedValue;

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Angle between diagonals (α)</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{displayValue}</span>
                    <select
                        value={selectedUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="deg">degrees (deg)</option>
                        <option value="rad">radians (rad)</option>
                        <option value="gon">gradians (gon)</option>
                        <option value="turn">turn radians (× π rad)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}

function RadiusResultCard({ value, selectedUnit, onUnitChange, convertRadius }) {
    const convertedValue = convertRadius(value, selectedUnit);

    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-700">Circumcircle radius (r)</span>
                <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">{convertedValue}</span>
                    <select
                        value={selectedUnit}
                        onChange={(e) => onUnitChange(e.target.value)}
                        className="px-2 py-1 bg-white border border-gray-300 rounded text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="mm">millimeters (mm)</option>
                        <option value="cm">centimeters (cm)</option>
                        <option value="m">meters (m)</option>
                        <option value="km">kilometers (km)</option>
                        <option value="in">inches (in)</option>
                        <option value="ft">feet (ft)</option>
                        <option value="yd">yards (yd)</option>
                        <option value="mi">miles (mi)</option>
                    </select>
                </div>
            </div>
        </div>
    );
}