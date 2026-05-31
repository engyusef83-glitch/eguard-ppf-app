
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type CreateCenterPayload = {
  center_name: string;
  email: string;
  password: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  status: string;
};

export async function createCenter(
  payload: CreateCenterPayload
) {
  try {
    const {
      data: authData,
      error: authError,
    } = await supabase.auth.signUp({
      email: payload.email,
      password:
        payload.password,
    });

    if (
      authError ||
      !authData.user
    ) {
      throw new Error(
        authError?.message ||
          "Failed to create auth user"
      );
    }

    const userId =
      authData.user.id;

    const {
      error:
        profileError,
    } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email:
          payload.email,
        role: "center",
      });

    if (profileError) {
      throw new Error(
        profileError.message
      );
    }

    const {
      error:
        centerError,
    } = await supabase
      .from("centers")
      .insert({
        user_id:
          userId,
        center_name:
          payload.center_name,
        email:
          payload.email,
        phone:
          payload.phone,
        governorate:
          payload.governorate,
        city:
          payload.city,
        address:
          payload.address,
        status:
          payload.status,
      });

    if (centerError) {
      throw new Error(
        centerError.message
      );
    }

    return {
      success: true,
    };
  } catch (error: any) {
    return {
      success: false,
      error:
        error.message,
    };
  }
}

