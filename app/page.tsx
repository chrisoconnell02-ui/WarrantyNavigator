"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Session } from "@supabase/supabase-js";
import { Car, CalendarClock, CreditCard, Gauge, ScanLine, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const MODEL_LABELS: Record<string, string> = {
  CRV: "CR-V",
  HRV: "HR-V",
  F150: "F-150",
  F250: "F-250",
  F350: "F-350",
  CX5: "CX-5",
  CX30: "CX-30",
  CX50: "CX-50",
  CX90: "CX-90",
  RAM1500: "RAM 1500",
  GrandCherokee: "Grand Cherokee",
  Wagoneer: "Wagoneer",
  BroncoSport: "Bronco Sport",
  MachE: "Mustang Mach-E",
  BlazerEV: "Blazer EV",
  GrandHighlander: "Grand Highlander",
  FourRunner: "4Runner",
  Silverado1500: "Silverado 1500",
  Silverado2500: "Silverado 2500",
  Sierra1500: "Sierra 1500",
  YukonXL: "Yukon XL",
  SantaFe: "Santa Fe"
};

type LimitedCoverage = {
  name: string;
  years: number;
  miles: number;
  note: string;
};

type WarrantyData = {
  factoryYears: number;
  factoryMiles: number;
  powertrainYears: number;
  powertrainMiles: number;
  limitedCoverages: LimitedCoverage[];
};

type VehicleLibrary = Record<string, Record<string, Record<string, WarrantyData>>>;

type AuthMode = "sign-in" | "sign-up";

type PlannerSnapshot = {
  id: string;
  snapshot_name: string;
  vin: string | null;
  vehicle_year: number;
  make: string;
  model: string;
  vehicle_name: string;
  miles_at_origination: number;
  factory_years: number;
  factory_miles: number;
  powertrain_years: number;
  powertrain_miles: number;
  loan_term_months: number;
  annual_mileage: number;
  ownership_years: number;
  show_vsc_overlay: boolean;
  vsc_years: number;
  vsc_miles: number;
  created_at: string;
};

const STANDARD_WARRANTY: WarrantyData = {
  factoryYears: 3,
  factoryMiles: 36000,
  powertrainYears: 5,
  powertrainMiles: 60000,
  limitedCoverages: []
};

const HYUNDAI_KIA_WARRANTY: WarrantyData = {
  factoryYears: 5,
  factoryMiles: 60000,
  powertrainYears: 10,
  powertrainMiles: 100000,
  limitedCoverages: [
    {
      name: "Audio / Navigation / Infotainment",
      years: 3,
      miles: 36000,
      note: "Some OEM electronics and infotainment items may have shorter factory coverage than the main basic warranty."
    }
  ]
};

function withWarranty(base: WarrantyData, overrides: Partial<WarrantyData> = {}): WarrantyData {
  return {
    ...base,
    ...overrides,
    limitedCoverages: overrides.limitedCoverages ?? base.limitedCoverages ?? []
  };
}

const VEHICLE_LIBRARY: VehicleLibrary = {
  "2026": {
    Toyota: {
      Camry: withWarranty(STANDARD_WARRANTY),
      Corolla: withWarranty(STANDARD_WARRANTY),
      RAV4: withWarranty(STANDARD_WARRANTY),
      Highlander: withWarranty(STANDARD_WARRANTY),
      GrandHighlander: withWarranty(STANDARD_WARRANTY),
      Tacoma: withWarranty(STANDARD_WARRANTY),
      Tundra: withWarranty(STANDARD_WARRANTY),
      FourRunner: withWarranty(STANDARD_WARRANTY)
    },
    Honda: {
      Civic: withWarranty(STANDARD_WARRANTY),
      Accord: withWarranty(STANDARD_WARRANTY),
      CRV: withWarranty(STANDARD_WARRANTY),
      HRV: withWarranty(STANDARD_WARRANTY),
      Pilot: withWarranty(STANDARD_WARRANTY),
      Passport: withWarranty(STANDARD_WARRANTY),
      Odyssey: withWarranty(STANDARD_WARRANTY)
    },
    Ford: {
      F150: withWarranty(STANDARD_WARRANTY),
      F250: withWarranty(STANDARD_WARRANTY),
      F350: withWarranty(STANDARD_WARRANTY),
      Escape: withWarranty(STANDARD_WARRANTY),
      Explorer: withWarranty(STANDARD_WARRANTY),
      Expedition: withWarranty(STANDARD_WARRANTY),
      BroncoSport: withWarranty(STANDARD_WARRANTY),
      Maverick: withWarranty(STANDARD_WARRANTY),
      MachE: withWarranty(STANDARD_WARRANTY)
    },
    Chevrolet: {
      Silverado1500: withWarranty(STANDARD_WARRANTY),
      Silverado2500: withWarranty(STANDARD_WARRANTY),
      Equinox: withWarranty(STANDARD_WARRANTY),
      Traverse: withWarranty(STANDARD_WARRANTY),
      Tahoe: withWarranty(STANDARD_WARRANTY),
      Suburban: withWarranty(STANDARD_WARRANTY),
      Trax: withWarranty(STANDARD_WARRANTY),
      BlazerEV: withWarranty(STANDARD_WARRANTY)
    },
    GMC: {
      Sierra1500: withWarranty(STANDARD_WARRANTY),
      Terrain: withWarranty(STANDARD_WARRANTY),
      Acadia: withWarranty(STANDARD_WARRANTY),
      Yukon: withWarranty(STANDARD_WARRANTY),
      YukonXL: withWarranty(STANDARD_WARRANTY)
    },
    Hyundai: {
      Elantra: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sonata: withWarranty(HYUNDAI_KIA_WARRANTY),
      Tucson: withWarranty(HYUNDAI_KIA_WARRANTY),
      SantaFe: withWarranty(HYUNDAI_KIA_WARRANTY),
      Palisade: withWarranty(HYUNDAI_KIA_WARRANTY)
    },
    Kia: {
      K4: withWarranty(HYUNDAI_KIA_WARRANTY),
      K5: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sportage: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sorento: withWarranty(HYUNDAI_KIA_WARRANTY),
      Telluride: withWarranty(HYUNDAI_KIA_WARRANTY),
      Forte: withWarranty(HYUNDAI_KIA_WARRANTY)
    },
    Nissan: {
      Altima: withWarranty(STANDARD_WARRANTY),
      Sentra: withWarranty(STANDARD_WARRANTY),
      Rogue: withWarranty(STANDARD_WARRANTY),
      Pathfinder: withWarranty(STANDARD_WARRANTY),
      Frontier: withWarranty(STANDARD_WARRANTY)
    },
    Subaru: {
      Crosstrek: withWarranty(STANDARD_WARRANTY),
      Forester: withWarranty(STANDARD_WARRANTY),
      Outback: withWarranty(STANDARD_WARRANTY),
      Ascent: withWarranty(STANDARD_WARRANTY),
      Legacy: withWarranty(STANDARD_WARRANTY)
    },
    Mazda: {
      Mazda3: withWarranty(STANDARD_WARRANTY),
      CX30: withWarranty(STANDARD_WARRANTY),
      CX5: withWarranty(STANDARD_WARRANTY),
      CX50: withWarranty(STANDARD_WARRANTY),
      CX90: withWarranty(STANDARD_WARRANTY)
    },
    Jeep: {
      Wrangler: withWarranty(STANDARD_WARRANTY),
      GrandCherokee: withWarranty(STANDARD_WARRANTY),
      Compass: withWarranty(STANDARD_WARRANTY),
      Wagoneer: withWarranty(STANDARD_WARRANTY)
    },
    RAM: {
      RAM1500: withWarranty(STANDARD_WARRANTY)
    }
  },
  "2025": {
    Toyota: {
      Camry: withWarranty(STANDARD_WARRANTY),
      Corolla: withWarranty(STANDARD_WARRANTY),
      RAV4: withWarranty(STANDARD_WARRANTY),
      Highlander: withWarranty(STANDARD_WARRANTY),
      GrandHighlander: withWarranty(STANDARD_WARRANTY),
      Tacoma: withWarranty(STANDARD_WARRANTY),
      Tundra: withWarranty(STANDARD_WARRANTY),
      FourRunner: withWarranty(STANDARD_WARRANTY)
    },
    Honda: {
      Civic: withWarranty(STANDARD_WARRANTY),
      Accord: withWarranty(STANDARD_WARRANTY),
      CRV: withWarranty(STANDARD_WARRANTY),
      HRV: withWarranty(STANDARD_WARRANTY),
      Pilot: withWarranty(STANDARD_WARRANTY),
      Passport: withWarranty(STANDARD_WARRANTY),
      Odyssey: withWarranty(STANDARD_WARRANTY)
    },
    Ford: {
      F150: withWarranty(STANDARD_WARRANTY),
      F250: withWarranty(STANDARD_WARRANTY),
      F350: withWarranty(STANDARD_WARRANTY),
      Escape: withWarranty(STANDARD_WARRANTY),
      Explorer: withWarranty(STANDARD_WARRANTY),
      Expedition: withWarranty(STANDARD_WARRANTY),
      BroncoSport: withWarranty(STANDARD_WARRANTY),
      Maverick: withWarranty(STANDARD_WARRANTY),
      MachE: withWarranty(STANDARD_WARRANTY)
    },
    Chevrolet: {
      Silverado1500: withWarranty(STANDARD_WARRANTY),
      Silverado2500: withWarranty(STANDARD_WARRANTY),
      Equinox: withWarranty(STANDARD_WARRANTY),
      Traverse: withWarranty(STANDARD_WARRANTY),
      Tahoe: withWarranty(STANDARD_WARRANTY),
      Suburban: withWarranty(STANDARD_WARRANTY),
      Trax: withWarranty(STANDARD_WARRANTY),
      BlazerEV: withWarranty(STANDARD_WARRANTY)
    },
    GMC: {
      Sierra1500: withWarranty(STANDARD_WARRANTY),
      Terrain: withWarranty(STANDARD_WARRANTY),
      Acadia: withWarranty(STANDARD_WARRANTY),
      Yukon: withWarranty(STANDARD_WARRANTY),
      YukonXL: withWarranty(STANDARD_WARRANTY)
    },
    Hyundai: {
      Elantra: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sonata: withWarranty(HYUNDAI_KIA_WARRANTY),
      Tucson: withWarranty(HYUNDAI_KIA_WARRANTY),
      SantaFe: withWarranty(HYUNDAI_KIA_WARRANTY),
      Palisade: withWarranty(HYUNDAI_KIA_WARRANTY)
    },
    Kia: {
      Forte: withWarranty(HYUNDAI_KIA_WARRANTY),
      K5: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sportage: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sorento: withWarranty(HYUNDAI_KIA_WARRANTY),
      Telluride: withWarranty(HYUNDAI_KIA_WARRANTY)
    },
    Nissan: {
      Altima: withWarranty(STANDARD_WARRANTY),
      Sentra: withWarranty(STANDARD_WARRANTY),
      Rogue: withWarranty(STANDARD_WARRANTY),
      Pathfinder: withWarranty(STANDARD_WARRANTY),
      Frontier: withWarranty(STANDARD_WARRANTY)
    },
    Subaru: {
      Crosstrek: withWarranty(STANDARD_WARRANTY),
      Forester: withWarranty(STANDARD_WARRANTY),
      Outback: withWarranty(STANDARD_WARRANTY),
      Ascent: withWarranty(STANDARD_WARRANTY),
      Legacy: withWarranty(STANDARD_WARRANTY)
    },
    Mazda: {
      Mazda3: withWarranty(STANDARD_WARRANTY),
      CX30: withWarranty(STANDARD_WARRANTY),
      CX5: withWarranty(STANDARD_WARRANTY),
      CX50: withWarranty(STANDARD_WARRANTY),
      CX90: withWarranty(STANDARD_WARRANTY)
    },
    Jeep: {
      Wrangler: withWarranty(STANDARD_WARRANTY),
      GrandCherokee: withWarranty(STANDARD_WARRANTY),
      Compass: withWarranty(STANDARD_WARRANTY),
      Wagoneer: withWarranty(STANDARD_WARRANTY)
    },
    RAM: {
      RAM1500: withWarranty(STANDARD_WARRANTY)
    }
  },
  "2024": {
    Toyota: {
      Camry: withWarranty(STANDARD_WARRANTY),
      Corolla: withWarranty(STANDARD_WARRANTY),
      RAV4: withWarranty(STANDARD_WARRANTY),
      Highlander: withWarranty(STANDARD_WARRANTY),
      Tacoma: withWarranty(STANDARD_WARRANTY),
      Tundra: withWarranty(STANDARD_WARRANTY),
      FourRunner: withWarranty(STANDARD_WARRANTY)
    },
    Honda: {
      Civic: withWarranty(STANDARD_WARRANTY),
      Accord: withWarranty(STANDARD_WARRANTY),
      CRV: withWarranty(STANDARD_WARRANTY),
      HRV: withWarranty(STANDARD_WARRANTY),
      Pilot: withWarranty(STANDARD_WARRANTY),
      Passport: withWarranty(STANDARD_WARRANTY),
      Odyssey: withWarranty(STANDARD_WARRANTY)
    },
    Ford: {
      F150: withWarranty(STANDARD_WARRANTY),
      F250: withWarranty(STANDARD_WARRANTY),
      F350: withWarranty(STANDARD_WARRANTY),
      Escape: withWarranty(STANDARD_WARRANTY),
      Explorer: withWarranty(STANDARD_WARRANTY),
      Expedition: withWarranty(STANDARD_WARRANTY),
      BroncoSport: withWarranty(STANDARD_WARRANTY),
      Maverick: withWarranty(STANDARD_WARRANTY),
      MachE: withWarranty(STANDARD_WARRANTY)
    },
    Chevrolet: {
      Silverado1500: withWarranty(STANDARD_WARRANTY),
      Silverado2500: withWarranty(STANDARD_WARRANTY),
      Equinox: withWarranty(STANDARD_WARRANTY),
      Traverse: withWarranty(STANDARD_WARRANTY),
      Tahoe: withWarranty(STANDARD_WARRANTY),
      Suburban: withWarranty(STANDARD_WARRANTY),
      Trax: withWarranty(STANDARD_WARRANTY)
    },
    GMC: {
      Sierra1500: withWarranty(STANDARD_WARRANTY),
      Terrain: withWarranty(STANDARD_WARRANTY),
      Acadia: withWarranty(STANDARD_WARRANTY),
      Yukon: withWarranty(STANDARD_WARRANTY),
      YukonXL: withWarranty(STANDARD_WARRANTY)
    },
    Hyundai: {
      Elantra: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sonata: withWarranty(HYUNDAI_KIA_WARRANTY),
      Tucson: withWarranty(HYUNDAI_KIA_WARRANTY),
      SantaFe: withWarranty(HYUNDAI_KIA_WARRANTY),
      Palisade: withWarranty(HYUNDAI_KIA_WARRANTY)
    },
    Kia: {
      Forte: withWarranty(HYUNDAI_KIA_WARRANTY),
      K5: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sportage: withWarranty(HYUNDAI_KIA_WARRANTY),
      Sorento: withWarranty(HYUNDAI_KIA_WARRANTY),
      Telluride: withWarranty(HYUNDAI_KIA_WARRANTY)
    },
    Nissan: {
      Altima: withWarranty(STANDARD_WARRANTY),
      Sentra: withWarranty(STANDARD_WARRANTY),
      Rogue: withWarranty(STANDARD_WARRANTY),
      Pathfinder: withWarranty(STANDARD_WARRANTY),
      Frontier: withWarranty(STANDARD_WARRANTY)
    },
    Subaru: {
      Crosstrek: withWarranty(STANDARD_WARRANTY),
      Forester: withWarranty(STANDARD_WARRANTY),
      Outback: withWarranty(STANDARD_WARRANTY),
      Ascent: withWarranty(STANDARD_WARRANTY),
      Legacy: withWarranty(STANDARD_WARRANTY)
    },
    Mazda: {
      Mazda3: withWarranty(STANDARD_WARRANTY),
      CX30: withWarranty(STANDARD_WARRANTY),
      CX5: withWarranty(STANDARD_WARRANTY),
      CX50: withWarranty(STANDARD_WARRANTY),
      CX90: withWarranty(STANDARD_WARRANTY)
    },
    Jeep: {
      Wrangler: withWarranty(STANDARD_WARRANTY),
      GrandCherokee: withWarranty(STANDARD_WARRANTY),
      Compass: withWarranty(STANDARD_WARRANTY),
      Wagoneer: withWarranty(STANDARD_WARRANTY)
    },
    RAM: {
      RAM1500: withWarranty(STANDARD_WARRANTY)
    }
  }
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function formatYears(value: number): string {
  if (!Number.isFinite(value)) return "0.0";
  return value.toFixed(1);
}

function formatMiles(value: number): string {
  return Math.round(value).toLocaleString();
}

function formatPercent(value: number): string {
  return `${Math.round(value)}%`;
}

type SegmentProps = {
  left: number;
  width: number;
  label: string;
  tone?: string;
  textTone?: string;
};

function Segment({ left, width, label, tone = "bg-slate-300", textTone = "text-slate-800" }: SegmentProps) {
  const safeWidth = Math.max(width, 0);
  if (safeWidth <= 0) return null;

  return (
    <div
      className={`timeline-segment absolute top-0 h-full rounded-xl ${tone} ${textTone} flex items-center justify-center text-[10px] md:text-xs font-semibold px-2 text-center overflow-hidden`}
      style={{ left: `${left}%`, width: `${safeWidth}%` }}
    >
      <span className="truncate">{label}</span>
    </div>
  );
}

type MarkerProps = {
  left: number;
  label: string;
  sublabel?: string;
  color?: string;
  lane?: number;
};

type TimelineMarker = {
  left: number;
  label: string;
  sublabel?: string;
  color?: string;
};

function assignMarkerLanes(markers: TimelineMarker[], minGap = 12): Array<TimelineMarker & { lane: number }> {
  const laneRightEdges: number[] = [];

  return markers.map((marker) => {
    let lane = 0;

    while (laneRightEdges[lane] !== undefined && marker.left - laneRightEdges[lane] < minGap) {
      lane += 1;
    }

    laneRightEdges[lane] = marker.left;

    return {
      ...marker,
      lane
    };
  });
}

function Marker({ left, label, sublabel, color = "bg-black", lane = 0 }: MarkerProps) {
  const lineHeight = 16 + lane * 22;
  const labelTop = 70 + lane * 22;

  return (
    <div className="timeline-marker absolute top-[-10px]" style={{ left: `${left}%` }}>
      <div className={`timeline-marker-line w-0.5 ${color} opacity-80`} style={{ height: `${lineHeight}px` }} />
      <div className="timeline-marker-label absolute -translate-x-1/2 text-center" style={{ top: `${labelTop}px` }}>
        <div className="text-xs font-semibold text-slate-900 whitespace-nowrap">{label}</div>
        {sublabel ? <div className="text-[11px] text-slate-500 whitespace-nowrap">{sublabel}</div> : null}
      </div>
    </div>
  );
}

type DecodedVin = {
  valid: boolean;
  message: string;
  vin?: string;
  manufacturer?: string;
  modelYear?: number | string;
  serial?: string;
};

function decodeVin(vin: string): DecodedVin {
  const cleanVin = vin.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleanVin.length !== 17) {
    return {
      valid: false,
      message: "Enter a 17-character VIN to auto-fill basic vehicle details."
    };
  }

  const wmiMap: Record<string, string> = {
    "1FA": "Ford",
    "1FM": "Ford",
    "1FT": "Ford",
    "1GC": "Chevrolet",
    "1G1": "Chevrolet",
    "1GY": "Cadillac",
    "1N4": "Nissan",
    "1N6": "Nissan",
    "1HG": "Honda",
    "2HG": "Honda",
    "2T3": "Toyota",
    "4T1": "Toyota",
    "5YJ": "Tesla",
    "JF1": "Subaru",
    "JHM": "Honda",
    "JTD": "Toyota",
    "JM1": "Mazda",
    "JN1": "Nissan",
    "JN8": "Nissan",
    "KM8": "Hyundai",
    "KNA": "Kia",
    "WBA": "BMW",
    "WAU": "Audi",
    "WVW": "Volkswagen"
  };

  const yearMap: Record<string, number> = {
    A: 2010,
    B: 2011,
    C: 2012,
    D: 2013,
    E: 2014,
    F: 2015,
    G: 2016,
    H: 2017,
    J: 2018,
    K: 2019,
    L: 2020,
    M: 2021,
    N: 2022,
    P: 2023,
    R: 2024,
    S: 2025,
    T: 2026,
    V: 2027,
    W: 2028,
    X: 2029,
    Y: 2030,
    "1": 2001,
    "2": 2002,
    "3": 2003,
    "4": 2004,
    "5": 2005,
    "6": 2006,
    "7": 2007,
    "8": 2008,
    "9": 2009
  };

  const wmi = cleanVin.slice(0, 3);
  const manufacturer = wmiMap[wmi] || "Unknown Manufacturer";
  const modelYear = yearMap[cleanVin[9]] || "Unknown Year";

  return {
    valid: true,
    vin: cleanVin,
    manufacturer,
    modelYear,
    serial: cleanVin.slice(11),
    message: `${manufacturer} • ${modelYear}`
  };
}

function normalizeSnapshot(row: Record<string, unknown>): PlannerSnapshot {
  return {
    id: String(row.id),
    snapshot_name: String(row.snapshot_name),
    vin: row.vin ? String(row.vin) : null,
    vehicle_year: Number(row.vehicle_year),
    make: String(row.make),
    model: String(row.model),
    vehicle_name: String(row.vehicle_name),
    miles_at_origination: Number(row.miles_at_origination),
    factory_years: Number(row.factory_years),
    factory_miles: Number(row.factory_miles),
    powertrain_years: Number(row.powertrain_years),
    powertrain_miles: Number(row.powertrain_miles),
    loan_term_months: Number(row.loan_term_months),
    annual_mileage: Number(row.annual_mileage),
    ownership_years: Number(row.ownership_years),
    show_vsc_overlay: Boolean(row.show_vsc_overlay),
    vsc_years: Number(row.vsc_years),
    vsc_miles: Number(row.vsc_miles),
    created_at: String(row.created_at)
  };
}

function formatSnapshotDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

type LoginScreenProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (values: { email: string; password: string; dealerName: string }) => Promise<void>;
  isSubmitting: boolean;
  error: string;
  message: string;
  configError: string;
};

function LoginScreen({ mode, onModeChange, onSubmit, isSubmitting, error, message, configError }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [dealerName, setDealerName] = useState("Premier Auto Group");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setFormError("Enter your email and password.");
      return;
    }

    if (mode === "sign-up" && !dealerName.trim()) {
      setFormError("Enter the dealer group name for this account.");
      return;
    }

    setFormError("");
    await onSubmit({
      email: email.trim(),
      password,
      dealerName: dealerName.trim() || "Dealer Account"
    });
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
      <div className="w-full max-w-5xl grid gap-6 lg:grid-cols-2">
        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardHeader className="space-y-3">
            <Badge className="rounded-full w-fit">Dealer Warranty Platform</Badge>
            <CardTitle className="text-3xl">Show customers when factory coverage really runs out.</CardTitle>
            <p className="text-slate-600 text-sm leading-6">
              This works because it ties warranty coverage to how the customer actually drives, how long they finance, and how long they keep the vehicle.
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="font-semibold">What the dealer gets</div>
              <div className="mt-2 text-sm text-slate-600 space-y-2">
                <div>VIN and vehicle selector workflow</div>
                <div>Factory and powertrain warranty comparison</div>
                <div>Ownership life cycle vs warranty gap</div>
                <div>Loan life cycle vs warranty gap</div>
                <div>Saved scenarios tied to each dealer login</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-slate-200 shadow-sm bg-white">
          <CardHeader>
            <CardTitle className="text-2xl">Dealer Login</CardTitle>
            <p className="text-sm text-slate-500">Sign in with your email, or create a dealer account and save warranty scenarios.</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "sign-up" ? (
                <div className="space-y-2">
                  <Label>Dealer Group Name</Label>
                  <Input value={dealerName} onChange={(e) => setDealerName(e.target.value)} placeholder="Dealer group" />
                </div>
              ) : null}
              <div className="space-y-2">
                <Label>Email</Label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@dealership.com" type="email" />
              </div>
              <div className="space-y-2">
                <Label>Password</Label>
                <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" />
              </div>
              {configError ? <div className="text-sm text-red-600">{configError}</div> : null}
              {formError ? <div className="text-sm text-red-600">{formError}</div> : null}
              {!formError && error ? <div className="text-sm text-red-600">{error}</div> : null}
              {message ? <div className="text-sm text-emerald-700">{message}</div> : null}
              <button type="submit" disabled={isSubmitting || Boolean(configError)} className="w-full rounded-xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60">
                {isSubmitting ? "Working..." : mode === "sign-in" ? "Sign In" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => onModeChange(mode === "sign-in" ? "sign-up" : "sign-in")}
                className="w-full rounded-xl border border-slate-200 bg-white py-3 font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {mode === "sign-in" ? "Create a New Account" : "Back to Sign In"}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function DealerFactoryWarrantyPlanner() {
  const supabase = useMemo(() => getSupabaseBrowserClient(), []);
  const yearOptions = useMemo(() => Object.keys(VEHICLE_LIBRARY).map(Number).sort((a, b) => b - a), []);
  const initialYear = yearOptions[0] || 2026;
  const initialMake = Object.keys(VEHICLE_LIBRARY[String(initialYear)] ?? {})[0] ?? "";
  const initialModel = Object.keys(VEHICLE_LIBRARY[String(initialYear)]?.[initialMake] ?? {})[0] ?? "";

  const [vin, setVin] = useState("");
  const [selectedYear, setSelectedYear] = useState<number>(initialYear);
  const [selectedMake, setSelectedMake] = useState<string>(initialMake);
  const [selectedModel, setSelectedModel] = useState<string>(initialModel);
  const [vehicleName, setVehicleName] = useState(`${initialYear} ${initialMake} ${MODEL_LABELS[initialModel] || initialModel}`.trim());
  const [milesAtOrigination, setMilesAtOrigination] = useState<number>(1);
  const [factoryYears, setFactoryYears] = useState<number>(3);
  const [factoryMiles, setFactoryMiles] = useState<number>(36000);
  const [powertrainYears, setPowertrainYears] = useState<number>(5);
  const [powertrainMiles, setPowertrainMiles] = useState<number>(60000);
  const [loanTermMonths, setLoanTermMonths] = useState<number>(72);
  const [annualMileage, setAnnualMileage] = useState<number>(18000);
  const [ownershipYears, setOwnershipYears] = useState<number>(5);
  const [showVscOverlay, setShowVscOverlay] = useState<boolean>(false);
  const [vscYears, setVscYears] = useState<number>(5);
  const [vscMiles, setVscMiles] = useState<number>(75000);
  const [dealerName, setDealerName] = useState<string>("Dealer Account");
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");
  const [authMessage, setAuthMessage] = useState<string>("");
  const [snapshotName, setSnapshotName] = useState<string>("");
  const [activeSnapshotId, setActiveSnapshotId] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<PlannerSnapshot[]>([]);
  const [snapshotsLoading, setSnapshotsLoading] = useState<boolean>(false);
  const [saveLoading, setSaveLoading] = useState<boolean>(false);
  const [snapshotBusyId, setSnapshotBusyId] = useState<string | null>(null);
  const [snapshotError, setSnapshotError] = useState<string>("");
  const [snapshotMessage, setSnapshotMessage] = useState<string>("");

  const availableMakes = useMemo(() => Object.keys(VEHICLE_LIBRARY[String(selectedYear)] ?? {}), [selectedYear]);
  const availableModels = useMemo(() => Object.keys(VEHICLE_LIBRARY[String(selectedYear)]?.[selectedMake] ?? {}), [selectedYear, selectedMake]);

  useEffect(() => {
    if (!availableMakes.includes(selectedMake)) {
      setSelectedMake(availableMakes[0] ?? "");
    }
  }, [availableMakes, selectedMake]);

  useEffect(() => {
    if (!availableModels.includes(selectedModel)) {
      setSelectedModel(availableModels[0] ?? "");
    }
  }, [availableModels, selectedModel]);

  const selectedWarranty = useMemo<WarrantyData | null>(() => {
    return VEHICLE_LIBRARY[String(selectedYear)]?.[selectedMake]?.[selectedModel] ?? null;
  }, [selectedYear, selectedMake, selectedModel]);

  const limitedCoverages = selectedWarranty?.limitedCoverages ?? [];

  useEffect(() => {
    if (!selectedWarranty) return;
    setFactoryYears(selectedWarranty.factoryYears);
    setFactoryMiles(selectedWarranty.factoryMiles);
    setPowertrainYears(selectedWarranty.powertrainYears);
    setPowertrainMiles(selectedWarranty.powertrainMiles);
    setVehicleName(`${selectedYear} ${selectedMake} ${MODEL_LABELS[selectedModel] || selectedModel}`);
  }, [selectedWarranty, selectedYear, selectedMake, selectedModel]);

  const derived = useMemo(() => {
    const loanYears = loanTermMonths / 12;
    const remainingFactoryMiles = Math.max(factoryMiles - milesAtOrigination, 0);
    const remainingPowertrainMiles = Math.max(powertrainMiles - milesAtOrigination, 0);
    const bumperToBumperYearsByDriving = remainingFactoryMiles / Math.max(annualMileage, 1);
    const powertrainYearsByDriving = remainingPowertrainMiles / Math.max(annualMileage, 1);
    const bumperToBumperActualYears = Math.min(factoryYears, bumperToBumperYearsByDriving);
    const powertrainActualYears = Math.min(powertrainYears, powertrainYearsByDriving);
    const vscYearsByDriving = vscMiles / Math.max(annualMileage, 1);
    const vscActualYears = Math.min(vscYears, vscYearsByDriving);
    const protectedYearsWithVsc = Math.max(bumperToBumperActualYears, vscActualYears);
    const bumperGapYears = Math.max(ownershipYears - bumperToBumperActualYears, 0);
    const loanAfterBumperGap = Math.max(loanYears - bumperToBumperActualYears, 0);
    const ownershipOutOfWarrantyRisk = ownershipYears > 0 ? (bumperGapYears / ownershipYears) * 100 : 0;
    const loanOutOfWarrantyRisk = loanYears > 0 ? (loanAfterBumperGap / loanYears) * 100 : 0;
    const ownershipGapWithVsc = Math.max(ownershipYears - protectedYearsWithVsc, 0);
    const loanGapWithVsc = Math.max(loanYears - protectedYearsWithVsc, 0);
    const ownershipRiskWithVsc = ownershipYears > 0 ? (ownershipGapWithVsc / ownershipYears) * 100 : 0;
    const loanRiskWithVsc = loanYears > 0 ? (loanGapWithVsc / loanYears) * 100 : 0;
    const maxTimelineYears = Math.max(ownershipYears, loanYears, factoryYears, powertrainYears, vscYears, bumperToBumperYearsByDriving, powertrainYearsByDriving, vscYearsByDriving, 6) * 1.15;
    const bumperEndsBy = bumperToBumperYearsByDriving < factoryYears ? "mileage" : "time";
    const powertrainEndsBy = powertrainYearsByDriving < powertrainYears ? "mileage" : "time";

    return {
      loanYears,
      remainingFactoryMiles,
      remainingPowertrainMiles,
      bumperToBumperActualYears,
      powertrainActualYears,
      protectedYearsWithVsc,
      maxTimelineYears,
      bumperGapYears,
      loanAfterBumperGap,
      ownershipOutOfWarrantyRisk,
      loanOutOfWarrantyRisk,
      ownershipRiskWithVsc,
      loanRiskWithVsc,
      bumperEndsBy,
      powertrainEndsBy
    };
  }, [annualMileage, factoryMiles, factoryYears, loanTermMonths, milesAtOrigination, ownershipYears, powertrainMiles, powertrainYears, vscMiles, vscYears]);

  const pct = (years: number) => clamp((years / derived.maxTimelineYears) * 100, 0, 100);
  const vinDecoded = useMemo(() => decodeVin(vin), [vin]);
  const bumperMarkers = useMemo(
    () =>
      assignMarkerLanes(
        [
          {
            left: pct(derived.bumperToBumperActualYears),
            label: "Warranty ends",
            sublabel: `${formatYears(derived.bumperToBumperActualYears)} yrs`,
            color: "bg-emerald-700"
          },
          ...(showVscOverlay && derived.protectedYearsWithVsc > derived.bumperToBumperActualYears
            ? [
                {
                  left: pct(derived.protectedYearsWithVsc),
                  label: "VSC ends",
                  sublabel: `${formatYears(derived.protectedYearsWithVsc)} yrs`,
                  color: "bg-indigo-700"
                }
              ]
            : []),
          {
            left: pct(ownershipYears),
            label: "Ownership target",
            sublabel: `${ownershipYears} yrs`,
            color: "bg-slate-700"
          },
          {
            left: pct(derived.loanYears),
            label: "Loan ends",
            sublabel: `${formatYears(derived.loanYears)} yrs`,
            color: "bg-blue-700"
          }
        ].sort((a, b) => a.left - b.left)
      ),
    [derived.bumperToBumperActualYears, derived.loanYears, derived.protectedYearsWithVsc, ownershipYears, pct, showVscOverlay]
  );
  const powertrainMarkers = useMemo(
    () =>
      assignMarkerLanes(
        [
          {
            left: pct(derived.powertrainActualYears),
            label: "Coverage ends",
            sublabel: `${formatYears(derived.powertrainActualYears)} yrs`,
            color: "bg-sky-700"
          },
          {
            left: pct(ownershipYears),
            label: "Ownership target",
            sublabel: `${ownershipYears} yrs`,
            color: "bg-slate-700"
          },
          {
            left: pct(derived.loanYears),
            label: "Loan ends",
            sublabel: `${formatYears(derived.loanYears)} yrs`,
            color: "bg-blue-700"
          }
        ].sort((a, b) => a.left - b.left)
      ),
    [derived.loanYears, derived.powertrainActualYears, ownershipYears, pct]
  );
  const ownershipMarkers = useMemo(
    () =>
      assignMarkerLanes(
        [
          {
            left: pct(ownershipYears),
            label: "Ownership target",
            sublabel: `${ownershipYears} yrs`,
            color: "bg-slate-700"
          },
          {
            left: pct(derived.loanYears),
            label: "Loan ends",
            sublabel: `${formatYears(derived.loanYears)} yrs`,
            color: "bg-blue-700"
          }
        ].sort((a, b) => a.left - b.left)
      ),
    [derived.loanYears, ownershipYears, pct]
  );

  const customerMessage = useMemo(() => {
    if (milesAtOrigination > 0 && annualMileage >= 20000) {
      return `This is where used-car reality hits. Starting at ${formatMiles(milesAtOrigination)} miles and driving ${formatMiles(annualMileage)} miles a year, factory coverage disappears fast.`;
    }
    if (annualMileage <= 12000) {
      return `At ${formatMiles(annualMileage)} miles a year, this customer is more likely to age out of warranty on time rather than mileage.`;
    }
    return `Once you account for ${formatMiles(milesAtOrigination)} starting miles and ${formatMiles(annualMileage)} miles per year, bumper-to-bumper protection ends much sooner than most customers assume.`;
  }, [annualMileage, milesAtOrigination]);

  useEffect(() => {
    if (!supabase) {
      setAuthLoading(false);
      return;
    }

    let isMounted = true;

    void supabase.auth.getSession().then(({ data, error }) => {
      if (!isMounted) return;
      if (error) {
        setAuthError(error.message);
      }
      setSession(data.session ?? null);
      setAuthLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setAuthLoading(false);
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, [supabase]);

  useEffect(() => {
    if (!session || !supabase) {
      setSnapshots([]);
      setSnapshotName("");
      setActiveSnapshotId(null);
      setSnapshotError("");
      setSnapshotMessage("");
      setDealerName("Dealer Account");
      return;
    }

    const loadAccountData = async () => {
      setSnapshotsLoading(true);
      setSnapshotError("");

      const [{ data: profile, error: profileError }, { data: snapshotRows, error: snapshotsQueryError }] = await Promise.all([
        supabase.from("profiles").select("dealer_name").eq("id", session.user.id).maybeSingle(),
        supabase
          .from("planner_snapshots")
          .select("id, snapshot_name, vin, vehicle_year, make, model, vehicle_name, miles_at_origination, factory_years, factory_miles, powertrain_years, powertrain_miles, loan_term_months, annual_mileage, ownership_years, show_vsc_overlay, vsc_years, vsc_miles, created_at")
          .order("created_at", { ascending: false })
          .limit(12)
      ]);

      if (profileError) {
        setAuthError(profileError.message);
      } else {
        setDealerName(profile?.dealer_name || String(session.user.user_metadata.dealer_name || "Dealer Account"));
      }

      if (snapshotsQueryError) {
        setSnapshotError(snapshotsQueryError.message);
      } else {
        const nextSnapshots = (snapshotRows ?? []).map((row) => normalizeSnapshot(row as Record<string, unknown>));
        setSnapshots(nextSnapshots);
        setSnapshotName((current) => current || nextSnapshots[0]?.snapshot_name || "");
      }

      setSnapshotsLoading(false);
    };

    void loadAccountData();
  }, [session, supabase]);

  const handleAuthSubmit = async ({ email, password, dealerName: nextDealerName }: { email: string; password: string; dealerName: string }) => {
    if (!supabase) return;

    setAuthSubmitting(true);
    setAuthError("");
    setAuthMessage("");

    if (authMode === "sign-in") {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthError(error.message);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            dealer_name: nextDealerName
          }
        }
      });

      if (error) {
        setAuthError(error.message);
      } else if (data.session) {
        setAuthMessage("Account created. You are signed in.");
      } else {
        setAuthMode("sign-in");
        setAuthMessage("Account created. Check your email to confirm the sign-up, then sign in.");
      }
    }

    setAuthSubmitting(false);
  };

  const loadSnapshot = (snapshot: PlannerSnapshot) => {
    setActiveSnapshotId(snapshot.id);
    setVin(snapshot.vin ?? "");
    setSelectedYear(snapshot.vehicle_year);
    setSelectedMake(snapshot.make);
    setSelectedModel(snapshot.model);
    setVehicleName(snapshot.vehicle_name);
    setMilesAtOrigination(snapshot.miles_at_origination);
    setFactoryYears(snapshot.factory_years);
    setFactoryMiles(snapshot.factory_miles);
    setPowertrainYears(snapshot.powertrain_years);
    setPowertrainMiles(snapshot.powertrain_miles);
    setLoanTermMonths(snapshot.loan_term_months);
    setAnnualMileage(snapshot.annual_mileage);
    setOwnershipYears(snapshot.ownership_years);
    setShowVscOverlay(snapshot.show_vsc_overlay);
    setVscYears(snapshot.vsc_years);
    setVscMiles(snapshot.vsc_miles);
    setSnapshotName(snapshot.snapshot_name);
    setSnapshotMessage(`Loaded "${snapshot.snapshot_name}".`);
    setSnapshotError("");
  };

  const refreshSnapshots = async () => {
    if (!supabase || !session) return;

    const { data, error } = await supabase
      .from("planner_snapshots")
      .select("id, snapshot_name, vin, vehicle_year, make, model, vehicle_name, miles_at_origination, factory_years, factory_miles, powertrain_years, powertrain_miles, loan_term_months, annual_mileage, ownership_years, show_vsc_overlay, vsc_years, vsc_miles, created_at")
      .order("created_at", { ascending: false })
      .limit(12);

    if (error) {
      setSnapshotError(error.message);
      return;
    }

    setSnapshots((data ?? []).map((row) => normalizeSnapshot(row as Record<string, unknown>)));
  };

  const handleSaveSnapshot = async () => {
    if (!supabase || !session) return false;

    const trimmedName = snapshotName.trim() || `${vehicleName} snapshot`;
    const payload = {
      snapshot_name: trimmedName,
      vin: vin || null,
      vehicle_year: selectedYear,
      make: selectedMake,
      model: selectedModel,
      vehicle_name: vehicleName,
      miles_at_origination: milesAtOrigination,
      factory_years: factoryYears,
      factory_miles: factoryMiles,
      powertrain_years: powertrainYears,
      powertrain_miles: powertrainMiles,
      loan_term_months: loanTermMonths,
      annual_mileage: annualMileage,
      ownership_years: ownershipYears,
      show_vsc_overlay: showVscOverlay,
      vsc_years: vscYears,
      vsc_miles: vscMiles
    };

    setSaveLoading(true);
    setSnapshotError("");
    setSnapshotMessage("");

    const { data, error } = activeSnapshotId
      ? await supabase.from("planner_snapshots").update(payload).eq("id", activeSnapshotId).select("id").single()
      : await supabase.from("planner_snapshots").insert({
          user_id: session.user.id,
          ...payload
        }).select("id").single();

    if (error) {
      setSnapshotError(error.message);
      setSaveLoading(false);
      return false;
    } else {
      if (data?.id) {
        setActiveSnapshotId(String(data.id));
      }
      setSnapshotName(trimmedName);
      setSnapshotMessage(`${activeSnapshotId ? "Updated" : "Saved"} "${trimmedName}".`);
      await refreshSnapshots();
    }

    setSaveLoading(false);
    return true;
  };

  const handleDeleteSnapshot = async (snapshotId: string) => {
    if (!supabase) return;

    setSnapshotBusyId(snapshotId);
    setSnapshotError("");
    setSnapshotMessage("");

    const { error } = await supabase.from("planner_snapshots").delete().eq("id", snapshotId);

    if (error) {
      setSnapshotError(error.message);
    } else {
      if (activeSnapshotId === snapshotId) {
        setActiveSnapshotId(null);
      }
      setSnapshotMessage("Snapshot deleted.");
      await refreshSnapshots();
    }

    setSnapshotBusyId(null);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setAuthMessage("");
    setAuthError("");
  };

  const handleSaveAndPrint = async () => {
    const didSave = await handleSaveSnapshot();
    if (didSave) {
      window.print();
    }
  };

  if (authLoading) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600">Loading account...</div>;
  }

  if (!session) {
    return (
      <LoginScreen
        mode={authMode}
        onModeChange={setAuthMode}
        onSubmit={handleAuthSubmit}
        isSubmitting={authSubmitting}
        error={authError}
        message={authMessage}
        configError={supabase ? "" : "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 printable-shell">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="grid gap-6 lg:grid-cols-[360px_1fr] print-grid"
        >
          <Card className="rounded-2xl shadow-sm border-slate-200 no-print">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl">
                <ShieldCheck className="w-5 h-5" />
                Warranty Planner
              </CardTitle>
              <p className="text-sm text-slate-500">Built for dealership conversations. Adjust the numbers and let the timeline do the selling.</p>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                <div className="flex items-center gap-2">
                  <ScanLine className="w-4 h-4" />
                  <Label className="text-sm font-semibold">VIN Decoder</Label>
                </div>
                <div className="space-y-2">
                  <Label>Vehicle Identification Number</Label>
                  <Input
                    value={vin}
                    maxLength={17}
                    placeholder="Enter 17-character VIN"
                    onChange={(e) => {
                      const nextVin = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 17);
                      setVin(nextVin);
                      const decoded = decodeVin(nextVin);
                      if (decoded.valid && decoded.manufacturer && decoded.modelYear) {
                        setVehicleName(`${decoded.modelYear} ${decoded.manufacturer}`);
                      }
                    }}
                  />
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  <div className="font-medium text-slate-900">{vinDecoded.message}</div>
                  {vinDecoded.valid ? <div className="mt-1 text-xs text-slate-500">VIN: {vinDecoded.vin} • WMI: {vinDecoded.vin?.slice(0, 3)} • Serial: {vinDecoded.serial}</div> : null}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-3 bg-slate-50">
                <Label className="text-sm font-semibold">Vehicle Selector</Label>
                <div className="grid grid-cols-1 gap-3">
                  <div className="space-y-2">
                    <Label>Vehicle Year</Label>
                    <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                      {yearOptions.map((year) => <option key={year} value={year}>{year}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Make</Label>
                    <select value={selectedMake} onChange={(e) => setSelectedMake(e.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                      {availableMakes.map((make) => <option key={make} value={make}>{make}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Model</Label>
                    <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm">
                      {availableModels.map((model) => <option key={model} value={model}>{MODEL_LABELS[model] || model}</option>)}
                    </select>
                  </div>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-600">
                  {selectedWarranty ? (
                    <>
                      <div className="font-medium text-slate-900">{selectedYear} {selectedMake} {MODEL_LABELS[selectedModel] || selectedModel}</div>
                      <div className="mt-1 text-xs text-slate-500">Factory: {selectedWarranty.factoryYears} yr / {formatMiles(selectedWarranty.factoryMiles)} mi • Powertrain: {selectedWarranty.powertrainYears} yr / {formatMiles(selectedWarranty.powertrainMiles)} mi</div>
                      {limitedCoverages.length > 0 ? (
                        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
                          <div className="font-semibold mb-1">Coverage note</div>
                          {limitedCoverages.map((coverage) => <div key={coverage.name} className="mb-1 last:mb-0">{coverage.name}: {coverage.years} yr / {formatMiles(coverage.miles)} mi. {coverage.note}</div>)}
                        </div>
                      ) : null}
                    </>
                  ) : <div>No warranty data found for this selection.</div>}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Vehicle / Trim</Label>
                <Input value={vehicleName} onChange={(e) => setVehicleName(e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label>Miles at Origination</Label>
                <Input type="number" value={milesAtOrigination} onChange={(e) => setMilesAtOrigination(Number(e.target.value) || 0)} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Factory Warranty Years</Label>
                  <Input type="number" value={factoryYears} onChange={(e) => setFactoryYears(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Factory Warranty Miles</Label>
                  <Input type="number" value={factoryMiles} onChange={(e) => setFactoryMiles(Number(e.target.value) || 0)} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Powertrain Years</Label>
                  <Input type="number" value={powertrainYears} onChange={(e) => setPowertrainYears(Number(e.target.value) || 0)} />
                </div>
                <div className="space-y-2">
                  <Label>Powertrain Miles</Label>
                  <Input type="number" value={powertrainMiles} onChange={(e) => setPowertrainMiles(Number(e.target.value) || 0)} />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><CreditCard className="w-4 h-4" /> Loan Term</Label>
                  <span className="text-sm font-semibold">{loanTermMonths} months</span>
                </div>
                <Slider value={[loanTermMonths]} min={24} max={96} step={3} onValueChange={(v) => setLoanTermMonths(v[0])} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><Gauge className="w-4 h-4" /> Annual Mileage</Label>
                  <span className="text-sm font-semibold">{formatMiles(annualMileage)} mi</span>
                </div>
                <Slider value={[annualMileage]} min={6000} max={30000} step={1000} onValueChange={(v) => setAnnualMileage(v[0])} />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="flex items-center gap-2"><CalendarClock className="w-4 h-4" /> Typical Ownership</Label>
                  <span className="text-sm font-semibold">{ownershipYears} years</span>
                </div>
                <Slider value={[ownershipYears]} min={1} max={10} step={1} onValueChange={(v) => setOwnershipYears(v[0])} />
              </div>

              <Separator />

              <div className="rounded-2xl border border-slate-200 p-4 space-y-4 bg-slate-50">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Show VSC Overlay</Label>
                  <input type="checkbox" checked={showVscOverlay} onChange={(e) => setShowVscOverlay(e.target.checked)} className="h-4 w-4" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>VSC Years</Label>
                    <Input type="number" value={vscYears} onChange={(e) => setVscYears(Number(e.target.value) || 0)} />
                  </div>
                  <div className="space-y-2">
                    <Label>VSC Miles</Label>
                    <Input type="number" value={vscMiles} onChange={(e) => setVscMiles(Number(e.target.value) || 0)} />
                  </div>
                </div>
                <p className="text-xs text-slate-500">This overlay shows how a service contract can reduce time spent outside full coverage.</p>
              </div>

              <div className="rounded-2xl border border-slate-200 p-4 space-y-4 bg-white">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-semibold">Saved Snapshots</Label>
                  {snapshotsLoading ? <span className="text-xs text-slate-500">Loading...</span> : null}
                </div>
                <div className="space-y-2">
                  <Label>Snapshot Name</Label>
                  <Input value={snapshotName} onChange={(e) => setSnapshotName(e.target.value)} placeholder="Example: F-150 high-mileage buyer" />
                </div>
                {snapshotError ? <div className="text-sm text-red-600">{snapshotError}</div> : null}
                {!snapshotError && snapshotMessage ? <div className="text-sm text-emerald-700">{snapshotMessage}</div> : null}
                <button type="button" onClick={() => void handleSaveSnapshot()} disabled={saveLoading} className="w-full rounded-xl bg-slate-900 text-white py-3 font-semibold hover:bg-slate-800 transition-colors disabled:cursor-not-allowed disabled:opacity-60">
                  {saveLoading ? "Saving..." : "Save Current Snapshot"}
                </button>
                <div className="space-y-3">
                  {snapshots.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-200 p-3 text-sm text-slate-500">No saved snapshots yet.</div>
                  ) : (
                    snapshots.map((snapshot) => (
                      <div key={snapshot.id} className="rounded-xl border border-slate-200 p-3 bg-slate-50 space-y-2">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="font-medium text-slate-900">{snapshot.snapshot_name}</div>
                            <div className="text-xs text-slate-500">{snapshot.vehicle_name}</div>
                            <div className="text-xs text-slate-400">{formatSnapshotDate(snapshot.created_at)}</div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => loadSnapshot(snapshot)} className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100">
                              Load
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleDeleteSnapshot(snapshot.id)}
                              disabled={snapshotBusyId === snapshot.id}
                              className="rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                              {snapshotBusyId === snapshot.id ? "Deleting..." : "Delete"}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-sm border-slate-200 printable-card">
              <CardHeader className="pb-3">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-xs uppercase tracking-wide text-slate-500 mb-1">{dealerName}</div>
                    <CardTitle className="text-2xl">{vehicleName}</CardTitle>
                    <p className="text-sm text-slate-500 mt-1">Visual explanation of when factory coverage ends based on how the customer actually drives.</p>
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge className="rounded-full">Starts at {formatMiles(milesAtOrigination)} mi</Badge>
                    <Badge className="rounded-full">Bumper-to-Bumper {factoryYears} yr / {formatMiles(factoryMiles)} mi</Badge>
                    <Badge className="rounded-full">Powertrain {powertrainYears} yr / {formatMiles(powertrainMiles)} mi</Badge>
                    {limitedCoverages.length > 0 ? <Badge className="rounded-full">Limited electronics coverage applies</Badge> : null}
                    {showVscOverlay ? <Badge className="rounded-full">VSC {vscYears} yr / {formatMiles(vscMiles)} mi</Badge> : null}
                    <Badge className="rounded-full">Loan {formatYears(derived.loanYears)} yrs</Badge>
                    <button type="button" onClick={() => void handleSaveAndPrint()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-print">
                      Save / Print PDF
                    </button>
                    <button type="button" onClick={() => void handleSignOut()} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 no-print">Log Out</button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="rounded-2xl border-slate-200 shadow-none bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Factory coverage lasts</div><div className="text-2xl font-bold mt-1">{formatYears(derived.bumperToBumperActualYears)} yrs</div><div className="text-sm text-slate-500 mt-1">Ends by {derived.bumperEndsBy}</div></CardContent></Card>
                  <Card className="rounded-2xl border-slate-200 shadow-none bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Powertrain lasts</div><div className="text-2xl font-bold mt-1">{formatYears(derived.powertrainActualYears)} yrs</div><div className="text-sm text-slate-500 mt-1">Ends by {derived.powertrainEndsBy}</div></CardContent></Card>
                  <Card className="rounded-2xl border-slate-200 shadow-none bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Risk out of warranty during ownership</div><div className="text-2xl font-bold mt-1">{formatPercent(derived.ownershipOutOfWarrantyRisk)}</div><div className="text-sm text-slate-500 mt-1">{formatYears(derived.bumperGapYears)} yrs exposed</div></CardContent></Card>
                  <Card className="rounded-2xl border-slate-200 shadow-none bg-white"><CardContent className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Risk during loan period</div><div className="text-2xl font-bold mt-1">{formatPercent(derived.loanOutOfWarrantyRisk)}</div><div className="text-sm text-slate-500 mt-1">{formatYears(derived.loanAfterBumperGap)} yrs while financed</div></CardContent></Card>
                </div>

                {showVscOverlay ? (
                  <div className="grid gap-4 md:grid-cols-2">
                    <Card className="rounded-2xl border-slate-200 shadow-none bg-emerald-50"><CardContent className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Ownership risk with VSC</div><div className="text-2xl font-bold mt-1">{formatPercent(derived.ownershipRiskWithVsc)}</div><div className="text-sm text-slate-500 mt-1">Improves by {formatPercent(derived.ownershipOutOfWarrantyRisk - derived.ownershipRiskWithVsc)}</div></CardContent></Card>
                    <Card className="rounded-2xl border-slate-200 shadow-none bg-sky-50"><CardContent className="p-4"><div className="text-xs uppercase tracking-wide text-slate-500">Loan risk with VSC</div><div className="text-2xl font-bold mt-1">{formatPercent(derived.loanRiskWithVsc)}</div><div className="text-sm text-slate-500 mt-1">Improves by {formatPercent(derived.loanOutOfWarrantyRisk - derived.loanRiskWithVsc)}</div></CardContent></Card>
                  </div>
                ) : null}

                <div className="rounded-2xl border border-slate-200 bg-white p-4 md:p-6">
                  <div className="flex items-center gap-2 mb-6"><Car className="w-5 h-5" /><h2 className="text-lg font-semibold">Coverage Timeline</h2></div>
                  <div className="space-y-16 pt-4 pb-24">
                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Factory Bumper-to-Bumper</span><span>{formatYears(derived.bumperToBumperActualYears)} years of real-world coverage</span></div>
                      <div className="timeline-track relative h-8 rounded-xl bg-slate-100 overflow-visible">
                        <Segment left={0} width={pct(derived.bumperToBumperActualYears)} label="Covered" tone="bg-emerald-300" textTone="text-emerald-950" />
                        <Segment left={pct(derived.bumperToBumperActualYears)} width={pct(ownershipYears - derived.bumperToBumperActualYears)} label="Ownership without factory coverage" tone="bg-rose-200" textTone="text-rose-950" />
                        {showVscOverlay && derived.protectedYearsWithVsc > derived.bumperToBumperActualYears ? <Segment left={pct(derived.bumperToBumperActualYears)} width={pct(derived.protectedYearsWithVsc - derived.bumperToBumperActualYears)} label="VSC protection" tone="bg-indigo-300" textTone="text-indigo-950" /> : null}
                        {bumperMarkers.map((marker) => (
                          <Marker key={`${marker.label}-${marker.left}`} left={marker.left} label={marker.label} sublabel={marker.sublabel} color={marker.color} lane={marker.lane} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Powertrain Coverage</span><span>{formatYears(derived.powertrainActualYears)} years of real-world coverage</span></div>
                      <div className="timeline-track relative h-8 rounded-xl bg-slate-100 overflow-visible">
                        <Segment left={0} width={pct(derived.powertrainActualYears)} label="Covered" tone="bg-sky-300" textTone="text-sky-950" />
                        <Segment left={pct(derived.powertrainActualYears)} width={pct(ownershipYears - derived.powertrainActualYears)} label="Ownership after powertrain expires" tone="bg-amber-200" textTone="text-amber-950" />
                        {powertrainMarkers.map((marker) => (
                          <Marker key={`${marker.label}-${marker.left}`} left={marker.left} label={marker.label} sublabel={marker.sublabel} color={marker.color} lane={marker.lane} />
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-500 mb-2"><span>Customer Ownership vs Loan</span><span>{ownershipYears >= derived.loanYears ? "Ownership outlasts financing" : "Loan outlasts expected ownership"}</span></div>
                      <div className="timeline-track relative h-8 rounded-xl bg-slate-100 overflow-visible">
                        <Segment left={0} width={pct(Math.min(ownershipYears, derived.loanYears))} label="Ownership while paying loan" tone="bg-violet-300" textTone="text-violet-950" />
                        {ownershipYears > derived.loanYears ? <Segment left={pct(derived.loanYears)} width={pct(ownershipYears - derived.loanYears)} label="Owned after payoff" tone="bg-violet-200" textTone="text-violet-950" /> : <Segment left={pct(ownershipYears)} width={pct(derived.loanYears - ownershipYears)} label="Loan remains after expected ownership" tone="bg-orange-200" textTone="text-orange-950" />}
                        {ownershipMarkers.map((marker) => (
                          <Marker key={`${marker.label}-${marker.left}`} left={marker.left} label={marker.label} sublabel={marker.sublabel} color={marker.color} lane={marker.lane} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-1">
                  <Card className="rounded-2xl border-slate-200 shadow-none bg-white">
                    <CardHeader><CardTitle className="text-lg">Warranty Summary vs Life Cycle</CardTitle></CardHeader>
                    <CardContent className="space-y-4 text-sm leading-6 text-slate-700">
                      <p>{customerMessage}</p>
                      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <h3 className="font-semibold mb-1">Loan Life Cycle vs Warranty Coverage</h3>
                        <p>The customer is financing this vehicle for <strong>{formatYears(derived.loanYears)} years</strong>. Based on their driving habits and the vehicle&apos;s starting mileage, the factory bumper-to-bumper warranty realistically lasts about <strong>{formatYears(derived.bumperToBumperActualYears)} years</strong>.</p>
                        <p>That means roughly <strong>{formatYears(derived.loanAfterBumperGap)} years</strong> of the loan could occur after full factory coverage expires. During that period the customer may still be making payments while the vehicle is no longer protected by the original warranty.</p>
                      </div>
                      <div className="rounded-xl border border-slate-200 p-4 bg-slate-50">
                        <h3 className="font-semibold mb-1">Ownership Life Cycle vs Warranty Coverage</h3>
                        <p>The typical ownership window entered is <strong>{ownershipYears} years</strong>. With the current mileage and driving habits, the comprehensive factory coverage realistically protects the vehicle for about <strong>{formatYears(derived.bumperToBumperActualYears)} years</strong>.</p>
                        <p>That leaves approximately <strong>{formatYears(derived.bumperGapYears)} years</strong> of expected ownership after the factory warranty expires. This is the period where most unexpected repair costs tend to occur because the vehicle is aging but no longer protected by the manufacturer.</p>
                      </div>
                      {limitedCoverages.length > 0 ? <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-950"><strong>Important factory warranty note:</strong> some components on this vehicle may have shorter OEM coverage than the main basic warranty. Electronics like audio, navigation, infotainment, or similar items may expire earlier.</div> : null}
                      {showVscOverlay ? <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-3">Adding the service contract overlay reduces the ownership risk from <strong>{formatPercent(derived.ownershipOutOfWarrantyRisk)}</strong> to <strong>{formatPercent(derived.ownershipRiskWithVsc)}</strong> and reduces the loan-period exposure as well.</div> : null}
                    </CardContent>
                  </Card>
                </div>

                <Card className="rounded-2xl border-slate-200 shadow-none bg-white print-page-break-avoid">
                  <CardHeader>
                    <CardTitle className="text-lg">Acknowledgement</CardTitle>
                    <p className="text-sm text-slate-500">
                      Customer acknowledgement of the warranty coverage and ownership timeline reviewed during this presentation.
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6 text-sm text-slate-700">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 leading-6">
                      I acknowledge that the warranty timeline, ownership assumptions, and coverage gaps shown in this snapshot were reviewed with me.
                    </div>
                    <div className="grid gap-6 md:grid-cols-2">
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Customer Signature</div>
                        <div className="h-16 border-b border-slate-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Date</div>
                        <div className="h-16 border-b border-slate-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Printed Name</div>
                        <div className="h-12 border-b border-slate-400" />
                      </div>
                      <div className="space-y-2">
                        <div className="text-xs uppercase tracking-wide text-slate-500">Dealership Representative</div>
                        <div className="h-12 border-b border-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
