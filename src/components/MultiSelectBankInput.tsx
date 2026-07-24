import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check, Plus } from 'lucide-react';

interface MultiSelectBankInputProps {
  label: string;
  value: string; // Comma-separated list of selected banks
  otherValue?: string; // Saved other bank text
  onChange: (value: string, otherValue?: string) => void;
  placeholder?: string;
}

const BANK_CATEGORIES = [
  {
    category: 'Kamu Bankaları',
    banks: ['Ziraat Bankası', 'Halkbank', 'VakıfBank']
  },
  {
    category: 'Özel Bankalar',
    banks: ['Türkiye İş Bankası', 'Garanti BBVA', 'Akbank', 'Yapı Kredi', 'QNB']
  },
  {
    category: 'Katılım Bankaları',
    banks: ['Kuveyt Türk', 'Türkiye Finans', 'Albaraka Türk']
  }
];

const PREDEFINED_BANKS = [
  'Ziraat Bankası', 'Halkbank', 'VakıfBank',
  'Türkiye İş Bankası', 'Garanti BBVA', 'Akbank', 'Yapı Kredi', 'QNB',
  'Kuveyt Türk', 'Türkiye Finans', 'Albaraka Türk'
];

export function MultiSelectBankInput({
  label,
  value,
  otherValue = '',
  onChange,
  placeholder = 'Banka seçin...'
}: MultiSelectBankInputProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedPredefined, setSelectedPredefined] = useState<string[]>([]);
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherText, setOtherText] = useState(otherValue);

  // Parse the stored value string on mount/change
  useEffect(() => {
    const items = value ? value.split(',').map(s => s.trim()).filter(Boolean) : [];
    
    // Find predefined ones
    const predefined = items.filter(item => PREDEFINED_BANKS.includes(item));
    setSelectedPredefined(predefined);

    // Check if "Diğer" is explicitly in items, OR if there are items that are not predefined
    const hasOtherExplicit = items.includes('Diğer');
    const hasOtherImplicit = items.some(item => !PREDEFINED_BANKS.includes(item) && item !== 'Diğer');
    
    if (hasOtherExplicit || hasOtherImplicit) {
      setIsOtherSelected(true);
      // If there was an implicit other (e.g. custom text stored from before), extract it
      const implicitOtherText = items.filter(item => !PREDEFINED_BANKS.includes(item) && item !== 'Diğer').join(', ');
      if (implicitOtherText && !otherValue) {
        setOtherText(implicitOtherText);
      } else {
        setOtherText(otherValue);
      }
    } else {
      setIsOtherSelected(false);
      setOtherText('');
    }
  }, [value, otherValue]);

  const handleToggleBank = (bank: string) => {
    let newList: string[];
    if (selectedPredefined.includes(bank)) {
      newList = selectedPredefined.filter(b => b !== bank);
    } else {
      newList = [...selectedPredefined, bank];
    }
    setSelectedPredefined(newList);
    triggerChange(newList, isOtherSelected, otherText);
  };

  const handleToggleOther = () => {
    const nextOtherSelected = !isOtherSelected;
    setIsOtherSelected(nextOtherSelected);
    const nextOtherText = nextOtherSelected ? otherText : '';
    if (!nextOtherSelected) {
      setOtherText('');
    }
    triggerChange(selectedPredefined, nextOtherSelected, nextOtherText);
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    triggerChange(selectedPredefined, isOtherSelected, text);
  };

  const triggerChange = (predefined: string[], otherSelected: boolean, otherTxt: string) => {
    const resultItems = [...predefined];
    if (otherSelected) {
      resultItems.push('Diğer');
    }
    const joinedValue = resultItems.join(', ');
    onChange(joinedValue, otherTxt);
  };

  // Human readable text for the selected banks trigger button
  const getButtonLabel = () => {
    const displayList = [...selectedPredefined];
    if (isOtherSelected) {
      displayList.push(otherText ? `Diğer (${otherText})` : 'Diğer');
    }
    return displayList.length > 0 ? displayList.join(', ') : placeholder;
  };

  return (
    <div className="space-y-1 text-sm relative">
      <label className="font-semibold text-slate-600 dark:text-zinc-400 block">{label}</label>
      
      {/* Selector Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 border border-slate-200 dark:border-zinc-850 bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 rounded-xl hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors text-left font-medium text-xs sm:text-sm"
      >
        <span className="truncate">{getButtonLabel()}</span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
      </button>

      {/* Selector Dropdown Panel */}
      {isOpen && (
        <div className="absolute left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-xl z-50 p-4 space-y-3 max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-1">
          {BANK_CATEGORIES.map((cat) => (
            <div key={cat.category} className="space-y-1.5">
              <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block border-b border-slate-100 dark:border-zinc-800/60 pb-1">
                {cat.category}
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {cat.banks.map((bank) => {
                  const isChecked = selectedPredefined.includes(bank);
                  return (
                    <button
                      type="button"
                      key={bank}
                      onClick={() => handleToggleBank(bank)}
                      className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-teal-500/10 border-teal-500/80 text-teal-700 dark:text-teal-400 font-bold'
                          : 'bg-slate-50/50 dark:bg-zinc-950/20 border-slate-150 dark:border-zinc-850 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                        isChecked ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs leading-none">{bank}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Diğer (Other) section */}
          <div className="space-y-1.5 pt-1">
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block border-b border-slate-100 dark:border-zinc-800/60 pb-1">
              Ek Seçenekler
            </span>
            <button
              type="button"
              onClick={handleToggleOther}
              className={`w-full flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                isOtherSelected
                  ? 'bg-teal-500/10 border-teal-500/80 text-teal-700 dark:text-teal-400 font-bold'
                  : 'bg-slate-50/50 dark:bg-zinc-950/20 border-slate-150 dark:border-zinc-850 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <div className={`w-4.5 h-4.5 rounded-md border flex items-center justify-center transition-all ${
                isOtherSelected ? 'bg-teal-600 border-teal-600 text-white' : 'border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-950'
              }`}>
                {isOtherSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="text-xs leading-none">Diğer</span>
            </button>
          </div>

          <div className="pt-2 flex justify-end border-t border-slate-100 dark:border-zinc-800/60 mt-2">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white dark:bg-zinc-800 dark:hover:bg-zinc-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
            >
              Tamam
            </button>
          </div>
        </div>
      )}

      {/* Dropdown overlay click capture */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Conditionally reveal custom text input only when "Diğer" is selected */}
      {isOtherSelected && (
        <div className="mt-1.5 animate-in slide-in-from-top-1 duration-200">
          <input
            type="text"
            value={otherText}
            onChange={(e) => handleOtherTextChange(e.target.value)}
            placeholder="Diğer banka adını yazınız..."
            required={isOtherSelected}
            className="w-full px-3.5 py-2 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:border-teal-500"
          />
        </div>
      )}
    </div>
  );
}
