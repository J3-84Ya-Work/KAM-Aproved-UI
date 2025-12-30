"use client"

import { useState, useEffect } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2 } from "lucide-react"
import { clientLogger } from "@/lib/logger"

interface Client {
  ClientID: number
  ClientName: string
  GSTNo?: string
  GST?: string
  [key: string]: any
}

interface ClientDropdownProps {
  value?: string
  onValueChange?: (value: string, clientData?: { clientId: number; clientName: string }) => void
  placeholder?: string
  disabled?: boolean
}

export function ClientDropdown({
  value,
  onValueChange,
  placeholder = "Select client",
  disabled = false
}: ClientDropdownProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchClients()
  }, [])

  const fetchClients = async () => {
    try {
      setLoading(true)
      setError(null)

      const { apiClient } = await import("@/lib/api-config")
      const data = await apiClient.get("api/planwindow/GetSbClient")

      // Map API fields to our interface
      if (Array.isArray(data)) {
        const mappedClients = data.map((item: any) => ({
          ClientID: item.LedgerId,
          ClientName: item.LedgerName,
          GSTNo: item.Currency || "",
          ...item
        }))
        setClients(mappedClients)
      } else {
        setClients([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch clients")
      clientLogger.error("Error fetching clients:", err)
      setClients([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50">
        <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
        <span className="text-sm text-gray-500">Loading customers...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-3 py-2 border border-red-300 rounded-lg bg-red-50 text-red-600 text-sm">
        Error: {error}
      </div>
    )
  }


  const handleValueChange = (selectedValue: string) => {
    const selectedClient = clients.find(c => c.ClientName === selectedValue)
    console.log('=== ClientDropdown: handleValueChange ===')
    console.log('selectedValue:', selectedValue)
    console.log('selectedClient:', selectedClient)
    console.log('ClientID from selectedClient:', selectedClient?.ClientID, 'type:', typeof selectedClient?.ClientID)
    if (selectedClient && onValueChange) {
      onValueChange(selectedValue, {
        clientId: selectedClient.ClientID,
        clientName: selectedClient.ClientName
      })
    } else if (onValueChange) {
      onValueChange(selectedValue)
    }
  }

  return (
    <Select value={value} onValueChange={handleValueChange} disabled={disabled}>
      <SelectTrigger className="h-10">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {!Array.isArray(clients) || clients.length === 0 ? (
          <div className="px-2 py-3 text-sm text-gray-500 text-center">
            No clients found
          </div>
        ) : (
          clients.map((client) => (
            <SelectItem
              key={client.ClientID}
              value={client.ClientName}
            >
              <div className="flex flex-col">
                <span className="font-medium">{client.ClientName}</span>
                {(client.GSTNo || client.GST) && (
                  <span className="text-xs text-gray-500">
                    GST: {client.GSTNo || client.GST}
                  </span>
                )}
              </div>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  )
}
