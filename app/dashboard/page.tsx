// app/dashboard/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function DashboardPage() {

  const [warranties, setWarranties] =
    useState<any[]>([])

  useEffect(() => {
    fetchWarranties()
  }, [])

  const fetchWarranties = async () => {

    const { data } = await supabase
      .from('warranties')
      .select('*')

    if (data) {
      setWarranties(data)
    }
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-6">
        Dashboard
      </h1>

      <table className="border-collapse border w-full">

        <thead>

          <tr>

            <th className="border p-2">
              Customer
            </th>

            <th className="border p-2">
              VIN
            </th>

            <th className="border p-2">
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {warranties.map((item) => (

            <tr key={item.id}>

              <td className="border p-2">
                {item.customer_name}
              </td>

              <td className="border p-2">
                {item.vin}
              </td>

              <td className="border p-2">
                {item.status}
              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>
  )
}