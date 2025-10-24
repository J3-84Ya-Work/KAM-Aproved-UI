"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ReportsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to dashboard page
    router.replace("/dashboard")
  }, [router])

  return null
}
