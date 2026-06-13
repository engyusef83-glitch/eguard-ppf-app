import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
process.env.NEXT_PUBLIC_SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
request: Request
) {
try {


const backup =
  await request.json();

const results: any = {};

// PRODUCTS

if (
  backup.products &&
  backup.products.length > 0
) {

  const deleteProducts =
    await supabase
      .from("products")
      .delete()
      .not("id", "is", null);

  if (deleteProducts.error) {

    return NextResponse.json({
      success: false,
      stage: "PRODUCTS_DELETE",
      error:
        deleteProducts.error.message,
    });
  }

  const insertProducts =
    await supabase
      .from("products")
      .insert(
        backup.products
      )
      .select();

  if (insertProducts.error) {

    return NextResponse.json({
      success: false,
      stage: "PRODUCTS_INSERT",
      error:
        insertProducts.error.message,
    });
  }

  results.products =
    insertProducts.data
      ?.length || 0;
}

// ROLL INVENTORY

if (
  backup.roll_inventory &&
  backup.roll_inventory.length > 0
) {

  const deleteInventory =
    await supabase
      .from("roll_inventory")
      .delete()
      .not("id", "is", null);

  if (deleteInventory.error) {

    return NextResponse.json({
      success: false,
      stage:
        "ROLL_INVENTORY_DELETE",
      error:
        deleteInventory.error.message,
    });
  }

  const inventoryData =
    backup.roll_inventory.map(
      ({ id, ...row }: any) => row
    );

  const insertInventory =
    await supabase
      .from("roll_inventory")
      .insert(
        inventoryData
      )
      .select();

  if (insertInventory.error) {

    return NextResponse.json({
      success: false,
      stage:
        "ROLL_INVENTORY_INSERT",
      error:
        insertInventory.error.message,
    });
  }

  results.roll_inventory =
    insertInventory.data
      ?.length || 0;
}

return NextResponse.json({
  success: true,
  stage: "COMPLETE",
  results,
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
