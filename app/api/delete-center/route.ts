
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  );

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      centerId,
      userId,
    } = body;

    // delete center
    const {
      error:
        centerError,
    } =
      await supabaseAdmin
        .from(
          "centers"
        )
        .delete()
        .eq(
          "id",
          centerId
        );

    if (
      centerError
    ) {
      return NextResponse.json(
        {
          success:
            false,
          error:
            centerError.message,
        }
      );
    }

    // delete profile
    await supabaseAdmin
      .from(
        "profiles"
      )
      .delete()
      .eq(
        "id",
        userId
      );

    // delete auth user
    const {
      error:
        authError,
    } =
      await supabaseAdmin.auth.admin.deleteUser(
        userId
      );

    if (
      authError
    ) {
      return NextResponse.json(
        {
          success:
            false,
          error:
            authError.message,
        }
      );
    }

    return NextResponse.json(
      {
        success:
          true,
        }
      );
  } catch (
    error: any
  ) {
    return NextResponse.json(
      {
        success:
          false,
        error:
          error.message,
      }
    );
  }
}

