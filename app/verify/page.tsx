'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '../lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

export default function VerifyPage() {

  const searchParams = useSearchParams()

  const [search, setSearch] = useState('')
  const [result, setResult] = useState<any>(null)

  useEffect(() => {

    const query = searchParams.get('search')

    if (query) {

      setSearch(query)

      autoSearch(query)
    }

  }, [])

  const autoSearch = async (value: string) => {

    const { data } = await supabase
      .from('installations')
      .select('*')
      .or(
        `film_roll_id.eq.${value},vin_number.eq.${value}`
      )
      .single()

    if (data) {
      setResult(data)
    }
  }

  const handleSearch = async () => {

    if (!search) {
      alert('Please enter Roll ID or VIN')
      return
    }

    const { data, error } = await supabase
      .from('installations')
      .select('*')
      .or(
        `film_roll_id.eq.${search},vin_number.eq.${search}`
      )
      .single()

    if (error || !data) {

      setResult(null)

      alert('Warranty Not Found')

    } else {

      setResult(data)
    }
  }

  return (
    <main className="min-h-screen bg-gray-100 p-8">

      <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold mb-6 text-center">
          Verify Warranty
        </h1>

        <div className="space-y-4">

          <input
            type="text"
            placeholder="Enter Roll ID or VIN"
            className="w-full border p-3 rounded-lg"
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
          />

          <button
            onClick={handleSearch}
            className="w-full bg-black text-white p-3 rounded-lg"
          >
            VERIFY WARRANTY
          </button>

        </div>

        {result && (

          <div className="mt-8 border rounded-xl p-6 bg-gray-50">

            <h2 className="text-2xl font-bold mb-4 text-green-600">
              Warranty Verified
            </h2>

            <div className="space-y-2">

              <p>
                <strong>Roll ID:</strong>{' '}
                {result.film_roll_id}
              </p>

              <p>
                <strong>VIN:</strong>{' '}
                {result.vin_number}
              </p>

              <p>
                <strong>Film Type:</strong>{' '}
                {result.film_type}
              </p>

              <p>
                <strong>Warranty:</strong>{' '}
                {result.warranty_years} Years
              </p>

              <p>
                <strong>Location:</strong>{' '}
                {result.installation_location}
              </p>

              <p>
                <strong>Installation Date:</strong>{' '}
                {result.install_date}
              </p>

            </div>

            <div className="mt-6 flex justify-center">

              <QRCodeSVG
                value={
                  window.location.origin +
                  '/verify?search=' +
                  result.film_roll_id
                }
                size={180}
              />

            </div>

          </div>

        )}

      </div>

    </main>
  )
}