// app/admin/page.tsx

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [customerName, setCustomerName] =
    useState('')

  const [vin, setVin] = useState('')

  const [status, setStatus] =
    useState('Active')

  const addWarranty = async () => {

    const { error } = await supabase
      .from('warranties')
      .insert([
        {
          customer_name: customerName,
          vin,
          status,
        },
      ])

    if (error) {

      alert('Error adding warranty')

    } else {

      alert('Warranty added')

      setCustomerName('')
      setVin('')
    }
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-4">
        Admin Dashboard
      </h1>

      <input
        type="text"
        placeholder="Customer Name"
        value={customerName}
        onChange={(e) =>
          setCustomerName(e.target.value)
        }
        className="border p-2 block mb-4"
      />

      <input
        type="text"
        placeholder="VIN"
        value={vin}
        onChange={(e) =>
          setVin(e.target.value)
        }
        className="border p-2 block mb-4"
      />

      <select
        value={status}
        onChange={(e) =>
          setStatus(e.target.value)
        }
        className="border p-2 block mb-4"
      >

        <option>
          Active
        </option>

        <option>
          Expired
        </option>

      </select>

      <button
        onClick={addWarranty}
        className="bg-black text-white px-4 py-2"
      >
        Add Warranty
      </button>

    </div>
  )
}