export interface CustomerPhoto {
  id: string;
  url: string; // Base64 data url
  category: 'Company' | 'BusinessCard' | 'Document';
  date: string;
}

export interface Customer {
  id: string;
  companyName: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  lat: number;
  lng: number;
  notes: string;
  photos: CustomerPhoto[];
}

export interface Visit {
  id: string;
  customerName: string; // Müşteri Ünvanı / Adı Soyadı
  customerPhone?: string; // Telefon
  customerEmail?: string; // E-posta
  customerAddress?: string; // Adres (çok satırlı)
  lat?: number;
  lng?: number;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  purpose: string;
  notes: string;
  status: 'Planned' | 'Completed' | 'Cancelled';
  customerEntryMode?: 'existing' | 'manual';
  selectedCustomerId?: string;
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  manualCustomerEmail?: string;
  manualCustomerAddress?: string;
  meetingForm?: CustomerMeetingForm;
  workingBanks?: string[];
  cashFlowBanks?: string[];
  creditLimitBanks?: string[];
  collectionBanks?: string[];
  paymentBanks?: string[];
  workingBanksOther?: string;
  cashFlowBanksOther?: string;
  creditLimitBanksOther?: string;
  collectionBanksOther?: string;
  paymentBanksOther?: string;
  meetingNotes?: string;
  opinions?: string;
  companyImages?: string[];
  businessCardImages?: string[];
}

export interface CustomerMeetingForm {
  meetingDate: string;
  contactPerson: string;
  meetingResult: 'Görüşüldü' | 'Ertelendi' | 'Yerinde Bulunamadı' | 'Telefonla Görüşüldü' | 'İptal Edildi';
  employeeCount: number;
  lastPeriodTurnover: number;
  profitMargin: number;
  propertyType: 'Kendi Mülkü' | 'Kiralık';
  monthlyRentAmount?: number;
  salesCollectionMethods: string[]; // Nakit, Açık Hesap, vb.
  avgCollectionTerm: number;
  purchasePaymentMethods: string[]; // Nakit, Açık Hesap, vb.
  avgPurchaseTerm: number;
  hasExport: boolean;
  annualExportAmount?: number;
  exportCountries?: string;
  exportPaymentMethod?: string;
  hasImport: boolean;
  annualImportAmount?: number;
  importCountries?: string;
  importPaymentMethod?: string;
  cashFlowBank: string;
  loanBanks: string;
  workingBanks?: any; // Çalıştığı bankalar (string veya string[])
  tahsilatBanks?: string; // Tahsilat bankaları
  odemeBanks?: string; // Ödeme bankaları
  cashFlowBankOther?: string;
  loanBanksOther?: string;
  workingBanksOther?: string;
  tahsilatBanksOther?: string;
  odemeBanksOther?: string;
  cashFlowBanks?: string[];
  creditLimitBanks?: string[];
  collectionBanks?: string[];
  paymentBanks?: string[];
  cashFlowBanksOther?: string;
  creditLimitBanksOther?: string;
  collectionBanksOther?: string;
  paymentBanksOther?: string;
  bankingProductsUsed: string[]; // Ticari Kredi, vb.
  collateralStructure: string[]; // İpotek, vb.
  needAdditionalFinancing: boolean;
  financingNeeds: string[]; // İşletme Kredisi, vb.
  hasInvestmentPlan: boolean;
  estimatedInvestmentAmount?: number;
  capitalIncreasePlanned: boolean;
  generalNotes: string;
  meetingNotes?: string;
  opinions?: string;
  workingConditions?: string;
  businessStatus?: string;
  photos?: string[];
  businessCards?: string[];
}

export type SMTPPreset = 'Gmail' | 'Outlook' | 'Office365' | 'Exchange' | 'Yahoo' | 'Yandex' | 'Custom';

export interface SMTPConfig {
  preset: SMTPPreset;
  email: string;
  host: string;
  port: number;
  secure: boolean;
  password?: string;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  smtp: SMTPConfig;
}

export const getTodayDateString = (): string => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};
