'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function LoginPage() {

  const router = useRouter()

  const [email, setEmail] =
    useState('')

  const [password, setPassword] =
    useState('')

  const login = async () => {

    const { error } =
      await supabase.auth.signInWithPassword({

        email,
        password,

      })

    if (error) {

      alert(error.message)

      return
    }

    router.push('/admin')
  }

  return (

    <div className="p-10 max-w-xl mx-auto">

      <h1 className="text-5xl font-bold mb-10">
        Admin Login
      </h1>

      <div className="space-y-4">

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          className="border p-4 w-full text-xl"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          className="border p-4 w-full text-xl"
        />

        <button
          onClick={login}
          className="bg-black text-white px-8 py-4 text-xl w-full"
        >
          Login
        </button>

      </div>

    </div>
  )
}