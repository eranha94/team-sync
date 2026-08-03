import bcrypt from "bcryptjs";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

type ClosePollBody = {
  pollId?: string;
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

function getSupabaseAdmin() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL;

  const serviceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error(
      "Missing Supabase server configuration"
    );
  }

  return createClient(
    supabaseUrl,
    serviceRoleKey,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    }
  );
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as ClosePollBody;

    const pollId = (body.pollId ?? "").trim();
    const adminPhone = normalizePhone(
      body.adminPhone ?? ""
    );
    const adminPin = (body.adminPin ?? "").trim();

    if (!pollId) {
      return NextResponse.json(
        {
          success: false,
          message: "לא נבחר סקר לסגירה",
        },
        { status: 400 }
      );
    }

    if (!/^05\d{8}$/.test(adminPhone)) {
      return NextResponse.json(
        {
          success: false,
          message: "מספר הטלפון של המנהל אינו תקין",
        },
        { status: 400 }
      );
    }

    if (!/^\d{4,6}$/.test(adminPin)) {
      return NextResponse.json(
        {
          success: false,
          message: "יש להזין קוד מנהל בן 4 עד 6 ספרות",
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const {
      data: admin,
      error: adminError,
    } = await supabaseAdmin
      .from("members")
      .select(
        "id, role, is_active, approval_status, pin_hash"
      )
      .eq("phone", adminPhone)
      .maybeSingle();

    if (adminError) {
      console.error(
        "Close poll admin lookup error:",
        adminError
      );

      return NextResponse.json(
        {
          success: false,
          message: "לא ניתן לאמת את המנהל כרגע",
        },
        { status: 500 }
      );
    }

    const isValidAdmin =
      admin &&
      admin.role === "admin" &&
      admin.is_active === true &&
      admin.approval_status === "approved" &&
      admin.pin_hash &&
      (await bcrypt.compare(
        adminPin,
        admin.pin_hash
      ));

    if (!isValidAdmin) {
      return NextResponse.json(
        {
          success: false,
          message: "אימות המנהל נכשל",
        },
        { status: 403 }
      );
    }

    const {
      data: poll,
      error: pollError,
    } = await supabaseAdmin
      .from("polls")
      .select("id, title, status")
      .eq("id", pollId)
      .maybeSingle();

    if (pollError) {
      console.error(
        "Close poll lookup error:",
        pollError
      );

      return NextResponse.json(
        {
          success: false,
          message: "לא ניתן לטעון את הסקר",
        },
        { status: 500 }
      );
    }

    if (!poll) {
      return NextResponse.json(
        {
          success: false,
          message: "הסקר לא נמצא",
        },
        { status: 404 }
      );
    }

    if (poll.status === "closed") {
      return NextResponse.json(
        {
          success: false,
          message: "הסקר כבר סגור",
        },
        { status: 400 }
      );
    }

    const {
      data: closedPoll,
      error: updateError,
    } = await supabaseAdmin
      .from("polls")
      .update({
        status: "closed",
      })
      .eq("id", pollId)
      .eq("status", "open")
      .select("id, title, status")
      .maybeSingle();

    if (updateError) {
      console.error(
        "Close poll update error:",
        updateError
      );

      return NextResponse.json(
        {
          success: false,
          message: "סגירת הסקר נכשלה",
        },
        { status: 500 }
      );
    }

    if (!closedPoll) {
      return NextResponse.json(
        {
          success: false,
          message:
            "הסקר אינו פתוח או שכבר נסגר",
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `הסקר "${closedPoll.title}" נסגר בהצלחה`,
      poll: closedPoll,
    });
  } catch (error) {
    console.error("Close poll route error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "אירעה שגיאה לא צפויה",
      },
      { status: 500 }
    );
  }
}