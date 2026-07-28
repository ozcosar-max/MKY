import React, { useState } from 'react';
import { CustomerMeetingForm, getTodayDateString } from '../types';
import { MultiSelectBankInput } from './MultiSelectBankInput';
import { 
  ChevronDown, 
  ChevronUp, 
  Calendar, 
  User, 
  TrendingUp, 
  Home, 
  DollarSign, 
  Briefcase, 
  ShoppingBag, 
  Globe, 
  ArrowUpRight, 
  ArrowDownLeft,
  Building,
  ShieldCheck,
  Percent,
  FileText,
  Camera,
  Image,
  Trash2
} from 'lucide-react';

const stringToArray = (val: any): string[] => {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string') {
    return val.split(',').map(s => s.trim()).filter(Boolean);
  }
  return [];
};

const arrayToString = (val: any): string => {
  if (Array.isArray(val)) {
    return val.join(', ');
  }
  if (typeof val === 'string') {
    return val;
  }
  return '';
};

interface CustomerMeetingFormProps {
  value: CustomerMeetingForm;
  onChange: (newValue: CustomerMeetingForm) => void;
}

export function CustomerMeetingFormComp({ value, onChange }: CustomerMeetingFormProps) {
  // Expandable sections state
  const [expanded, setExpanded] = useState({
    general: true,
    company: false,
    property: false,
    sales: false,
    purchasing: false,
    export: false,
    import: false,
    banking: false,
    financing: false,
    investment: false,
    capital: false,
    notes: true,
    photos: true
  });

  const toggleSection = (section: keyof typeof expanded) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateField = (field: keyof CustomerMeetingForm, val: any) => {
    onChange({
      ...value,
      [field]: val
    });
  };

  const toggleCheckboxInList = (field: keyof CustomerMeetingForm, item: string) => {
    const list = (value[field] as string[]) || [];
    const newList = list.includes(item)
      ? list.filter(i => i !== item)
      : [...list, item];
    updateField(field, newList);
  };

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>, field: 'photos' | 'businessCards') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const existingList = value[field] || [];
        updateField(field, [...existingList, reader.result]);
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleImageDelete = (field: 'photos' | 'businessCards', index: number) => {
    const existingList = value[field] || [];
    const newList = existingList.filter((_, i) => i !== index);
    updateField(field, newList);
  };

  const resultsOptions = ['Görüşüldü', 'Ertelendi', 'Yerinde Bulunamadı', 'Telefonla Görüşüldü', 'İptal Edildi'] as const;
  const collectionOptions = ['Nakit', 'Açık Hesap', 'Çek', 'Senet', 'DBS', 'POS', 'Havale / EFT', 'Diğer'];
  const bankingProducts = ['Ticari Kredi', 'Spot Kredi', 'Rotatif Kredi', 'POS', 'DBS', 'Teminat Mektubu', 'İhracat Kredisi', 'Leasing', 'Faktoring', 'Çek'];
  const collateralOptions = ['İpotek', 'Nakit Bloke', 'Kefalet', 'Çek', 'Teminat Mektubu', 'Diğer'];
  const financingNeedsOptions = ['İşletme Kredisi', 'Yatırım Kredisi', 'Makine', 'Araç', 'Gayrimenkul', 'Döviz Kredisi', 'Diğer'];

  return (
    <div className="space-y-2.5 text-xs">
      
      {/* ----------------- 1. GENERAL SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('general')}
          className="w-full px-3 py-2.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left text-xs"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-teal-600" />
            <span>GENEL GÖRÜŞME BİLGİLERİ</span>
          </div>
          {expanded.general ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.general && (
          <div className="p-3 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-2.5 bg-white dark:bg-zinc-900/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Görüşme Tarihi</label>
                <input
                  type="date"
                  value={value.meetingDate}
                  onChange={(e) => updateField('meetingDate', e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Muhatap Kişi</label>
                <input
                  type="text"
                  value={value.contactPerson}
                  onChange={(e) => updateField('contactPerson', e.target.value)}
                  placeholder="Görüşülen yetkilinin adı"
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-slate-600 dark:text-zinc-400 block">Görüşme Sonucu</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1.5">
                {resultsOptions.map((option) => (
                  <label
                    key={option}
                    className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer select-none transition-all ${
                      value.meetingResult === option
                        ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                        : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={value.meetingResult === option}
                      onChange={() => updateField('meetingResult', option)}
                      className="w-3.5 h-3.5 text-teal-600 border-slate-300 focus:ring-teal-500"
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 2. COMPANY SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('company')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-teal-600" />
            <span>FİRMA MAVİ TABELA / HUKUKİ YAPI</span>
          </div>
          {expanded.company ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.company && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-3.5 bg-white dark:bg-zinc-900/40">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Çalışan Sayısı (Kişi)</label>
                <input
                  type="number"
                  value={value.employeeCount || ''}
                  onChange={(e) => updateField('employeeCount', parseInt(e.target.value) || 0)}
                  placeholder="Örn: 25"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Son Dönem Net Ciro (₺)</label>
                <input
                  type="number"
                  value={value.lastPeriodTurnover || ''}
                  onChange={(e) => updateField('lastPeriodTurnover', parseFloat(e.target.value) || 0)}
                  placeholder="Örn: 12000000"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Brüt Kar Marjı (%)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={value.profitMargin || ''}
                    onChange={(e) => updateField('profitMargin', parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 18"
                    className="w-full pl-3 pr-8 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                  />
                  <Percent className="absolute right-3 top-3.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 3. PROPERTY SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('property')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Home className="w-4.5 h-4.5 text-teal-600" />
            <span>MÜLKİYET DURUMU</span>
          </div>
          {expanded.property ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.property && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400 block">İş Yeri Mülkiyet Tipi</label>
              <div className="grid grid-cols-2 gap-3">
                {['Kendi Mülkü', 'Kiralık'].map((type) => (
                  <label
                    key={type}
                    className={`flex items-center gap-2.5 p-3.5 rounded-xl border cursor-pointer select-none transition-all ${
                      value.propertyType === type
                        ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                        : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <input
                      type="radio"
                      checked={value.propertyType === type}
                      onChange={() => {
                        updateField('propertyType', type);
                        if (type === 'Kendi Mülkü') {
                          updateField('monthlyRentAmount', undefined);
                        }
                      }}
                      className="w-4 h-4 text-teal-600 border-slate-300 focus:ring-teal-500"
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {value.propertyType === 'Kiralık' && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Aylık Kira Bedeli (₺)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={value.monthlyRentAmount || ''}
                    onChange={(e) => updateField('monthlyRentAmount', parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 45000"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                  />
                  <DollarSign className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- 4. SALES SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('sales')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ArrowUpRight className="w-4.5 h-4.5 text-teal-600" />
            <span>SATIŞ / TAHSİLAT YAPISI</span>
          </div>
          {expanded.sales ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.sales && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400 block">Müşterilerden Tahsilat Yöntemleri (Çoklu Seçim)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {collectionOptions.map((method) => {
                  const isChecked = value.salesCollectionMethods?.includes(method) || false;
                  return (
                    <label
                      key={method}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                          : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxInList('salesCollectionMethods', method)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span>{method}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Ortalama Satış/Tahsilat Vadesi (Gün)</label>
                <input
                  type="number"
                  value={value.avgCollectionTerm || ''}
                  onChange={(e) => updateField('avgCollectionTerm', parseInt(e.target.value) || 0)}
                  placeholder="Örn: 60"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 5. PURCHASING SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('purchasing')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ArrowDownLeft className="w-4.5 h-4.5 text-teal-600" />
            <span>SATIN ALMA / ÖDEME YAPISI</span>
          </div>
          {expanded.purchasing ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.purchasing && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400 block">Tedarikçilere Ödeme Yöntemleri (Çoklu Seçim)</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {collectionOptions.filter(m => m !== 'POS').map((method) => {
                  const isChecked = value.purchasePaymentMethods?.includes(method) || false;
                  return (
                    <label
                      key={method}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                          : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxInList('purchasePaymentMethods', method)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span>{method}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Ortalama Alım/Ödeme Vadesi (Gün)</label>
                <input
                  type="number"
                  value={value.avgPurchaseTerm || ''}
                  onChange={(e) => updateField('avgPurchaseTerm', parseInt(e.target.value) || 0)}
                  placeholder="Örn: 90"
                  className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 6. EXPORT SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('export')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-teal-600" />
            <span>İHRACAT FAALİYETİ</span>
          </div>
          {expanded.export ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.export && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800/60">
              <span className="font-bold text-slate-700 dark:text-zinc-300">İhracat Var mı?</span>
              <button
                type="button"
                onClick={() => {
                  updateField('hasExport', !value.hasExport);
                  if (value.hasExport) {
                    onChange({
                      ...value,
                      hasExport: false,
                      annualExportAmount: undefined,
                      exportCountries: '',
                      exportPaymentMethod: ''
                    });
                  }
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                  value.hasExport ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-850'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  value.hasExport ? 'transform translate-x-5.5' : ''
                }`} />
              </button>
            </div>

            {value.hasExport && (
              <div className="space-y-3.5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-zinc-400">Yıllık İhracat Bedeli ($)</label>
                    <input
                      type="number"
                      value={value.annualExportAmount || ''}
                      onChange={(e) => updateField('annualExportAmount', parseFloat(e.target.value) || 0)}
                      placeholder="Örn: 250000"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-zinc-400">İhracat Ülkeleri</label>
                    <input
                      type="text"
                      value={value.exportCountries || ''}
                      onChange={(e) => updateField('exportCountries', e.target.value)}
                      placeholder="Örn: Almanya, İtalya"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-zinc-400">Tahsilat / Ödeme Şekli</label>
                    <input
                      type="text"
                      value={value.exportPaymentMethod || ''}
                      onChange={(e) => updateField('exportPaymentMethod', e.target.value)}
                      placeholder="Örn: Akreditif, Peşin"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- 7. IMPORT SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('import')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Globe className="w-4.5 h-4.5 text-teal-600" />
            <span>İTHALAT FAALİYETİ</span>
          </div>
          {expanded.import ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.import && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800/60">
              <span className="font-bold text-slate-700 dark:text-zinc-300">İthalat Var mı?</span>
              <button
                type="button"
                onClick={() => {
                  updateField('hasImport', !value.hasImport);
                  if (value.hasImport) {
                    onChange({
                      ...value,
                      hasImport: false,
                      annualImportAmount: undefined,
                      importCountries: '',
                      importPaymentMethod: ''
                    });
                  }
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                  value.hasImport ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-850'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  value.hasImport ? 'transform translate-x-5.5' : ''
                }`} />
              </button>
            </div>

            {value.hasImport && (
              <div className="space-y-3.5 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-zinc-400">Yıllık İthalat Bedeli ($)</label>
                    <input
                      type="number"
                      value={value.annualImportAmount || ''}
                      onChange={(e) => updateField('annualImportAmount', parseFloat(e.target.value) || 0)}
                      placeholder="Örn: 180000"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-zinc-400">İthalat Ülkeleri</label>
                    <input
                      type="text"
                      value={value.importCountries || ''}
                      onChange={(e) => updateField('importCountries', e.target.value)}
                      placeholder="Örn: Çin, Güney Kore"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-slate-600 dark:text-zinc-400">Ödeme Şekli</label>
                    <input
                      type="text"
                      value={value.importPaymentMethod || ''}
                      onChange={(e) => updateField('importPaymentMethod', e.target.value)}
                      placeholder="Örn: Mal Mukabili, Akreditif"
                      className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- 8. BANKING SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('banking')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <Building className="w-4.5 h-4.5 text-teal-600" />
            <span>BANKACILIK İLİŞKİLERİ</span>
          </div>
          {expanded.banking ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.banking && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <MultiSelectBankInput
                label="Nakit Akışının Döndüğü Banka (Nakit Akış Bankaları)"
                value={arrayToString(value.cashFlowBanks ?? value.cashFlowBank ?? '')}
                otherValue={value.cashFlowBanksOther || value.cashFlowBankOther || ''}
                onChange={(val, otherVal) => {
                  const cleanVal = val || '';
                  const cleanOther = otherVal || '';
                  onChange({
                    ...value,
                    cashFlowBank: cleanVal,
                    cashFlowBankOther: cleanOther,
                    cashFlowBanks: stringToArray(cleanVal),
                    cashFlowBanksOther: cleanOther
                  });
                }}
                placeholder="Nakit akışı dönen bankaları seçin..."
              />

              <MultiSelectBankInput
                label="Kredi Kullanılan Bankalar (Kredi Bankaları)"
                value={arrayToString(value.creditLimitBanks ?? value.loanBanks ?? '')}
                otherValue={value.creditLimitBanksOther || value.loanBanksOther || ''}
                onChange={(val, otherVal) => {
                  const cleanVal = val || '';
                  const cleanOther = otherVal || '';
                  onChange({
                    ...value,
                    loanBanks: cleanVal,
                    loanBanksOther: cleanOther,
                    creditLimitBanks: stringToArray(cleanVal),
                    creditLimitBanksOther: cleanOther
                  });
                }}
                placeholder="Kredi kullanılan bankaları seçin..."
              />
            </div>

            <div className="grid grid-cols-1 gap-3.5">
              <MultiSelectBankInput
                label="Çalıştığı Diğer Bankalar (Tüm Bankalar)"
                value={arrayToString(value.workingBanks ?? '')}
                otherValue={value.workingBanksOther || ''}
                onChange={(val, otherVal) => {
                  const cleanVal = val || '';
                  const cleanOther = otherVal || '';
                  onChange({
                    ...value,
                    workingBanks: stringToArray(cleanVal),
                    workingBanksOther: cleanOther
                  });
                }}
                placeholder="Çalışılan diğer bankaları seçin..."
              />
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400 block">Kullanılan Bankacılık Ürünleri (Çoklu Seçim)</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {bankingProducts.map((prod) => {
                  const isChecked = value.bankingProductsUsed?.includes(prod) || false;
                  return (
                    <label
                      key={prod}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                          : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxInList('bankingProductsUsed', prod)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span>{prod}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400 block">Teminat Yapısı (Çoklu Seçim)</label>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                {collateralOptions.map((col) => {
                  const isChecked = value.collateralStructure?.includes(col) || false;
                  return (
                    <label
                      key={col}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                          : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleCheckboxInList('collateralStructure', col)}
                        className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                      />
                      <span>{col}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 9. FINANCING SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('financing')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4.5 h-4.5 text-teal-600" />
            <span>FİNANSMAN İHTİYACI</span>
          </div>
          {expanded.financing ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.financing && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800/60">
              <span className="font-bold text-slate-700 dark:text-zinc-300">Ek Finansman İhtiyacı Var mı?</span>
              <button
                type="button"
                onClick={() => {
                  updateField('needAdditionalFinancing', !value.needAdditionalFinancing);
                  if (value.needAdditionalFinancing) {
                    onChange({
                      ...value,
                      needAdditionalFinancing: false,
                      financingNeeds: []
                    });
                  }
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                  value.needAdditionalFinancing ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-850'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  value.needAdditionalFinancing ? 'transform translate-x-5.5' : ''
                }`} />
              </button>
            </div>

            {value.needAdditionalFinancing && (
              <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="font-semibold text-slate-600 dark:text-zinc-400 block">Talep Edilen Kredi / Finansman Türleri (Çoklu Seçim)</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {financingNeedsOptions.map((need) => {
                    const isChecked = value.financingNeeds?.includes(need) || false;
                    return (
                      <label
                        key={need}
                        className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer select-none transition-all ${
                          isChecked
                            ? 'bg-teal-500/10 border-teal-500/85 text-teal-700 dark:text-teal-400 font-bold'
                            : 'bg-slate-50/50 dark:bg-zinc-950/50 border-slate-200/80 dark:border-zinc-800 hover:bg-slate-100/80 dark:hover:bg-zinc-900/80 text-slate-700 dark:text-zinc-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleCheckboxInList('financingNeeds', need)}
                          className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                        />
                        <span>{need}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- 10. INVESTMENT SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('investment')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-teal-600" />
            <span>YATIRIM PLANLARI</span>
          </div>
          {expanded.investment ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.investment && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 space-y-4 bg-white dark:bg-zinc-900/40">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800/60">
              <span className="font-bold text-slate-700 dark:text-zinc-300">Önümüzdeki Dönem Yatırım Planı Var mı?</span>
              <button
                type="button"
                onClick={() => {
                  updateField('hasInvestmentPlan', !value.hasInvestmentPlan);
                  if (value.hasInvestmentPlan) {
                    onChange({
                      ...value,
                      hasInvestmentPlan: false,
                      estimatedInvestmentAmount: undefined
                    });
                  }
                }}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                  value.hasInvestmentPlan ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-850'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  value.hasInvestmentPlan ? 'transform translate-x-5.5' : ''
                }`} />
              </button>
            </div>

            {value.hasInvestmentPlan && (
              <div className="space-y-1 animate-in fade-in slide-in-from-top-2">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Tahmini Yatırım Tutarı (₺)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={value.estimatedInvestmentAmount || ''}
                    onChange={(e) => updateField('estimatedInvestmentAmount', parseFloat(e.target.value) || 0)}
                    placeholder="Örn: 2500000"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-mono font-medium"
                  />
                  <DollarSign className="absolute left-3.5 top-3.5 w-3.5 h-3.5 text-slate-400" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ----------------- 11. CAPITAL SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('capital')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4.5 h-4.5 text-teal-600" />
            <span>SERMAYE DEĞİŞİM PLANI</span>
          </div>
          {expanded.capital ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.capital && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-zinc-950 rounded-xl border border-slate-200/80 dark:border-zinc-800/60">
              <span className="font-bold text-slate-700 dark:text-zinc-300">Sermaye Artışı Planlanıyor mu?</span>
              <button
                type="button"
                onClick={() => updateField('capitalIncreasePlanned', !value.capitalIncreasePlanned)}
                className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                  value.capitalIncreasePlanned ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-850'
                }`}
              >
                <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                  value.capitalIncreasePlanned ? 'transform translate-x-5.5' : ''
                }`} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 12. GENERAL NOTES SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-2xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-xs">
        <button
          type="button"
          onClick={() => toggleSection('notes')}
          className="w-full px-4 py-3.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left"
        >
          <div className="flex items-center gap-2">
            <FileText className="w-4.5 h-4.5 text-teal-600" />
            <span>GENEL DİĞER NOTLAR (Münferit Not)</span>
          </div>
          {expanded.notes ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.notes && (
          <div className="p-4 border-t border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 space-y-4">
            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400">Toplantı Notları</label>
              <textarea
                value={value.meetingNotes || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  onChange({
                    ...value,
                    meetingNotes: val,
                    generalNotes: val
                  });
                }}
                rows={4}
                placeholder="Görüşülen konuları ve alınan notları ekleyin..."
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="font-semibold text-slate-600 dark:text-zinc-400">Görüş ve Değerlendirmeler</label>
              <textarea
                value={value.opinions || ''}
                onChange={(e) => updateField('opinions', e.target.value)}
                rows={4}
                placeholder="Müşteri hakkındaki görüşleriniz ve değerlendirmeleriniz..."
                className="w-full px-3 py-2.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-medium focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* ----------------- 13. PHOTOS SECTION ----------------- */}
      <div className="bg-slate-50 dark:bg-zinc-950/45 rounded-xl border border-slate-200/80 dark:border-zinc-850/80 overflow-hidden shadow-2xs">
        <button
          type="button"
          onClick={() => toggleSection('photos')}
          className="w-full px-3 py-2.5 flex items-center justify-between font-display font-bold text-slate-800 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-900/60 transition-colors text-left text-xs"
        >
          <div className="flex items-center gap-2">
            <Camera className="w-4 h-4 text-teal-600" />
            <span>FOTOĞRAFLAR VE KARTVİZİTLER</span>
          </div>
          {expanded.photos ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>

        {expanded.photos && (
          <div className="p-3 border-t border-slate-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/40 space-y-3.5 text-xs">
            {/* Fotoğraflar Alt Bölümü */}
            <div className="space-y-2">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Görüşme Fotoğrafları</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="meeting-camera-photos"
                    className="hidden"
                    onChange={(e) => handleImageAdd(e, 'photos')}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('meeting-camera-photos')?.click()}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg border border-teal-100/40 font-semibold cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Kamera
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    id="meeting-gallery-photos"
                    className="hidden"
                    onChange={(e) => handleImageAdd(e, 'photos')}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('meeting-gallery-photos')?.click()}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg border border-slate-200/50 font-semibold cursor-pointer transition-colors"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Galeri
                  </button>
                </div>
              </div>

              {(!value.photos || value.photos.length === 0) ? (
                <p className="text-[11px] text-slate-400 italic">Henüz fotoğraf eklenmedi.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {value.photos.map((url, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-square group bg-slate-50">
                      <img src={url} alt={`Photo ${i}`} className="w-full h-full object-cover animate-fade-in" />
                      <button
                        type="button"
                        onClick={() => handleImageDelete('photos', i)}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Kartvizitler Alt Bölümü */}
            <div className="space-y-2 border-t border-slate-100 dark:border-zinc-800/60 pt-2.5">
              <div className="flex justify-between items-center gap-2">
                <span className="font-bold text-slate-700 dark:text-zinc-300 text-xs">Müşteri Kartvizitleri</span>
                <div className="flex items-center gap-1.5">
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    id="meeting-camera-cards"
                    className="hidden"
                    onChange={(e) => handleImageAdd(e, 'businessCards')}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('meeting-camera-cards')?.click()}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/30 dark:hover:bg-teal-900/30 text-teal-600 dark:text-teal-400 rounded-lg border border-teal-100/40 font-semibold cursor-pointer transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    Kamera
                  </button>

                  <input
                    type="file"
                    accept="image/*"
                    id="meeting-gallery-cards"
                    className="hidden"
                    onChange={(e) => handleImageAdd(e, 'businessCards')}
                  />
                  <button
                    type="button"
                    onClick={() => document.getElementById('meeting-gallery-cards')?.click()}
                    className="flex items-center gap-1 px-2 py-1 text-[11px] bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-lg border border-slate-200/50 font-semibold cursor-pointer transition-colors"
                  >
                    <Image className="w-3.5 h-3.5" />
                    Galeri
                  </button>
                </div>
              </div>

              {(!value.businessCards || value.businessCards.length === 0) ? (
                <p className="text-[11px] text-slate-400 italic">Henüz kartvizit eklenmedi.</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {value.businessCards.map((url, i) => (
                    <div key={i} className="relative rounded-lg overflow-hidden border border-slate-200 dark:border-zinc-800 aspect-square group bg-slate-50">
                      <img src={url} alt={`Card ${i}`} className="w-full h-full object-cover animate-fade-in" />
                      <button
                        type="button"
                        onClick={() => handleImageDelete('businessCards', i)}
                        className="absolute top-1 right-1 p-0.5 bg-red-600 hover:bg-red-700 text-white rounded-full opacity-90 group-hover:opacity-100 transition-opacity cursor-pointer shadow-xs"
                      >
                        <Trash2 className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}

export const createEmptyMeetingForm = (defaultDate: string = getTodayDateString(), defaultContact: string = ''): CustomerMeetingForm => ({
  meetingDate: defaultDate,
  contactPerson: defaultContact,
  meetingResult: 'Görüşüldü',
  employeeCount: 0,
  lastPeriodTurnover: 0,
  profitMargin: 0,
  propertyType: 'Kendi Mülkü',
  salesCollectionMethods: [],
  avgCollectionTerm: 0,
  purchasePaymentMethods: [],
  avgPurchaseTerm: 0,
  hasExport: false,
  annualExportAmount: undefined,
  exportCountries: '',
  exportPaymentMethod: '',
  hasImport: false,
  annualImportAmount: undefined,
  importCountries: '',
  importPaymentMethod: '',
  cashFlowBank: '',
  loanBanks: '',
  workingBanks: '',
  tahsilatBanks: '',
  odemeBanks: '',
  cashFlowBankOther: '',
  loanBanksOther: '',
  workingBanksOther: '',
  tahsilatBanksOther: '',
  odemeBanksOther: '',
  cashFlowBanks: [],
  creditLimitBanks: [],
  collectionBanks: [],
  paymentBanks: [],
  cashFlowBanksOther: '',
  creditLimitBanksOther: '',
  collectionBanksOther: '',
  paymentBanksOther: '',
  bankingProductsUsed: [],
  collateralStructure: [],
  needAdditionalFinancing: false,
  financingNeeds: [],
  hasInvestmentPlan: false,
  estimatedInvestmentAmount: undefined,
  capitalIncreasePlanned: false,
  generalNotes: '',
  meetingNotes: '',
  opinions: '',
  workingConditions: '',
  businessStatus: '',
  photos: [],
  businessCards: []
});
