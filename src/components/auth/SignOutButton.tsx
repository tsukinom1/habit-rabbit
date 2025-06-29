"use client"

import { signOut } from "next-auth/react"
import MyButton from "@/components/ui/MyButton"

export default function SignOutButton() {
  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" })
  }

  return (
    <MyButton
      onClick={handleSignOut}
      className='w-full'
    >
      Выйти
    </MyButton>
  )
} 