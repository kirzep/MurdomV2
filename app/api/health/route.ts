// app/api/health/route.ts
import { NextResponse } from 'next/server';

// Этот маршрут просто отвечает "ОК", чтобы мы могли проверить, работает ли сервер.
export async function GET() {
    return NextResponse.json({ status: 'ok' });
}
