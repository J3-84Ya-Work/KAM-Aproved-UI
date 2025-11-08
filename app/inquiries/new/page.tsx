"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { NewInquiryForm } from '@/components/new-inquiry-form'
import { PrintingWizard } from '@/components/printing-wizard'
import { AppHeader } from '@/components/app-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Suspense } from 'react'

function NewInquiryContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const mode = searchParams.get('mode') || 'manual'

  const handleBack = () => {
    router.push('/inquiries')
  }

  const getPageName = () => {
    if (mode === 'ai') return 'AI Chat Inquiry'
    if (mode === 'manual') return 'Create New Inquiry'
    if (mode === 'dynamic') return 'Dynamic Fill Costing'
    return 'New Inquiry'
  }

  return (
    <SidebarProvider>
      <div className="hidden md:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader
          pageName={getPageName()}
          showBackButton={true}
          onBackClick={handleBack}
        />
        <div className="flex flex-1 flex-col gap-4 p-2 md:p-3">
          {mode === 'ai' && (
            <div className="max-w-4xl mx-auto w-full">
              <div className="bg-white rounded-lg border border-[#005180]/20 p-8">
                <p className="text-gray-600">AI Chat mode coming soon...</p>
                <p className="text-sm text-gray-500 mt-2">
                  This feature will allow you to create inquiries by chatting with an AI assistant.
                </p>
              </div>
            </div>
          )}

          {mode === 'manual' && (
            <div className="max-w-7xl mx-auto w-full">
              <NewInquiryForm />
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

export default function NewInquiryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewInquiryContent />
    </Suspense>
  )
}
