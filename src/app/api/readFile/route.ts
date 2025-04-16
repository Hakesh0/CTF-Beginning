import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';

export async function GET(req: NextRequest) {
  const filePath = req.nextUrl.searchParams.get('filePath');

  if (!filePath) {
    return new NextResponse('File path is required', { status: 400 });
  }

  try {
    const fileContent = await fs.readFile(filePath, 'utf-8');
    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain',
      },
    });
  } catch (error: any) {
    return new NextResponse(`Error reading file: ${error.message}`, { status: 500 });
  }
}
