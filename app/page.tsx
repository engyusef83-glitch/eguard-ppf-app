'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {

  const [vin, setVin] = useState('')

  const [result, setResult] =
    useState<any>(null)

  const [notFound, setNotFound] =
    useState(false)

  const checkWarranty = async () => {

    setNotFound(false)

    setResult(null)

    const { data } = await supabase
      .from('warranties')
      .select('*')
      .eq('vin', vin)
      .maybeSingle()

    if (!data) {

      setNotFound(true)

      return
    }

    setResult(data)
  }

  return (

    <div className="p-10">

      <h1 className="text-5xl font-bold mb-10">
        Eguard Warranty Check
      </h1>

      <div className="flex gap-4 mb-10">

        <input
          type="text"
          placeholder="Enter VIN"
          value={vin}
          onChange={(e) =>
            setVin(e.target.value)
          }
          className="border p-4 text-2xl"
        />

        <button
          onClick={checkWarranty}
          className="bg-black text-white px-10 text-2xl"
        >
          Check
        </button>

      </div>

      {notFound && (

        <p className="text-2xl text-red-500">
          Warranty not found
        </p>

      )}

      {result && (

        <div className="border p-8 rounded-xl text-2xl space-y-4">

          <p>
            <strong>Customer:</strong>
            {' '}
            {result.customer_name}
          </p>

          <p>
            <strong>VIN:</strong>
            {' '}
            {result.vin}
          </p>

          <p>
            <strong>Product:</strong>
            {' '}
            {result.product_name}
          </p>

          <p>
            <strong>Warranty:</strong>
            {' '}
            {result.duration_years}
            {' '}
            Years
          </p>

          <p>
            <strong>Start Date:</strong>
            {' '}
            {result.start_date}
          </p>

          <p>
            <strong>End Date:</strong>
            {' '}
            {result.end_date}
          </p>

          <p>
            <strong>Status:</strong>
            {' '}
            {result.status}
          </p>

        </div>

      )}

    </div>
  )
}