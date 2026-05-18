'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {

  const [customerName, setCustomerName] =
    useState('')

  const [vin, setVin] =
    useState('')

  const [durationYears, setDurationYears] =
    useState(5)

  const [warranties, setWarranties] =
    useState<any[]>([])

  const fetchWarranties = async () => {

    const { data } = await supabase
      .from('warranties')
      .select('*')
      .order('start_date', {
        ascending: false,
      })

    if (data) {

      const updated = data.map((item) => {

        const today =
          new Date()

        const end =
          new Date(item.end_date)

        return {
          ...item,
          status:
            end < today
              ? 'Expired'
              : 'Active',
        }
      })

      setWarranties(updated)
    }
  }

  useEffect(() => {
    fetchWarranties()
  }, [])

  const addWarranty = async () => {

    if (!customerName || !vin) return

    const startDate =
      new Date()

    const endDate =
      new Date()

    endDate.setFullYear(
      startDate.getFullYear() +
      durationYears
    )

    await supabase
      .from('warranties')
      .insert([
        {
          customer_name:
            customerName,

          vin: vin,

          duration_years:
            durationYears,

          start_date:
            startDate
              .toISOString()
              .split('T')[0],

          end_date:
            endDate
              .toISOString()
              .split('T')[0],

          status:
            'Active',
        },
      ])

    setCustomerName('')
    setVin('')
    setDurationYears(5)

    fetchWarranties()
  }

  const deleteWarranty =
    async (id: string) => {

      await supabase
        .from('warranties')
        .delete()
        .eq('id', id)

      fetchWarranties()
    }

  return (

    <div className="p-10">

      <h1 className="text-5xl font-bold mb-10">
        Admin Dashboard
      </h1>

      <div className="space-y-4 max-w-xl mb-10">

        <input
          type="text"
          placeholder="Customer Name"
          value={customerName}
          onChange={(e) =>
            setCustomerName(
              e.target.value
            )
          }
          className="border p-4 w-full text-xl"
        />

        <input
          type="text"
          placeholder="VIN"
          value={vin}
          onChange={(e) =>
            setVin(
              e.target.value
            )
          }
          className="border p-4 w-full text-xl"
        />

        <select
          value={durationYears}
          onChange={(e) =>
            setDurationYears(
              Number(
                e.target.value
              )
            )
          }
          className="border p-4 w-full text-xl"
        >

          <option value={3}>
            3 Years
          </option>

          <option value={5}>
            5 Years
          </option>

          <option value={7}>
            7 Years
          </option>

          <option value={10}>
            10 Years
          </option>

        </select>

        <button
          onClick={addWarranty}
          className="bg-black text-white px-8 py-4 text-xl"
        >
          Add Warranty
        </button>

      </div>

      <div className="space-y-4">

        {warranties.map((item) => (

          <div
            key={item.id}
            className="border p-6 rounded-xl"
          >

            <p className="text-2xl font-bold">
              {item.customer_name}
            </p>

            <p>
              VIN:
              {' '}
              {item.vin}
            </p>

            <p>
              Warranty:
              {' '}
              {item.duration_years}
              {' '}
              Years
            </p>

            <p>
              Start Date:
              {' '}
              {item.start_date}
            </p>

            <p>
              End Date:
              {' '}
              {item.end_date}
            </p>

            <p>
              Status:
              {' '}
              <strong>
                {item.status}
              </strong>
            </p>

            <button
              onClick={() =>
                deleteWarranty(
                  item.id
                )
              }
              className="bg-red-500 text-white px-4 py-2 mt-4"
            >
              Delete
            </button>

          </div>
        ))}

      </div>

    </div>
  )
}