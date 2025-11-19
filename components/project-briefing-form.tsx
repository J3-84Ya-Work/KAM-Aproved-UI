"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent } from "@/components/ui/card"

interface ProjectBriefingFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: ProjectBriefingData) => void
  docNumber?: string
  projectType?: "JDO" | "Commercial" | "SDO" | "PN" | null
}

export interface ProjectBriefingData {
  // Header Information
  productionPlant: string
  prepressPlant: string
  customerName: string
  brandName: string
  cartonStyle: string
  pktRead: string
  previousMaterialId: string
  costSheetReference: string
  punchReference: string
  shadeReference: string

  // Carton Specification
  gsm: string
  boardType: string
  mill: string
  boardBrand: string
  boardNominated: boolean
  boardToBoardNominated: boolean
  boardToBoardLamination: string
  flutingType: string
  kraftPaperDetails: string
  kraftLinerDetails: string

  // Pre-Printing Requirements
  prePrintingValue: string

  // Post-Printing Requirements
  frontSideVarnish: string
  backSideVarnish: string
  postPrintingLamination: string
  gravurePrinting: string
  hotFoilStamping: string
  coldFoil: string
  embossing: string
  windowPasting: string

  // Liner Pasting
  linerPasting: string

  // Screen Printing
  screenPrinting: string

  // Special Components
  specialComponent: string
  variableDataPrinting: string
  cartonPasting: string
  securityFeatures: string
  specialInstructions: string
}

export function ProjectBriefingForm({ open, onOpenChange, onSubmit, docNumber, projectType }: ProjectBriefingFormProps) {
  const [formData, setFormData] = useState<ProjectBriefingData>({
    productionPlant: "1100 - DAMAN",
    prepressPlant: "Prepress Plant 1100 - DAMAN",
    customerName: "",
    brandName: "",
    cartonStyle: "",
    pktRead: "",
    previousMaterialId: "",
    costSheetReference: "",
    punchReference: "",
    shadeReference: "",
    gsm: "",
    boardType: "",
    mill: "",
    boardBrand: "",
    boardNominated: false,
    boardToBoardNominated: false,
    boardToBoardLamination: "N/A",
    flutingType: "PLY",
    kraftPaperDetails: "",
    kraftLinerDetails: "",
    prePrintingValue: "",
    frontSideVarnish: "NO",
    backSideVarnish: "NO",
    postPrintingLamination: "",
    gravurePrinting: "",
    hotFoilStamping: "",
    coldFoil: "",
    embossing: "",
    windowPasting: "",
    linerPasting: "",
    screenPrinting: "",
    specialComponent: "",
    variableDataPrinting: "",
    cartonPasting: "",
    securityFeatures: "",
    specialInstructions: "",
  })

  const handleSubmit = () => {
    onSubmit(formData)
    onOpenChange(false)
  }

  const updateField = (field: keyof ProjectBriefingData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 bg-gradient-to-r from-[#005180] to-[#0066a1]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white p-2 rounded">
                <svg className="h-8 w-8 text-[#005180]" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zM9 17H7v-7h2v7zm4 0h-2V7h2v10zm4 0h-2v-4h2v4z"/>
                </svg>
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white">
                  {projectType ? `NEW ${projectType.toUpperCase()}` : 'PROJECT BRIEFING'}
                </DialogTitle>
                <p className="text-sm text-white/80 mt-1">Project Briefing Form</p>
              </div>
            </div>
            <div className="bg-white/20 px-4 py-2 rounded border border-white/30">
              <div className="text-xs text-white/80">DOC NO:</div>
              <div className="text-sm font-bold text-white">{docNumber || 'FDMKT-15'}</div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="h-[calc(90vh-180px)]">
          <div className="px-6 py-4 space-y-6">
            {/* Header Information */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Production Plant</Label>
                    <Input
                      value={formData.productionPlant}
                      onChange={(e) => updateField('productionPlant', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Prepress Plant</Label>
                    <Input
                      value={formData.prepressPlant}
                      onChange={(e) => updateField('prepressPlant', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Customer Name <span className="text-red-500">*</span></Label>
                    <Input
                      value={formData.customerName}
                      onChange={(e) => updateField('customerName', e.target.value)}
                      placeholder="Enter customer name"
                    />
                  </div>
                  <div>
                    <Label>Brand Name</Label>
                    <Input
                      value={formData.brandName}
                      onChange={(e) => updateField('brandName', e.target.value)}
                      placeholder="Enter brand name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Carton Style</Label>
                    <Input
                      value={formData.cartonStyle}
                      onChange={(e) => updateField('cartonStyle', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>PKT Read? (Yes/No / Details)</Label>
                    <Input
                      value={formData.pktRead}
                      onChange={(e) => updateField('pktRead', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Previous Material ID</Label>
                    <Input
                      value={formData.previousMaterialId}
                      onChange={(e) => updateField('previousMaterialId', e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label>Cost Sheet Reference No</Label>
                    <Input
                      value={formData.costSheetReference}
                      onChange={(e) => updateField('costSheetReference', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Punch Reference</Label>
                    <Input
                      value={formData.punchReference}
                      onChange={(e) => updateField('punchReference', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Shade Reference</Label>
                    <Input
                      value={formData.shadeReference}
                      onChange={(e) => updateField('shadeReference', e.target.value)}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator />

            {/* Carton Specification */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#005180] bg-yellow-100 px-3 py-2 rounded">
                CARTON SPECIFICATION
              </h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label>GSM</Label>
                      <Input
                        value={formData.gsm}
                        onChange={(e) => updateField('gsm', e.target.value)}
                        placeholder="e.g., 300"
                      />
                    </div>
                    <div>
                      <Label>Board Type</Label>
                      <Select value={formData.boardType} onValueChange={(val) => updateField('boardType', val)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="N/A">N/A</SelectItem>
                          <SelectItem value="FBB">FBB</SelectItem>
                          <SelectItem value="SBS">SBS</SelectItem>
                          <SelectItem value="Kraft">Kraft</SelectItem>
                          <SelectItem value="Corrugated">Corrugated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Mill</Label>
                      <Input
                        value={formData.mill}
                        onChange={(e) => updateField('mill', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Board Brand</Label>
                      <Input
                        value={formData.boardBrand}
                        onChange={(e) => updateField('boardBrand', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Board Nominated?</Label>
                      <Select
                        value={formData.boardNominated ? "Yes" : "No"}
                        onValueChange={(val) => updateField('boardNominated', val === "Yes")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Board to Board Nominated?</Label>
                      <Select
                        value={formData.boardToBoardNominated ? "Yes" : "No"}
                        onValueChange={(val) => updateField('boardToBoardNominated', val === "Yes")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Yes">Yes</SelectItem>
                          <SelectItem value="No">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Board to Board Lamination</Label>
                      <Input
                        value={formData.boardToBoardLamination}
                        onChange={(e) => updateField('boardToBoardLamination', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Fluting Type</Label>
                      <Select value={formData.flutingType} onValueChange={(val) => updateField('flutingType', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="PLY">PLY</SelectItem>
                          <SelectItem value="A">A Flute</SelectItem>
                          <SelectItem value="B">B Flute</SelectItem>
                          <SelectItem value="C">C Flute</SelectItem>
                          <SelectItem value="E">E Flute</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Kraft Paper (Fluting Details)</Label>
                      <Input
                        value={formData.kraftPaperDetails}
                        onChange={(e) => updateField('kraftPaperDetails', e.target.value)}
                        placeholder="GSM / BF or BF"
                      />
                    </div>
                    <div>
                      <Label>Kraft Liner Details</Label>
                      <Input
                        value={formData.kraftLinerDetails}
                        onChange={(e) => updateField('kraftLinerDetails', e.target.value)}
                        placeholder="GSM / BF or BF"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Pre-Printing Requirements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#005180] bg-yellow-100 px-3 py-2 rounded">
                PRE-PRINTING / LITHO/ROTO REQUIREMENTS
              </h3>
              <Card>
                <CardContent className="pt-6">
                  <div>
                    <Label>Pre-Printing Value Add (Selection / Process / Details)</Label>
                    <Textarea
                      value={formData.prePrintingValue}
                      onChange={(e) => updateField('prePrintingValue', e.target.value)}
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Separator />

            {/* Post-Printing Requirements */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#005180] bg-yellow-100 px-3 py-2 rounded">
                POST-PRINTING REQUIREMENTS
              </h3>
              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Front Side Varnish (Selections)</Label>
                      <Select value={formData.frontSideVarnish} onValueChange={(val) => updateField('frontSideVarnish', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NO">NO</SelectItem>
                          <SelectItem value="UV">UV Varnish</SelectItem>
                          <SelectItem value="Aqueous">Aqueous Varnish</SelectItem>
                          <SelectItem value="Spot UV">Spot UV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Back Side Varnish (Selections)</Label>
                      <Select value={formData.backSideVarnish} onValueChange={(val) => updateField('backSideVarnish', val)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NO">NO</SelectItem>
                          <SelectItem value="UV">UV Varnish</SelectItem>
                          <SelectItem value="Aqueous">Aqueous Varnish</SelectItem>
                          <SelectItem value="Spot UV">Spot UV</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Post Printing Lamination (Film Type / Finish / Front / Microns)</Label>
                      <Input
                        value={formData.postPrintingLamination}
                        onChange={(e) => updateField('postPrintingLamination', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Gravure Printing (Yes/No / Details, If Any)</Label>
                      <Input
                        value={formData.gravurePrinting}
                        onChange={(e) => updateField('gravurePrinting', e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Hot Foil Stamping (Yes/No / Details)</Label>
                      <Input
                        value={formData.hotFoilStamping}
                        onChange={(e) => updateField('hotFoilStamping', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Cold Foil (Yes/No / Details)</Label>
                      <Input
                        value={formData.coldFoil}
                        onChange={(e) => updateField('coldFoil', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label>Embossing (Selections)</Label>
                      <Input
                        value={formData.embossing}
                        onChange={(e) => updateField('embossing', e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <Label>Window Pasting (Film Type / Microns)</Label>
                    <Input
                      value={formData.windowPasting}
                      onChange={(e) => updateField('windowPasting', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Additional Sections */}
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <Label>Liner Pasting (Yes/No / Details)</Label>
                  <Input
                    value={formData.linerPasting}
                    onChange={(e) => updateField('linerPasting', e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Label>Screen Printing (Selection / Details If Any)</Label>
                  <Input
                    value={formData.screenPrinting}
                    onChange={(e) => updateField('screenPrinting', e.target.value)}
                  />
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 space-y-4">
                  <div>
                    <Label>Special Component</Label>
                    <Input
                      value={formData.specialComponent}
                      onChange={(e) => updateField('specialComponent', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Variable Data Printing (Selection / Details If Any)</Label>
                    <Input
                      value={formData.variableDataPrinting}
                      onChange={(e) => updateField('variableDataPrinting', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Carton Pasting (Selection / Details If Any)</Label>
                    <Input
                      value={formData.cartonPasting}
                      onChange={(e) => updateField('cartonPasting', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Security Features (Selection / Details If Any)</Label>
                    <Input
                      value={formData.securityFeatures}
                      onChange={(e) => updateField('securityFeatures', e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <Label>Special Instructions</Label>
                  <Textarea
                    value={formData.specialInstructions}
                    onChange={(e) => updateField('specialInstructions', e.target.value)}
                    rows={3}
                    placeholder="Any special instructions or notes..."
                  />
                </CardContent>
              </Card>
            </div>
          </div>
        </ScrollArea>

        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} className="bg-[#005180] hover:bg-[#004060]">
            Save & Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
