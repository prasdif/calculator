import { NextResponse } from 'next/server';
import { calculateFullHome } from '@/lib/calculations';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (!['1BHK', '2BHK', '3BHK', '4BHK', '5BHK+'].includes(body.bhkType)) {
            return NextResponse.json(
                { success: false, error: 'Invalid BHK type' },
                { status: 400 }
            );
        }

        if (!['small', 'large'].includes(body.bhkSize)) {
            return NextResponse.json(
                { success: false, error: 'Invalid BHK size' },
                { status: 400 }
            );
        }

        const result = calculateFullHome(body);

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Full home estimate error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Full Home Estimator API',
        usage: 'POST with FullHomeEstimate object',
        example: {
            bhkType: '2BHK',
            bhkSize: 'small',
            includeKitchen: false,
            includeWardrobe: false,
            includeTVUnit: false,
            includeBed: false,
        },
    });
} 

export async function Get() {
    return NextResponse.json({
        message:  'Full Home Estimator API', 
        usage: 'POST with FullHomeEstimater object', 
        example: {
            bhkType: '2BHK',
            bhkSize: 'small',
            includeKitchen: false,
            includeWardrobe: false,
            includeTVUnit: false,
            includeBed: false,
        }

    })
}