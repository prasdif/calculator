import {
    KITCHEN_BASE_RATES,
    KITCHEN_ACCESSORIES,
    WARDROBE_BASE_RATES,
    WARDROBE_FINISH_MULTIPLIERS,
    WARDROBE_ACCESSORIES,
    TV_UNIT_BASE_RATE,
    TV_UNIT_CLOSED_STORAGE,
    BED_BASE_PRICE,
    BED_HYDRAULIC_STORAGE,
    BED_HEADBOARD,
    FULL_HOME_RATES,
    BHK_BEDROOM_COUNT,
    BHK_BATHROOM_COUNT,
    BUDGET_RANGE_PERCENTAGE,
} from './constants';

export function calculateKitchen(estimate) {
    const breakdown = [];

    const baseRate = KITCHEN_BASE_RATES[estimate.finish];
    const baseCost = estimate.runningFeet * baseRate;
    breakdown.push({
        label: `Kitchen Base (${estimate.runningFeet} ft, ${estimate.finish})`,
        amount: baseCost,
    });

    let accessoriesTotal = 0;

    if (estimate.accessories.softClose) {
        breakdown.push({ label: 'Soft Close Drawers', amount: KITCHEN_ACCESSORIES.softClose });
        accessoriesTotal += KITCHEN_ACCESSORIES.softClose;
    }

    if (estimate.accessories.cutleryTray) {
        breakdown.push({ label: 'Cutlery Tray', amount: KITCHEN_ACCESSORIES.cutleryTray });
        accessoriesTotal += KITCHEN_ACCESSORIES.cutleryTray;
    }

    if (estimate.accessories.tallUnit) {
        breakdown.push({ label: 'Tall Unit', amount: KITCHEN_ACCESSORIES.tallUnit });
        accessoriesTotal += KITCHEN_ACCESSORIES.tallUnit;
    }

    if (estimate.accessories.cornerCarousel) {
        breakdown.push({ label: 'Corner Carousel', amount: KITCHEN_ACCESSORIES.cornerCarousel });
        accessoriesTotal += KITCHEN_ACCESSORIES.cornerCarousel;
    }

    if (estimate.accessories.chimney) {
        breakdown.push({ label: 'Chimney', amount: KITCHEN_ACCESSORIES.chimney });
        accessoriesTotal += KITCHEN_ACCESSORIES.chimney;
    }

    if (estimate.accessories.hob) {
        breakdown.push({ label: 'Hob', amount: KITCHEN_ACCESSORIES.hob });
        accessoriesTotal += KITCHEN_ACCESSORIES.hob;
    }

    const total = baseCost + accessoriesTotal;
    const minBudget = Math.round(total * (1 - BUDGET_RANGE_PERCENTAGE));
    const maxBudget = Math.round(total * (1 + BUDGET_RANGE_PERCENTAGE));

    return { total, minBudget, maxBudget, breakdown };
}

export function calculateWardrobe(estimate) {
    const breakdown = [];

    const baseRate = WARDROBE_BASE_RATES[estimate.type];
    const finishMultiplier = WARDROBE_FINISH_MULTIPLIERS[estimate.finish];
    const baseCost = estimate.runningFeet * baseRate * finishMultiplier;

    breakdown.push({
        label: `Wardrobe Base (${estimate.runningFeet} ft, ${estimate.type}, ${estimate.finish})`,
        amount: baseCost,
    });

    let accessoriesTotal = 0;

    if (estimate.accessories.drawerSet) {
        breakdown.push({ label: 'Drawer Set', amount: WARDROBE_ACCESSORIES.drawerSet });
        accessoriesTotal += WARDROBE_ACCESSORIES.drawerSet;
    }

    if (estimate.accessories.mirrorShutter) {
        breakdown.push({ label: 'Mirror Shutter', amount: WARDROBE_ACCESSORIES.mirrorShutter });
        accessoriesTotal += WARDROBE_ACCESSORIES.mirrorShutter;
    }

    if (estimate.accessories.loft) {
        breakdown.push({ label: 'Loft', amount: WARDROBE_ACCESSORIES.loft });
        accessoriesTotal += WARDROBE_ACCESSORIES.loft;
    }

    if (estimate.accessories.softCloseHinges) {
        breakdown.push({ label: 'Soft Close Hinges', amount: WARDROBE_ACCESSORIES.softCloseHinges });
        accessoriesTotal += WARDROBE_ACCESSORIES.softCloseHinges;
    }

    const total = baseCost + accessoriesTotal;
    const minBudget = Math.round(total * (1 - BUDGET_RANGE_PERCENTAGE));
    const maxBudget = Math.round(total * (1 + BUDGET_RANGE_PERCENTAGE));

    return { total, minBudget, maxBudget, breakdown };
}

export function calculateTVUnit(config) {
    const breakdown = [];

    const baseCost = config.runningFeet * TV_UNIT_BASE_RATE;
    breakdown.push({
        label: `TV Unit Base (${config.runningFeet} ft)`,
        amount: baseCost,
    });

    let storageUpgrade = 0;
    if (config.closedStorage) {
        storageUpgrade = config.runningFeet * TV_UNIT_CLOSED_STORAGE;
        breakdown.push({
            label: 'Closed Storage Upgrade',
            amount: storageUpgrade,
        });
    }

    const total = baseCost + storageUpgrade;
    const minBudget = Math.round(total * (1 - BUDGET_RANGE_PERCENTAGE));
    const maxBudget = Math.round(total * (1 + BUDGET_RANGE_PERCENTAGE));

    return { total, minBudget, maxBudget, breakdown };
}

export function calculateBed(config) {
    const breakdown = [];

    let total = BED_BASE_PRICE;
    breakdown.push({
        label: 'Platform Bed Base',
        amount: BED_BASE_PRICE,
    });

    if (config.hydraulicStorage) {
        breakdown.push({ label: 'Hydraulic Storage', amount: BED_HYDRAULIC_STORAGE });
        total += BED_HYDRAULIC_STORAGE;
    }

    if (config.headboard) {
        breakdown.push({ label: 'Headboard', amount: BED_HEADBOARD });
        total += BED_HEADBOARD;
    }

    const minBudget = Math.round(total * (1 - BUDGET_RANGE_PERCENTAGE));
    const maxBudget = Math.round(total * (1 + BUDGET_RANGE_PERCENTAGE));

    return { total, minBudget, maxBudget, breakdown };
}

export function calculateFullHome(estimate) {
    const breakdown = [];

    breakdown.push({
        label: 'Living Room',
        amount: FULL_HOME_RATES.living,
    });

    const bedroomCount = BHK_BEDROOM_COUNT[estimate.bhkType];
    const bedroomTotal = bedroomCount * FULL_HOME_RATES.bedroomBase;
    breakdown.push({
        label: `Bedrooms (${bedroomCount})`,
        amount: bedroomTotal,
    });

    const bathroomCount = BHK_BATHROOM_COUNT[estimate.bhkType];
    const bathroomTotal = bathroomCount * FULL_HOME_RATES.bathroom;
    breakdown.push({
        label: `Bathrooms (${bathroomCount})`,
        amount: bathroomTotal,
    });

    breakdown.push({
        label: 'Dining Area',
        amount: FULL_HOME_RATES.dining,
    });

    let total =
        FULL_HOME_RATES.living +
        bedroomTotal +
        bathroomTotal +
        FULL_HOME_RATES.dining;

    if (estimate.includeKitchen && estimate.kitchen) {
        const kitchenResult = calculateKitchen(estimate.kitchen);
        breakdown.push({
            label: 'Kitchen',
            amount: kitchenResult.total,
        });
        total += kitchenResult.total;
    }

    if (estimate.includeWardrobe && estimate.wardrobe) {
        const wardrobeResult = calculateWardrobe(estimate.wardrobe);
        breakdown.push({
            label: 'Wardrobe',
            amount: wardrobeResult.total,
        });
        total += wardrobeResult.total;
    }

    if (estimate.includeTVUnit && estimate.tvUnit) {
        const tvResult = calculateTVUnit(estimate.tvUnit);
        breakdown.push({
            label: 'TV Unit',
            amount: tvResult.total,
        });
        total += tvResult.total;
    }

    if (estimate.includeBed && estimate.bed) {
        const bedResult = calculateBed(estimate.bed);
        breakdown.push({
            label: 'Bed',
            amount: bedResult.total,
        });
        total += bedResult.total;
    }

    const minBudget = Math.round(total * (1 - BUDGET_RANGE_PERCENTAGE));
    const maxBudget = Math.round(total * (1 + BUDGET_RANGE_PERCENTAGE));

    return { total, minBudget, maxBudget, breakdown };
}

export function formatCurrency(amount) {
    return `₹${amount.toLocaleString('en-IN')}`;
}
