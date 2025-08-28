import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";
import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!process.env.REPLICATE_API_TOKEN) {
      return new NextResponse("Replicate API Token not configured.", { status: 500 });
    }

    const prediction = await replicate.predictions.get(params.id);
    
    return NextResponse.json({
      id: prediction.id,
      status: prediction.status,
      output: prediction.output,
      error: prediction.error
    });
    
  } catch (error) {
    console.log('[REPLICATE_STATUS_ERROR]', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}