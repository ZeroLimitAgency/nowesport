import { NextResponse } from "next/server";
import { getMaintenanceSetting } from "@/lib/settings";

export async function GET() {
  const maintenance = await getMaintenanceSetting();
  return NextResponse.json({ maintenance });
}
