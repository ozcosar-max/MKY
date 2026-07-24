import { Customer, Visit, AppSettings } from '../types';

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    id: "cust-1",
    companyName: "Anadolu Teknoloji A.Ş.",
    contactPerson: "Ahmet Yılmaz",
    phone: "+90 532 111 2233",
    email: "ahmet.yilmaz@anadolutech.com",
    address: "Büyükdere Cad. No:124, Kanyon Ofis Blokları Kat:8, Levent, İstanbul",
    lat: 41.0805,
    lng: 29.0112,
    notes: "Yıllık cirosu 150M TL olan, yazılım ve donanım ihracatı yapan önemli bir müşterimiz. Nakit akışı yönetimi ve döviz kredileriyle ilgileniyorlar.",
    photos: [
      {
        id: "photo-1-1",
        url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80",
        category: "Company",
        date: "2026-07-15"
      },
      {
        id: "photo-1-2",
        url: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=600&q=80",
        category: "BusinessCard",
        date: "2026-07-15"
      }
    ]
  },
  {
    id: "cust-2",
    companyName: "Yıldız Gıda Lojistik Sanayi",
    contactPerson: "Ayşe Demir",
    phone: "+90 542 222 3344",
    email: "ayse.demir@yildizgida.com.tr",
    address: "Maslak Plaza No:45 Kat:12, Maslak, İstanbul",
    lat: 41.1118,
    lng: 29.0204,
    notes: "Toptan gıda dağıtımı ve soğuk zincir lojistiği işi yapıyorlar. Filo yenileme leasing paketi ve POS oranları güncellemesi görüşülecek.",
    photos: [
      {
        id: "photo-2-1",
        url: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        category: "Company",
        date: "2026-07-10"
      }
    ]
  },
  {
    id: "cust-3",
    companyName: "Ege Otomotiv Yan Sanayi",
    contactPerson: "Mehmet Kaya",
    phone: "+90 505 333 4455",
    email: "m.kaya@egeotomotiv.com",
    address: "Halaskargazi Cad. No:89, Şişli, İstanbul",
    lat: 41.0602,
    lng: 28.9877,
    notes: "Almanya ve Fransa'ya yedek parça ihraç ediyorlar. Akreditif (L/C) limitlerinin artırılması ve gayri nakdi kredi talepleri bulunuyor.",
    photos: []
  },
  {
    id: "cust-4",
    companyName: "Zirve İnşaat Malzemeleri Ltd.",
    contactPerson: "Canan Özkan",
    phone: "+90 216 444 5566",
    email: "canan.ozkan@zirveinsaat.com.tr",
    address: "Bağdat Cad. No:312, Kadıköy, İstanbul",
    lat: 40.9901,
    lng: 29.0245,
    notes: "Konut ve ticari inşaat projelerine malzeme tedarik ediyorlar. DBS (Doğrudan Borçlandırma Sistemi) entegrasyonu yapmak istiyorlar.",
    photos: []
  },
  {
    id: "cust-5",
    companyName: "Trend Tekstil İthalat İhracat",
    contactPerson: "Burak Şahin",
    phone: "+90 216 555 6677",
    email: "burak@trendtekstil.com.tr",
    address: "Barbaros Mah. Kardelen Sok. No:8, Ataşehir, İstanbul",
    lat: 40.9847,
    lng: 29.1064,
    notes: "Hazır giyim üreticisi. Rotatif kredi vadeleri ve maaş ödeme protokolü anlaşması (promosyon teklifi) hakkında görüşmeler devam ediyor.",
    photos: []
  }
];

// Helper to get relative dates based on current date
const getRelativeDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getInitialVisits = (): Visit[] => {
  return [
    {
      id: "visit-1",
      customerName: "Anadolu Teknoloji A.Ş.",
      customerPhone: "+90 532 111 2233",
      customerEmail: "ahmet.yilmaz@anadolutech.com",
      customerAddress: "Büyükdere Cad. No:124, Kanyon Ofis Blokları Kat:8, Levent, İstanbul",
      lat: 41.0805,
      lng: 29.0112,
      date: getRelativeDateString(0), // Today
      time: "10:30",
      purpose: "Yeni Sezon Yatırım Kredisi Görüşmesi",
      notes: "Ahmet Bey ile döviz kredisi faiz oranları ve 24 ay vade seçeneği üzerinde mutabık kalındı. Şirket bilançosu olumlu, limit artışı onaylanabilir.",
      status: "Completed"
    },
    {
      id: "visit-2",
      customerName: "Yıldız Gıda Lojistik Sanayi",
      customerPhone: "+90 542 222 3344",
      customerEmail: "ayse.demir@yildizgida.com.tr",
      customerAddress: "Maslak Plaza No:45 Kat:12, Maslak, İstanbul",
      lat: 41.1118,
      lng: 29.0204,
      date: getRelativeDateString(0), // Today
      time: "14:00",
      purpose: "Filo Yenileme Leasing Talebi ve POS Komisyon Oranları",
      notes: "Ayşe Hanım ile yeni frigorifik araç filosu için teklif dosyası incelenecek. POS komisyon oranlarında binde 1.2 indirim talepleri var, genel müdürlükten onay istenecek.",
      status: "Planned"
    },
    {
      id: "visit-3",
      customerName: "Ege Otomotiv Yan Sanayi",
      customerPhone: "+90 505 333 4455",
      customerEmail: "m.kaya@egeotomotiv.com",
      customerAddress: "Halaskargazi Cad. No:89, Şişli, İstanbul",
      lat: 41.0602,
      lng: 28.9877,
      date: getRelativeDateString(1), // Tomorrow
      time: "11:00",
      purpose: "Akreditif Limit Artırımı ve İhracat Finansmanı",
      notes: "Almanya siparişleri için ek ham madde alımı akreditifi açılması gerekiyor. Mevcut nakdi limitler yeterli, gayri nakdi teminat mektubu verilecek.",
      status: "Planned"
    },
    {
      id: "visit-4",
      customerName: "Zirve İnşaat Malzemeleri Ltd.",
      customerPhone: "+90 216 444 5566",
      customerEmail: "canan.ozkan@zirveinsaat.com.tr",
      customerAddress: "Bağdat Cad. No:312, Kadıköy, İstanbul",
      lat: 40.9901,
      lng: 29.0245,
      date: getRelativeDateString(2), // Day after tomorrow
      time: "15:30",
      purpose: "DBS (Doğrudan Borçlandırma Sistemi) Kurulumu",
      notes: "Ana bayilerle aralarındaki tahsilat sistemini otomatikleştirmek istiyorlar. Bilgi işlem ekiplerinin entegrasyon API kılavuzu teslim edilecek.",
      status: "Planned"
    },
    {
      id: "visit-5",
      customerName: "Trend Tekstil İthalat İhracat",
      customerPhone: "+90 216 555 6677",
      customerEmail: "burak@trendtekstil.com.tr",
      customerAddress: "Barbaros Mah. Kardelen Sok. No:8, Ataşehir, İstanbul",
      lat: 40.9847,
      lng: 29.1064,
      date: getRelativeDateString(-3), // Missed / Past planned visit (should trigger persistent reminder)
      time: "16:00",
      purpose: "Maaş Ödeme Protokolü ve Promosyon Anlaşması",
      notes: "Eski banka anlaşmaları bitiyor. 120 çalışan için kişi başı yıllık promosyon teklifimiz sunulacak. Toplantı ertelendi ancak henüz tamamlanmadı.",
      status: "Planned"
    }
  ];
};

export const DEFAULT_SETTINGS: AppSettings = {
  theme: "system",
  notificationsEnabled: true,
  smtp: {
    preset: "Gmail",
    email: "portfolio.manager@bank.com",
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    password: "••••••••••••••••"
  }
};
