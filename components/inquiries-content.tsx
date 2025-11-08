
"use client"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, SlidersHorizontal, Filter, Clock, Mic, CalendarIcon, Pencil } from "lucide-react"
import { useVoiceInput } from "@/hooks/use-voice-input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { TruncatedText } from "@/components/truncated-text"
import { getViewableKAMs, isHOD } from "@/lib/permissions"
import { EnquiryAPI, type EnquiryItem, formatDateForAPI, formatDateForDisplay } from "@/lib/api/enquiry"
import { NewInquiryForm } from "@/components/new-inquiry-form"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

// REMOVED: Static data - using only API data now
/*
const staticInquiries = [
  { id: "INQ-2024-001", customer: "Tata Industries", job: "Custom Packaging Box", sku: "PKG-001", jobType: "Monocarton", quantityRange: "5000-10000", status: "Costing", priority: "high", date: "2024-01-15", dueDate: "2024-01-18", clarificationStatus: "Pending Clarification", notes: "Urgent requirement for Q1 launch", kamName: "Rajesh Kumar", hodName: "Suresh Menon" },
  { id: "INQ-2024-002", customer: "Reliance Retail", job: "Printed Labels", sku: "LBL-045", jobType: "Fluted Box", quantityRange: "10000-15000", status: "Quoted", priority: "medium", date: "2024-01-14", dueDate: "2024-01-20", clarificationStatus: "Clarified", notes: "Repeat order with minor modifications", kamName: "Priya Sharma", hodName: "Kavita Reddy" },
  { id: "INQ-2024-003", customer: "Mahindra Logistics", job: "Corrugated Sheets", sku: "COR-023", jobType: "Rigid Box", quantityRange: "2000-5000", status: "Pending", priority: "low", date: "2024-01-13", dueDate: "2024-01-25", clarificationStatus: "Awaiting Customer", notes: "New customer inquiry", kamName: "Amit Patel", hodName: "Suresh Menon" },
  { id: "INQ-2024-004", customer: "Wipro Technologies", job: "Folding Cartons", sku: "FLD-012", jobType: "Gable Top", quantityRange: "8000-12000", status: "Approved", priority: "high", date: "2024-01-12", dueDate: "2024-01-17", clarificationStatus: "Not Required", notes: "Ready for quotation", kamName: "Rajesh Kumar", hodName: "Suresh Menon" },
  { id: "INQ-2024-005", customer: "Infosys Ltd", job: "Die-Cut Boxes", sku: "DCB-089", jobType: "Paper Pod", quantityRange: "3000-6000", status: "Pending", priority: "medium", date: "2024-01-11", dueDate: "2024-01-22", clarificationStatus: "Pending Clarification", notes: "Awaiting customer specifications", kamName: "Sneha Gupta", hodName: "Kavita Reddy" },
  { id: "INQ-2024-006", customer: "Aditya Birla Group", job: "Luxury Gift Hampers", sku: "LGH-034", jobType: "Burgo Pack", quantityRange: "1500-3000", status: "Costing", priority: "medium", date: "2024-01-10", dueDate: "2024-01-19", clarificationStatus: "Awaiting Customer", notes: "Need final artwork approval", kamName: "Priya Sharma", hodName: "Kavita Reddy" },
  { id: "INQ-2024-007", customer: "Asian Paints Ltd", job: "Premium Tea Boxes", sku: "PTB-210", jobType: "Speciality Pack", quantityRange: "4000-7000", status: "Quoted", priority: "high", date: "2024-01-09", dueDate: "2024-01-21", clarificationStatus: "Clarified", notes: "All specs confirmed, awaiting PO", kamName: "Amit Patel", hodName: "Suresh Menon" },
  { id: "INQ-2024-008", customer: "Godrej Industries", job: "Pharmaceutical Cartons", sku: "PHC-156", jobType: "Monocarton", quantityRange: "12000-18000", status: "Costing", priority: "high", date: "2024-01-08", dueDate: "2024-01-15", clarificationStatus: "Clarified", notes: "Priority pharma packaging order", kamName: "Sneha Gupta", hodName: "Kavita Reddy" },
  { id: "INQ-2024-009", customer: "Larsen & Toubro", job: "Industrial Labels", sku: "IND-089", jobType: "Paper Pod", quantityRange: "8000-10000", status: "Approved", priority: "medium", date: "2024-01-07", dueDate: "2024-01-19", clarificationStatus: "Not Required", notes: "Standard industrial labeling", kamName: "Rajesh Kumar", hodName: "Suresh Menon" },
  { id: "INQ-2024-010", customer: "Bajaj Auto", job: "Auto Parts Packaging", sku: "AUT-234", jobType: "Rigid Box", quantityRange: "15000-20000", status: "Quoted", priority: "high", date: "2024-01-06", dueDate: "2024-01-16", clarificationStatus: "Clarified", notes: "Automotive component packaging", kamName: "Priya Sharma", hodName: "Kavita Reddy" },
  { id: "INQ-2024-011", customer: "ITC Limited", job: "Food Grade Cartons", sku: "FGC-445", jobType: "Fluted Box", quantityRange: "20000-25000", status: "Pending", priority: "medium", date: "2024-01-05", dueDate: "2024-01-22", clarificationStatus: "Pending Clarification", notes: "Food safety certification required", kamName: "Amit Patel", hodName: "Suresh Menon" },
  { id: "INQ-2024-012", customer: "HCL Technologies", job: "Electronic Device Boxes", sku: "EDB-678", jobType: "Gable Top", quantityRange: "5000-8000", status: "Costing", priority: "low", date: "2024-01-04", dueDate: "2024-01-28", clarificationStatus: "Awaiting Customer", notes: "Electronics packaging specifications needed", kamName: "Sneha Gupta", hodName: "Kavita Reddy" },
  { id: "INQ-2024-013", customer: "Tech Mahindra", job: "Shipping Cartons", sku: "SHP-901", jobType: "Burgo Pack", quantityRange: "10000-15000", status: "Approved", priority: "high", date: "2024-01-03", dueDate: "2024-01-14", clarificationStatus: "Not Required", notes: "Bulk shipping order approved", kamName: "Rajesh Kumar", hodName: "Suresh Menon" },
  { id: "INQ-2024-014", customer: "HDFC Bank", job: "Promotional Gift Boxes", sku: "PGB-123", jobType: "Speciality Pack", quantityRange: "3000-5000", status: "Quoted", priority: "medium", date: "2024-01-02", dueDate: "2024-01-20", clarificationStatus: "Clarified", notes: "Banking promotional materials", kamName: "Priya Sharma", hodName: "Kavita Reddy" },
  { id: "INQ-2024-015", customer: "ICICI Prudential", job: "Document Folders", sku: "DOC-567", jobType: "Monocarton", quantityRange: "7000-9000", status: "Pending", priority: "low", date: "2024-01-01", dueDate: "2024-01-25", clarificationStatus: "Pending Clarification", notes: "Insurance document packaging", kamName: "Amit Patel", hodName: "Suresh Menon" },
  { id: "INQ-2023-150", customer: "Hindustan Unilever", job: "FMCG Packaging", sku: "FMC-890", jobType: "Paper Pod", quantityRange: "25000-30000", status: "Costing", priority: "high", date: "2023-12-30", dueDate: "2024-01-12", clarificationStatus: "Clarified", notes: "Large FMCG order for multiple SKUs", kamName: "Sneha Gupta", hodName: "Kavita Reddy" },
  { id: "INQ-2023-149", customer: "Sun Pharma", job: "Medicine Cartons", sku: "MED-234", jobType: "Rigid Box", quantityRange: "18000-22000", status: "Approved", priority: "high", date: "2023-12-28", dueDate: "2024-01-10", clarificationStatus: "Not Required", notes: "Pharmaceutical grade packaging", kamName: "Rajesh Kumar", hodName: "Suresh Menon" },
  { id: "INQ-2023-148", customer: "Dr Reddy's Labs", job: "Tablet Blister Packs", sku: "TBP-456", jobType: "Fluted Box", quantityRange: "30000-35000", status: "Quoted", priority: "medium", date: "2023-12-26", dueDate: "2024-01-15", clarificationStatus: "Clarified", notes: "High volume pharma packaging", kamName: "Priya Sharma", hodName: "Kavita Reddy" },
  { id: "INQ-2023-147", customer: "Cipla Pharmaceuticals", job: "Syrup Cartons", sku: "SYR-789", jobType: "Gable Top", quantityRange: "12000-15000", status: "Pending", priority: "low", date: "2023-12-24", dueDate: "2024-01-18", clarificationStatus: "Awaiting Customer", notes: "Liquid medicine packaging", kamName: "Amit Patel", hodName: "Suresh Menon" },
  { id: "INQ-2023-146", customer: "Dabur India", job: "Ayurvedic Product Boxes", sku: "AYU-012", jobType: "Burgo Pack", quantityRange: "8000-10000", status: "Costing", priority: "medium", date: "2023-12-22", dueDate: "2024-01-16", clarificationStatus: "Pending Clarification", notes: "Traditional medicine packaging", kamName: "Sneha Gupta", hodName: "Kavita Reddy" },
  { id: "INQ-2023-145", customer: "Patanjali Ayurved", job: "Herbal Product Cartons", sku: "HRB-345", jobType: "Speciality Pack", quantityRange: "15000-18000", status: "Approved", priority: "high", date: "2023-12-20", dueDate: "2024-01-08", clarificationStatus: "Not Required", notes: "Herbal products packaging approved", hodName: "Suresh Menon" },
  { id: "INQ-2023-144", customer: "Britannia Industries", job: "Biscuit Packaging", sku: "BIS-678", jobType: "Monocarton", quantityRange: "40000-45000", status: "Quoted", priority: "high", date: "2023-12-18", dueDate: "2024-01-05", clarificationStatus: "Clarified", notes: "Food packaging for new product line", hodName: "Kavita Reddy" },
  { id: "INQ-2023-143", customer: "Parle Products", job: "Confectionery Boxes", sku: "CNF-901", jobType: "Paper Pod", quantityRange: "35000-40000", status: "Pending", priority: "medium", date: "2023-12-16", dueDate: "2024-01-12", clarificationStatus: "Pending Clarification", notes: "Sweet packaging requirements" },
  { id: "INQ-2023-142", customer: "Nestle India", job: "Chocolate Packaging", sku: "CHO-234", jobType: "Rigid Box", quantityRange: "20000-25000", status: "Costing", priority: "low", date: "2023-12-14", dueDate: "2024-01-20", clarificationStatus: "Awaiting Customer", notes: "Premium chocolate gift boxes" },
  { id: "INQ-2023-141", customer: "PepsiCo India", job: "Snack Cartons", sku: "SNK-567", jobType: "Fluted Box", quantityRange: "50000-55000", status: "Approved", priority: "high", date: "2023-12-12", dueDate: "2024-01-06", clarificationStatus: "Not Required", notes: "High volume snack packaging" },
  { id: "INQ-2023-140", customer: "Coca-Cola India", job: "Beverage Cartons", sku: "BEV-890", jobType: "Gable Top", quantityRange: "45000-50000", status: "Quoted", priority: "high", date: "2023-12-10", dueDate: "2024-01-08", clarificationStatus: "Clarified", notes: "Beverage multipacks packaging" },
  { id: "INQ-2023-139", customer: "Amazon India", job: "E-commerce Shipping Boxes", sku: "ECM-123", jobType: "Burgo Pack", quantityRange: "100000-120000", status: "Pending", priority: "medium", date: "2023-12-08", dueDate: "2024-01-15", clarificationStatus: "Pending Clarification", notes: "Massive e-commerce order" },
  { id: "INQ-2023-138", customer: "Flipkart", job: "Delivery Cartons", sku: "DEL-456", jobType: "Speciality Pack", quantityRange: "80000-90000", status: "Costing", priority: "high", date: "2023-12-06", dueDate: "2024-01-10", clarificationStatus: "Clarified", notes: "E-commerce delivery packaging" },
  { id: "INQ-2023-137", customer: "Myntra Fashion", job: "Apparel Boxes", sku: "APP-789", jobType: "Monocarton", quantityRange: "25000-30000", status: "Approved", priority: "medium", date: "2023-12-04", dueDate: "2024-01-18", clarificationStatus: "Not Required", notes: "Fashion retail packaging" },
  { id: "INQ-2023-136", customer: "Zomato", job: "Food Delivery Boxes", sku: "FDL-012", jobType: "Paper Pod", quantityRange: "60000-70000", status: "Quoted", priority: "low", date: "2023-12-02", dueDate: "2024-01-22", clarificationStatus: "Clarified", notes: "Food delivery packaging solution" },
  { id: "INQ-2023-135", customer: "Swiggy", job: "Restaurant Packaging", sku: "RST-345", jobType: "Rigid Box", quantityRange: "55000-65000", status: "Pending", priority: "high", date: "2023-11-30", dueDate: "2024-01-14", clarificationStatus: "Awaiting Customer", notes: "Restaurant partner packaging" },
  { id: "INQ-2023-134", customer: "BigBasket", job: "Grocery Cartons", sku: "GRC-678", jobType: "Fluted Box", quantityRange: "70000-80000", status: "Costing", priority: "medium", date: "2023-11-28", dueDate: "2024-01-16", clarificationStatus: "Pending Clarification", notes: "Online grocery packaging" },
  { id: "INQ-2023-133", customer: "DMart", job: "Retail Packaging", sku: "RTL-901", jobType: "Gable Top", quantityRange: "40000-50000", status: "Approved", priority: "high", date: "2023-11-26", dueDate: "2024-01-09", clarificationStatus: "Not Required", notes: "Retail chain bulk order" },
  { id: "INQ-2023-132", customer: "Future Retail", job: "Department Store Boxes", sku: "DSB-234", jobType: "Burgo Pack", quantityRange: "35000-40000", status: "Quoted", priority: "low", date: "2023-11-24", dueDate: "2024-01-20", clarificationStatus: "Clarified", notes: "Department store packaging" },
  { id: "INQ-2023-131", customer: "Reliance Fresh", job: "Fresh Produce Cartons", sku: "FPC-567", jobType: "Speciality Pack", quantityRange: "30000-35000", status: "Pending", priority: "medium", date: "2023-11-22", dueDate: "2024-01-17", clarificationStatus: "Pending Clarification", notes: "Fresh food packaging" },
  { id: "INQ-2023-130", customer: "Spencer's Retail", job: "Supermarket Packaging", sku: "SPM-890", jobType: "Monocarton", quantityRange: "25000-30000", status: "Costing", priority: "high", date: "2023-11-20", dueDate: "2024-01-12", clarificationStatus: "Clarified", notes: "Supermarket private labels" },
  { id: "INQ-2023-129", customer: "Metro Cash & Carry", job: "Wholesale Cartons", sku: "WSC-123", jobType: "Paper Pod", quantityRange: "50000-60000", status: "Approved", priority: "high", date: "2023-11-18", dueDate: "2024-01-08", clarificationStatus: "Not Required", notes: "Wholesale packaging approved" },
  { id: "INQ-2023-128", customer: "Vedanta Limited", job: "Industrial Packaging", sku: "IND-456", jobType: "Rigid Box", quantityRange: "20000-25000", status: "Quoted", priority: "medium", date: "2023-11-16", dueDate: "2024-01-15", clarificationStatus: "Clarified", notes: "Heavy duty industrial boxes" },
  { id: "INQ-2023-127", customer: "JSW Steel", job: "Metal Parts Cartons", sku: "MPT-789", jobType: "Fluted Box", quantityRange: "15000-20000", status: "Pending", priority: "low", date: "2023-11-14", dueDate: "2024-01-22", clarificationStatus: "Awaiting Customer", notes: "Steel components packaging" },
  { id: "INQ-2023-126", customer: "Tata Steel", job: "Steel Product Boxes", sku: "SPB-012", jobType: "Gable Top", quantityRange: "12000-15000", status: "Costing", priority: "high", date: "2023-11-12", dueDate: "2024-01-10", clarificationStatus: "Pending Clarification", notes: "Steel products packaging" },
  { id: "INQ-2023-125", customer: "Ultratech Cement", job: "Cement Bag Liners", sku: "CBL-345", jobType: "Burgo Pack", quantityRange: "80000-90000", status: "Approved", priority: "high", date: "2023-11-10", dueDate: "2024-01-06", clarificationStatus: "Not Required", notes: "Industrial cement packaging" },
  { id: "INQ-2023-124", customer: "Ambuja Cement", job: "Construction Material Boxes", sku: "CMB-678", jobType: "Speciality Pack", quantityRange: "60000-70000", status: "Quoted", priority: "medium", date: "2023-11-08", dueDate: "2024-01-14", clarificationStatus: "Clarified", notes: "Construction packaging materials" },
  { id: "INQ-2023-123", customer: "ACC Cement", job: "Building Material Cartons", sku: "BMC-901", jobType: "Monocarton", quantityRange: "50000-55000", status: "Pending", priority: "low", date: "2023-11-06", dueDate: "2024-01-20", clarificationStatus: "Pending Clarification", notes: "Building materials packaging" },
  { id: "INQ-2023-122", customer: "Apollo Tyres", job: "Tyre Packaging", sku: "TYR-234", jobType: "Paper Pod", quantityRange: "25000-30000", status: "Costing", priority: "high", date: "2023-11-04", dueDate: "2024-01-11", clarificationStatus: "Clarified", notes: "Automotive tyre packaging" },
  { id: "INQ-2023-121", customer: "MRF Tyres", job: "Rubber Product Boxes", sku: "RPB-567", jobType: "Rigid Box", quantityRange: "20000-25000", status: "Approved", priority: "high", date: "2023-11-02", dueDate: "2024-01-07", clarificationStatus: "Not Required", notes: "Rubber products packaging" },
  { id: "INQ-2023-120", customer: "Ceat Tyres", job: "Automotive Cartons", sku: "ATC-890", jobType: "Fluted Box", quantityRange: "30000-35000", status: "Quoted", priority: "medium", date: "2023-10-31", dueDate: "2024-01-16", clarificationStatus: "Clarified", notes: "Automotive accessories packaging" },
  { id: "INQ-2023-119", customer: "Hero MotoCorp", job: "Two Wheeler Parts Boxes", sku: "TWP-123", jobType: "Gable Top", quantityRange: "40000-45000", status: "Pending", priority: "low", date: "2023-10-29", dueDate: "2024-01-23", clarificationStatus: "Awaiting Customer", notes: "Motorcycle parts packaging" },
  { id: "INQ-2023-118", customer: "TVS Motor", job: "Scooter Parts Cartons", sku: "SPC-456", jobType: "Burgo Pack", quantityRange: "35000-40000", status: "Costing", priority: "high", date: "2023-10-27", dueDate: "2024-01-13", clarificationStatus: "Pending Clarification", notes: "Scooter components packaging" },
  { id: "INQ-2023-117", customer: "Maruti Suzuki", job: "Car Parts Packaging", sku: "CPP-789", jobType: "Speciality Pack", quantityRange: "50000-55000", status: "Approved", priority: "high", date: "2023-10-25", dueDate: "2024-01-09", clarificationStatus: "Not Required", notes: "Automobile parts packaging" },
  { id: "INQ-2023-116", customer: "Hyundai Motor India", job: "Vehicle Component Boxes", sku: "VCB-012", jobType: "Monocarton", quantityRange: "45000-50000", status: "Quoted", priority: "medium", date: "2023-10-23", dueDate: "2024-01-17", clarificationStatus: "Clarified", notes: "Vehicle components packaging" },
  { id: "INQ-2023-115", customer: "Mahindra & Mahindra", job: "SUV Parts Cartons", sku: "SVC-345", jobType: "Paper Pod", quantityRange: "30000-35000", status: "Pending", priority: "low", date: "2023-10-21", dueDate: "2024-01-24", clarificationStatus: "Pending Clarification", notes: "SUV parts packaging" },
  { id: "INQ-2023-114", customer: "Tata Motors", job: "Commercial Vehicle Boxes", sku: "CVB-678", jobType: "Rigid Box", quantityRange: "40000-45000", status: "Costing", priority: "high", date: "2023-10-19", dueDate: "2024-01-12", clarificationStatus: "Clarified", notes: "Commercial vehicle packaging" },
  { id: "INQ-2023-113", customer: "Ashok Leyland", job: "Truck Parts Packaging", sku: "TPP-901", jobType: "Fluted Box", quantityRange: "35000-40000", status: "Approved", priority: "high", date: "2023-10-17", dueDate: "2024-01-08", clarificationStatus: "Not Required", notes: "Heavy vehicle parts packaging" },
  { id: "INQ-2023-112", customer: "Eicher Motors", job: "Commercial Parts Cartons", sku: "CPC-234", jobType: "Gable Top", quantityRange: "25000-30000", status: "Quoted", priority: "medium", date: "2023-10-15", dueDate: "2024-01-19", clarificationStatus: "Clarified", notes: "Commercial vehicle components" },
  { id: "INQ-2023-111", customer: "Samsung India", job: "Electronics Packaging", sku: "ELC-567", jobType: "Burgo Pack", quantityRange: "60000-70000", status: "Pending", priority: "low", date: "2023-10-13", dueDate: "2024-01-25", clarificationStatus: "Awaiting Customer", notes: "Consumer electronics packaging" },
  { id: "INQ-2023-110", customer: "LG Electronics", job: "Appliance Cartons", sku: "APC-890", jobType: "Speciality Pack", quantityRange: "50000-60000", status: "Costing", priority: "high", date: "2023-10-11", dueDate: "2024-01-14", clarificationStatus: "Pending Clarification", notes: "Home appliances packaging" },
  { id: "INQ-2023-109", customer: "Sony India", job: "TV Packaging Boxes", sku: "TVP-123", jobType: "Monocarton", quantityRange: "40000-45000", status: "Approved", priority: "high", date: "2023-10-09", dueDate: "2024-01-10", clarificationStatus: "Not Required", notes: "Television packaging approved" },
  { id: "INQ-2023-108", customer: "Panasonic India", job: "Audio Equipment Cartons", sku: "AEC-456", jobType: "Paper Pod", quantityRange: "35000-40000", status: "Quoted", priority: "medium", date: "2023-10-07", dueDate: "2024-01-18", clarificationStatus: "Clarified", notes: "Audio products packaging" },
  { id: "INQ-2023-107", customer: "Haier India", job: "Refrigerator Boxes", sku: "RFB-789", jobType: "Rigid Box", quantityRange: "30000-35000", status: "Pending", priority: "low", date: "2023-10-05", dueDate: "2024-01-22", clarificationStatus: "Pending Clarification", notes: "Refrigeration packaging" },
  { id: "INQ-2023-106", customer: "Whirlpool India", job: "Washing Machine Cartons", sku: "WMC-012", jobType: "Fluted Box", quantityRange: "45000-50000", status: "Costing", priority: "high", date: "2023-10-03", dueDate: "2024-01-13", clarificationStatus: "Clarified", notes: "Washing machine packaging" },
  { id: "INQ-2023-105", customer: "Bosch India", job: "Power Tools Packaging", sku: "PTP-345", jobType: "Gable Top", quantityRange: "25000-30000", status: "Approved", priority: "high", date: "2023-10-01", dueDate: "2024-01-09", clarificationStatus: "Not Required", notes: "Professional tools packaging" },
  { id: "INQ-2023-104", customer: "Havells India", job: "Electrical Products Boxes", sku: "EPB-678", jobType: "Burgo Pack", quantityRange: "40000-45000", status: "Quoted", priority: "medium", date: "2023-09-29", dueDate: "2024-01-17", clarificationStatus: "Clarified", notes: "Electrical equipment packaging" },
  { id: "INQ-2023-103", customer: "Crompton Greaves", job: "Fan Packaging Cartons", sku: "FPC-901", jobType: "Speciality Pack", quantityRange: "50000-55000", status: "Pending", priority: "low", date: "2023-09-27", dueDate: "2024-01-24", clarificationStatus: "Awaiting Customer", notes: "Fan and motor packaging" },
  { id: "INQ-2023-102", customer: "V-Guard Industries", job: "Stabilizer Boxes", sku: "STB-234", jobType: "Monocarton", quantityRange: "35000-40000", status: "Costing", priority: "high", date: "2023-09-25", dueDate: "2024-01-12", clarificationStatus: "Pending Clarification", notes: "Voltage stabilizer packaging" },
  { id: "INQ-2023-101", customer: "Blue Star", job: "AC Packaging Cartons", sku: "ACP-567", jobType: "Paper Pod", quantityRange: "30000-35000", status: "Approved", priority: "high", date: "2023-09-23", dueDate: "2024-01-08", clarificationStatus: "Not Required", notes: "Air conditioner packaging" },
  { id: "INQ-2023-100", customer: "Voltas Limited", job: "Cooling System Boxes", sku: "CSB-890", jobType: "Rigid Box", quantityRange: "40000-45000", status: "Quoted", priority: "medium", date: "2023-09-21", dueDate: "2024-01-16", clarificationStatus: "Clarified", notes: "Cooling systems packaging" },
  { id: "INQ-2023-099", customer: "IFB Industries", job: "Kitchen Appliance Cartons", sku: "KAC-123", jobType: "Fluted Box", quantityRange: "25000-30000", status: "Pending", priority: "low", date: "2023-09-19", dueDate: "2024-01-23", clarificationStatus: "Pending Clarification", notes: "Kitchen appliances packaging" },
  { id: "INQ-2023-098", customer: "Philips India", job: "Lighting Products Boxes", sku: "LPB-456", jobType: "Gable Top", quantityRange: "60000-70000", status: "Costing", priority: "high", date: "2023-09-17", dueDate: "2024-01-14", clarificationStatus: "Clarified", notes: "LED lighting packaging" },
  { id: "INQ-2023-097", customer: "Bajaj Electricals", job: "Home Appliances Packaging", sku: "HAP-789", jobType: "Burgo Pack", quantityRange: "50000-55000", status: "Approved", priority: "high", date: "2023-09-15", dueDate: "2024-01-10", clarificationStatus: "Not Required", notes: "Home appliances bulk order" },
  { id: "INQ-2023-096", customer: "Usha International", job: "Sewing Machine Cartons", sku: "SMC-012", jobType: "Speciality Pack", quantityRange: "20000-25000", status: "Quoted", priority: "medium", date: "2023-09-13", dueDate: "2024-01-19", clarificationStatus: "Clarified", notes: "Sewing equipment packaging" },
  { id: "INQ-2023-095", customer: "Butterfly Gandhimathi", job: "Kitchen Equipment Boxes", sku: "KEB-345", jobType: "Monocarton", quantityRange: "35000-40000", status: "Pending", priority: "low", date: "2023-09-11", dueDate: "2024-01-25", clarificationStatus: "Awaiting Customer", notes: "Kitchen equipment packaging" },
  { id: "INQ-2023-094", customer: "Prestige Smart Kitchen", job: "Cookware Packaging", sku: "CKP-678", jobType: "Paper Pod", quantityRange: "45000-50000", status: "Costing", priority: "high", date: "2023-09-09", dueDate: "2024-01-13", clarificationStatus: "Pending Clarification", notes: "Cookware packaging solutions" },
  { id: "INQ-2023-093", customer: "TTK Prestige", job: "Pressure Cooker Boxes", sku: "PCB-901", jobType: "Rigid Box", quantityRange: "40000-45000", status: "Approved", priority: "high", date: "2023-09-07", dueDate: "2024-01-09", clarificationStatus: "Not Required", notes: "Pressure cooker packaging" },
  { id: "INQ-2023-092", customer: "Pigeon India", job: "Non-stick Cookware Cartons", sku: "NCC-234", jobType: "Fluted Box", quantityRange: "30000-35000", status: "Quoted", priority: "medium", date: "2023-09-05", dueDate: "2024-01-18", clarificationStatus: "Clarified", notes: "Non-stick cookware packaging" },
  { id: "INQ-2023-091", customer: "Milton India", job: "Bottle Packaging Boxes", sku: "BPB-567", jobType: "Gable Top", quantityRange: "55000-60000", status: "Pending", priority: "low", date: "2023-09-03", dueDate: "2024-01-24", clarificationStatus: "Pending Clarification", notes: "Water bottle packaging" },
  { id: "INQ-2023-090", customer: "Cello Plast", job: "Plastic Products Cartons", sku: "PPC-890", jobType: "Burgo Pack", quantityRange: "70000-80000", status: "Costing", priority: "high", date: "2023-09-01", dueDate: "2024-01-15", clarificationStatus: "Clarified", notes: "Plastic products packaging" },
  { id: "INQ-2023-089", customer: "Tupperware India", job: "Container Packaging", sku: "CTP-123", jobType: "Speciality Pack", quantityRange: "50000-60000", status: "Approved", priority: "high", date: "2023-08-30", dueDate: "2024-01-11", clarificationStatus: "Not Required", notes: "Food container packaging" },
  { id: "INQ-2023-088", customer: "Signify India", job: "Smart Lighting Boxes", sku: "SLB-456", jobType: "Monocarton", quantityRange: "40000-45000", status: "Quoted", priority: "medium", date: "2023-08-28", dueDate: "2024-01-20", clarificationStatus: "Clarified", notes: "Smart lighting solutions packaging" },
  { id: "INQ-2023-087", customer: "Syska LED", job: "LED Bulb Cartons", sku: "LBC-789", jobType: "Paper Pod", quantityRange: "80000-90000", status: "Pending", priority: "low", date: "2023-08-26", dueDate: "2024-01-26", clarificationStatus: "Awaiting Customer", notes: "LED bulbs packaging" },
  { id: "INQ-2023-086", customer: "Orient Electric", job: "Fan Component Boxes", sku: "FCB-012", jobType: "Rigid Box", quantityRange: "45000-50000", status: "Costing", priority: "high", date: "2023-08-24", dueDate: "2024-01-16", clarificationStatus: "Pending Clarification", notes: "Fan components packaging" },
  { id: "INQ-2023-085", customer: "Anchor Electricals", job: "Switch Packaging", sku: "SWP-345", jobType: "Fluted Box", quantityRange: "90000-100000", status: "Approved", priority: "high", date: "2023-08-22", dueDate: "2024-01-12", clarificationStatus: "Not Required", notes: "Electrical switches packaging" },
  { id: "INQ-2023-084", customer: "Legrand India", job: "Electrical Accessories Boxes", sku: "EAB-678", jobType: "Gable Top", quantityRange: "60000-70000", status: "Quoted", priority: "medium", date: "2023-08-20", dueDate: "2024-01-21", clarificationStatus: "Clarified", notes: "Electrical accessories packaging" },
  { id: "INQ-2023-083", customer: "Schneider Electric", job: "Industrial Switches Cartons", sku: "ISC-901", jobType: "Burgo Pack", quantityRange: "50000-55000", status: "Pending", priority: "low", date: "2023-08-18", dueDate: "2024-01-27", clarificationStatus: "Pending Clarification", notes: "Industrial electrical packaging" },
  { id: "INQ-2023-082", customer: "ABB India", job: "Automation Products Boxes", sku: "APB-234", jobType: "Speciality Pack", quantityRange: "35000-40000", status: "Costing", priority: "high", date: "2023-08-16", dueDate: "2024-01-17", clarificationStatus: "Clarified", notes: "Automation equipment packaging" },
  { id: "INQ-2023-081", customer: "Siemens India", job: "Industrial Equipment Cartons", sku: "IEC-567", jobType: "Monocarton", quantityRange: "40000-45000", status: "Approved", priority: "high", date: "2023-08-14", dueDate: "2024-01-13", clarificationStatus: "Not Required", notes: "Industrial machinery packaging" },
  { id: "INQ-2023-080", customer: "GE India", job: "Power Systems Boxes", sku: "PSB-890", jobType: "Paper Pod", quantityRange: "30000-35000", status: "Quoted", priority: "medium", date: "2023-08-12", dueDate: "2024-01-22", clarificationStatus: "Clarified", notes: "Power systems packaging" },
  { id: "INQ-2023-079", customer: "Honeywell India", job: "Control Systems Packaging", sku: "CSP-123", jobType: "Rigid Box", quantityRange: "25000-30000", status: "Pending", priority: "low", date: "2023-08-10", dueDate: "2024-01-28", clarificationStatus: "Awaiting Customer", notes: "Control systems packaging" },
  { id: "INQ-2023-078", customer: "Johnson Controls", job: "HVAC Equipment Cartons", sku: "HEC-456", jobType: "Fluted Box", quantityRange: "35000-40000", status: "Costing", priority: "high", date: "2023-08-08", dueDate: "2024-01-18", clarificationStatus: "Pending Clarification", notes: "HVAC systems packaging" },
  { id: "INQ-2023-077", customer: "Carrier Midea India", job: "Air Handling Units Boxes", sku: "AHB-789", jobType: "Gable Top", quantityRange: "20000-25000", status: "Approved", priority: "high", date: "2023-08-06", dueDate: "2024-01-14", clarificationStatus: "Not Required", notes: "Air handling packaging" },
  { id: "INQ-2023-076", customer: "Daikin India", job: "VRF Systems Packaging", sku: "VRP-012", jobType: "Burgo Pack", quantityRange: "15000-20000", status: "Quoted", priority: "medium", date: "2023-08-04", dueDate: "2024-01-23", clarificationStatus: "Clarified", notes: "VRF systems packaging" },
  { id: "INQ-2023-075", customer: "Mitsubishi Electric", job: "Elevator Parts Cartons", sku: "EPC-345", jobType: "Speciality Pack", quantityRange: "25000-30000", status: "Pending", priority: "low", date: "2023-08-02", dueDate: "2024-01-29", clarificationStatus: "Pending Clarification", notes: "Elevator components packaging" },
  { id: "INQ-2023-074", customer: "Otis Elevator", job: "Lift Component Boxes", sku: "LCB-678", jobType: "Monocarton", quantityRange: "30000-35000", status: "Costing", priority: "high", date: "2023-07-31", dueDate: "2024-01-19", clarificationStatus: "Clarified", notes: "Lift parts packaging" },
  { id: "INQ-2023-073", customer: "Kone India", job: "Escalator Parts Packaging", sku: "EPP-901", jobType: "Paper Pod", quantityRange: "20000-25000", status: "Approved", priority: "high", date: "2023-07-29", dueDate: "2024-01-15", clarificationStatus: "Not Required", notes: "Escalator components packaging" },
  { id: "INQ-2023-072", customer: "Schindler India", job: "Vertical Transport Cartons", sku: "VTC-234", jobType: "Rigid Box", quantityRange: "18000-22000", status: "Quoted", priority: "medium", date: "2023-07-27", dueDate: "2024-01-24", clarificationStatus: "Clarified", notes: "Vertical transport packaging" },
  { id: "INQ-2023-071", customer: "ThyssenKrupp Elevators", job: "Moving Systems Boxes", sku: "MSB-567", jobType: "Fluted Box", quantityRange: "22000-28000", status: "Pending", priority: "low", date: "2023-07-25", dueDate: "2024-01-30", clarificationStatus: "Awaiting Customer", notes: "Moving systems packaging" },
  { id: "INQ-2023-070", customer: "Cummins India", job: "Generator Packaging", sku: "GNP-890", jobType: "Gable Top", quantityRange: "15000-20000", status: "Costing", priority: "high", date: "2023-07-23", dueDate: "2024-01-20", clarificationStatus: "Pending Clarification", notes: "Power generator packaging" },
  { id: "INQ-2023-069", customer: "Kirloskar Electric", job: "Transformer Cartons", sku: "TFC-123", jobType: "Burgo Pack", quantityRange: "12000-15000", status: "Approved", priority: "high", date: "2023-07-21", dueDate: "2024-01-16", clarificationStatus: "Not Required", notes: "Transformer packaging approved" },
  { id: "INQ-2023-068", customer: "BHEL India", job: "Heavy Machinery Boxes", sku: "HMB-456", jobType: "Speciality Pack", quantityRange: "10000-12000", status: "Quoted", priority: "medium", date: "2023-07-19", dueDate: "2024-01-25", clarificationStatus: "Clarified", notes: "Heavy machinery packaging" },
  { id: "INQ-2023-067", customer: "Crompton & Co", job: "Motor Packaging", sku: "MTP-789", jobType: "Monocarton", quantityRange: "35000-40000", status: "Pending", priority: "low", date: "2023-07-17", dueDate: "2024-01-31", clarificationStatus: "Pending Clarification", notes: "Electric motor packaging" },
  { id: "INQ-2023-066", customer: "ABB Motors", job: "Industrial Motors Cartons", sku: "IMC-012", jobType: "Paper Pod", quantityRange: "28000-32000", status: "Costing", priority: "high", date: "2023-07-15", dueDate: "2024-01-21", clarificationStatus: "Clarified", notes: "Industrial motor packaging" },
  { id: "INQ-2023-065", customer: "Siemens Motors", job: "Drive Systems Boxes", sku: "DSB-345", jobType: "Rigid Box", quantityRange: "25000-30000", status: "Approved", priority: "high", date: "2023-07-13", dueDate: "2024-01-17", clarificationStatus: "Not Required", notes: "Drive systems packaging" },
  { id: "INQ-2023-064", customer: "WEG India", job: "Electric Drive Packaging", sku: "EDP-678", jobType: "Fluted Box", quantityRange: "20000-25000", status: "Quoted", priority: "medium", date: "2023-07-11", dueDate: "2024-01-26", clarificationStatus: "Clarified", notes: "Electric drives packaging" },
  { id: "INQ-2023-063", customer: "Baldor Electric", job: "Gear Motor Cartons", sku: "GMC-901", jobType: "Gable Top", quantityRange: "18000-22000", status: "Pending", priority: "low", date: "2023-07-09", dueDate: "2024-02-01", clarificationStatus: "Awaiting Customer", notes: "Gear motor packaging" },
  { id: "INQ-2023-062", customer: "Regal Beloit", job: "Power Transmission Boxes", sku: "PTB-234", jobType: "Burgo Pack", quantityRange: "22000-26000", status: "Costing", priority: "high", date: "2023-07-07", dueDate: "2024-01-22", clarificationStatus: "Pending Clarification", notes: "Power transmission packaging" },
  { id: "INQ-2023-061", customer: "SKF India", job: "Bearing Packaging", sku: "BRP-567", jobType: "Speciality Pack", quantityRange: "60000-70000", status: "Approved", priority: "high", date: "2023-07-05", dueDate: "2024-01-18", clarificationStatus: "Not Required", notes: "Precision bearing packaging" },
  { id: "INQ-2023-060", customer: "Timken India", job: "Industrial Bearings Cartons", sku: "IBC-890", jobType: "Monocarton", quantityRange: "50000-55000", status: "Quoted", priority: "medium", date: "2023-07-03", dueDate: "2024-01-27", clarificationStatus: "Clarified", notes: "Industrial bearing packaging" },
  { id: "INQ-2023-059", customer: "NSK India", job: "Precision Parts Boxes", sku: "PPB-123", jobType: "Paper Pod", quantityRange: "45000-50000", status: "Pending", priority: "low", date: "2023-07-01", dueDate: "2024-02-02", clarificationStatus: "Pending Clarification", notes: "Precision parts packaging" },
  { id: "INQ-2023-058", customer: "NTN Bearing", job: "Automotive Bearings Packaging", sku: "ABP-456", jobType: "Rigid Box", quantityRange: "55000-60000", status: "Costing", priority: "high", date: "2023-06-29", dueDate: "2024-01-23", clarificationStatus: "Clarified", notes: "Automotive bearing packaging" },
  { id: "INQ-2023-057", customer: "FAG Bearings", job: "Roller Bearing Cartons", sku: "RBC-789", jobType: "Fluted Box", quantityRange: "40000-45000", status: "Approved", priority: "high", date: "2023-06-27", dueDate: "2024-01-19", clarificationStatus: "Not Required", notes: "Roller bearing packaging" },
  { id: "INQ-2023-056", customer: "Schaeffler India", job: "Ball Bearing Boxes", sku: "BBB-012", jobType: "Gable Top", quantityRange: "65000-70000", status: "Quoted", priority: "medium", date: "2023-06-25", dueDate: "2024-01-28", clarificationStatus: "Clarified", notes: "Ball bearing packaging" },
  { id: "INQ-2023-055", customer: "INA Bearings", job: "Linear Motion Packaging", sku: "LMP-345", jobType: "Burgo Pack", quantityRange: "35000-40000", status: "Pending", priority: "low", date: "2023-06-23", dueDate: "2024-02-03", clarificationStatus: "Awaiting Customer", notes: "Linear motion packaging" },
  { id: "INQ-2023-054", customer: "Gates India", job: "Belt Drive Cartons", sku: "BDC-678", jobType: "Speciality Pack", quantityRange: "40000-45000", status: "Costing", priority: "high", date: "2023-06-21", dueDate: "2024-01-24", clarificationStatus: "Pending Clarification", notes: "Belt drive systems packaging" },
  { id: "INQ-2023-053", customer: "Continental India", job: "Automotive Belts Boxes", sku: "ABB-901", jobType: "Monocarton", quantityRange: "50000-55000", status: "Approved", priority: "high", date: "2023-06-19", dueDate: "2024-01-20", clarificationStatus: "Not Required", notes: "Automotive belt packaging" },
  { id: "INQ-2023-052", customer: "Fenner India", job: "Power Transmission Belts Packaging", sku: "PTB-234", jobType: "Paper Pod", quantityRange: "30000-35000", status: "Quoted", priority: "medium", date: "2023-06-17", dueDate: "2024-01-29", clarificationStatus: "Clarified", notes: "Power belt packaging" },
  { id: "INQ-2023-051", customer: "Optibelt India", job: "Industrial Belts Cartons", sku: "IBC-567", jobType: "Rigid Box", quantityRange: "25000-30000", status: "Pending", priority: "low", date: "2023-06-15", dueDate: "2024-02-04", clarificationStatus: "Pending Clarification", notes: "Industrial belt packaging" },
  { id: "INQ-2023-050", customer: "Megadyne India", job: "Timing Belt Boxes", sku: "TBB-890", jobType: "Fluted Box", quantityRange: "35000-40000", status: "Costing", priority: "high", date: "2023-06-13", dueDate: "2024-01-25", clarificationStatus: "Clarified", notes: "Timing belt packaging" },
  { id: "INQ-2023-049", customer: "Hutchinson India", job: "V-Belt Packaging", sku: "VBP-123", jobType: "Gable Top", quantityRange: "45000-50000", status: "Approved", priority: "high", date: "2023-06-11", dueDate: "2024-01-21", clarificationStatus: "Not Required", notes: "V-belt packaging approved" },
  { id: "INQ-2023-048", customer: "Bando India", job: "Conveyor Belt Cartons", sku: "CBC-456", jobType: "Burgo Pack", quantityRange: "20000-25000", status: "Quoted", priority: "medium", date: "2023-06-09", dueDate: "2024-01-30", clarificationStatus: "Clarified", notes: "Conveyor belt packaging" },
  { id: "INQ-2023-047", customer: "Habasit India", job: "Modular Belt Boxes", sku: "MBB-789", jobType: "Speciality Pack", quantityRange: "15000-20000", status: "Pending", priority: "low", date: "2023-06-07", dueDate: "2024-02-05", clarificationStatus: "Awaiting Customer", notes: "Modular belt packaging" },
  { id: "INQ-2023-046", customer: "Intralox India", job: "Plastic Belt Packaging", sku: "PBP-012", jobType: "Monocarton", quantityRange: "25000-30000", status: "Costing", priority: "high", date: "2023-06-05", dueDate: "2024-01-26", clarificationStatus: "Pending Clarification", notes: "Plastic belt packaging" },
  { id: "INQ-2023-045", customer: "Rexnord India", job: "Chain Drive Cartons", sku: "CDC-345", jobType: "Paper Pod", quantityRange: "30000-35000", status: "Approved", priority: "high", date: "2023-06-03", dueDate: "2024-01-22", clarificationStatus: "Not Required", notes: "Chain drive packaging" },
  { id: "INQ-2023-044", customer: "Diamond Chain", job: "Roller Chain Boxes", sku: "RCB-678", jobType: "Rigid Box", quantityRange: "40000-45000", status: "Quoted", priority: "medium", date: "2023-06-01", dueDate: "2024-01-31", clarificationStatus: "Clarified", notes: "Roller chain packaging" },
  { id: "INQ-2023-043", customer: "Tsubaki India", job: "Engineering Chain Packaging", sku: "ECP-901", jobType: "Fluted Box", quantityRange: "35000-40000", status: "Pending", priority: "low", date: "2023-05-30", dueDate: "2024-02-06", clarificationStatus: "Pending Clarification", notes: "Engineering chain packaging" },
  { id: "INQ-2023-042", customer: "Renold India", job: "Conveyor Chain Cartons", sku: "CCC-234", jobType: "Gable Top", quantityRange: "25000-30000", status: "Costing", priority: "high", date: "2023-05-28", dueDate: "2024-01-27", clarificationStatus: "Clarified", notes: "Conveyor chain packaging" },
  { id: "INQ-2023-041", customer: "Iwis India", job: "Precision Chain Boxes", sku: "PCB-567", jobType: "Burgo Pack", quantityRange: "20000-25000", status: "Approved", priority: "high", date: "2023-05-26", dueDate: "2024-01-23", clarificationStatus: "Not Required", notes: "Precision chain packaging" },
  { id: "INQ-2023-040", customer: "KMC Chain", job: "Bicycle Chain Packaging", sku: "BCP-890", jobType: "Speciality Pack", quantityRange: "80000-90000", status: "Quoted", priority: "medium", date: "2023-05-24", dueDate: "2024-02-01", clarificationStatus: "Clarified", notes: "Bicycle chain packaging" },
  { id: "INQ-2023-039", customer: "SRAM India", job: "Bike Component Cartons", sku: "BCC-123", jobType: "Monocarton", quantityRange: "60000-70000", status: "Pending", priority: "low", date: "2023-05-22", dueDate: "2024-02-07", clarificationStatus: "Awaiting Customer", notes: "Bike components packaging" },
  { id: "INQ-2023-038", customer: "Shimano India", job: "Cycling Gear Boxes", sku: "CGB-456", jobType: "Paper Pod", quantityRange: "50000-55000", status: "Costing", priority: "high", date: "2023-05-20", dueDate: "2024-01-28", clarificationStatus: "Pending Clarification", notes: "Cycling gear packaging" },
  { id: "INQ-2023-037", customer: "Campagnolo India", job: "Racing Parts Packaging", sku: "RPP-789", jobType: "Rigid Box", quantityRange: "25000-30000", status: "Approved", priority: "high", date: "2023-05-18", dueDate: "2024-01-24", clarificationStatus: "Not Required", notes: "Racing parts packaging" },
  { id: "INQ-2023-036", customer: "FSA India", job: "Bike Accessory Cartons", sku: "BAC-012", jobType: "Fluted Box", quantityRange: "40000-45000", status: "Quoted", priority: "medium", date: "2023-05-16", dueDate: "2024-02-02", clarificationStatus: "Clarified", notes: "Bike accessories packaging" },
  { id: "INQ-2023-035", customer: "Specialized India", job: "Mountain Bike Boxes", sku: "MBB-345", jobType: "Gable Top", quantityRange: "15000-20000", status: "Pending", priority: "low", date: "2023-05-14", dueDate: "2024-02-08", clarificationStatus: "Pending Clarification", notes: "Mountain bike packaging" },
  { id: "INQ-2023-034", customer: "Trek India", job: "Road Bike Packaging", sku: "RBP-678", jobType: "Burgo Pack", quantityRange: "12000-15000", status: "Costing", priority: "high", date: "2023-05-12", dueDate: "2024-01-29", clarificationStatus: "Clarified", notes: "Road bike packaging" },
  { id: "INQ-2023-033", customer: "Giant India", job: "Hybrid Bike Cartons", sku: "HBC-901", jobType: "Speciality Pack", quantityRange: "18000-22000", status: "Approved", priority: "high", date: "2023-05-10", dueDate: "2024-01-25", clarificationStatus: "Not Required", notes: "Hybrid bike packaging" },
  { id: "INQ-2023-032", customer: "Cannondale India", job: "Performance Bike Boxes", sku: "PBB-234", jobType: "Monocarton", quantityRange: "10000-12000", status: "Quoted", priority: "medium", date: "2023-05-08", dueDate: "2024-02-03", clarificationStatus: "Clarified", notes: "Performance bike packaging" },
  { id: "INQ-2023-031", customer: "Scott Sports India", job: "Sports Equipment Packaging", sku: "SEP-567", jobType: "Paper Pod", quantityRange: "25000-30000", status: "Pending", priority: "low", date: "2023-05-06", dueDate: "2024-02-09", clarificationStatus: "Awaiting Customer", notes: "Sports equipment packaging" },
  { id: "INQ-2023-030", customer: "Decathlon India", job: "Sporting Goods Cartons", sku: "SGC-890", jobType: "Rigid Box", quantityRange: "100000-120000", status: "Costing", priority: "high", date: "2023-05-04", dueDate: "2024-01-30", clarificationStatus: "Pending Clarification", notes: "Large sporting goods order" },
  { id: "INQ-2023-029", customer: "Nike India", job: "Footwear Packaging", sku: "FWP-123", jobType: "Fluted Box", quantityRange: "150000-180000", status: "Approved", priority: "high", date: "2023-05-02", dueDate: "2024-01-26", clarificationStatus: "Not Required", notes: "Footwear packaging approved" },
  { id: "INQ-2023-028", customer: "Adidas India", job: "Apparel Boxes", sku: "APB-456", jobType: "Gable Top", quantityRange: "120000-140000", status: "Quoted", priority: "medium", date: "2023-04-30", dueDate: "2024-02-04", clarificationStatus: "Clarified", notes: "Apparel packaging solutions" },
  { id: "INQ-2023-027", customer: "Puma India", job: "Sports Shoe Cartons", sku: "SSC-789", jobType: "Burgo Pack", quantityRange: "90000-100000", status: "Pending", priority: "low", date: "2023-04-28", dueDate: "2024-02-10", clarificationStatus: "Pending Clarification", notes: "Sports shoe packaging" },
  { id: "INQ-2023-026", customer: "Reebok India", job: "Athletic Wear Packaging", sku: "AWP-012", jobType: "Speciality Pack", quantityRange: "80000-90000", status: "Costing", priority: "high", date: "2023-04-26", dueDate: "2024-01-31", clarificationStatus: "Clarified", notes: "Athletic wear packaging" },
  { id: "INQ-2023-025", customer: "New Balance India", job: "Running Shoe Boxes", sku: "RSB-345", jobType: "Monocarton", quantityRange: "60000-70000", status: "Approved", priority: "high", date: "2023-04-24", dueDate: "2024-01-27", clarificationStatus: "Not Required", notes: "Running shoe packaging" },
  { id: "INQ-2023-024", customer: "Asics India", job: "Training Gear Cartons", sku: "TGC-678", jobType: "Paper Pod", quantityRange: "50000-55000", status: "Quoted", priority: "medium", date: "2023-04-22", dueDate: "2024-02-05", clarificationStatus: "Clarified", notes: "Training gear packaging" },
  { id: "INQ-2023-023", customer: "Under Armour India", job: "Performance Apparel Packaging", sku: "PAP-901", jobType: "Rigid Box", quantityRange: "40000-45000", status: "Pending", priority: "low", date: "2023-04-20", dueDate: "2024-02-11", clarificationStatus: "Awaiting Customer", notes: "Performance apparel packaging" },
  { id: "INQ-2023-022", customer: "Skechers India", job: "Casual Footwear Boxes", sku: "CFB-234", jobType: "Fluted Box", quantityRange: "70000-80000", status: "Costing", priority: "high", date: "2023-04-18", dueDate: "2024-02-01", clarificationStatus: "Pending Clarification", notes: "Casual footwear packaging" },
  { id: "INQ-2023-021", customer: "Fila India", job: "Sports Clothing Cartons", sku: "SCC-567", jobType: "Gable Top", quantityRange: "55000-60000", status: "Approved", priority: "high", date: "2023-04-16", dueDate: "2024-01-28", clarificationStatus: "Not Required", notes: "Sports clothing packaging" },
  { id: "INQ-2023-020", customer: "Lotto India", job: "Soccer Equipment Packaging", sku: "SEP-890", jobType: "Burgo Pack", quantityRange: "35000-40000", status: "Quoted", priority: "medium", date: "2023-04-14", dueDate: "2024-02-06", clarificationStatus: "Clarified", notes: "Soccer equipment packaging" },
  { id: "INQ-2023-019", customer: "Umbro India", job: "Football Gear Boxes", sku: "FGB-123", jobType: "Speciality Pack", quantityRange: "30000-35000", status: "Pending", priority: "low", date: "2023-04-12", dueDate: "2024-02-12", clarificationStatus: "Pending Clarification", notes: "Football gear packaging" },
  { id: "INQ-2023-018", customer: "Kappa India", job: "Team Apparel Cartons", sku: "TAC-456", jobType: "Monocarton", quantityRange: "45000-50000", status: "Costing", priority: "high", date: "2023-04-10", dueDate: "2024-02-02", clarificationStatus: "Clarified", notes: "Team apparel packaging" },
  { id: "INQ-2023-017", customer: "Mizuno India", job: "Running Equipment Packaging", sku: "REP-789", jobType: "Paper Pod", quantityRange: "25000-30000", status: "Approved", priority: "high", date: "2023-04-08", dueDate: "2024-01-29", clarificationStatus: "Not Required", notes: "Running equipment packaging" },
  { id: "INQ-2023-016", customer: "Brooks India", job: "Marathon Shoe Boxes", sku: "MSB-012", jobType: "Rigid Box", quantityRange: "20000-25000", status: "Quoted", priority: "medium", date: "2023-04-06", dueDate: "2024-02-07", clarificationStatus: "Clarified", notes: "Marathon shoe packaging" },
  { id: "INQ-2023-015", customer: "Salomon India", job: "Trail Running Cartons", sku: "TRC-345", jobType: "Fluted Box", quantityRange: "18000-22000", status: "Pending", priority: "low", date: "2023-04-04", dueDate: "2024-02-13", clarificationStatus: "Awaiting Customer", notes: "Trail running packaging" },
  { id: "INQ-2023-014", customer: "Merrell India", job: "Hiking Gear Packaging", sku: "HGP-678", jobType: "Gable Top", quantityRange: "22000-28000", status: "Costing", priority: "high", date: "2023-04-02", dueDate: "2024-02-03", clarificationStatus: "Pending Clarification", notes: "Hiking gear packaging" },
  { id: "INQ-2023-013", customer: "Columbia India", job: "Outdoor Apparel Boxes", sku: "OAB-901", jobType: "Burgo Pack", quantityRange: "30000-35000", status: "Approved", priority: "high", date: "2023-03-31", dueDate: "2024-01-30", clarificationStatus: "Not Required", notes: "Outdoor apparel packaging" },
  { id: "INQ-2023-012", customer: "The North Face India", job: "Expedition Gear Cartons", sku: "EGC-234", jobType: "Speciality Pack", quantityRange: "15000-20000", status: "Quoted", priority: "medium", date: "2023-03-29", dueDate: "2024-02-08", clarificationStatus: "Clarified", notes: "Expedition gear packaging" },
  { id: "INQ-2023-011", customer: "Patagonia India", job: "Eco Apparel Packaging", sku: "EAP-567", jobType: "Monocarton", quantityRange: "25000-30000", status: "Pending", priority: "low", date: "2023-03-27", dueDate: "2024-02-14", clarificationStatus: "Pending Clarification", notes: "Eco-friendly apparel packaging" },
  { id: "INQ-2023-010", customer: "Mammut India", job: "Climbing Gear Boxes", sku: "CGB-890", jobType: "Paper Pod", quantityRange: "12000-15000", status: "Costing", priority: "high", date: "2023-03-25", dueDate: "2024-02-04", clarificationStatus: "Clarified", notes: "Climbing gear packaging" },
  { id: "INQ-2023-009", customer: "Arc'teryx India", job: "Technical Apparel Cartons", sku: "TAC-123", jobType: "Rigid Box", quantityRange: "10000-12000", status: "Approved", priority: "high", date: "2023-03-23", dueDate: "2024-01-31", clarificationStatus: "Not Required", notes: "Technical apparel packaging" },
  { id: "INQ-2023-008", customer: "Marmot India", job: "Mountain Gear Packaging", sku: "MGP-456", jobType: "Fluted Box", quantityRange: "18000-22000", status: "Quoted", priority: "medium", date: "2023-03-21", dueDate: "2024-02-09", clarificationStatus: "Clarified", notes: "Mountain gear packaging" },
  { id: "INQ-2023-007", customer: "Black Diamond India", job: "Alpine Equipment Boxes", sku: "AEB-789", jobType: "Gable Top", quantityRange: "8000-10000", status: "Pending", priority: "low", date: "2023-03-19", dueDate: "2024-02-15", clarificationStatus: "Awaiting Customer", notes: "Alpine equipment packaging" },
  { id: "INQ-2023-006", customer: "Petzl India", job: "Climbing Safety Cartons", sku: "CSC-012", jobType: "Burgo Pack", quantityRange: "15000-18000", status: "Costing", priority: "high", date: "2023-03-17", dueDate: "2024-02-05", clarificationStatus: "Pending Clarification", notes: "Safety equipment packaging" },
  { id: "INQ-2023-005", customer: "Wild Country India", job: "Rope Equipment Packaging", sku: "REP-345", jobType: "Speciality Pack", quantityRange: "12000-15000", status: "Approved", priority: "high", date: "2023-03-15", dueDate: "2024-02-01", clarificationStatus: "Not Required", notes: "Rope equipment packaging" },
  { id: "INQ-2023-004", customer: "DMM India", job: "Carabiner Boxes", sku: "CRB-678", jobType: "Monocarton", quantityRange: "25000-30000", status: "Quoted", priority: "medium", date: "2023-03-13", dueDate: "2024-02-10", clarificationStatus: "Clarified", notes: "Carabiner packaging" },
  { id: "INQ-2023-003", customer: "Camp India", job: "Technical Climbing Cartons", sku: "TCC-901", jobType: "Paper Pod", quantityRange: "20000-25000", status: "Pending", priority: "low", date: "2023-03-11", dueDate: "2024-02-16", clarificationStatus: "Pending Clarification", notes: "Technical climbing packaging" },
  { id: "INQ-2023-002", customer: "Edelrid India", job: "Harness Packaging", sku: "HRP-234", jobType: "Rigid Box", quantityRange: "18000-22000", status: "Costing", priority: "high", date: "2023-03-09", dueDate: "2024-02-06", clarificationStatus: "Clarified", notes: "Harness packaging solutions" },
  { id: "INQ-2023-001", customer: "Beal India", job: "Dynamic Rope Boxes", sku: "DRB-567", jobType: "Fluted Box", quantityRange: "10000-12000", status: "Approved", priority: "high", date: "2023-03-07", dueDate: "2024-02-02", clarificationStatus: "Not Required", notes: "Dynamic rope packaging approved" },
]
*/

const STATUS_BADGES: Record<string, string> = {
  Approved: "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30",
  Quoted: "bg-[#78BE20]/20 text-green-700 border-[#78BE20]/40",
  Costing: "bg-[#005180]/15 text-[#005180] border-[#005180]/30",
  Pending: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
  Clarified: "bg-[#78BE20]/15 text-green-700 border-[#78BE20]/30",
  "Pending Clarification": "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
  "Awaiting Customer": "bg-[#005180]/15 text-[#005180] border-[#005180]/30",
  "Not Required": "bg-slate-200 text-slate-600 border-slate-300",
}

const PRIORITY_BADGES: Record<string, string> = {
  high: "bg-[#B92221]/15 text-[#B92221] border-[#B92221]/30",
  medium: "bg-[#005180]/15 text-[#005180] border-[#005180]/30",
  low: "bg-[#78BE20]/15 text-[#78BE20] border-[#78BE20]/30",
}

function getStatusBadge(status: string) {
  return STATUS_BADGES[status] ?? "bg-muted text-muted-foreground border-border/60"
}

function getPriorityBadge(priority: string) {
  return PRIORITY_BADGES[priority] ?? "bg-muted text-muted-foreground border-border/60"
}

function getPriorityAccent(priority: string) {
  switch (priority) {
    case "high":
      return "bg-[#B92221]"
    case "medium":
      return "bg-[#005180]"
    default:
      return "bg-[#78BE20]"
  }
}

// Helper function to get first 2 lines of email
function getEmailPreview(emailBody: string): string {
  if (!emailBody) return ''
  const lines = emailBody.split('\n').filter(line => line.trim().length > 0)
  return lines.slice(0, 2).join('\n')
}

export function InquiriesContent() {
  const viewableKams = getViewableKAMs()
  const isRestrictedUser = viewableKams.length > 0 && viewableKams.length < 4 // Not Vertical Head
  const isKAMUser = viewableKams.length === 1 // KAM can only see themselves
  const isHODUser = isHOD() // HOD user check

  // API state
  const [inquiries, setInquiries] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [hodFilter, setHodFilter] = useState("all")
  const [kamFilter, setKamFilter] = useState("all")
  const [sortBy, setSortBy] = useState("date-desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  // Date range for filtering inquiries - default to 2025-2026
  const [fromDate, setFromDate] = useState<Date | undefined>(new Date(2025, 0, 1)) // Jan 1, 2025
  const [toDate, setToDate] = useState<Date | undefined>(new Date(2026, 11, 31)) // Dec 31, 2026
  const [dateFilterOpen, setDateFilterOpen] = useState(false)

  // Voice input hook
  const { isListening, transcript, startListening, resetTranscript } = useVoiceInput()

  // Email body state
  const [emailBodies, setEmailBodies] = useState<Record<string, string>>({}) // Store email bodies by inquiry ID
  const [fullEmailDialogOpen, setFullEmailDialogOpen] = useState(false)
  const [selectedEmail, setSelectedEmail] = useState<{id: string, body: string} | null>(null)

  // Edit inquiry state
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editingInquiry, setEditingInquiry] = useState<any>(null)
  const [loadingEnquiryDetails, setLoadingEnquiryDetails] = useState(false)

  // Fetch inquiries from API
  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Format dates for API (YYYY-MM-DD HH:mm:ss.SSS)
        const formatDateForAPICall = (date: Date | undefined): string => {
          if (!date) return '2025-01-01 00:00:00.000'
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day} 00:00:00.000`
        }

        const formatEndDate = (date: Date | undefined): string => {
          if (!date) return '2026-12-31 23:59:59.999'
          const year = date.getFullYear()
          const month = String(date.getMonth() + 1).padStart(2, '0')
          const day = String(date.getDate()).padStart(2, '0')
          return `${year}-${month}-${day} 23:59:59.999`
        }

        const requestData = {
          FromDate: formatDateForAPICall(fromDate),
          ToDate: formatEndDate(toDate),
          ApplydateFilter: 'True',
          RadioValue: 'All',
        }

        console.log('📅 Fetching inquiries with request:', requestData)

        const response = await EnquiryAPI.getEnquiries(requestData, null)

        console.log('📊 API Response:', {
          success: response.success,
          totalInquiries: response.data?.length || 0,
          error: response.error
        })

        if (response.success && response.data && response.data.length > 0) {
          console.log('📋 Raw API Data (first 3 inquiries):', response.data.slice(0, 3))
          console.log('📋 All API Data:', response.data)
          console.log('🏷️ Category Data Check:', response.data.map((item: any) => ({
            id: item.EnquiryNo,
            CategoryID: item.CategoryID,
            CategoryName: item.CategoryName
          })))

          // Transform API data to match component structure
          const transformedData = response.data.map((item: any) => ({
            id: item.EnquiryNo,
            enquiryId: item.EnquiryID || item.EnquiryId || 0, // Numeric EnquiryID for updates
            customer: item.ClientName,
            job: item.JobName,
            sku: item.ProductCode || '',
            jobType: item.TypeOfJob || '',
            quantityRange: item.Quantity,
            unit: item.EstimationUnit || 'PCS',
            categoryName: item.CategoryName || '',
            categoryId: item.CategoryID || null,
            segmentName: item.SegmentName || '',
            status: item.Status1 || item.Status || 'Pending', // Use Status1 from API
            priority: 'medium', // API doesn't provide priority, default to medium
            date: item.EnquiryDate1 || item.EnquiryDate,
            dueDate: item.EnquiryDate1 || item.EnquiryDate,
            expectCompletion: item.ExpectCompletion || '',
            clarificationStatus: 'Not Required', // API doesn't provide this
            notes: item.Remark || '',
            kamName: item.SalesRepresentative,
            salesEmployeeId: item.SalesEmployeeID || null,
            ledgerId: item.LedgerID || null,
            hodName: '', // API doesn't provide HOD name
            productionUnitName: item.ProductionUnitName || '',
            productionUnitId: item.ProductionUnitID || null,
            Source: item.Source || '', // Add Source field for Email Scraper detection
            EmailEnquiryId: item.EmailEnquiryId || null, // Add EmailEnquiryId for fetching raw email body
            // Store the full raw item for detailed edit form
            rawData: item,
          }))

          console.log('✅ Transformed Data:', transformedData)
          console.log('✅ Total transformed inquiries:', transformedData.length)

          setInquiries(transformedData)
        } else {
          console.log('⚠️ No inquiries found or API failed')
          setError(response.error || 'No inquiries found')
          setInquiries([])
        }
      } catch (err: any) {
        setError(err.message || 'An error occurred while loading inquiries')
        setInquiries([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchInquiries()
  }, [fromDate, toDate])

  // Update search query when voice transcript changes
  useEffect(() => {
    if (transcript) {
      setSearchQuery(transcript)
      resetTranscript()
    }
  }, [transcript, resetTranscript])

  // Handle edit inquiry - fetch detailed data first
  const handleEditInquiry = async (inquiry: any) => {
    try {
      setLoadingEnquiryDetails(true)

      console.log('📝 Opening edit for inquiry:', inquiry.id, 'EnquiryID:', inquiry.enquiryId)

      // Fetch detailed enquiry data including dimensions and processes
      if (inquiry.enquiryId) {
        const response = await (EnquiryAPI as any).getEnquiryDetails(inquiry.enquiryId, null)

        if (response.success && response.data) {
          console.log('✅ Fetched detailed enquiry data:', response.data)

          // Merge the detailed data with the inquiry
          const detailedInquiry = {
            ...inquiry,
            detailedData: response.data,
          }

          setEditingInquiry(detailedInquiry)
          setEditDialogOpen(true)
        } else {
          console.error('❌ Failed to fetch enquiry details:', response.error)
          // Open with basic data if detailed fetch fails
          setEditingInquiry(inquiry)
          setEditDialogOpen(true)
        }
      } else {
        // No enquiryId, open with basic data
        setEditingInquiry(inquiry)
        setEditDialogOpen(true)
      }
    } catch (error) {
      console.error('❌ Error fetching enquiry details:', error)
      // Open with basic data on error
      setEditingInquiry(inquiry)
      setEditDialogOpen(true)
    } finally {
      setLoadingEnquiryDetails(false)
    }
  }

  // Fetch email body for an inquiry
  const fetchEmailBody = async (inquiry: any) => {
    // Only fetch if source is "Email Scraper"
    if (inquiry.Source !== "Email Scraper") {
      console.log('❌ Source is not Email Scraper:', inquiry.Source)
      return
    }

    // Check if inquiry has EmailEnquiryId
    if (!inquiry.EmailEnquiryId) {
      console.warn('❌ No EmailEnquiryId for inquiry:', inquiry.id)
      return
    }

    // Check if already fetched
    if (emailBodies[inquiry.id]) {
      console.log('✅ Email body already fetched for:', inquiry.id)
      return
    }

    try {
      console.log('📧 Fetching email body for inquiry:', inquiry.id, 'EmailEnquiryId:', inquiry.EmailEnquiryId)
      const response = await (EnquiryAPI as any).getRawEmailBody(inquiry.EmailEnquiryId, null)

      console.log('📧 Email body response:', response)

      if (response.success && response.data) {
        // Extract the actual email body text from the response
        const emailBodyText = typeof response.data === 'string'
          ? response.data
          : response.data.rawEmailBody || response.data.RawEmailBody || ''

        console.log('✅ Setting email body:', emailBodyText)

        setEmailBodies(prev => ({
          ...prev,
          [inquiry.id]: emailBodyText
        }))
      } else {
        console.error('❌ Failed to fetch email body:', response.error)
      }
    } catch (error) {
      console.error('❌ Error fetching email body:', error)
    }
  }

  // Filter data based on user role - KAMs can only see their own data
  // Unassigned inquiries (kamName is null) are visible to all users
  // DISABLED: Showing all inquiries regardless of user role
  const userFilteredInquiries = inquiries

  // Original filtering logic (commented out):
  // const userFilteredInquiries = isRestrictedUser
  //   ? inquiries.filter(inq => {
  //       // Show if no KAM assigned (null/undefined/empty)
  //       if (!inq.kamName || inq.kamName === '') return true
  //       // Show if KAM name is in viewable list
  //       if (viewableKams.includes(inq.kamName)) return true
  //       // Otherwise hide
  //       return false
  //     })
  //   : inquiries

  console.log('🔍 User Role Filtering:', {
    totalInquiries: inquiries.length,
    afterUserFilter: userFilteredInquiries.length,
    isRestrictedUser,
    viewableKams,
    filtered: inquiries.length - userFilteredInquiries.length
  })

  // Get unique HOD and KAM names for filters
  const hodNames = Array.from(new Set(userFilteredInquiries.map(inq => inq.hodName).filter((name): name is string => Boolean(name))))
  const kamNames = Array.from(new Set(userFilteredInquiries.map(inq => inq.kamName).filter((name): name is string => Boolean(name))))

  const filteredInquiries = userFilteredInquiries
    .filter((inquiry) => {
      // Exclude Draft status inquiries
      if (inquiry.status === "Draft") return false

      const matchesSearch = !searchQuery ||
        inquiry.customer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.job?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.quantityRange?.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.jobType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inquiry.kamName && inquiry.kamName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (inquiry.hodName && inquiry.hodName.toLowerCase().includes(searchQuery.toLowerCase()))
      const matchesStatus = statusFilter === "all" || inquiry.status === statusFilter || !inquiry.status || inquiry.status === ""
      const matchesPriority = priorityFilter === "all" || inquiry.priority === priorityFilter || !inquiry.priority
      const matchesHod = hodFilter === "all" || inquiry.hodName === hodFilter || !inquiry.hodName || inquiry.hodName === ""
      const matchesKam = kamFilter === "all" || inquiry.kamName === kamFilter || !inquiry.kamName || inquiry.kamName === ""

      return matchesSearch && matchesStatus && matchesPriority && matchesHod && matchesKam
    })

  console.log('📊 Final Filtering:', {
    afterUserFilter: userFilteredInquiries.length,
    afterAllFilters: filteredInquiries.length,
    filters: {
      searchQuery,
      statusFilter,
      priorityFilter,
      hodFilter,
      kamFilter,
      sortBy
    }
  })

  const sortedInquiries = filteredInquiries
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "due-asc":
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
        case "due-desc":
          return new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
        case "priority":
          const priorityOrder = { high: 0, medium: 1, low: 2 }
          return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder]
        default:
          return 0
      }
    })

  // Pagination calculations
  const totalPages = Math.ceil(sortedInquiries.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedInquiries = sortedInquiries.slice(startIndex, endIndex)

  console.log('📄 Pagination:', {
    totalInquiries: sortedInquiries.length,
    currentPage,
    totalPages,
    showing: paginatedInquiries.length
  })

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, priorityFilter, hodFilter, kamFilter, sortBy])

  return (
    <div className="section-spacing">
      <div className="relative w-full flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Find your inquiries by customer, job, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-12 rounded-2xl border border-border/50 bg-white/90 pl-12 text-base font-medium shadow-[0_10px_30px_-20px_rgba(8,25,55,0.45)] focus-visible:ring-2 focus-visible:ring-primary/40 placeholder:truncate"
          />
        </div>
        <Mic
          onClick={isListening ? undefined : startListening}
          className={`h-6 w-6 cursor-pointer transition-colors duration-200 flex-shrink-0 ${
            isListening
              ? 'text-[#B92221] animate-pulse'
              : 'text-[#005180] hover:text-[#004875]'
          }`}
        />
      </div>

      <Card className="surface-elevated overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#005180] to-[#003d63] hover:bg-gradient-to-r hover:from-[#005180] hover:to-[#003d63]">
                  {!isKAMUser && !isHODUser && (
                    <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                      <div className="flex items-center justify-between">
                        <span>HOD</span>
                        {!isRestrictedUser && (
                          <Select value={hodFilter} onValueChange={setHodFilter}>
                            <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                              <Filter className="h-4 w-4 text-white" />
                            </SelectTrigger>
                            <SelectContent align="start" className="min-w-[150px]">
                              <SelectItem value="all">All HODs</SelectItem>
                              {hodNames.map(hodName => (
                                <SelectItem key={hodName} value={hodName}>{hodName}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </TableHead>
                  )}
                  {!isKAMUser && (
                    <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                      <div className="flex items-center justify-between">
                        <span>KAM Name</span>
                        <Select value={kamFilter} onValueChange={setKamFilter}>
                          <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                            <Filter className="h-4 w-4 text-white" />
                          </SelectTrigger>
                          <SelectContent align="start" className="min-w-[150px]">
                            <SelectItem value="all">All KAMs</SelectItem>
                            {kamNames.map(kamName => (
                              <SelectItem key={kamName} value={kamName}>{kamName}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </TableHead>
                  )}
                  <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    ID / Customer
                  </TableHead>
                  <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Job Name
                  </TableHead>
                  <TableHead className="w-[160px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Job Type
                  </TableHead>
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Category
                  </TableHead>
                  <TableHead className="w-[140px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Quantity
                  </TableHead>
                  <TableHead className="w-[180px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    Production Unit
                  </TableHead>
                  <TableHead className="w-[200px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Status</span>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all [&>svg:last-child]:hidden">
                          <Filter className="h-4 w-4 text-white" />
                        </SelectTrigger>
                        <SelectContent align="start" className="min-w-[150px]">
                          <SelectItem value="all">All Status</SelectItem>
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Costing">Costing</SelectItem>
                          <SelectItem value="Approved">Approved</SelectItem>
                          <SelectItem value="Quoted">Quoted</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </TableHead>
                  <TableHead className="w-[220px] px-6 py-4 text-xs font-bold uppercase tracking-wider text-white">
                    <div className="flex items-center justify-between">
                      <span>Date Range</span>
                      <Dialog open={dateFilterOpen} onOpenChange={setDateFilterOpen}>
                        <DialogTrigger asChild>
                          <button className="h-8 w-8 rounded-md border-none bg-[#003d63]/60 hover:bg-[#004875]/80 p-0 flex items-center justify-center shadow-sm transition-all">
                            <CalendarIcon className="h-4 w-4 text-white" />
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px]">
                          <DialogHeader>
                            <DialogTitle className="text-[#005180]">Filter Inquiries by Date</DialogTitle>
                            <DialogDescription>
                              Select a date range to filter the inquiries list
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-6 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="from-date" className="text-sm font-medium text-[#005180]">
                                From Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="from-date"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !fromDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={fromDate}
                                    onSelect={setFromDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="to-date" className="text-sm font-medium text-[#005180]">
                                To Date
                              </Label>
                              <Popover>
                                <PopoverTrigger asChild>
                                  <Button
                                    id="to-date"
                                    variant="outline"
                                    className={cn(
                                      "w-full justify-start text-left font-normal",
                                      !toDate && "text-muted-foreground"
                                    )}
                                  >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                                  </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                    mode="single"
                                    selected={toDate}
                                    onSelect={setToDate}
                                    initialFocus
                                  />
                                </PopoverContent>
                              </Popover>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <div className="text-sm text-muted-foreground">
                                {isLoading ? 'Loading...' : `${inquiries.length} inquiries found`}
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  onClick={() => {
                                    setFromDate(new Date(2025, 0, 1))
                                    setToDate(new Date(2026, 11, 31))
                                  }}
                                  variant="outline"
                                >
                                  Reset
                                </Button>
                                <Button
                                  onClick={() => setDateFilterOpen(false)}
                                  className="bg-[#005180] hover:bg-[#004875] text-white"
                                >
                                  Apply
                                </Button>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#005180] border-t-transparent"></div>
                        <p className="text-sm text-muted-foreground">Loading inquiries...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : error ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <p className="text-sm text-[#B92221] font-medium">Failed to load inquiries</p>
                        <p className="text-xs text-muted-foreground">{error}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.location.reload()}
                          className="mt-2"
                        >
                          Retry
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : paginatedInquiries.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={13} className="h-32 text-center">
                      <p className="text-sm text-muted-foreground">No inquiries found</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedInquiries.map((inquiry, index) => (
                  <Dialog key={inquiry.id}>
                    <DialogTrigger asChild>
                      <TableRow
                        className="group cursor-pointer border-b border-border/40 bg-white transition-all duration-200 even:bg-[#B92221]/5 hover:bg-[#78BE20]/20 hover:shadow-md hover:scale-[1.01] active:scale-[0.99]"
                      >
                        {!isKAMUser && !isHODUser && (
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-foreground">{inquiry.hodName || "N/A"}</p>
                          </TableCell>
                        )}
                        {!isKAMUser && (
                          <TableCell className="py-4">
                            <p className="text-sm font-medium text-foreground">{inquiry.kamName || "N/A"}</p>
                          </TableCell>
                        )}
                        <TableCell className="whitespace-nowrap py-4">
                          <div className="leading-[1.15]">
                            <p className="text-sm font-semibold text-primary">{inquiry.id}</p>
                            <TruncatedText text={inquiry.customer} limit={25} className="text-sm font-medium text-foreground/80" />
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="leading-[1.15]">
                            <TruncatedText text={inquiry.job} limit={30} className="text-sm font-semibold text-foreground" />
                            <p className="text-xs text-muted-foreground">SKU {inquiry.sku}</p>
                          </div>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-primary">
                            {inquiry.jobType}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs text-muted-foreground">
                            {inquiry.categoryName || '-'}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-sm font-medium">
                            {inquiry.quantityRange} <span className="text-xs text-muted-foreground">{inquiry.unit}</span>
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <p className="text-xs text-muted-foreground">
                            {inquiry.productionUnitName || '-'}
                          </p>
                        </TableCell>
                        <TableCell className="py-4">
                          <Badge className={`${getStatusBadge(inquiry.status)} border`}>{inquiry.status}</Badge>
                        </TableCell>
                        <TableCell className="py-4">
                          <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4 text-[#005180]" />
                            <span className="text-sm font-medium text-gray-700">{inquiry.date}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    </DialogTrigger>
                    <DialogContent className="surface-elevated max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
                      <DialogHeader className="border-b-0 bg-gradient-to-r from-slate-100 to-gray-100 px-6 py-5 flex-shrink-0 text-center">
                        <DialogTitle className="text-xl font-bold text-gray-900">{inquiry.job}</DialogTitle>
                        <DialogDescription className="text-sm font-semibold text-gray-600">{inquiry.id}</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-0 overflow-y-auto overflow-x-hidden flex-1">
                        {/* Customer Section */}
                        <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Customer</Label>
                          <p className="text-base font-semibold text-gray-900">{inquiry.customer}</p>
                        </div>

                        {/* Row 1: Status & Priority */}
                        <div className="bg-white px-6 py-4 border-b border-gray-200 grid grid-cols-2 gap-6">
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Status</Label>
                            <Badge className={`${getStatusBadge(inquiry.status)} border text-sm px-3 py-1`}>{inquiry.status}</Badge>
                          </div>
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Priority</Label>
                            <Badge className={`${getPriorityBadge(inquiry.priority)} border capitalize text-sm px-3 py-1`}>
                              {inquiry.priority}
                            </Badge>
                          </div>
                        </div>

                        {/* Row 2: KAM Name & Clarification */}
                        <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200 grid grid-cols-2 gap-6">
                          {!isKAMUser && (
                            <div>
                              <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">KAM Name</Label>
                              <p className="text-base font-semibold text-gray-900">{inquiry.kamName || "N/A"}</p>
                            </div>
                          )}
                          <div className={!isKAMUser ? "" : "col-span-2"}>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Clarification</Label>
                            <p className="text-base font-semibold text-gray-900">{inquiry.clarificationStatus}</p>
                          </div>
                        </div>

                        {/* Row 3: Job Type & SKU */}
                        <div className="bg-white px-6 py-4 border-b border-gray-200 grid grid-cols-2 gap-6">
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Job Type</Label>
                            <p className="text-sm font-bold uppercase tracking-wider text-[#005180]">{inquiry.jobType}</p>
                          </div>
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">SKU</Label>
                            <p className="text-base font-semibold text-gray-900">{inquiry.sku}</p>
                          </div>
                        </div>

                        {/* Row 4: Quantity & Unit */}
                        <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200 grid grid-cols-2 gap-6">
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Quantity</Label>
                            <p className="text-base font-semibold text-gray-900">{inquiry.quantityRange} <span className="text-xs text-muted-foreground">{inquiry.unit}</span></p>
                          </div>
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Category</Label>
                            <p className="text-base font-semibold text-gray-900">{inquiry.categoryName || '-'}</p>
                          </div>
                        </div>

                        {/* Row 5: Date & Due Date */}
                        <div className="bg-white px-6 py-4 border-b border-gray-200 grid grid-cols-2 gap-6">
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Date</Label>
                            <p className="text-base font-semibold text-gray-900">{inquiry.date}</p>
                          </div>
                          <div>
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Due Date</Label>
                            <p className="text-base font-semibold text-gray-900">{inquiry.dueDate}</p>
                          </div>
                        </div>

                        {/* Email Body Section - Only show if Source is "Email Scraper" */}
                        {inquiry.Source === "Email Scraper" && (
                          <div className="bg-blue-50/50 px-6 py-4 border-b border-gray-200">
                            <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Email Body</Label>
                            {emailBodies[inquiry.id] ? (
                              <div className="space-y-2">
                                <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
                                  {getEmailPreview(emailBodies[inquiry.id])}
                                </p>
                                {emailBodies[inquiry.id].split('\n').filter((l: string) => l.trim()).length > 2 && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      setSelectedEmail({ id: inquiry.id, body: emailBodies[inquiry.id] })
                                      setFullEmailDialogOpen(true)
                                    }}
                                    className="text-xs"
                                  >
                                    Read Full Email
                                  </Button>
                                )}
                              </div>
                            ) : (
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => fetchEmailBody(inquiry)}
                                className="bg-[#005180] hover:bg-[#004170] text-white"
                              >
                                View Email Body
                              </Button>
                            )}
                          </div>
                        )}

                        {/* Notes Section */}
                        <div className="bg-white px-6 py-4">
                          <Label className="text-xs uppercase tracking-wider font-bold text-gray-500 mb-2 block">Notes</Label>
                          <TruncatedText text={inquiry.notes} limit={200} className="text-sm leading-relaxed text-gray-700 block" />
                        </div>
                      </div>

                      {/* Dialog Footer with Edit Button */}
                      <DialogFooter className="border-t border-gray-200 px-6 py-4 bg-gray-50 flex-shrink-0">
                        <Button
                          onClick={() => handleEditInquiry(inquiry)}
                          disabled={loadingEnquiryDetails}
                          className="bg-[#005180] hover:bg-[#004170] text-white"
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          {loadingEnquiryDetails ? 'Loading...' : 'Edit Enquiry'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-center border-t border-border/40 bg-muted/20 px-4 py-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-8 px-3"
              >
                Previous
              </Button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 w-8 ${currentPage === page ? "bg-primary text-primary-foreground" : ""}`}
                  >
                    {page}
                  </Button>
                ))}
              </div>
              <div className="md:hidden text-sm text-muted-foreground">
                {currentPage} / {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-8 px-3"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Full Email Body Dialog */}
      <Dialog open={fullEmailDialogOpen} onOpenChange={setFullEmailDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>Full Email Body</DialogTitle>
            <DialogDescription>
              {selectedEmail?.id}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto">
            <pre className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap font-sans">
              {selectedEmail?.body}
            </pre>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Inquiry Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-7xl max-h-[95vh] p-0 flex flex-col">
          <DialogHeader className="border-b border-gray-200 px-6 py-4 bg-gradient-to-r from-slate-100 to-gray-100 flex-shrink-0">
            <DialogTitle className="text-xl font-bold text-gray-900">Edit Enquiry</DialogTitle>
            <DialogDescription className="text-sm font-semibold text-gray-600">
              {editingInquiry?.id} - {editingInquiry?.job}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6">
            {editingInquiry && (
              <NewInquiryForm
                editMode={true}
                initialData={editingInquiry}
                onSaveSuccess={() => {
                  setEditDialogOpen(false)
                  setEditingInquiry(null)
                  // Refresh inquiry list
                  window.location.reload()
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
