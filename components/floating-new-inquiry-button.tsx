"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Bot, FileEdit, Sparkles, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function FloatingNewInquiryButton() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleOptionClick = (mode: string) => {
    setIsOpen(false)
    router.push(`/inquiries/new?mode=${mode}`)
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Option Buttons - Show when open */}
      {isOpen && (
        <div className="flex flex-col gap-3 mb-3 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <Button
            onClick={() => handleOptionClick('ai')}
            className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200 h-12 px-4 rounded-full flex items-center gap-3"
          >
            <Bot className="h-5 w-5 text-purple-600" />
            <span className="font-medium">AI Chat</span>
          </Button>

          <Button
            onClick={() => handleOptionClick('manual')}
            className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200 h-12 px-4 rounded-full flex items-center gap-3"
          >
            <FileEdit className="h-5 w-5 text-blue-600" />
            <span className="font-medium">Manual Form</span>
          </Button>

          <Button
            onClick={() => handleOptionClick('dynamic')}
            className="bg-white hover:bg-gray-50 text-gray-700 shadow-lg border border-gray-200 h-12 px-4 rounded-full flex items-center gap-3"
          >
            <Sparkles className="h-5 w-5 text-amber-600" />
            <span className="font-medium">Dynamic Fill</span>
          </Button>
        </div>
      )}

      {/* Main FAB Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className={`h-16 w-16 rounded-full shadow-2xl transition-all duration-200 ${
          isOpen
            ? "bg-red-500 hover:bg-red-600 rotate-45"
            : "bg-[#78BE20] hover:bg-[#6BA81B]"
        }`}
        title="New Enquiry"
      >
        <Plus className="h-8 w-8 text-white" />
      </Button>
    </div>
  )
}
