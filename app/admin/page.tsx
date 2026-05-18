'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AdminPage() {

  const [installations, setInstallations] = useState<any[]>([])

  useEffect(() => {
    loadInstallations()
  }, [])

  const loadInstallations = async () => {

    const { data, error } = await supabase
      .from('installations')
      .select('*')
      .order('created_at', {
        ascending: false,
      })

    if (!error && data) {
      setInstallations(data)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-7xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-6">
          Eguard Warranty Dashboard
        </h1>

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="bg-black text-white">

                <th className="p-3 text-left">
                  Roll ID
                </th>

                <th className="p-3 text-left">
                  VIN
                </th>

                <th className="p-3 text-left">
                  Film Type
                </th>

                <th className="p-3 text-left">
                  Warranty
                </th>

                <th className="p-3 text-left">
                  Location
                </th>

                <th className="p-3 text-left">
                  Install Date
                </th>

              </tr>

            </thead>

            <tbody>

              {installations.map((item) => (

                <tr
                  key={item.id}
                  className="border-b"
                >

                  <td className="p-3">
                    {item.film_roll_id}
                  </td>

                  <td className="p-3">
                    {item.vin_number}
                  </td>

                  <td className="p-3">
                    {item.film_type}
                  </td>

                  <td className="p-3">
                    {item.warranty_years} Years
                  </td>

                  <td className="p-3">
                    {item.installation_location}
                  </td>

                  <td className="p-3">
                    {item.install_date}
                  </td>

                </tr>

              ))}

            </tbody>

          </table>

        </div>

      </div>

    </main>
  )
}