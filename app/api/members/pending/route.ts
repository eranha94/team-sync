import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RequestBody = {
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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase server configuration");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

async function verifyAdmin(
  supabaseAdmin: ReturnType<typeof getAdminClient>,
  phone: string,
  pin: string
) {
  const { data: admin, error } = await supabaseAdmin
    .from("members")
    .select("id, role, is_active, approval_status, pin_hash")
    .eq("phone", phone)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (
    !admin ||
    !admin.is_active ||
    admin.approval_status !== "approved" ||
    admin.role !== "admin" ||
    !admin.pin_hash
  ) {
    return false;
  }

  return bcrypt.compare(pin, admin.pin_hash);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody;

    const adminPhone = normalizePhone(body.adminPhone ?? "");
    const adminPin = (body.adminPin ?? "").trim();

    if (!/^05\d{8}$/.test(adminPhone) || !/^\d{4,6}$/.test(adminPin)) {
      return NextResponse.json(
        {
          success: false,
          message: "פרטי המנהל אינם תקינים",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getAdminClient();

    const isAdmin = await verifyAdmin(
      supabaseAdmin,
      adminPhone,
      adminPin
    );

    if (!isAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "אימות המנהל נכשל",
        },
        { status: 403 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("members")
      .select(
        "id, full_name, phone, role, created_at, approval_status"
      )
      .eq("approval_status", "pending")
      .eq("is_active", false)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: data ?? [],
    });
  } catch (error) {
    console.error("Pending members error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "לא ניתן לטעון את בקשות ההצטרפות",
      },
      { status: 500 }
    );
  }
}