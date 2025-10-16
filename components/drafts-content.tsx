"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search } from "lucide-react"
import { Badge } from "@/components/ui/badge"

type DraftRecord = {
  inquiryNo: string
  jobType: string
  inputType: "Chat" | "Manual Form"
  updatedAt: string
  owner: string
}

const draftRecords: DraftRecord[] = [
  {
    inquiryNo: "INQ-2024-021",
    jobType: "Monocarton",
    inputType: "Chat",
    updatedAt: "2024-01-16 14:30",
    owner: "Acme Corp",
  },
  {
    inquiryNo: "INQ-2024-024",
    jobType: "Fluted Box",
    inputType: "Manual Form",
    updatedAt: "2024-01-16 10:05",
    owner: "Metro Supplies",
  },
  {
    inquiryNo: "INQ-2024-027",
    jobType: "Rigid Box",
    inputType: "Chat",
    updatedAt: "2024-01-15 19:45",
    owner: "Prime Packaging",
  },
  {
    inquiryNo: "INQ-2024-029",
    jobType: "Gable Top",
    inputType: "Manual Form",
    updatedAt: "2024-01-15 18:12",
    owner: "Vista Retail",
  },
  {
    inquiryNo: "INQ-2024-031",
    jobType: "Paper Pod",
    inputType: "Chat",
    updatedAt: "2024-01-15 09:20",
    owner: "Evergreen Foods",
  },
  {
    inquiryNo: "INQ-2024-033",
    jobType: "Burgo Pack",
    inputType: "Manual Form",
    updatedAt: "2024-01-14 22:05",
    owner: "Global Traders",
  },
  {
    inquiryNo: "INQ-2024-034",
    jobType: "Speciality Pack",
    inputType: "Chat",
    updatedAt: "2024-01-14 17:40",
    owner: "Swift Logistics",
  },
]

const inputTypeStyles: Record<DraftRecord["inputType"], string> = {
  Chat: "bg-blue-10 text-blue border-blue-40",
  "Manual Form": "bg-burgundy-10 text-burgundy border-burgundy-40",
}

export function DraftsContent() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredDrafts = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return draftRecords
    return draftRecords.filter((record) => {
      return (
        record.inquiryNo.toLowerCase().includes(query) ||
        record.jobType.toLowerCase().includes(query) ||
        record.inputType.toLowerCase().includes(query) ||
        record.owner.toLowerCase().includes(query)
      )
    })
  }, [searchQuery])

  return (
    <div className="space-y-4">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search by inquiry no., job type, input type, customer..."
          className="pl-9"
        />
      </div>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-[#005180]/10 to-transparent">
          <div className="flex items-center justify-between gap-2">
            <CardTitle className="text-lg font-bold text-foreground">Draft Inquiries</CardTitle>
            <Badge variant="outline" className="border-blue-40 text-blue bg-blue-10">
              {filteredDrafts.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#005180]">
              <TableRow className="[&_th]:text-white [&_th]:font-semibold">
                <TableHead className="w-[180px]">Inquiry No.</TableHead>
                <TableHead className="w-[200px]">Customer</TableHead>
                <TableHead className="w-[180px]">Job Type</TableHead>
                <TableHead className="w-[160px]">Input Type</TableHead>
                <TableHead className="w-[180px]">Last Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDrafts.map((draft) => (
                <TableRow key={draft.inquiryNo} className="hover:bg-blue-5 transition-colors">
                  <TableCell className="font-semibold text-blue">{draft.inquiryNo}</TableCell>
                  <TableCell>{draft.owner}</TableCell>
                  <TableCell className="uppercase tracking-wide text-sm font-semibold text-muted-foreground">
                    {draft.jobType}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`${inputTypeStyles[draft.inputType]} text-xs font-semibold uppercase`}>
                      {draft.inputType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm font-medium">{draft.updatedAt}</span>
                  </TableCell>
                </TableRow>
              ))}
              {filteredDrafts.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                    No draft inquiries match your search.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
