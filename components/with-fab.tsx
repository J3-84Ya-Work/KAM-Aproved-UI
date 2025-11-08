"use client"

import { FloatingNewInquiryButton } from "@/components/floating-new-inquiry-button"

export function WithFAB({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <FloatingNewInquiryButton />
    </>
  )
}
