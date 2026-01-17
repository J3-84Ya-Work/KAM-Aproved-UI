"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { PrintingWizard } from '@/components/printing-wizard'
import { AICostingChat } from '@/components/ai-costing-chat'
import { AppHeader } from '@/components/app-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Suspense } from 'react'

function NewQuotationContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode') || 'dynamic'

  const handleBack = () => {
    router.push('/quotations')
  }

  const getPageName = () => {
    if (mode === 'ai') return 'Chat with Parkbuddy'
    if (mode === 'dynamic') return 'Dynamic Fill Costing'
    return 'New Quotation'
  }

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset className="overflow-hidden">
        <AppHeader
          pageName={getPageName()}
          showBackButton={true}
          onBackClick={handleBack}
        />
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-3 overflow-auto">
          {mode === 'ai' && (
            <div className="w-full h-full">
              <AICostingChat />
            </div>
          )}

          {mode === 'dynamic' && (
            <div className="w-full">
              <PrintingWizard />
            </div>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function NewQuotationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewQuotationContent />
    </Suspense>
  )
}
