import { NextResponse } from 'next/server';
import { calculateKitchen } from '@/lib/calculations';

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

        //validate finish 
        if (!['laminate', 'membrane', 'acrylic'].includes(body.finish)) {
            return NextResponse.json(
                { success: false, error: 'Invalid finish type' },
                { status: 400 }
            );
        }

        const result = calculateKitchen(body);

        return NextResponse.json({ success: true, result });
    } catch (error) {
        console.error('Kitchen estimate error:', error);
        return NextResponse.json(
            { success: false, error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        message: 'Kitchen Estimator API',
        usage: 'POST with KitchenEstimate object',
        example: {
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
        },
    });
}
