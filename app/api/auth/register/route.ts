import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_POSITIONS = [
  "goalkeeper",
  "center_back",
  "full_back",
  "defensive_midfielder",
  "midfielder",
  "winger",
  "striker",
] as const;

type PlayerPosition =
  (typeof ALLOWED_POSITIONS)[number];

type RegisterBody = {
  fullName?: string;
  phone?: string;
  pin?: string;
  positions?: string[];
};

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");

  if (
    digits.startsWith("9725") &&
    digits.length === 12
  ) {
    return `0${digits.slice(3)}`;
  }

  return digits;
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as RegisterBody;

    const fullName = (body.fullName ?? "").trim();
    const phone = normalizePhone(body.phone ?? "");
    const pin = (body.pin ?? "").trim();

    const positions = Array.isArray(body.positions)
      ? [...new Set(body.positions)]
      : [];

    if (fullName.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message: "יש להזין שם מלא",
        },
        { status: 400 }
      );
    }

    if (fullName.length > 80) {
      return NextResponse.json(
        {
          success: false,
          message: "השם שהוזן ארוך מדי",
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

    if (
      positions.length === 0 ||
      positions.some(
        (position) =>
          !ALLOWED_POSITIONS.includes(
            position as PlayerPosition
          )
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "יש לבחור לפחות עמדה חוקית אחת",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(pin)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "הקוד חייב להכיל 4 עד 6 ספרות",
        },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceKey) {
      console.error(
        "Missing Supabase server configuration"
      );

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
          detectSessionInUrl: false,
        },
      }
    );

    const {
      data: existingMember,
      error: existingMemberError,
    } = await supabase
      .from("members")
      .select(
        "id, is_active, approval_status"
      )
      .eq("phone", phone)
      .maybeSingle();

    if (existingMemberError) {
      console.error(
        "Existing member lookup error:",
        existingMemberError
      );

      return NextResponse.json(
        {
          success: false,
          message:
            "לא ניתן לבדוק את פרטי המשתמש כרגע",
        },
        { status: 500 }
      );
    }

    if (existingMember) {
      let message =
        "מספר הטלפון כבר רשום במערכת";

      if (
        existingMember.approval_status ===
        "pending"
      ) {
        message =
          "כבר קיימת בקשת הרשמה למספר הזה";
      }

      if (
        existingMember.approval_status ===
        "rejected"
      ) {
        message =
          "בקשת הרשמה קודמת למספר הזה נדחתה";
      }

      return NextResponse.json(
        {
          success: false,
          message,
        },
        { status: 400 }
      );
    }

    const pinHash = await bcrypt.hash(pin, 12);

    const { error } = await supabase
      .from("members")
      .insert({
        full_name: fullName,
        phone,
        pin_hash: pinHash,
        positions,
        role: "player",
        is_active: false,
        approval_status: "pending",
      });

    if (error) {
      console.error(
        "Register member insert error:",
        error
      );

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
    console.error(
      "Register route error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "אירעה שגיאה",
      },
      { status: 500 }
    );
  }
}