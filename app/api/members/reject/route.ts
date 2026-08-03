import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RequestBody = {
  memberId?: string;
  adminPhone?: string;
  adminPin?: string;
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("9725") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  return digits;
}

function getAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error("Missing Supabase server configuration");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const memberId = body.memberId ?? "";
    const adminPhone = normalizePhone(body.adminPhone ?? "");
    const adminPin = (body.adminPin ?? "").trim();

    if (!memberId) {
      return NextResponse.json(
        {
          success: false,
          message: "לא נבחר משתמש לדחייה",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    const { data: admin, error: adminError } = await supabaseAdmin
      .from("members")
      .select("role, is_active, approval_status, pin_hash")
      .eq("phone", adminPhone)
      .maybeSingle();

    if (adminError) {
      throw adminError;
    }

    const validAdmin =
      admin &&
      admin.role === "admin" &&
      admin.is_active &&
      admin.approval_status === "approved" &&
      admin.pin_hash &&
      (await bcrypt.compare(adminPin, admin.pin_hash));

    if (!validAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "אימות המנהל נכשל",
        },
        { status: 403 }
      );
    }

    const { data: rejectedMember, error: updateError } =
      await supabaseAdmin
        .from("members")
        .update({
          is_active: false,
          approval_status: "rejected",
        })
        .eq("id", memberId)
        .eq("approval_status", "pending")
        .select("id, full_name")
        .maybeSingle();

    if (updateError) {
      throw updateError;
    }

    if (!rejectedMember) {
      return NextResponse.json(
        {
          success: false,
          message: "הבקשה לא נמצאה או שכבר טופלה",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `הבקשה של ${rejectedMember.full_name} נדחתה`,
    });
  } catch (error) {
    console.error("Reject member error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "דחיית המשתמש נכשלה",
      },
      { status: 500 }
    );
  }
}