import { z } from 'zod';

export const quotationSchema = z.object({
  // --- TOP HEADER FIELDS ---
  inquiryNo: z.string().optional(),
  quotationNo: z.string().min(1, "Quotation No is required"),
  validFrom: z.string().min(1, "Valid From date is required"),
  validTill: z.string().min(1, "Valid Till date is required"),
  organization: z.string().min(1, "Organization is required"),
  usability: z.string().min(1, "Select Usability"),
  lineOfBusiness: z.string().min(1, "LOB is required"),
  location: z.string().min(1, "Location is required"),
  pricingBy: z.string().optional(),
  salesCoor: z.string().min(1, "Select Sales Coordinator"),

  // --- CARGO DETAILS ---
  lead: z.string().min(1, "Lead No is required"),
  transportMode: z.string().min(1, "Mode is required"),
  transportType: z.string().min(1, "Transport Type is required"),
  commodity: z.string().min(1, "Select Commodity"),
  numPackages: z.number().min(1, "Packages must be > 0"),
  grossWeightKg: z.number().min(0.1, "Gross Weight is required"),
  volumeWeight: z.number().optional(),

  // --- FORWARDING & MOVEMENT ---
  movement: z.string().min(1, "Movement Type is required"),
  placeOfReceipt: z.string().min(1, "Place of Receipt is required"),
  originPOL: z.string().min(1, "Origin / POL is required"),
  placeOfDelivery: z.string().min(1, "Place of Delivery is required"),
  podFinalDest: z.string().min(1, "POD / Final Dest is required"),

  // --- TABLES (Revenue & Cost) ---
  revenueData: z.array(z.object({
    lob: z.string().min(1, "LOB required"),
    chargeName: z.string().min(1, "Charge name required"),
    rate: z.number().min(0.01, "Rate required"),
    currency: z.string().min(1, "Cur required")
  })).min(1, "Add at least one Revenue row"),

  costData: z.array(z.object({
    lob: z.string().min(1, "LOB required"),
    chargeName: z.string().min(1, "Charge name required"),
    rate: z.number().min(0.01, "Rate required"),
    currency: z.string().min(1, "Cur required")
  })).min(1, "Add at least one Cost row"),
});