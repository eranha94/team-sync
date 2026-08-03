import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type LoginBody = {
  phone?: string;
  pin?: string;
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (digits.startsWith("9725") && digits.length === 12) {
    return `0${digits.slice(3)}`;
  }

  return digits;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as LoginBody;

    const phone = normalizePhone(body.phone ?? "");
    const pin = (body.pin ?? "").trim();

    if (!/^05\d{8}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "יש להזין מספר טלפון ישראלי תקין",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          message: "יש להזין קוד אישי בן 4 עד 6 ספרות",
        },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      console.error("Missing Supabase server environment variables");

      return NextResponse.json(
        {
          success: false,
          message: "הגדרות השרת אינן תקינות",
        },
        { status: 500 }
      );
    }

    const supabaseAdmin = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const { data: member, error } = await supabaseAdmin
      .from("members")
      .select(
        "id, full_name, phone, role, is_active, pin_hash"
      )
      .eq("phone", phone)
      .maybeSingle();

    if (error) {
      console.error("Member lookup failed:", error);

      return NextResponse.json(
        {
          success: false,
          message: "לא ניתן לבצע כניסה כרגע",
        },
        { status: 500 }
      );
    }

    if (!member || !member.pin_hash) {
      return NextResponse.json(
        {
          success: false,
          message: "מספר הטלפון או הקוד האישי שגויים",
        },
        { status: 401 }
      );
    }

    if (!member.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "המשתמש אינו פעיל. יש לפנות למנהל הקבוצה",
        },
        { status: 403 }
      );
    }

    const pinIsValid = await bcrypt.compare(
      pin,
      member.pin_hash
    );

    if (!pinIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "מספר הטלפון או הקוד האישי שגויים",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      member: {
        id: member.id,
        fullName: member.full_name,
        phone: member.phone,
        role: member.role,
      },
    });
  } catch (error) {
    console.error("Login route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "אירעה שגיאה לא צפויה. נסה שוב",
      },
      { status: 500 }
    );
  }
}