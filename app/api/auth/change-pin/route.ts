import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ChangePinBody = {
  phone?: string;
  currentPin?: string;
  newPin?: string;
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
    const body = (await request.json()) as ChangePinBody;

    const phone = normalizePhone(body.phone ?? "");
    const currentPin = (body.currentPin ?? "").trim();
    const newPin = (body.newPin ?? "").trim();

    if (!/^05\d{8}$/.test(phone)) {
      return NextResponse.json(
        {
          success: false,
          message: "מספר הטלפון אינו תקין",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(currentPin)) {
      return NextResponse.json(
        {
          success: false,
          message: "הקוד הנוכחי חייב להכיל 4 עד 6 ספרות",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(newPin)) {
      return NextResponse.json(
        {
          success: false,
          message: "הקוד החדש חייב להכיל 4 עד 6 ספרות",
        },
        { status: 400 }
      );
    }

    if (currentPin === newPin) {
      return NextResponse.json(
        {
          success: false,
          message: "הקוד החדש חייב להיות שונה מהקוד הנוכחי",
        },
        { status: 400 }
      );
    }

    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const secretKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !secretKey) {
      console.error(
        "Missing Supabase server environment variables"
      );

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
      secretKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    const { data: member, error: memberError } =
      await supabaseAdmin
        .from("members")
        .select("id, is_active, pin_hash")
        .eq("phone", phone)
        .maybeSingle();

    if (memberError) {
      console.error(
        "Change PIN member lookup failed:",
        memberError
      );

      return NextResponse.json(
        {
          success: false,
          message: "לא ניתן לשנות את הקוד כרגע",
        },
        { status: 500 }
      );
    }

    if (!member || !member.pin_hash) {
      return NextResponse.json(
        {
          success: false,
          message: "המשתמש לא נמצא",
        },
        { status: 404 }
      );
    }

    if (!member.is_active) {
      return NextResponse.json(
        {
          success: false,
          message: "המשתמש אינו פעיל",
        },
        { status: 403 }
      );
    }

    const currentPinIsValid = await bcrypt.compare(
      currentPin,
      member.pin_hash
    );

    if (!currentPinIsValid) {
      return NextResponse.json(
        {
          success: false,
          message: "הקוד הנוכחי שגוי",
        },
        { status: 401 }
      );
    }

    const newPinHash = await bcrypt.hash(newPin, 12);

    const { error: updateError } = await supabaseAdmin
      .from("members")
      .update({
        pin_hash: newPinHash,
      })
      .eq("id", member.id);

    if (updateError) {
      console.error(
        "Change PIN update failed:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message: "עדכון הקוד נכשל",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "הקוד האישי עודכן בהצלחה",
    });
  } catch (error) {
    console.error("Change PIN route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "אירעה שגיאה לא צפויה",
      },
      { status: 500 }
    );
  }
}