'use client'

import { Html5QrcodeScanner } from 'html5-qrcode'
import { useEffect } from 'react'

interface Props {
  onScanSuccess: (decodedText: string) => void
}

export default function BarcodeScanner({
  onScanSuccess,
}: Props) {

  useEffect(() => {

    const scanner = new Html5QrcodeScanner(
      'reader',
      {
        fps: 10,
        qrbox: 250,
      },
      false
    )

    scanner.render(
      (decodedText) => {

        onScanSuccess(decodedText)

        scanner.clear()
      },

      (error) => {
        console.log(error)
      }
    )

    return () => {
      scanner.clear().catch(() => {})
    }

  }, [])

  return (
    <div
      id="reader"
      className="w-full"
    />
  )
}