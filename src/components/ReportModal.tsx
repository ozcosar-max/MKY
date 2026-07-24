import React from 'react';
import { Customer, Visit } from '../types';
import { FileText, Mail, Share2, Printer, X } from 'lucide-react';

interface ReportModalProps {
  customer: Customer;
  visit: Visit;
  onClose: () => void;
  smtpEmail?: string;
}

export function ReportModal({ customer, visit, onClose, smtpEmail }: ReportModalProps) {
  const m = visit.meetingForm;

  const formatBool = (val?: boolean) => (val ? 'Evet' : 'Hayır');
  const formatCurrency = (val?: number, currency = 'TL') =>
    val !== undefined && val !== null && val > 0
      ? `${val.toLocaleString('tr-TR')} ${currency}`
      : 'Belirtilmedi';
  const formatText = (val?: string) => (val && val.trim() ? val : 'Belirtilmedi');

  const formatBanks = (banks: string[] | string | undefined, other?: string): string => {
    let list: string[] = [];
    if (Array.isArray(banks)) {
      list = banks.filter(Boolean);
    } else if (typeof banks === 'string') {
      list = banks.split(',').map(s => s.trim()).filter(Boolean);
    }
    
    if (list.length === 0) {
      return 'Belirtilmedi';
    }

    const hasOther = list.some(item => item === 'Diğer');
    if (hasOther && other && other.trim()) {
      const filtered = list.filter(item => item !== 'Diğer');
      if (filtered.length > 0) {
        return `${filtered.join(', ')}, Diğer (${other.trim()})`;
      }
      return `Diğer (${other.trim()})`;
    } else if (other && other.trim() && !list.includes(other.trim())) {
      if (list.includes('Diğer')) {
        return list.map(item => item === 'Diğer' ? `Diğer (${other.trim()})` : item).join(', ');
      }
      return `${list.join(', ')} (${other.trim()})`;
    }

    return list.join(', ');
  };

  const reportTitle = `${visit.customerName} - Detaylı Görüşme Raporu`;
  
  // Clean Plain Text Representation for Email/WhatsApp Sharing
  const reportText = `
PORTFÖY ZİYARET PLANI - DETAYLI TOPLANTI RAPORU
============================================
Tarih: ${visit.date} / Saat: ${visit.time}
Ziyaret Amacı: ${visit.purpose}
Durum: ${visit.status === 'Completed' ? 'Tamamlandı' : visit.status === 'Cancelled' ? 'İptal Edildi' : 'Planlandı'}

MÜŞTERİ GENEL BİLGİLERİ:
--------------------------------------------
Firma Ünvanı / Adı: ${visit.customerName}
Telefon: ${visit.customerPhone || 'Belirtilmedi'}
E-posta: ${visit.customerEmail || 'Belirtilmedi'}
Adres: ${visit.customerAddress || 'Belirtilmedi'}

GÖRÜŞME NOTLARI VE DEĞERLENDİRME:
--------------------------------------------
Özet Notlar: ${visit.notes || 'Herhangi bir toplantı notu girilmemiştir.'}
${m && m.meetingNotes ? `Toplantı Notları: ${m.meetingNotes}` : ''}
${m && m.opinions ? `Görüş ve Değerlendirmeler: ${m.opinions}` : ''}

${m ? `
FİRMA OPERASYONEL GÖSTERGELERİ:
--------------------------------------------
Görüşme Sonucu: ${m.meetingResult || 'Belirtilmedi'}
Yetkili Muhatap: ${m.contactPerson || 'Belirtilmedi'}
Çalışan Sayısı: ${m.employeeCount || 'Belirtilmedi'}
Yıllık Ciro Tutarı: ${formatCurrency(m.lastPeriodTurnover, 'TL')}
Kârlılık Oranı / Marjı: ${m.profitMargin ? `%${m.profitMargin}` : 'Belirtilmedi'}
Mülkiyet Durumu: ${m.propertyType || 'Belirtilmedi'} ${m.monthlyRentAmount ? `(Kira Bedeli: ${m.monthlyRentAmount.toLocaleString('tr-TR')} TL)` : ''}

TİCARİ NAKİT AKIŞI VE VADELER:
--------------------------------------------
Satış Tahsilat Yöntemleri: ${m.salesCollectionMethods?.join(', ') || 'Belirtilmedi'}
Ortalama Tahsilat Vadesi: ${m.avgCollectionTerm ? `${m.avgCollectionTerm} Gün` : 'Belirtilmedi'}
Satın Alma Ödeme Yöntemleri: ${m.purchasePaymentMethods?.join(', ') || 'Belirtilmedi'}
Ortalama Ödeme Vadesi: ${m.avgPurchaseTerm ? `${m.avgPurchaseTerm} Gün` : 'Belirtilmedi'}

DIŞ TİCARET FAALİYETLERİ:
--------------------------------------------
İhracat Faaliyeti: ${formatBool(m.hasExport)}
${m.hasExport ? `Yıllık İhracat Hacmi: ${formatCurrency(m.annualExportAmount, 'USD')}
İhracat Yapılan Ülkeler: ${formatText(m.exportCountries)}
İhracat Ödeme Şekilleri: ${formatText(m.exportPaymentMethod)}` : ''}

İthalat Faaliyeti: ${formatBool(m.hasImport)}
${m.hasImport ? `Yıllık İthalat Hacmi: ${formatCurrency(m.annualImportAmount, 'USD')}
İthalat Yapılan Ülkeler: ${formatText(m.importCountries)}
İthalat Ödeme Şekilleri: ${formatText(m.importPaymentMethod)}` : ''}

BANKACILIK İLİŞKİLERİ & ÇALIŞILAN BANKALAR:
--------------------------------------------
Nakit Akışı Çalışılan Banka: ${formatBanks(m.cashFlowBanks ?? m.cashFlowBank, m.cashFlowBanksOther ?? m.cashFlowBankOther)}
Kredi Limitli Bankalar: ${formatBanks(m.creditLimitBanks ?? m.loanBanks, m.creditLimitBanksOther ?? m.loanBanksOther)}
Çalıştığı Bankalar: ${formatBanks(m.workingBanks, m.workingBanksOther)}

KULLANILAN ÜRÜNLER VE TEMİNATLAR:
--------------------------------------------
Aktif Kullanılan Ürünler: ${m.bankingProductsUsed?.join(', ') || 'Belirtilmedi'}
Teminat Yapısı: ${m.collateralStructure?.join(', ') || 'Belirtilmedi'}

FİNANSMAN TALEBİ VE YATIRIM PLANLARI:
--------------------------------------------
İlave Finansman İhtiyacı: ${formatBool(m.needAdditionalFinancing)}
${m.needAdditionalFinancing ? `Finansman Talebi Türleri: ${m.financingNeeds?.join(', ') || 'Belirtilmedi'}` : ''}
Yatırım Planı Var mı?: ${formatBool(m.hasInvestmentPlan)}
${m.hasInvestmentPlan ? `Tahmini Yatırım Tutarı: ${formatCurrency(m.estimatedInvestmentAmount, 'TL')}` : ''}
Ciro/Sermaye Artış Planı: ${formatBool(m.capitalIncreasePlanned)}
` : 'Ayrıntılı görüşme formu doldurulmamıştır.'}

--------------------------------------------
Raporlayan: Ticari Portföy Yöneticisi
Üretim Tarihi: ${new Date().toLocaleDateString('tr-TR')}
  `.trim();

  // Handle HTML Print/PDF Generation
  const handleDownloadPDF = () => {
    const printableWindow = window.open('', '_blank');
    if (!printableWindow) {
      alert("Lütfen pop-up engelleyicinizi kapatıp tekrar deneyin.");
      return;
    }

    printableWindow.document.write(`
      <html>
        <head>
          <title>${reportTitle}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
            body {
              font-family: 'Plus Jakarta Sans', sans-serif;
              color: #1e293b;
              padding: 40px;
              line-height: 1.5;
              background-color: #ffffff;
            }
            .header-table {
              width: 100%;
              border-collapse: collapse;
              margin-bottom: 25px;
              border-bottom: 3px solid #0f766e;
              padding-bottom: 15px;
            }
            .brand-title {
              font-size: 26px;
              font-weight: 800;
              color: #0f766e;
              margin: 0;
              letter-spacing: -0.5px;
            }
            .brand-subtitle {
              font-size: 11px;
              text-transform: uppercase;
              letter-spacing: 1.5px;
              color: #64748b;
              font-weight: 700;
              margin-top: 3px;
            }
            .meta-info {
              text-align: right;
              font-size: 11px;
              color: #64748b;
              line-height: 1.6;
            }
            .section {
              margin-bottom: 24px;
              page-break-inside: avoid;
            }
            .section-title {
              font-weight: 800;
              font-size: 13px;
              text-transform: uppercase;
              letter-spacing: 1px;
              color: #0f766e;
              background-color: #f0fdfa;
              padding: 8px 12px;
              border-left: 4px solid #0f766e;
              margin-bottom: 12px;
              border-radius: 0 6px 6px 0;
            }
            .grid-table {
              width: 100%;
              border-collapse: collapse;
            }
            .grid-table td {
              padding: 6px 8px;
              font-size: 11.5px;
              border-bottom: 1px solid #f1f5f9;
              vertical-align: top;
            }
            .grid-table td.label {
              font-weight: 700;
              color: #475569;
              width: 25%;
            }
            .grid-table td.value {
              color: #1e293b;
              width: 25%;
            }
            .notes-box {
              background-color: #fafafa;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 12px 16px;
              font-size: 11.5px;
              color: #334155;
              white-space: pre-wrap;
              line-height: 1.6;
              font-style: italic;
            }
            .badge {
              display: inline-block;
              padding: 2px 8px;
              font-size: 10px;
              font-weight: 700;
              border-radius: 4px;
              text-transform: uppercase;
            }
            .badge-completed {
              background-color: #dcfce7;
              color: #15803d;
            }
            .badge-planned {
              background-color: #fef9c3;
              color: #a16207;
            }
            .badge-cancelled {
              background-color: #fee2e2;
              color: #b91c1c;
            }
            .footer {
              margin-top: 40px;
              border-top: 1px solid #e2e8f0;
              padding-top: 15px;
              font-size: 10px;
              color: #94a3b8;
              text-align: center;
              font-weight: 500;
            }
            @media print {
              body {
                padding: 15px;
              }
              .section {
                margin-bottom: 20px;
              }
            }
          </style>
        </head>
        <body>
          <table class="header-table">
            <tr>
              <td>
                <div class="brand-title">PORTFÖY ZİYARET PLANI</div>
                <div class="brand-subtitle">Ticari Müşteri Görüşme ve Değerlendirme Raporu</div>
              </td>
              <td class="meta-info">
                <strong>Rapor No:</strong> BVP-${visit.id.replace('visit-', '')}<br />
                <strong>Oluşturma Tarihi:</strong> ${new Date().toLocaleDateString('tr-TR')}<br />
                <strong>Portföy Yetkilisi:</strong> ${smtpEmail || 'Ticari Portföy Yöneticisi'}
              </td>
            </tr>
          </table>
          
          <div class="section">
            <div class="section-title">1. Görüşme ve Ziyaret Detayları</div>
            <table class="grid-table">
              <tr>
                <td class="label">Müşteri Firma:</td>
                <td class="value" style="font-weight: 700; color: #0f766e;">${visit.customerName}</td>
                <td class="label">Ziyaret Amacı:</td>
                <td class="value">${visit.purpose}</td>
              </tr>
              <tr>
                <td class="label">Görüşme Tarihi / Saati:</td>
                <td class="value">${visit.date} / ${visit.time}</td>
                <td class="label">Ziyaret Durumu:</td>
                <td class="value">
                  <span class="badge ${
                    visit.status === 'Completed'
                      ? 'badge-completed'
                      : visit.status === 'Cancelled'
                      ? 'badge-cancelled'
                      : 'badge-planned'
                  }">
                    ${visit.status === 'Completed' ? 'Tamamlandı' : visit.status === 'Cancelled' ? 'İptal Edildi' : 'Planlandı'}
                  </span>
                </td>
              </tr>
              <tr>
                <td class="label">Telefon:</td>
                <td class="value font-mono">${visit.customerPhone || 'Belirtilmedi'}</td>
                <td class="label">E-posta:</td>
                <td class="value">${visit.customerEmail || 'Belirtilmedi'}</td>
              </tr>
              <tr>
                <td class="label">Adres:</td>
                <td class="value" colspan="3">${visit.customerAddress || 'Belirtilmedi'}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">2. Toplantı / Ziyaret Notları</div>
            <div class="notes-box">${visit.notes || 'Herhangi bir toplantı notu girilmemiştir.'}</div>
          </div>

          ${
            m
              ? `
          <div class="section">
            <div class="section-title">3. Firma Operasyonel ve Finansal Göstergeleri</div>
            <table class="grid-table">
              <tr>
                <td class="label">Görüşme Sonucu:</td>
                <td class="value" style="font-weight: 600;">${m.meetingResult || 'Belirtilmedi'}</td>
                <td class="label font-semibold">Görüşülen Yetkili:</td>
                <td class="value">${m.contactPerson || 'Belirtilmedi'}</td>
              </tr>
              <tr>
                <td class="label">Çalışan Sayısı:</td>
                <td class="value">${m.employeeCount || 'Belirtilmedi'}</td>
                <td class="label">Yıllık Ciro Tutarı:</td>
                <td class="value">${formatCurrency(m.lastPeriodTurnover, 'TL')}</td>
              </tr>
              <tr>
                <td class="label">Kârlılık Oranı:</td>
                <td class="value">${m.profitMargin ? `%${m.profitMargin}` : 'Belirtilmedi'}</td>
                <td class="label">Mülkiyet Yapısı:</td>
                <td class="value">${m.propertyType || 'Belirtilmedi'} ${
                  m.monthlyRentAmount ? `(Kira: ${m.monthlyRentAmount.toLocaleString('tr-TR')} TL)` : ''
                }</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">4. Nakit Akışı, Tahsilat ve Satın Alma Vadeleri</div>
            <table class="grid-table">
              <tr>
                <td class="label">Satış Tahsilat Yöntemleri:</td>
                <td class="value">${m.salesCollectionMethods?.join(', ') || 'Belirtilmedi'}</td>
                <td class="label font-semibold">Ortalama Tahsilat Vadesi:</td>
                <td class="value">${m.avgCollectionTerm ? `${m.avgCollectionTerm} Gün` : 'Belirtilmedi'}</td>
              </tr>
              <tr>
                <td class="label">Satın Alma Ödeme Yöntemleri:</td>
                <td class="value">${m.purchasePaymentMethods?.join(', ') || 'Belirtilmedi'}</td>
                <td class="label font-semibold">Ortalama Ödeme Vadesi:</td>
                <td class="value">${m.avgPurchaseTerm ? `${m.avgPurchaseTerm} Gün` : 'Belirtilmedi'}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">5. Dış Ticaret Faaliyetleri</div>
            <table class="grid-table">
              <tr>
                <td class="label" style="background-color: #fafafa;">İhracat Yapılıyor mu?:</td>
                <td class="value" style="font-weight: 600; background-color: #fafafa;">${formatBool(m.hasExport)}</td>
                <td class="label" style="background-color: #fafafa;">İthalat Yapılıyor mu?:</td>
                <td class="value" style="font-weight: 600; background-color: #fafafa;">${formatBool(m.hasImport)}</td>
              </tr>
              ${
                m.hasExport
                  ? `
              <tr>
                <td class="label">Yıllık İhracat Hacmi:</td>
                <td class="value">${formatCurrency(m.annualExportAmount, 'USD')}</td>
                <td class="label">İhracat Ülkeleri:</td>
                <td class="value">${formatText(m.exportCountries)}</td>
              </tr>
              <tr>
                <td class="label">İhracat Ödeme Şekli:</td>
                <td class="value" colspan="3">${formatText(m.exportPaymentMethod)}</td>
              </tr>
              `
                  : ''
              }
              ${
                m.hasImport
                  ? `
              <tr>
                <td class="label">Yıllık İthalat Hacmi:</td>
                <td class="value">${formatCurrency(m.annualImportAmount, 'USD')}</td>
                <td class="label">İthalat Ülkeleri:</td>
                <td class="value">${formatText(m.importCountries)}</td>
              </tr>
              <tr>
                <td class="label">İthalat Ödeme Şekli:</td>
                <td class="value" colspan="3">${formatText(m.importPaymentMethod)}</td>
              </tr>
              `
                  : ''
              }
            </table>
          </div>

          <div class="section">
            <div class="section-title">6. Bankacılık İlişkileri & Çalışılan Bankalar</div>
            <table class="grid-table">
              <tr>
                <td class="label">Nakit Akışı Bankası:</td>
                <td class="value" colspan="3">${formatBanks(m.cashFlowBanks ?? m.cashFlowBank, m.cashFlowBanksOther ?? m.cashFlowBankOther)}</td>
              </tr>
              <tr>
                <td class="label">Kredi Limitli Bankalar:</td>
                <td class="value" colspan="3">${formatBanks(m.creditLimitBanks ?? m.loanBanks, m.creditLimitBanksOther ?? m.loanBanksOther)}</td>
              </tr>
              <tr>
                <td class="label">Çalıştığı Bankalar:</td>
                <td class="value" colspan="3">${formatBanks(m.workingBanks, m.workingBanksOther)}</td>
              </tr>
              <tr>
                <td class="label">Tahsilat Çalışılan Bankalar:</td>
                <td class="value" colspan="3">${formatBanks(m.collectionBanks ?? m.tahsilatBanks, m.collectionBanksOther ?? m.tahsilatBanksOther)}</td>
              </tr>
              <tr>
                <td class="label">Ödeme Çalışılan Bankalar:</td>
                <td class="value" colspan="3">${formatBanks(m.paymentBanks ?? m.odemeBanks, m.paymentBanksOther ?? m.odemeBanksOther)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">7. Kullanılan Bankacılık Ürünleri & Teminatlar</div>
            <table class="grid-table">
              <tr>
                <td class="label">Aktif Kullanılan Ürünler:</td>
                <td class="value" colspan="3">${m.bankingProductsUsed?.join(', ') || 'Belirtilmedi'}</td>
              </tr>
              <tr>
                <td class="label">Teminat Yapısı:</td>
                <td class="value" colspan="3">${m.collateralStructure?.join(', ') || 'Belirtilmedi'}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">8. Finansman Talebi ve Yatırım Beklentileri</div>
            <table class="grid-table">
              <tr>
                <td class="label">İlave Finansman İhtiyacı:</td>
                <td class="value">${formatBool(m.needAdditionalFinancing)}</td>
                <td class="label">Finansman Talebi Detayı:</td>
                <td class="value">${
                  m.needAdditionalFinancing ? m.financingNeeds?.join(', ') || 'Belirtilmedi' : 'Yok'
                }</td>
              </tr>
              <tr>
                <td class="label">Yatırım Planı Var mı?:</td>
                <td class="value">${formatBool(m.hasInvestmentPlan)}</td>
                <td class="label">Tahmini Yatırım Tutarı:</td>
                <td class="value">${
                  m.hasInvestmentPlan ? formatCurrency(m.estimatedInvestmentAmount, 'TL') : 'Yok'
                }</td>
              </tr>
              <tr>
                <td class="label" colspan="2">Gelecek Dönem Ciro / Sermaye Artış Planı Var mı?:</td>
                <td class="value" colspan="2" style="font-weight: 600;">${formatBool(m.capitalIncreasePlanned)}</td>
              </tr>
            </table>
          </div>

          <div class="section">
            <div class="section-title">9. Portföy Yöneticisi Değerlendirmeleri ve Görüşler</div>
            <table class="grid-table">
              <tr>
                <td class="label">Toplantı Notları:</td>
                <td class="value" colspan="3">${formatText(m.meetingNotes || m.generalNotes)}</td>
              </tr>
              <tr>
                <td class="label">Görüş ve Değerlendirmeler:</td>
                <td class="value" colspan="3">${formatText(m.opinions)}</td>
              </tr>
            </table>
          </div>

          ${
            (m.photos && m.photos.length > 0) || (m.businessCards && m.businessCards.length > 0)
              ? `
          <div class="section" style="page-break-inside: avoid;">
            <div class="section-title">10. Görüşme Görselleri</div>
            <div style="display: flex; flex-wrap: wrap; gap: 15px; margin-top: 10px;">
              ${
                m.photos && m.photos.length > 0
                  ? m.photos.map(p => `
                    <div style="flex: 1 1 200px; max-width: 300px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; background: #fafafa; box-sizing: border-box;">
                      <img src="${p}" style="width: 100%; height: auto; max-height: 220px; border-radius: 6px; object-fit: contain;" referrerpolicy="no-referrer" />
                      <div style="font-size: 10px; color: #64748b; text-align: center; margin-top: 5px; font-weight: 600;">Görüşme Fotoğrafı</div>
                    </div>
                  `).join('')
                  : ''
              }
              ${
                m.businessCards && m.businessCards.length > 0
                  ? m.businessCards.map(bc => `
                    <div style="flex: 1 1 200px; max-width: 300px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 6px; background: #fafafa; box-sizing: border-box;">
                      <img src="${bc}" style="width: 100%; height: auto; max-height: 220px; border-radius: 6px; object-fit: contain;" referrerpolicy="no-referrer" />
                      <div style="font-size: 10px; color: #64748b; text-align: center; margin-top: 5px; font-weight: 600;">Kartvizit / Belge</div>
                    </div>
                  `).join('')
                  : ''
              }
            </div>
          </div>
          `
              : ''
          }
          `
              : ''
          }

          <div class="footer">
            Bu rapor Portföy Ziyaret Planı (Ticari Portföy Yönetim Platformu) tarafından güvenli olarak üretilmiştir. © 2026
          </div>
          
          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `);
    printableWindow.document.close();
  };

  // Mailto Dispatch
  const handleSendEmail = () => {
    const subject = encodeURIComponent(`${visit.customerName} Detaylı Toplantı Özet Raporu`);
    const body = encodeURIComponent(reportText);
    const mailtoUrl = `mailto:${visit.customerEmail || customer.email || ''}?subject=${subject}&body=${body}`;
    window.location.href = mailtoUrl;
  };

  // WhatsApp Dispatch
  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(reportText);
    const whatsappUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in duration-200">
      <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4.5 border-b border-slate-150 dark:border-zinc-800/80">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" />
            <h2 className="font-display font-bold text-slate-950 dark:text-zinc-50 text-base">
              Ziyaret Değerlendirme Raporu
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Review Area */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <p className="text-xs sm:text-sm font-medium text-slate-500 dark:text-zinc-400 leading-normal">
            Aşağıdaki görüşme özeti ve yapılandırılmış değerlendirme formu verileri anlık olarak derlendi. Raporu yazdırabilir, kurumsal e-posta veya anlık mesajlaşma kanallarıyla paylaşabilirsiniz.
          </p>

          <div className="p-4 bg-slate-50 dark:bg-zinc-950 border border-slate-200/80 dark:border-zinc-850 rounded-xl font-mono text-xs text-slate-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-[45vh] overflow-y-auto shadow-inner">
            {reportText}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-teal-50/30 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-900/15 rounded-xl text-xs text-slate-500 dark:text-zinc-400">
            <div>
              <span>Raporlanan Müşteri: </span>
              <strong className="text-slate-800 dark:text-zinc-200">{visit.customerName}</strong>
            </div>
            <div>
              <span>Görüşen Muhatap: </span>
              <strong className="text-slate-800 dark:text-zinc-200">
                {m?.contactPerson || customer.contactPerson || visit.customerName}
              </strong>
            </div>
            <div>
              <span>Görüşme Tarihi: </span>
              <strong className="text-slate-800 dark:text-zinc-200">{visit.date} / {visit.time}</strong>
            </div>
            <div>
              <span>Yetkili Portföy: </span>
              <strong className="text-emerald-600 dark:text-emerald-400">
                {smtpEmail || 'Ticari Portföy Yetkilisi'}
              </strong>
            </div>
          </div>
        </div>

        {/* Actions bar */}
        <div className="bg-slate-50 dark:bg-zinc-950/80 px-6 py-4 border-t border-slate-150 dark:border-zinc-800/80 rounded-b-2xl flex flex-wrap gap-2 justify-end">
          <button
            onClick={handleDownloadPDF}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Rapor Yazdır / PDF İndir
          </button>

          <button
            onClick={handleSendEmail}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow transition-colors cursor-pointer"
          >
            <Mail className="w-4 h-4" />
            E-posta Gönder
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4" />
            WhatsApp Paylaş
          </button>

          <button
            onClick={onClose}
            className="px-3.5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 transition-colors cursor-pointer"
          >
            Vazgeç
          </button>
        </div>

      </div>
    </div>
  );
}
