import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function removeId(rows: any[]) {
  return rows.map(({ id, ...row }) => row);
}

export async function POST(
  request: Request
) {
  try {

    const backup =
      await request.json();

    const results: any = {};

    // =========================
    // PRODUCTS (UUID)
    // =========================

    if (
      backup.products &&
      backup.products.length > 0
    ) {

      await supabase
        .from("products")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("products")
          .insert(
            backup.products
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage: "PRODUCTS",
          error:
            result.error.message,
        });
      }

      results.products =
        result.data?.length || 0;
    }

    // =========================
    // WARRANTIES (UUID)
    // =========================

    if (
      backup.warranties &&
      backup.warranties.length > 0
    ) {

      await supabase
        .from("warranties")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("warranties")
          .insert(
            backup.warranties
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage: "WARRANTIES",
          error:
            result.error.message,
        });
      }

      results.warranties =
        result.data?.length || 0;
    }

    // =========================
    // CENTERS (UUID)
    // =========================

    if (
      backup.centers &&
      backup.centers.length > 0
    ) {

      await supabase
        .from("centers")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("centers")
          .insert(
            backup.centers
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage: "CENTERS",
          error:
            result.error.message,
        });
      }

      results.centers =
        result.data?.length || 0;
    }

    // =========================
    // PROFILES (UUID)
    // =========================

    if (
      backup.profiles &&
      backup.profiles.length > 0
    ) {

      await supabase
        .from("profiles")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("profiles")
          .insert(
            backup.profiles
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage: "PROFILES",
          error:
            result.error.message,
        });
      }

      results.profiles =
        result.data?.length || 0;
    }

    // =========================
    // ROLL INVENTORY (BIGINT)
    // =========================

    if (
      backup.roll_inventory &&
      backup.roll_inventory.length > 0
    ) {

      await supabase
        .from("roll_inventory")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("roll_inventory")
          .insert(
            removeId(
              backup.roll_inventory
            )
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage:
            "ROLL_INVENTORY",
          error:
            result.error.message,
        });
      }

      results.roll_inventory =
        result.data?.length || 0;
    }

    // =========================
    // ROLL IMPORT HISTORY
    // =========================

    if (
      backup.roll_import_history &&
      backup.roll_import_history.length > 0
    ) {

      await supabase
        .from("roll_import_history")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("roll_import_history")
          .insert(
            removeId(
              backup.roll_import_history
            )
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage:
            "ROLL_IMPORT_HISTORY",
          error:
            result.error.message,
        });
      }

      results.roll_import_history =
        result.data?.length || 0;
    }

    // =========================
    // ROLL RELEASE LOG
    // =========================

    if (
      backup.roll_release_log &&
      backup.roll_release_log.length > 0
    ) {

      await supabase
        .from("roll_release_log")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("roll_release_log")
          .insert(
            removeId(
              backup.roll_release_log
            )
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage:
            "ROLL_RELEASE_LOG",
          error:
            result.error.message,
        });
      }

      results.roll_release_log =
        result.data?.length || 0;
    }

    // =========================
    // SYSTEM SETTINGS
    // =========================

    if (
      backup.system_settings &&
      backup.system_settings.length > 0
    ) {

      await supabase
        .from("system_settings")
        .delete()
        .not("id", "is", null);

      const result =
        await supabase
          .from("system_settings")
          .insert(
            removeId(
              backup.system_settings
            )
          )
          .select();

      if (result.error) {

        return NextResponse.json({
          success: false,
          stage:
            "SYSTEM_SETTINGS",
          error:
            result.error.message,
        });
      }

      results.system_settings =
        result.data?.length || 0;
    }

 return NextResponse.json({
  success: true,
  stage: "COMPLETE",
  message: "Backup restored successfully",
  results: {
    products:
      results.products || 0,

    warranties:
      results.warranties || 0,

    centers:
      results.centers || 0,

    profiles:
      results.profiles || 0,

    roll_inventory:
      results.roll_inventory || 0,

    roll_import_history:
      results.roll_import_history || 0,

    roll_release_log:
      results.roll_release_log || 0,

    system_settings:
      results.system_settings || 0,
  },
});

  } catch (error: any) {

    return NextResponse.json(
      {
        success: false,
        stage: "CATCH",
        error:
          error?.message ||
          String(error),
      },
      {
        status: 500,
      }
    );
  }
}