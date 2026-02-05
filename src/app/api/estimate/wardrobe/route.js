import { NextResponse } from 'next/server';
import { calculateWardrobe } from '@/lib/calculations';

export async function POST(request) {
    try {
        const body = await request.json();

        // Validate required fields
        if (typeof body.runningFeet !== 'number' || body.runningFeet < 0) {
            return NextResponse.json(
                { success: false, error: 'Invalid running feet value' },
                { status: 400 }
            );
        }

        if (!['swing', 'sliding'].includes(body.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid wardrobe type' }, 
                { status: 400 }
            );
        }

        if (!['laminate', 'membrane', 'acrylic'].includes(body.finish)) {
            return NextResponse.json(
                { success: false, error: 'Invalid finish type' },
                { status: 400 }
            );
        }

        const result = calculateWardrobe(body);

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Wardrobe estimate error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Wardrobe Estimator API',
        usage: 'POST with WardrobeEstimate object',
        example: {
            runningFeet: 7,
            type: 'swing',
            finish: 'laminate',
            accessories: {
                drawerSet: false,
                mirrorShutter: false,
                loft: false,
                softCloseHinges: false,
            },
        },
    });
}
