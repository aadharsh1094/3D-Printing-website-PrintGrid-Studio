import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import fs from "node:fs";
import { getOrder } from "@/lib/orders";
import { verifyAdminToken, ADMIN_COOKIE } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const jar = await cookies();
  const token = jar.get(ADMIN_COOKIE.name)?.value;
  if (!token || !(await verifyAdminToken(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const order = await getOrder(id);
  if (!order) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!fs.existsSync(order.file_path)) {
    return NextResponse.json(
      { error: "File missing on disk" },
      { status: 410 }
    );
  }
  const buf = fs.readFileSync(order.file_path);
  const ab = buf.buffer.slice(
    buf.byteOffset,
    buf.byteOffset + buf.byteLength
  ) as ArrayBuffer;
  return new NextResponse(ab, {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="${order.file_name}"`,
      "Content-Length": String(buf.byteLength),
    },
  });
}
