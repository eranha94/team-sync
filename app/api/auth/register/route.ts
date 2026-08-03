import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type RegisterBody = {
  fullName?: string;
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
    const body = (await request.json()) as RegisterBody;

    const fullName = (body.fullName ?? "").trim();
    const phone = normalizePhone(body.phone ?? "");
    const pin = (body.pin ?? "").trim();

    if (fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "יש להזין שם מלא",
        },
        { status: 400 }
      );
    }

    if (!/^05\d{8}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "מספר הטלפון אינו תקין",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          message: "הקוד חייב להכיל 4 עד 6 ספרות",
        },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      return NextResponse.json(
        {
          success: false,
          message: "שרת לא מוגדר",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    // האם כבר קיים משתמש

    const { data: existingMember } =
      await supabase
        .from("members")
        .select("id,is_active")
        .eq("phone", phone)
        .maybeSingle();

    if (existingMember) {
      return NextResponse.json(
        {
          success: false,
          message:
            existingMember.is_active
              ? "מספר הטלפון כבר רשום במערכת"
              : "כבר קיימת בקשת הרשמה למספר הזה",
        },
        { status: 400 }
      );
    }

    const pinHash = await bcrypt.hash(pin, 12);

    const { error } = await supabase
      .from("members")
      .insert({
        full_name: fullName,
        phone: phone,
        pin_hash: pinHash,

        role: "player",

        is_active: false,

        approval_status: "pending",
      });

    if (error) {
      console.error(error);

      return NextResponse.json(
        {
          success: false,
          message: "יצירת הבקשה נכשלה",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message:
        "בקשת ההצטרפות נשלחה בהצלחה וממתינה לאישור מנהל הקבוצה.",
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "אירעה שגיאה",
      },
      { status: 500 }
    );
  }
}