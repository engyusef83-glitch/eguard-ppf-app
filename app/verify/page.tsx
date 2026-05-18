// app/verify/page.tsx

'use client'

export const dynamic = 'force-dynamic'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { QRCodeSVG } from 'qrcode.react'

function VerifyContent() {

  const searchParams = useSearchParams()

  const vin = searchParams.get('vin')

  const [data, setData] = useState<any>(null)

  useEffect(() => {

    const fetchWarranty = async () => {

      if (!vin) return

      const { data } = await supabase
        .from('warranties')
        .select('*')
        .eq('vin', vin)
        .single()

      setData(data)
    }

    fetchWarranty()

  }, [vin])

  if (!data) {

    return (
      <div className="p-10">
        Loading...
      </div>
    )
  }

  return (
    <div className="p-10">

      <h1 className="text-3xl font-bold mb-4">
        Warranty Verification
      </h1>

      <p>
        <strong>Customer:</strong>{' '}
        {data.customer_name}
      </p>

      <p>
        <strong>VIN:</strong>{' '}
        {data.vin}
      </p>

      <p>
        <strong>Status:</strong>{' '}
        {data.status}
      </p>

      <div className="mt-6">

        <QRCodeSVG
          value={`https://eguard-ppf-app.vercel.app/verify?vin=${data.vin}`}
          size={200}
        />

      </div>

    </div>
  )
}

export default function VerifyPage() {

  return (

    <Suspense
      fallback={
        <div className="p-10">
          Loading...
        </div>
      }
    >

      <VerifyContent />

    </Suspense>
  )
}