import { NextResponse } from "next/server";
import { checkOnboardingStatus } from "@/features/onboarding/actions";

export async function GET() {
  try {
    const result = await checkOnboardingStatus()

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ needsOnboarding: result.needsOnboarding })
  } catch (error) {
    console.error('Check onboarding API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
