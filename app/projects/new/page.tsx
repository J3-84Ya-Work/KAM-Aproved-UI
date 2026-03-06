"use client"

import { useSearchParams, useRouter } from 'next/navigation'
import { Suspense, useState } from 'react'
import { AppSidebar } from '@/components/app-sidebar'
import { AppHeader } from '@/components/app-header'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { NewJDOForm } from '@/components/new-jdo-form'
import { NewSDOForm } from '@/components/new-sdo-form'
import { NewJDOFormV2 } from '@/components/new-jdo-form-v2'
import { NewSDOFormV2 } from '@/components/new-sdo-form-v2'

function NewProjectContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const type = searchParams.get('type') || 'JDO'
  const [useNewVersion, setUseNewVersion] = useState(true)

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

  const renderForm = () => {
    if (type === 'SDO') {
      return useNewVersion ? (
        <NewSDOFormV2 onClose={handleFormClose} onSubmit={handleFormSubmit} />
      ) : (
        <NewSDOForm onClose={handleFormClose} onSubmit={handleFormSubmit} />
      )
    }
    return useNewVersion ? (
      <NewJDOFormV2 projectType={type as "JDO" | "Commercial" | "PN"} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    ) : (
      <NewJDOForm projectType={type as "JDO" | "Commercial" | "PN"} onClose={handleFormClose} onSubmit={handleFormSubmit} />
    )
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
          {/* New / Old Toggle */}
          <div className="flex items-center justify-end mb-3 gap-2">
            <span className="text-xs text-gray-500 mr-1">Form Version:</span>
            <div className="inline-flex rounded-lg border border-gray-200 bg-gray-100 p-0.5">
              <button
                type="button"
                onClick={() => setUseNewVersion(false)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  !useNewVersion
                    ? 'bg-white text-[#005180] shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Old
              </button>
              <button
                type="button"
                onClick={() => setUseNewVersion(true)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  useNewVersion
                    ? 'bg-[#005180] text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                New
              </button>
            </div>
          </div>

          <div className="w-full">
            {renderForm()}
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
