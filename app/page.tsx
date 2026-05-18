// app/page.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Home() {
  const [vin, setVin] = useState('')
  const [result, setResult] = useState('')

  const checkWarranty = async () => {
    const { data, error } = await supabase
      .from('warranties')
      .select('*')
      .eq('vin', vin)
      .single()

    if (error || !data) {
      setResult('Warranty not found')
    } else {
      setResult(`Warranty Active for ${data.customer_name}`)
    }
  }

  return (
    <div className="p-10">
      <h1 className="text-3xl font-bold mb-4">
        Eguard Warranty Check
      </h1>

      <input
        type="text"
        placeholder="Enter VIN"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
        className="border p-2 mr-2"
      />

      <button
        onClick={checkWarranty}
        className="bg-black text-white px-4 py-2"
      >
        Check
      </button>

      <p className="mt-4">{result}</p>
    </div>
  )
}