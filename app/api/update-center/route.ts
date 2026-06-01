
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
      id,
      center_name,
      phone,
      governorate,
      city,
      address,
      email,
      status,
    } = body;

    const {
      error,
    } =
      await supabaseAdmin
        .from(
          "centers"
        )
        .update({
          center_name,
          phone,
          governorate,
          city,
          address,
          email,
          status,
        })
        .eq(
          "id",
          id
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

