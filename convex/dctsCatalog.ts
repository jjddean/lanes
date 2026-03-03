export type DctsTier = "COMPREHENSIVE" | "ENHANCED" | "STANDARD";
export type DctsCumulationGroup = "asia" | "africa";

export type DctsSuspensionWindow = {
  startDate: string;
  endDate: string;
  productCategories: string[];
  reason?: string;
};

export type DctsCountrySeed = {
  countryCode: string;
  countryName: string;
  countryNameNormalized: string;
  isoCode: string;
  tier: DctsTier;
  mfnRate: number;
  dctsRate: number;
  rulesOfOrigin: string;
  cumulationGroups: DctsCumulationGroup[];
  hasGraduationSuspensions: boolean;
  graduationSuspensions: DctsSuspensionWindow[];
  hasUkFta: boolean;
  isDctsBeneficiary: boolean;
  notes?: string;
};

const COMPREHENSIVE_COUNTRIES = [
  "Afghanistan",
  "Angola",
  "Bangladesh",
  "Benin",
  "Burkina Faso",
  "Burundi",
  "Cambodia",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Eritrea",
  "Ethiopia",
  "Gambia",
  "Guinea",
  "Guinea-Bissau",
  "Haiti",
  "Kiribati",
  "Laos",
  "Lesotho",
  "Liberia",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mozambique",
  "Myanmar",
  "Nepal",
  "Niger",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Sierra Leone",
  "Solomon Islands",
  "Somalia",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Timor-Leste",
  "Togo",
  "Tuvalu",
  "Uganda",
  "Yemen",
  "Zambia",
  "Zimbabwe",
] as const;

const ENHANCED_COUNTRIES = [
  "Armenia",
  "Bolivia",
  "Cameroon",
  "Cape Verde",
  "Congo",
  "Cote d'Ivoire",
  "Eswatini",
  "Ghana",
  "Honduras",
  "India",
  "Kenya",
  "Mongolia",
  "Nigeria",
  "Pakistan",
  "Philippines",
  "Sri Lanka",
  "Vanuatu",
] as const;

const STANDARD_COUNTRIES = ["Indonesia", "Uzbekistan"] as const;

const ISO_CODE_BY_COUNTRY: Record<string, string> = {
  Afghanistan: "AF",
  Angola: "AO",
  Bangladesh: "BD",
  Benin: "BJ",
  "Burkina Faso": "BF",
  Burundi: "BI",
  Cambodia: "KH",
  "Central African Republic": "CF",
  Chad: "TD",
  Comoros: "KM",
  "Democratic Republic of the Congo": "CD",
  Djibouti: "DJ",
  Eritrea: "ER",
  Ethiopia: "ET",
  Gambia: "GM",
  Guinea: "GN",
  "Guinea-Bissau": "GW",
  Haiti: "HT",
  Kiribati: "KI",
  Laos: "LA",
  Lesotho: "LS",
  Liberia: "LR",
  Madagascar: "MG",
  Malawi: "MW",
  Mali: "ML",
  Mauritania: "MR",
  Mozambique: "MZ",
  Myanmar: "MM",
  Nepal: "NP",
  Niger: "NE",
  Rwanda: "RW",
  "Sao Tome and Principe": "ST",
  Senegal: "SN",
  "Sierra Leone": "SL",
  "Solomon Islands": "SB",
  Somalia: "SO",
  "South Sudan": "SS",
  Sudan: "SD",
  Tanzania: "TZ",
  "Timor-Leste": "TL",
  Togo: "TG",
  Tuvalu: "TV",
  Uganda: "UG",
  Yemen: "YE",
  Zambia: "ZM",
  Zimbabwe: "ZW",
  Armenia: "AM",
  Bolivia: "BO",
  Cameroon: "CM",
  "Cape Verde": "CV",
  Congo: "CG",
  "Cote d'Ivoire": "CI",
  Eswatini: "SZ",
  Ghana: "GH",
  Honduras: "HN",
  India: "IN",
  Kenya: "KE",
  Mongolia: "MN",
  Nigeria: "NG",
  Pakistan: "PK",
  Philippines: "PH",
  "Sri Lanka": "LK",
  Vanuatu: "VU",
  Indonesia: "ID",
  Uzbekistan: "UZ",
};

const ASIA_CUMULATION_COUNTRIES = new Set([
  "Afghanistan",
  "Bangladesh",
  "Cambodia",
  "India",
  "Laos",
  "Mongolia",
  "Myanmar",
  "Nepal",
  "Pakistan",
  "Philippines",
  "Sri Lanka",
  "Timor-Leste",
  "Uzbekistan",
]);

const AFRICA_CUMULATION_COUNTRIES = new Set([
  "Angola",
  "Benin",
  "Burkina Faso",
  "Burundi",
  "Cameroon",
  "Central African Republic",
  "Chad",
  "Comoros",
  "Congo",
  "Cote d'Ivoire",
  "Democratic Republic of the Congo",
  "Djibouti",
  "Eritrea",
  "Eswatini",
  "Ethiopia",
  "Gambia",
  "Ghana",
  "Guinea",
  "Guinea-Bissau",
  "Kenya",
  "Lesotho",
  "Liberia",
  "Madagascar",
  "Malawi",
  "Mali",
  "Mauritania",
  "Mozambique",
  "Niger",
  "Nigeria",
  "Rwanda",
  "Sao Tome and Principe",
  "Senegal",
  "Sierra Leone",
  "Somalia",
  "South Sudan",
  "Sudan",
  "Tanzania",
  "Togo",
  "Uganda",
  "Zambia",
  "Zimbabwe",
]);

const SPECIAL_CASES: Record<string, Partial<DctsCountrySeed>> = {
  India: {
    hasGraduationSuspensions: true,
    graduationSuspensions: [
      {
        startDate: "2026-01-01",
        endDate: "2028-12-31",
        productCategories: ["textiles", "chemicals", "iron_and_steel"],
        reason: "Graduation suspension window",
      },
    ],
  },
  Indonesia: {
    hasGraduationSuspensions: true,
    graduationSuspensions: [
      {
        startDate: "2026-01-01",
        endDate: "2028-12-31",
        productCategories: ["oil_based_products", "footwear", "musical_instruments"],
        reason: "Graduation suspension window",
      },
    ],
  },
  Bangladesh: {
    notes: "Graduates from LDC status in 2026 but continues under DCTS preference access.",
  },
};

const TIER_DEFAULTS: Record<DctsTier, { mfnRate: number; dctsRate: number; rulesOfOrigin: string }> = {
  COMPREHENSIVE: {
    mfnRate: 12,
    dctsRate: 0,
    rulesOfOrigin: "Comprehensive preference baseline rule-set; verify HS-specific thresholds.",
  },
  ENHANCED: {
    mfnRate: 12,
    dctsRate: 2,
    rulesOfOrigin: "Enhanced preference baseline rule-set; verify HS-specific thresholds.",
  },
  STANDARD: {
    mfnRate: 12,
    dctsRate: 8,
    rulesOfOrigin: "Standard preference baseline rule-set; verify HS-specific thresholds.",
  },
};

function tierFromCountry(countryName: string): DctsTier {
  if (COMPREHENSIVE_COUNTRIES.includes(countryName as (typeof COMPREHENSIVE_COUNTRIES)[number])) {
    return "COMPREHENSIVE";
  }
  if (ENHANCED_COUNTRIES.includes(countryName as (typeof ENHANCED_COUNTRIES)[number])) {
    return "ENHANCED";
  }
  return "STANDARD";
}

function cumulationGroupsForCountry(countryName: string): DctsCumulationGroup[] {
  const groups: DctsCumulationGroup[] = [];
  if (ASIA_CUMULATION_COUNTRIES.has(countryName)) groups.push("asia");
  if (AFRICA_CUMULATION_COUNTRIES.has(countryName)) groups.push("africa");
  return groups;
}

export function normalizeCountryName(countryName: string): string {
  return countryName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const ALL_COUNTRIES = [...COMPREHENSIVE_COUNTRIES, ...ENHANCED_COUNTRIES, ...STANDARD_COUNTRIES];

export const DCTS_COUNTRY_SEED: DctsCountrySeed[] = ALL_COUNTRIES.map((countryName) => {
  const tier = tierFromCountry(countryName);
  const defaults = TIER_DEFAULTS[tier];
  const special = SPECIAL_CASES[countryName] ?? {};
  const suspensionWindows = special.graduationSuspensions ?? [];
  const isoCode = ISO_CODE_BY_COUNTRY[countryName];

  if (!isoCode) {
    throw new Error(`Missing ISO code mapping for country: ${countryName}`);
  }

  return {
    countryCode: isoCode,
    countryName,
    countryNameNormalized: normalizeCountryName(countryName),
    isoCode,
    tier,
    mfnRate: defaults.mfnRate,
    dctsRate: defaults.dctsRate,
    rulesOfOrigin: defaults.rulesOfOrigin,
    cumulationGroups: cumulationGroupsForCountry(countryName),
    hasGraduationSuspensions: Boolean(special.hasGraduationSuspensions ?? false),
    graduationSuspensions: suspensionWindows,
    hasUkFta: false,
    isDctsBeneficiary: true,
    notes: special.notes,
  };
});

export const DCTS_COUNTRY_COUNTS = {
  total: DCTS_COUNTRY_SEED.length,
  comprehensive: COMPREHENSIVE_COUNTRIES.length,
  enhanced: ENHANCED_COUNTRIES.length,
  standard: STANDARD_COUNTRIES.length,
} as const;
