import { useEffect, useRef, useState, useCallback } from 'react'
import { saveDraft } from '@/lib/drafts-api'

export type FormType = 'DynamicFill' | 'ManualForm'
export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface AutoSaveOptions {
  formData: any
  formType: FormType
  draftName?: string
  enabled?: boolean
  debounceMs?: number
  initialDraftId?: number | null  // Initial draft ID when loading an existing draft
  onSaveSuccess?: (draftId: number) => void
  onSaveError?: (error: string) => void
}

interface AutoSaveReturn {
  saveStatus: SaveStatus
  lastSaved: Date | null
  currentDraftId: number | null
  forceSave: () => Promise<void>
}

/**
 * Auto-save hook for draft forms
 * Automatically saves form data when user pauses typing
 *
 * @param options - Configuration options for auto-save
 * @returns Save status, last saved time, and force save function
 */
export function useAutoSaveDraft({
  formData,
  formType,
  draftName,
  enabled = true,
  debounceMs = 2500, // 2.5 seconds default
  initialDraftId = null,
  onSaveSuccess,
  onSaveError,
}: AutoSaveOptions): AutoSaveReturn {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [currentDraftId, setCurrentDraftId] = useState<number | null>(initialDraftId)

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)
  const previousDataRef = useRef<string>('')
  const isMountedRef = useRef(true)

  // Generate default draft name based on form type and timestamp
  const generateDraftName = useCallback(() => {
    if (draftName) return draftName
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    return `${formType}_Draft_${timestamp}`
  }, [draftName, formType])

  // Save function
  const performSave = useCallback(async () => {
    if (!enabled || !formData) {
      return
    }

    // Convert form data to string for comparison
    const currentDataString = JSON.stringify(formData)

    // Skip if data hasn't changed
    if (currentDataString === previousDataRef.current) {
      return
    }

    try {
      setSaveStatus('saving')

      const payload = {
        UserID: process.env.NEXT_PUBLIC_USER_ID || '2',
        CompanyID: process.env.NEXT_PUBLIC_COMPANY_ID || '2',
        Module: 'Quotation',
        DraftName: generateDraftName(),
        DraftData: {
          ...formData,
          FormType: formType, // Add form type to draft data
        },
        IsAutoSave: true,
        RetentionDays: 30,
        ...(currentDraftId && { DraftID: currentDraftId }), // Include draft ID for updates
      }

      console.log('[Auto-Save] Saving draft:', payload)

      const response = await saveDraft(payload)

      if (isMountedRef.current) {
        // Extract draft ID from response
        const draftId = response?.DraftID || response?.data?.DraftID || currentDraftId

        if (draftId && !currentDraftId) {
          setCurrentDraftId(draftId)
        }

        setSaveStatus('saved')
        setLastSaved(new Date())
        previousDataRef.current = currentDataString

        console.log('[Auto-Save] Draft saved successfully:', draftId)

        if (onSaveSuccess && draftId) {
          onSaveSuccess(draftId)
        }

        // Reset to idle after 2 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle')
          }
        }, 2000)
      }
    } catch (error) {
      console.error('[Auto-Save] Error saving draft:', error)

      if (isMountedRef.current) {
        setSaveStatus('error')
        const errorMessage = error instanceof Error ? error.message : 'Failed to save draft'

        if (onSaveError) {
          onSaveError(errorMessage)
        }

        // Reset to idle after 3 seconds
        setTimeout(() => {
          if (isMountedRef.current) {
            setSaveStatus('idle')
          }
        }, 3000)
      }
    }
  }, [enabled, formData, formType, generateDraftName, currentDraftId, onSaveSuccess, onSaveError])

  // Force save (for manual triggers)
  const forceSave = useCallback(async () => {
    // Clear any pending debounced save
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
      debounceTimerRef.current = null
    }
    await performSave()
  }, [performSave])

  // Auto-save effect with debounce
  useEffect(() => {
    if (!enabled || !formData) {
      return
    }

    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }

    // Set new timer
    debounceTimerRef.current = setTimeout(() => {
      performSave()
    }, debounceMs)

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [formData, enabled, debounceMs, performSave])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  return {
    saveStatus,
    lastSaved,
    currentDraftId,
    forceSave,
  }
}
