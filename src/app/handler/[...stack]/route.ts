// Stack Auth requires a catch-all route handler
// For now, we'll create a minimal handler that delegates to Stack
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    // Stack Auth will handle this via middleware
    return NextResponse.json({ message: "Stack Auth handler" });
}

export async function POST(req: NextRequest) {
    // Stack Auth will handle this via middleware  
    return NextResponse.json({ message: "Stack Auth handler" });
}
