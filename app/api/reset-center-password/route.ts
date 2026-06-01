
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin =
  createClient(
    process.env
      .NEXT_PUBLIC_SUPABASE_URL!,
    process.env
      .SUPABASE_SERVICE_ROLE_KEY!
  );

function generatePassword() {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789";

  let password =
    "EG-";

  for (
    let i = 0;
    i < 8;
    i++
  ) {
    password +=
      chars.charAt(
        Math.floor(
          Math.random() *
            chars.length
        )
      );
  }

  return password;
}

export async function POST(
  request: Request
) {
  try {
    const body =
      await request.json();

    const {
      userId,
    } = body;

    const password =
      generatePassword();

    const {
      error,
    } =
      await supabaseAdmin.auth.admin.updateUserById(
        userId,
        {
          password,
        }
      );

    if (error) {
      return NextResponse.json(
        {
          success:
            false,
          error:
            error.message,
        }
      );
    }

    return NextResponse.json(
      {
        success:
          true,
        password,
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

