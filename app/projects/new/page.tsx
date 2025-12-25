"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { NewJDOForm } from '@/components/new-jdo-form'
import { NewSDOForm } from '@/components/new-sdo-form'

function NewProjectContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') || 'JDO'

  const handleBack = () => {
    router.push('/projects')
  }

  const getPageName = () => {
    switch (type) {
      case 'JDO':
        return 'New JDO Project'
      case 'Commercial':
        return 'New Commercial Project'
      case 'PN':
        return 'New PN Project'
      case 'SDO':
        return 'New SDO Project'
      default:
        return 'New Project'
    }
  }

  const handleFormClose = () => {
    router.push('/projects')
  }

  const handleFormSubmit = (data: any) => {
    console.log(`${type} Form submitted:`, data)
    router.push('/projects')
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <AppHeader
          pageName={getPageName()}
          showBackButton={true}
          onBackClick={handleBack}
        />
        <div className="flex flex-1 flex-col p-4 md:p-6 overflow-auto">
          <div className="w-full">
            {type === 'SDO' ? (
              <NewSDOForm
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
              />
            ) : (
              <NewJDOForm
                projectType={type as "JDO" | "Commercial" | "PN"}
                onClose={handleFormClose}
                onSubmit={handleFormSubmit}
              />
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default function NewProjectPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    }>
      <NewProjectContent />
    </Suspense>
  )
}
