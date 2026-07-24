import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "../../environments/environment";
import { ChargeDto } from "./Charge.service";
import { TaxRate } from "./tax-rate.service";

export interface GstLineRequest {
  chargeCode: string;
  isTaxable: boolean;
  amountInr: number;
  polCountryCode: string;
  podCountryCode: string;
  polCity: string;
  podCity: string;
  polState?: string;
  podState?: string;
  branchState: string;
  isZeroRated?: boolean;
  isRcmApplicable?: boolean;
}

export interface GstLineResult {
  sacHsn: string;
  taxableValue: number;
  nonTaxableValue: number;
  taxName: string;
  taxPercent: number;
  cgstPercent: number;
  sgstPercent: number;
  igstPercent: number;
  cgst: number;
  sgst: number;
  igst: number;
  taxAmount: number;
  totalAmount: number;
  placeOfSupplyState: string;
  isZeroRated: boolean;
  isRcmApplicable: boolean;
  shipmentDirection: "DOMESTIC" | "EXPORT" | "IMPORT" | "OTHER";
}


const LEGISLATURE_LESS_UTS = new Set(
  [
    "Chandigarh",
    "Lakshadweep",
    "Daman and Diu",
    "Daman & Diu",
    "Dadra and Nagar Haveli",
    "Dadra & Nagar Haveli",
    "Dadra and Nagar Haveli and Daman and Diu",
    "Andaman and Nicobar Islands",
    "Andaman & Nicobar Islands",
    "Andaman and Nicobar",
    "Ladakh",
  ].map((s) => normalizeState(s)),
);

function isLegislatureLessUT(state: string): boolean {
  if (!state) return false;
  return LEGISLATURE_LESS_UTS.has(normalizeState(state));
}

const CITY_TO_STATE: Record<string, string> = {
  Mumbai: "Maharashtra",
  "Nhava Sheva": "Maharashtra",
  JNPT: "Maharashtra",
  Chennai: "Tamil Nadu",
  Madras: "Tamil Nadu",
  Delhi: "Delhi",
  "New Delhi": "Delhi",
  "IGI Delhi": "Delhi",
  Kolkata: "West Bengal",
  Calcutta: "West Bengal",
  Bangalore: "Karnataka",
  Bengaluru: "Karnataka",
  Hyderabad: "Telangana",
  Ahmedabad: "Gujarat",
  Pune: "Maharashtra",
  Cochin: "Kerala",
  Kochi: "Kerala",
  Jaipur: "Rajasthan",
  Chandigarh: "Punjab",
  Ludhiana: "Punjab",
  Amritsar: "Punjab",
  Surat: "Gujarat",
  Vizag: "Andhra Pradesh",
  Visakhapatnam: "Andhra Pradesh",
  Goa: "Goa",
  Panaji: "Goa",
  Lucknow: "Uttar Pradesh",
  Kanpur: "Uttar Pradesh",
  Indore: "Madhya Pradesh",
  Bhopal: "Madhya Pradesh",
  Patna: "Bihar",
  Ranchi: "Jharkhand",
  Guwahati: "Assam",
  Bhubaneswar: "Odisha",
  Nagpur: "Maharashtra",
  Tuticorin: "Tamil Nadu",
  Mundra: "Gujarat",
  Kandla: "Gujarat",
  Hazira: "Gujarat",
  Pipavav: "Gujarat",
  Krishnapatnam: "Andhra Pradesh",
  Ennore: "Tamil Nadu",
  Paradip: "Odisha",
  Haldia: "West Bengal",
  Varanasi: "Uttar Pradesh",
};

@Injectable({ providedIn: "root" })
export class GstCalculationService {
  private apiUrl = `${environment.apiUrl}/Gst`;

  constructor(private http: HttpClient) {}

  calculateLine(request: GstLineRequest): Observable<GstLineResult> {
    return this.http.post<GstLineResult>(
      `${this.apiUrl}/calculate-line`,
      request,
    );
  }

  /** Instant client-side GST calculation — runs the moment charge/rate/status/port changes. Works for ANY country lane. */
  calculateLineLocal(
    request: GstLineRequest,
    chargeMaster?: ChargeDto | null,
    taxRates?: TaxRate[],
  ): GstLineResult {
    console.log("calculateLineLocal input:", {
      request,
      chargeMaster,
      taxRates,
    });

    const amount = round2(request.amountInr || 0);

    const polIndia = isIndia(request.polCountryCode);
    const podIndia = isIndia(request.podCountryCode);
    const shipmentDirection = resolveShipmentDirection(polIndia, podIndia);

    const empty: GstLineResult = {
      sacHsn: "",
      taxableValue: 0,
      nonTaxableValue: amount,
      taxName: "",
      taxPercent: 0,
      cgstPercent: 0,
      sgstPercent: 0,
      igstPercent: 0,
      cgst: 0,
      sgst: 0,
      igst: 0,
      taxAmount: 0,
      totalAmount: amount,
      placeOfSupplyState: "",
      isZeroRated: false,
      isRcmApplicable: false,
      shipmentDirection,
    };

    // Non-taxable / zero amount → nothing to compute
    if (!request.isTaxable || amount <= 0) return empty;

    // ✅ WORLDWIDE RULE: Indian GST (CGST/SGST/IGST) only applies when India is
    // POL or POD. Any lane not touching India (e.g. Singapore→UAE, USA→Germany)
    // is treated as OUT OF SCOPE for Indian GST — clean pass-through, no tax.
    if (shipmentDirection === "OTHER") {
      return {
        ...empty,
        taxableValue: 0,
        nonTaxableValue: amount,
        totalAmount: amount,
        taxName: "Out of GST Scope (Non-India Lane)",
      };
    }

    const charge = chargeMaster;
    if (!charge) {
      return {
        ...empty,
        taxableValue: amount,
        nonTaxableValue: 0,
        totalAmount: amount,
      };
    }

    const gstRow = charge.taxRows?.find(
      (t) => t.key?.toLowerCase() === "gst" && t.checked,
    );
    if (!gstRow?.categoryCode) {
      return {
        ...empty,
        taxableValue: amount,
        nonTaxableValue: 0,
        totalAmount: amount,
      };
    }

    const taxRate = (taxRates ?? [])
      .filter(
        (t) =>
          t.status === "Applicable" && t.categoryCode === gstRow.categoryCode,
      )
      .sort(
        (a, b) =>
          new Date(b.applicableDate).getTime() -
          new Date(a.applicableDate).getTime(),
      )[0];

    if (!taxRate) {
      return {
        ...empty,
        taxableValue: amount,
        nonTaxableValue: 0,
        totalAmount: amount,
      };
    }

    const placeOfSupply = resolvePlaceOfSupplyState(
      request.polCountryCode,
      request.podCountryCode,
      request.polCity,
      request.podCity,
      request.polState,
      request.podState,
    );

    // ✅ Seedha polState vs podState (placeOfSupply) compare, branchState use nahi
    const polStateResolved =
      request.polState || resolveStateFromCity(request.polCity);

    const useIntraState =
      shipmentDirection === "DOMESTIC" &&
      shouldUseIntraStateTax(polStateResolved, placeOfSupply);

let cgstRate = taxRate.cgst;
// ✅ FIX: UTGST sirf legislature-less Union Territories me lagta hai
const isUT = isLegislatureLessUT(placeOfSupply);
let sgstRate = isUT ? taxRate.utgst : taxRate.sgst;
let igstRate = taxRate.igst;

    if (gstRow.override && gstRow.percentage > 0) {
      if (useIntraState) {
        cgstRate = gstRow.percentage / 2;
        sgstRate = gstRow.percentage / 2;
        igstRate = 0;
      } else {
        igstRate = gstRow.percentage;
        cgstRate = 0;
        sgstRate = 0;
      }
    }

    const liabilityPercent =
      taxRate.liabilitySupplier && taxRate.liabilitySupplier > 0
        ? taxRate.liabilitySupplier
        : 100;
    const liabilityFactor = liabilityPercent / 100;

    cgstRate = round2(cgstRate * liabilityFactor);
    sgstRate = round2(sgstRate * liabilityFactor);
    igstRate = round2(igstRate * liabilityFactor);

    let taxName = "IGST";
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let taxPercent = 0;
    let cgstPercent = 0;
    let sgstPercent = 0;
    let igstPercent = 0;

    if (useIntraState) {
       taxName = isUT ? "CGST / UTGST" : "CGST / SGST";
      cgst = round2((amount * cgstRate) / 100);
      sgst = round2((amount * sgstRate) / 100);
      cgstPercent = cgstRate;
      sgstPercent = sgstRate;
      taxPercent = round2(cgstRate + sgstRate);
    } else {
      igst = round2((amount * igstRate) / 100);
      igstPercent = igstRate;
      taxPercent = igstRate;
    }

    let taxAmount = round2(cgst + sgst + igst);
    let totalAmount = round2(amount + taxAmount);

    const isZeroRated = shipmentDirection === "EXPORT" && !!request.isZeroRated;
    const isRcmApplicable =
      shipmentDirection === "IMPORT" && !!request.isRcmApplicable;

    if (isZeroRated) {
      cgst = 0;
      sgst = 0;
      igst = 0;
      cgstPercent = 0;
      sgstPercent = 0;
      igstPercent = 0;
      taxAmount = 0;
      taxPercent = 0;
      taxName = "IGST (Zero-Rated / LUT)";
      totalAmount = amount;
    } else if (isRcmApplicable) {
      taxName = `${taxName} (RCM - Recipient Liable)`;
      totalAmount = amount;
    }

    return {
      sacHsn: `${taxRate.gstType} ${taxRate.categoryCode}`.trim(),
      taxableValue: amount,
      nonTaxableValue: 0,
      taxName,
      taxPercent,
      cgstPercent,
      sgstPercent,
      igstPercent,
      cgst,
      sgst,
      igst,
      taxAmount,
      totalAmount,
      placeOfSupplyState: placeOfSupply,
      isZeroRated,
      isRcmApplicable,
      shipmentDirection,
    };
  }

  isChargeTaxableByDefault(charge: ChargeDto): boolean {
    const gstRow = charge.taxRows?.find(
      (t) => t.key?.toLowerCase() === "gst" && t.checked,
    );
    if (!gstRow) return false;
    return (
      gstRow.taxable === "Taxable" || gstRow.taxable === "Pure Agent Optional"
    );
  }
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function isIndia(codeOrName: string): boolean {
  const v = (codeOrName || "").trim();
  if (!v) return false;
  const upper = v.toUpperCase();
  if (upper === "IN" || upper === "IND" || upper === "INDIA") return true;
  if (upper.includes("+91")) return true;
  if (upper.includes("IN") && v.length <= 5) return true;
  return false;
}

function resolveShipmentDirection(
  polIndia: boolean,
  podIndia: boolean,
): "DOMESTIC" | "EXPORT" | "IMPORT" | "OTHER" {
  if (polIndia && podIndia) return "DOMESTIC";
  if (polIndia && !podIndia) return "EXPORT";
  if (!polIndia && podIndia) return "IMPORT";
  return "OTHER";
}

function resolveStateFromCity(city: string): string {
  if (!city) return "";
  const trimmed = city.trim();
  if (CITY_TO_STATE[trimmed]) return CITY_TO_STATE[trimmed];
  for (const [key, state] of Object.entries(CITY_TO_STATE)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase())) return state;
  }
  return trimmed;
}

function resolvePlaceOfSupplyState(
  polCountry: string,
  podCountry: string,
  polCity: string,
  podCity: string,
  polState?: string,
  podState?: string,
): string {
  const polIndia = isIndia(polCountry);
  const podIndia = isIndia(podCountry);

  if (polIndia && !podIndia) return polState || resolveStateFromCity(polCity);
  if (!polIndia && podIndia) return podState || resolveStateFromCity(podCity);
  if (polIndia && podIndia) return podState || resolveStateFromCity(podCity);

  return (
    podState ||
    resolveStateFromCity(podCity) ||
    polState ||
    resolveStateFromCity(polCity)
  );
}

function shouldUseIntraStateTax(polState: string, podState: string): boolean {
  if (!polState || !podState) return false;
  return normalizeState(polState) === normalizeState(podState);
}

function normalizeState(state: string): string {
  return state.trim().toLowerCase().replace(/\s+/g, "").replace(/&/g, "and");
}