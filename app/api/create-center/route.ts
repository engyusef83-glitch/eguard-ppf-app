
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
  center_name,
  email,
  phone,
  governorate,
  city,
  address,
  status,
} = body;

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

const password =
  generatePassword();


    const {
      data: authUser,
      error: authError,
    } =
      await supabaseAdmin.auth.admin.createUser(
        {
          email,
          password,
          email_confirm:
            true,
        }
      );

    if (
      authError ||
      !authUser.user
    ) {
      return NextResponse.json(
        {
          success:
            false,
          error:
            authError?.message ||
            "Failed to create auth user",
        },
        {
          status:
            400,
        }
      );
    }

    const userId =
      authUser.user.id;

    const {
      error:
        profileError,
    } =
      await supabaseAdmin
        .from(
          "profiles"
        )
        .insert({
          id: userId,
          email,
          role:
            "center",
        });

    if (
      profileError
    ) {
      return NextResponse.json(
        {
          success:
            false,
          error:
            profileError.message,
        },
        {
          status:
            400,
        }
      );
    }

    const {
      error:
        centerError,
    } =
      await supabaseAdmin
        .from(
          "centers"
        )
        .insert({
          user_id:
            userId,
          center_name,
          email,
          phone,
          governorate,
          city,
          address,
          status,
        });

    if (
      centerError
    ) {
      return NextResponse.json(
        {
          success:
            false,
          error:
            centerError.message,
        },
        {
          status:
            400,
        }
      );
    }


return NextResponse.json({
  success: true,
  email,
  password,
});


  } catch (
    error: any
  ) {
    return NextResponse.json(
      {
        success:
          false,
        error:
          error.message,
      },
      {
        status:
          500,
      }
    );
  }
}

