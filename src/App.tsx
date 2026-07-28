/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useAppState } from './hooks/useAppState';
import { VoiceAssistant } from './components/VoiceAssistant';
import { MapComponent } from './components/MapComponent';
import { ReportModal } from './components/ReportModal';
import { Customer, Visit, SMTPPreset, CustomerPhoto, CustomerMeetingForm, getTodayDateString } from './types';
import { INITIAL_CUSTOMERS } from './data/seedData';
import { CustomerMeetingFormComp, createEmptyMeetingForm } from './components/CustomerMeetingForm';
import { APIProvider, Map, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

const GOOGLE_MAPS_API_KEY =
  process.env.GOOGLE_MAPS_PLATFORM_KEY ||
  (import.meta as any).env?.VITE_GOOGLE_MAPS_PLATFORM_KEY ||
  (globalThis as any).GOOGLE_MAPS_PLATFORM_KEY ||
  '';
const hasValidGoogleMapsKey = Boolean(GOOGLE_MAPS_API_KEY) && GOOGLE_MAPS_API_KEY !== 'YOUR_API_KEY';

const parseBankFieldToDizi = (val: any): string[] => {
  if (Array.isArray(val)) {
    return val.filter(Boolean);
  }
  if (typeof val === 'string') {
    return val.split(',').map((s: string) => s.trim()).filter(Boolean);
  }
  return [];
};
import {
  Calendar,
  MapPin,
  Users,
  Settings,
  Mic,
  MicOff,
  Plus,
  Edit2,
  Trash2,
  Search,
  Phone,
  Mail,
  Navigation,
  Camera,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Printer,
  Share2,
  Sliders,
  Bell,
  Sun,
  Moon,
  Database,
  ArrowRight,
  ChevronRight,
  Sparkles,
  Compass,
  FileSpreadsheet,
  X,
  PlusCircle,
  Info
} from 'lucide-react';

export default function App() {
  const {
    isInitialized,
    visits,
    settings,
    activeTab,
    setActiveTab,
    addVisit,
    updateVisit,
    deleteVisit,
    updateSettings
  } = useAppState();

  // Android Simulator Mode State
  const [isAndroidSimulator, setIsAndroidSimulator] = useState(false);

  // Search and Filter states
  const [customerSearch, setCustomerSearch] = useState('');
  const [visitStatusFilter, setVisitStatusFilter] = useState<string>('All');

  const [showVisitModal, setShowVisitModal] = useState(false);
  const [editingVisit, setEditingVisit] = useState<Visit | null>(null);
  const [prefilledVisitDate, setPrefilledVisitDate] = useState<string>('');
  const [isFormInitialized, setIsFormInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Structured Meeting Form State
  const [meetingFormState, setMeetingFormState] = useState<CustomerMeetingForm>(createEmptyMeetingForm());

  // Safe Delete Confirmation Dialog State
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'visit' | 'photo';
    id: string;
    photoId?: string;
    companyName?: string;
    onConfirm: () => void;
  } | null>(null);

  // Auto Save Draft States
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [hasDraftVisit, setHasDraftVisit] = useState(false);
  const [hasDraftMeetingForm, setHasDraftMeetingForm] = useState(false);

  // Load registered customers list (simulated SQLite/localStorage)
  const [customers] = useState<Customer[]>(() => {
    const stored = localStorage.getItem('bvp_customers');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return INITIAL_CUSTOMERS;
      }
    }
    localStorage.setItem('bvp_customers', JSON.stringify(INITIAL_CUSTOMERS));
    return INITIAL_CUSTOMERS;
  });

  const [customerEntryMode, setCustomerEntryMode] = useState<'existing' | 'manual'>('existing');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [manualCustomerName, setManualCustomerName] = useState<string>('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState<string>('');
  const [manualCustomerEmail, setManualCustomerEmail] = useState<string>('');
  const [manualCustomerAddress, setManualCustomerAddress] = useState<string>('');

  // Controlled Visit Form States (for auto-save and direct creation)
  const [visitForm_customerName, setVisitForm_customerName] = useState('');
  const [visitForm_customerPhone, setVisitForm_customerPhone] = useState('');
  const [visitForm_customerEmail, setVisitForm_customerEmail] = useState('');
  const [visitForm_customerAddress, setVisitForm_customerAddress] = useState('');
  const [visitForm_lat, setVisitForm_lat] = useState<number>(41.0805);
  const [visitForm_lng, setVisitForm_lng] = useState<number>(29.0112);
  const [visitForm_date, setVisitForm_date] = useState(getTodayDateString());
  const [visitForm_time, setVisitForm_time] = useState('10:00');
  const [visitForm_purpose, setVisitForm_purpose] = useState('');
  const [visitForm_notes, setVisitForm_notes] = useState('');
  const [visitForm_status, setVisitForm_status] = useState<'Planned' | 'Completed' | 'Cancelled'>('Planned');

  // Selected visit details expand state in customer history list
  const [expandedVisitDetailId, setExpandedVisitDetailId] = useState<string | null>(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [activeReportData, setActiveReportData] = useState<{ customer: Customer; visit: Visit } | null>(null);

  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Calendar Specific Views
  const [calendarViewMode, setCalendarViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(new Date()); // Anchor near our data
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);

  // Voice Notes Dictation helper inside Visit Modal
  const [showVoiceCommandModal, setShowVoiceCommandModal] = useState(false);
  const [notesInputMode, setNotesInputMode] = useState<'voice' | 'text'>('text');
  const [visitNotes, setVisitNotes] = useState('');
  const [isListeningNotes, setIsListeningNotes] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Sync visitNotes when modal opens or editingVisit changes
  useEffect(() => {
    if (showVisitModal) {
      setVisitNotes(editingVisit?.notes || '');
      setNotesInputMode('text'); // default to manual
    } else {
      setVisitNotes('');
    }
  }, [showVisitModal, editingVisit]);

  // Draft loading on mount
  useEffect(() => {
    const draftVis = localStorage.getItem('bvp_draft_visit');
    const draftMf = localStorage.getItem('bvp_draft_meeting_form');
    if (draftVis || draftMf) {
      setHasDraftVisit(!!draftVis);
      setHasDraftMeetingForm(!!draftMf);
      setShowDraftDialog(true);
    }
  }, []);

  // Sync Visit Form and Meeting Form inputs
  useEffect(() => {
    if (showVisitModal) {
      if (!isFormInitialized) {
        if (editingVisit) {
          const matchedCust = customers.find(c => c.id === editingVisit.selectedCustomerId || c.companyName === editingVisit.customerName);
          if (matchedCust) {
            setCustomerEntryMode('existing');
            setSelectedCustomerId(matchedCust.id);
            setManualCustomerName('');
            setManualCustomerPhone('');
            setManualCustomerEmail('');
            setManualCustomerAddress('');
          } else {
            setCustomerEntryMode('manual');
            setSelectedCustomerId('');
            setManualCustomerName(editingVisit.customerName || '');
            setManualCustomerPhone(editingVisit.customerPhone || '');
            setManualCustomerEmail(editingVisit.customerEmail || '');
            setManualCustomerAddress(editingVisit.customerAddress || '');
          }

          setVisitForm_customerName(editingVisit.customerName);
          setVisitForm_customerPhone(editingVisit.customerPhone || '');
          setVisitForm_customerEmail(editingVisit.customerEmail || '');
          setVisitForm_customerAddress(editingVisit.customerAddress || '');
          setVisitForm_lat(editingVisit.lat || 41.0805);
          setVisitForm_lng(editingVisit.lng || 29.0112);
          setVisitForm_date(editingVisit.date);
          setVisitForm_time(editingVisit.time);
          setVisitForm_purpose(editingVisit.purpose);
          setVisitForm_notes(editingVisit.notes);
          setVisitForm_status(editingVisit.status);
          if (editingVisit.meetingForm) {
            const mForm = editingVisit.meetingForm;
            const photos = (editingVisit.companyImages && editingVisit.companyImages.length > 0)
              ? editingVisit.companyImages
              : (mForm.photos || []);
            const cards = (editingVisit.businessCardImages && editingVisit.businessCardImages.length > 0)
              ? editingVisit.businessCardImages
              : (mForm.businessCards || []);
            const notesVal = editingVisit.meetingNotes || editingVisit.notes || mForm.meetingNotes || mForm.generalNotes || '';
            const opinionsVal = editingVisit.opinions || mForm.opinions || '';

            const updatedForm: CustomerMeetingForm = {
              ...mForm,
              workingBanks: parseBankFieldToDizi(editingVisit.workingBanks?.length ? editingVisit.workingBanks : mForm.workingBanks),
              cashFlowBanks: parseBankFieldToDizi(editingVisit.cashFlowBanks?.length ? editingVisit.cashFlowBanks : (mForm.cashFlowBanks ?? mForm.cashFlowBank)),
              creditLimitBanks: parseBankFieldToDizi(editingVisit.creditLimitBanks?.length ? editingVisit.creditLimitBanks : (mForm.creditLimitBanks ?? mForm.loanBanks)),
              collectionBanks: parseBankFieldToDizi(editingVisit.collectionBanks?.length ? editingVisit.collectionBanks : (mForm.collectionBanks ?? mForm.tahsilatBanks)),
              paymentBanks: parseBankFieldToDizi(editingVisit.paymentBanks?.length ? editingVisit.paymentBanks : (mForm.paymentBanks ?? mForm.odemeBanks)),
              workingBanksOther: editingVisit.workingBanksOther ?? mForm.workingBanksOther ?? '',
              cashFlowBanksOther: editingVisit.cashFlowBanksOther ?? mForm.cashFlowBanksOther ?? mForm.cashFlowBankOther ?? '',
              creditLimitBanksOther: editingVisit.creditLimitBanksOther ?? mForm.creditLimitBanksOther ?? mForm.loanBanksOther ?? '',
              collectionBanksOther: editingVisit.collectionBanksOther ?? mForm.collectionBanksOther ?? mForm.tahsilatBanksOther ?? '',
              paymentBanksOther: editingVisit.paymentBanksOther ?? mForm.paymentBanksOther ?? mForm.odemeBanksOther ?? '',
              meetingNotes: notesVal,
              generalNotes: notesVal,
              opinions: opinionsVal,
              photos: photos,
              businessCards: cards
            };
            setMeetingFormState(updatedForm);
            setVisitNotes(notesVal);
          } else {
            const initialForm = createEmptyMeetingForm(editingVisit.date, editingVisit.customerName);
            const photos = editingVisit.companyImages || [];
            const cards = editingVisit.businessCardImages || [];
            const notesVal = editingVisit.meetingNotes || editingVisit.notes || '';
            const opinionsVal = editingVisit.opinions || '';

            const updatedForm: CustomerMeetingForm = {
              ...initialForm,
              workingBanks: parseBankFieldToDizi(editingVisit.workingBanks),
              cashFlowBanks: parseBankFieldToDizi(editingVisit.cashFlowBanks),
              creditLimitBanks: parseBankFieldToDizi(editingVisit.creditLimitBanks),
              collectionBanks: parseBankFieldToDizi(editingVisit.collectionBanks),
              paymentBanks: parseBankFieldToDizi(editingVisit.paymentBanks),
              workingBanksOther: editingVisit.workingBanksOther || '',
              cashFlowBanksOther: editingVisit.cashFlowBanksOther || '',
              creditLimitBanksOther: editingVisit.creditLimitBanksOther || '',
              collectionBanksOther: editingVisit.collectionBanksOther || '',
              paymentBanksOther: editingVisit.paymentBanksOther || '',
              meetingNotes: notesVal,
              generalNotes: notesVal,
              opinions: opinionsVal,
              photos: photos,
              businessCards: cards
            };
            setMeetingFormState(updatedForm);
            setVisitNotes(notesVal);
          }
        } else {
          setCustomerEntryMode('existing');
          setSelectedCustomerId(customers[0]?.id || '');
          setManualCustomerName('');
          setManualCustomerPhone('');
          setManualCustomerEmail('');
          setManualCustomerAddress('');

          setVisitForm_customerName('');
          setVisitForm_customerPhone('');
          setVisitForm_customerEmail('');
          setVisitForm_customerAddress('');
          setVisitForm_lat(41.0805);
          setVisitForm_lng(29.0112);
          setVisitForm_date(prefilledVisitDate || getTodayDateString());
          setVisitForm_time('10:00');
          setVisitForm_purpose('');
          setVisitForm_notes('');
          setVisitForm_status('Planned');
          setMeetingFormState(createEmptyMeetingForm(prefilledVisitDate || getTodayDateString(), ''));
        }
        setIsFormInitialized(true);
      }
    } else {
      setIsFormInitialized(false);
    }
  }, [showVisitModal, editingVisit, prefilledVisitDate, isFormInitialized, customers]);

  // Dynamically synchronize active visitForm fields based on customerEntryMode, selected customer, and manual inputs
  useEffect(() => {
    if (showVisitModal && isFormInitialized) {
      if (customerEntryMode === 'existing') {
        const c = customers.find(cust => cust.id === selectedCustomerId);
        if (c) {
          setVisitForm_customerName(c.companyName);
          setVisitForm_customerPhone(c.phone || '');
          setVisitForm_customerEmail(c.email || '');
          setVisitForm_customerAddress(c.address || '');
          setVisitForm_lat(c.lat || 41.0805);
          setVisitForm_lng(c.lng || 29.0112);
        }
      } else {
        setVisitForm_customerName(manualCustomerName);
        setVisitForm_customerPhone(manualCustomerPhone);
        setVisitForm_customerEmail(manualCustomerEmail);
        setVisitForm_customerAddress(manualCustomerAddress);
      }
    }
  }, [customerEntryMode, selectedCustomerId, manualCustomerName, manualCustomerPhone, manualCustomerEmail, manualCustomerAddress, customers, showVisitModal, isFormInitialized]);

  // Auto-save Visit and Meeting Forms to localStorage
  useEffect(() => {
    if (showVisitModal) {
      const draft = {
        customerName: visitForm_customerName,
        customerPhone: visitForm_customerPhone,
        customerEmail: visitForm_customerEmail,
        customerAddress: visitForm_customerAddress,
        lat: visitForm_lat,
        lng: visitForm_lng,
        date: visitForm_date,
        time: visitForm_time,
        purpose: visitForm_purpose,
        notes: visitForm_notes,
        status: visitForm_status,
        editingId: editingVisit?.id || null
      };
      if (visitForm_customerName || visitForm_purpose || visitForm_notes) {
        localStorage.setItem('bvp_draft_visit', JSON.stringify(draft));
      }
    }
  }, [showVisitModal, visitForm_customerName, visitForm_customerPhone, visitForm_customerEmail, visitForm_customerAddress, visitForm_lat, visitForm_lng, visitForm_date, visitForm_time, visitForm_purpose, visitForm_notes, visitForm_status, editingVisit]);

  useEffect(() => {
    if (showVisitModal && meetingFormState) {
      const isModified = 
        meetingFormState.generalNotes || 
        meetingFormState.employeeCount || 
        meetingFormState.lastPeriodTurnover || 
        meetingFormState.salesCollectionMethods?.length > 0 ||
        meetingFormState.purchasePaymentMethods?.length > 0;
      if (isModified) {
        localStorage.setItem('bvp_draft_meeting_form', JSON.stringify(meetingFormState));
      }
    }
  }, [showVisitModal, meetingFormState]);

  const handleRestoreDrafts = () => {
    const draftVisStr = localStorage.getItem('bvp_draft_visit');
    const draftMfStr = localStorage.getItem('bvp_draft_meeting_form');

    if (draftVisStr) {
      try {
        const draft = JSON.parse(draftVisStr);
        setVisitForm_customerName(draft.customerName || '');
        setVisitForm_customerPhone(draft.customerPhone || '');
        setVisitForm_customerEmail(draft.customerEmail || '');
        setVisitForm_customerAddress(draft.customerAddress || '');
        setVisitForm_lat(draft.lat || 41.0805);
        setVisitForm_lng(draft.lng || 29.0112);
        setVisitForm_date(draft.date || getTodayDateString());
        setVisitForm_time(draft.time || '10:00');
        setVisitForm_purpose(draft.purpose || '');
        setVisitForm_notes(draft.notes || '');
        setVisitForm_status(draft.status || 'Planned');
        if (draft.editingId) {
          const editVis = visits.find(v => v.id === draft.editingId) || null;
          setEditingVisit(editVis);
        } else {
          setEditingVisit(null);
        }
        if (draftMfStr) {
          setMeetingFormState(JSON.parse(draftMfStr));
        }
        setShowVisitModal(true);
        showToast("Ziyaret planı ve görüşme formu taslağı başarıyla yüklendi.", "info");
      } catch (e) {
        console.error("Failed to restore visit draft", e);
      }
    } else if (draftMfStr) {
      try {
        setMeetingFormState(JSON.parse(draftMfStr));
        setShowVisitModal(true);
        showToast("Görüşme formu taslağı başarıyla yüklendi.", "info");
      } catch (e) {
        console.error("Failed to restore meeting form draft", e);
      }
    }
    setShowDraftDialog(false);
  };

  const handleClearDrafts = () => {
    localStorage.removeItem('bvp_draft_customer');
    localStorage.removeItem('bvp_draft_visit');
    localStorage.removeItem('bvp_draft_meeting_form');
    setShowDraftDialog(false);
    showToast("Taslak kayıtlar silindi.", "info");
  };

  // Clean up speech recognition on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleToggleNotesListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast("Tarayıcınız ses tanımayı desteklemiyor. Simülasyon penceresi açılıyor...", "warning");
      const simText = prompt("Sesli Dikte Simülatörü - Notunuzu buraya yazarak sesle dikte edilmiş gibi ekleyebilirsiniz:");
      if (simText) {
        setVisitNotes(prev => prev ? `${prev} ${simText}` : simText);
        showToast("Simüle edilen sesli not eklendi.", "success");
      }
      return;
    }

    if (isListeningNotes) {
      recognitionRef.current?.stop();
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'tr-TR';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListeningNotes(true);
      };

      recognition.onresult = (event: any) => {
        const text = event.results[0][0].transcript;
        if (text) {
          setVisitNotes(prev => prev ? `${prev} ${text}` : text);
          showToast("Ses başarıyla metne dönüştürüldü!", "success");
        }
      };

      recognition.onerror = (event: any) => {
        console.error("Notes Voice Error:", event.error);
        if (event.error === 'not-allowed') {
          showToast("Mikrofon izni verilmedi.", "warning");
        } else if (event.error === 'no-speech') {
          showToast("Ses algılanamadı.", "warning");
        } else {
          showToast(`Hata oluştu: ${event.error}`, "warning");
        }
        setIsListeningNotes(false);
      };

      recognition.onend = () => {
        setIsListeningNotes(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListeningNotes(false);
    }
  };

  // Toast Helper
  const showToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Run initial calculations for reminders
  const todayStr = getTodayDateString();

  const todayPlannedVisits = visits.filter(v => v.date === todayStr && v.status === 'Planned');
  const missedPlannedVisits = visits.filter(v => v.date < todayStr && v.status === 'Planned');

  // Trigger command voice controller
  const handleExecuteVoiceCommand = (command: string) => {
    showToast(`Sesli Komut Alındı: "${command}"`, 'info');
    
    if (command.includes('ziyaret oluştur') || command.includes('yeni ziyaret') || command.includes('planla')) {
      setEditingVisit(null);
      setShowVisitModal(true);
    } else if (command.includes('bugün') || command.includes('bugünün ziyaretleri')) {
      setActiveTab('dashboard');
    } else if (command.includes('harita') || command.includes('haritayı aç')) {
      setActiveTab('map');
    } else if (command.includes('ayarlar') || command.includes('ayar')) {
      setActiveTab('settings');
    } else {
      showToast(`Komut anlaşılamadı: "${command}". Lütfen tekrar deneyin.`, 'warning');
    }
  };

  // Helper to handle voice dictation for meeting notes
  const handleVoiceNoteCaptured = (text: string) => {
    showToast("Ses başarıyla metne dönüştürüldü!", "success");
    setVisitNotes(prev => prev ? `${prev} ${text}` : text);
  };

  // Helper to simulate network latency for DB operations
  const simulateNetworkRequest = () => new Promise(resolve => setTimeout(resolve, 800));

  // Visit Form Submission
  const handleVisitSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSaving) return;
    setIsSaving(true);

    try {
      const formData = new FormData(e.currentTarget);
      const date = formData.get('date') as string;
      const time = formData.get('time') as string;
      const purpose = formData.get('purpose') as string;
      const status = formData.get('status') as 'Planned' | 'Completed' | 'Cancelled';
      const notes = visitNotes; // active text state from textarea/voice

      if (!visitForm_customerName || !visitForm_customerName.trim()) {
        showToast("Lütfen Müşteri Ünvanı / Adı Soyadı alanını doldurun.", "warning");
        setIsSaving(false);
        return;
      }

      // Simulate network request to ensure loading states/spinners are visible and protect against race conditions
      await simulateNetworkRequest();

      // Prepare image and note values
      const photosVal = (meetingFormState?.photos && meetingFormState.photos.length > 0)
        ? meetingFormState.photos
        : (editingVisit?.companyImages || editingVisit?.meetingForm?.photos || []);

      const businessCardsVal = (meetingFormState?.businessCards && meetingFormState.businessCards.length > 0)
        ? meetingFormState.businessCards
        : (editingVisit?.businessCardImages || editingVisit?.meetingForm?.businessCards || []);

      const notesVal = notes || meetingFormState?.meetingNotes || meetingFormState?.generalNotes || '';
      const opinionsVal = meetingFormState?.opinions || editingVisit?.opinions || '';

      // Capture meeting form details (which remains editable later)
      const finalizedMeetingForm: CustomerMeetingForm = {
        ...meetingFormState,
        meetingDate: date, // Keep in sync with visit date
        contactPerson: (meetingFormState && meetingFormState.contactPerson) || visitForm_customerName,
        workingBanks: parseBankFieldToDizi(meetingFormState?.workingBanks),
        cashFlowBanks: parseBankFieldToDizi(meetingFormState?.cashFlowBanks),
        creditLimitBanks: parseBankFieldToDizi(meetingFormState?.creditLimitBanks),
        collectionBanks: parseBankFieldToDizi(meetingFormState?.collectionBanks),
        paymentBanks: parseBankFieldToDizi(meetingFormState?.paymentBanks),
        workingBanksOther: meetingFormState?.workingBanksOther || '',
        cashFlowBanksOther: meetingFormState?.cashFlowBanksOther || '',
        creditLimitBanksOther: meetingFormState?.creditLimitBanksOther || '',
        collectionBanksOther: meetingFormState?.collectionBanksOther || '',
        paymentBanksOther: meetingFormState?.paymentBanksOther || '',
        meetingNotes: notesVal,
        generalNotes: notesVal,
        opinions: opinionsVal,
        photos: photosVal,
        businessCards: businessCardsVal
      } as CustomerMeetingForm;

      const visitData: Omit<Visit, 'id'> = {
        customerName: visitForm_customerName,
        customerPhone: visitForm_customerPhone,
        customerEmail: visitForm_customerEmail,
        customerAddress: visitForm_customerAddress,
        lat: visitForm_lat,
        lng: visitForm_lng,
        date,
        time,
        purpose,
        notes: notesVal,
        status,
        customerEntryMode,
        selectedCustomerId: customerEntryMode === 'existing' ? selectedCustomerId : undefined,
        manualCustomerName: customerEntryMode === 'manual' ? manualCustomerName : undefined,
        manualCustomerPhone: customerEntryMode === 'manual' ? manualCustomerPhone : undefined,
        manualCustomerEmail: customerEntryMode === 'manual' ? manualCustomerEmail : undefined,
        manualCustomerAddress: customerEntryMode === 'manual' ? manualCustomerAddress : undefined,
        meetingForm: finalizedMeetingForm,
        workingBanks: finalizedMeetingForm.workingBanks,
        cashFlowBanks: finalizedMeetingForm.cashFlowBanks,
        creditLimitBanks: finalizedMeetingForm.creditLimitBanks,
        collectionBanks: finalizedMeetingForm.collectionBanks,
        paymentBanks: finalizedMeetingForm.paymentBanks,
        workingBanksOther: finalizedMeetingForm.workingBanksOther,
        cashFlowBanksOther: finalizedMeetingForm.cashFlowBanksOther,
        creditLimitBanksOther: finalizedMeetingForm.creditLimitBanksOther,
        collectionBanksOther: finalizedMeetingForm.collectionBanksOther,
        paymentBanksOther: finalizedMeetingForm.paymentBanksOther,
        meetingNotes: notesVal,
        opinions: opinionsVal,
        companyImages: photosVal,
        businessCardImages: businessCardsVal
      };

      if (editingVisit) {
        updateVisit({
          ...editingVisit,
          ...visitData
        });
        showToast("Ziyaret planı başarıyla güncellendi.");
      } else {
        addVisit(visitData);
        showToast("Yeni ziyaret planı başarıyla kaydedildi.");
      }

      localStorage.removeItem('bvp_draft_visit');
      localStorage.removeItem('bvp_draft_meeting_form');
      setShowVisitModal(false);
      setEditingVisit(null);
    } catch (err: any) {
      showToast(err?.message || "Kayıt sırasında bir hata oluştu.", "warning");
    } finally {
      setIsSaving(false);
    }
  };


  // Simulated SMTP test trigger
  const [smtpTesting, setSmtpTesting] = useState(false);
  const handleTestSMTP = () => {
    setSmtpTesting(true);
    setTimeout(() => {
      setSmtpTesting(false);
      showToast(`${settings.smtp.preset} SMTP sunucusuna güvenli el sıkışma sağlandı. Test e-postası başarıyla gönderildi!`, 'success');
    }, 1500);
  };

  // Pre-autofill SMTP presets
  const handleSMTPPresetChange = (preset: SMTPPreset) => {
    let host = 'smtp.gmail.com';
    let port = 465;
    let secure = true;

    switch (preset) {
      case 'Gmail': host = 'smtp.gmail.com'; port = 465; secure = true; break;
      case 'Outlook': host = 'smtp-mail.outlook.com'; port = 587; secure = false; break;
      case 'Office365': host = 'smtp.office365.com'; port = 587; secure = false; break;
      case 'Exchange': host = 'mail.company.com'; port = 443; secure = true; break;
      case 'Yahoo': host = 'smtp.mail.yahoo.com'; port = 465; secure = true; break;
      case 'Yandex': host = 'smtp.yandex.com'; port = 465; secure = true; break;
      default: host = ''; port = 25; secure = false; break;
    }

    updateSettings({
      ...settings,
      smtp: {
        ...settings.smtp,
        preset,
        host,
        port,
        secure
      }
    });
  };

  // Calendar Helpers
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getDaysArray = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const totalDays = daysInMonth(year, month);
    const firstDayIndex = new Date(year, month, 1).getDay(); // Sun is 0, Mon is 1...

    // Adjust for Monday start (Turkish standard)
    const adjustedFirstDay = firstDayIndex === 0 ? 6 : firstDayIndex - 1;

    const days = [];
    // Pad previous month days
    for (let i = 0; i < adjustedFirstDay; i++) {
      days.push(null);
    }
    // Present month days
    for (let i = 1; i <= totalDays; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  // Check if calendar dates have visits
  const getVisitsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return visits.filter(v => v.date === dateStr);
  };

  // Helper to wrap app content inside Android Simulator Mockup if active
  const wrapWithSimulator = (children: React.ReactNode) => {
    if (!isAndroidSimulator) return children;
    return (
      <div className="w-full max-w-sm flex flex-col items-center gap-4 py-4 animate-in zoom-in-95 duration-300">
        {/* Top Control Header */}
        <div className="w-full flex items-center justify-between bg-zinc-800/90 backdrop-blur border border-zinc-700/60 p-3 rounded-2xl shadow-xl z-50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-[10px] font-bold text-zinc-100 uppercase tracking-wider font-display">Android Test Modu</span>
          </div>
          <button
            onClick={() => setIsAndroidSimulator(false)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-xl cursor-pointer transition-colors shadow-sm"
          >
            <X className="w-3.5 h-3.5" />
            Kapat
          </button>
        </div>

        {/* Android Device Frame */}
        <div className="w-[360px] h-[740px] bg-white dark:bg-zinc-900 rounded-[40px] shadow-[0_0_0_10px_#1e1e1f,0_20px_50px_rgba(0,0,0,0.6)] border-2 border-zinc-700 flex flex-col overflow-hidden relative select-none">
          {/* Punch Hole */}
          <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-24 h-5.5 bg-black rounded-full z-[1000] flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-zinc-900/60 ml-auto mr-4" />
          </div>

          {/* Status Bar */}
          <div className="h-9 bg-slate-50 dark:bg-zinc-950 px-5 pt-2.5 flex justify-between items-center text-[9px] font-bold text-slate-500 dark:text-zinc-400 z-50 select-none">
            <span>12:58</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] bg-teal-500/10 text-teal-600 px-1 py-0.2 rounded font-mono font-bold">LTE</span>
              <div className="flex gap-0.5 items-end h-2">
                <div className="w-0.5 h-1 bg-current" />
                <div className="w-0.5 h-1.5 bg-current" />
                <div className="w-0.5 h-2 bg-current" />
              </div>
              <div className="w-4 h-2 border border-current rounded-2xs p-0.2 flex items-center">
                <div className="w-full h-full bg-current rounded-3xs" />
              </div>
            </div>
          </div>

          {/* Inner Phone Body */}
          <div className="flex-1 overflow-y-auto flex flex-col bg-slate-50 dark:bg-zinc-950 relative pb-16">
            {children}
          </div>

          {/* Android Home Line */}
          <div className="absolute bottom-1 w-28 h-1 bg-zinc-300 dark:bg-zinc-700 rounded-full left-1/2 -translate-x-1/2 z-50 pointer-events-none" />
        </div>
      </div>
    );
  };

  return (
    <div className={isAndroidSimulator 
      ? "min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-2 md:p-6 text-slate-800 dark:text-zinc-200 selection:bg-teal-500/20 transition-all duration-350 relative overflow-y-auto" 
      : "min-h-screen flex flex-col md:flex-row bg-slate-50 dark:bg-zinc-950 text-slate-800 dark:text-zinc-200 selection:bg-teal-500/20 transition-colors"
    }>
      
      {/* Dynamic Toast Alerts */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-[9999] animate-in fade-in slide-in-from-top-4">
          <div className={`px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 border backdrop-blur ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-500/90 dark:bg-emerald-950/90 text-white border-emerald-400/30' 
              : toastMessage.type === 'warning'
              ? 'bg-amber-500/90 dark:bg-amber-950/90 text-white border-amber-400/30'
              : 'bg-blue-600/90 dark:bg-zinc-900/90 text-white border-blue-500/30'
          }`}>
            {toastMessage.type === 'success' && <CheckCircle2 className="w-5 h-5 flex-shrink-0" />}
            {toastMessage.type === 'warning' && <AlertTriangle className="w-5 h-5 flex-shrink-0" />}
            {toastMessage.type === 'info' && <Info className="w-5 h-5 flex-shrink-0 text-teal-400" />}
            <span className="text-xs font-semibold leading-tight">{toastMessage.text}</span>
          </div>
        </div>
      )}

      {wrapWithSimulator(
        <>
          {/* Main Layout Navigation (MD3 Sidebar Side Rail on desktop / Bottom Navigation on mobile) */}
      <aside className={`${isAndroidSimulator ? 'hidden' : 'hidden md:flex'} flex-col w-64 flex-shrink-0 bg-white dark:bg-zinc-900 border-r border-slate-150 dark:border-zinc-800 p-6 gap-6 select-none`}>
        <div className="flex items-center gap-2 px-2">
          <div className="w-10 h-10 rounded-xl bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white shadow-lg shadow-teal-500/20">
            <Compass className="w-5.5 h-5.5" />
          </div>
          <div>
            <h1 className="text-sm font-bold font-display tracking-tight text-slate-900 dark:text-zinc-50 leading-tight">
              Portföy Ziyaret Planı
            </h1>
            <span className="text-[10px] uppercase tracking-wider font-mono text-teal-600 dark:text-teal-400 font-bold">
              Ticari Portföy
            </span>
          </div>
        </div>

        {/* Navigation items list */}
        <nav className="flex-1 space-y-1.5">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold border-l-4 border-teal-500 pl-3'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Clock className="w-4.5 h-4.5" />
            <span>Ana Sayfa / Özet</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'calendar'
                ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold border-l-4 border-teal-500 pl-3'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-4.5 h-4.5" />
            <span>Ziyaret Takvimi</span>
          </button>


          <button
            onClick={() => setActiveTab('map')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'map'
                ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold border-l-4 border-teal-500 pl-3'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <MapPin className="w-4.5 h-4.5" />
            <span>İnteraktif Harita</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-teal-50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-400 font-bold border-l-4 border-teal-500 pl-3'
                : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-50 dark:hover:bg-zinc-800/40 hover:text-slate-900 dark:hover:text-zinc-200'
            }`}
          >
            <Settings className="w-4.5 h-4.5" />
            <span>Sistem Ayarları</span>
          </button>
        </nav>

        {/* Embedded voice assistant widget directly inside side panel */}
        <div className="p-4 bg-slate-50 dark:bg-zinc-950/40 rounded-2xl border border-slate-100 dark:border-zinc-800/60">
          <VoiceAssistant onExecuteCommand={handleExecuteVoiceCommand} mode="command" />
        </div>

        {/* Android Simulator Switch Button */}
        {!(import.meta as any).env?.PROD && (
          <button
            onClick={() => setIsAndroidSimulator(true)}
            className="flex items-center justify-center gap-2 w-full p-2.5 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-300 rounded-xl font-bold text-xs cursor-pointer transition-colors border border-slate-200 dark:border-zinc-700/60"
          >
            <Compass className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Android Görünümü (Test)
          </button>
        )}

        {/* SQLite Database status card */}
        <div className="flex items-center gap-2 p-3 bg-teal-50/45 dark:bg-teal-950/10 border border-teal-100/40 dark:border-teal-900/10 rounded-xl">
          <Database className="w-4 h-4 text-teal-600 dark:text-teal-400" />
          <div className="text-[10px] font-medium leading-none">
            <span className="text-slate-400">Offline SQLite Veri: </span>
            <span className="text-emerald-500 font-bold">Aktif (%100)</span>
          </div>
        </div>
      </aside>

      {/* Main Work Area Container */}
      <main className={`flex-1 flex flex-col ${isAndroidSimulator ? 'p-3.5 pb-20' : 'p-4 sm:p-6 md:p-8'} overflow-y-auto max-w-7xl mx-auto w-full ${isAndroidSimulator ? 'pb-20' : 'pb-[calc(5.5rem+env(safe-area-inset-bottom,0px))] md:pb-8'}`}>
        
        {/* Mobile Header */}
        <header className={`${isAndroidSimulator ? 'flex' : 'flex md:hidden'} items-center justify-between pb-4 mb-4 border-b border-slate-200 dark:border-zinc-800 select-none pt-safe`}>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-teal-600 dark:bg-teal-500 flex items-center justify-center text-white font-bold text-sm font-display">
              P
            </div>
            <h1 className="text-sm font-bold font-display text-slate-950 dark:text-zinc-50">
              Portföy Ziyaret Planı
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Simulator toggle button for mobile preview */}
            {!isAndroidSimulator && !(import.meta as any).env?.PROD && (
              <button
                onClick={() => setIsAndroidSimulator(true)}
                className="flex items-center gap-1 px-2.5 py-1 text-[9px] bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 rounded-lg font-bold cursor-pointer transition-colors"
              >
                <Compass className="w-3.5 h-3.5" />
                Android Test
              </button>
            )}
            {settings.notificationsEnabled && todayPlannedVisits.length > 0 && (
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
            )}
            <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 px-2 py-1 rounded font-semibold text-slate-500">
              20.07.2026 UTC
            </span>
          </div>
        </header>

        {/* -------------------- REMINDERS ALERTS BANNER -------------------- */}
        {settings.notificationsEnabled && (
          <div className="space-y-2.5 mb-6">
            {/* Today's Active Visits Reminder */}
            {todayPlannedVisits.length > 0 && (
              <div className="p-4 bg-teal-50 dark:bg-teal-950/20 border border-teal-200 dark:border-teal-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-teal-100 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 flex-shrink-0">
                    <Bell className="w-4.5 h-4.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-display uppercase tracking-wider">
                      Bugünkü Görüşmeleriniz Var
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 font-medium leading-relaxed">
                      Bugün için planlanmış <strong>{todayPlannedVisits.length}</strong> adet müşteri ziyaretiniz bulunuyor.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold rounded-xl self-end sm:self-center transition-colors cursor-pointer"
                >
                  Ajandayı Gör
                </button>
              </div>
            )}

            {/* Overdue / Missed Past Planned Visits Persistent Reminder */}
            {missedPlannedVisits.length > 0 && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in slide-in-from-top-3">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 flex-shrink-0 animate-bounce">
                    <AlertTriangle className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xs font-bold text-slate-900 dark:text-zinc-100 font-display uppercase tracking-wider">
                      Gecikmiş Müşteri Ziyaretleri
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 font-medium leading-relaxed">
                      Geçmiş günlerde yapılması planlanan ancak tamamlanmamış/iptal edilmemiş <strong>{missedPlannedVisits.length}</strong> ziyaret bulunuyor. Tamamlanana veya ertelenene kadar bu uyarı günlük gösterilecektir.
                    </p>
                    <div className="mt-2.5 flex flex-wrap gap-1.5">
                      {missedPlannedVisits.map(v => (
                        <button
                          key={v.id}
                          onClick={() => {
                            setEditingVisit(v);
                            setShowVisitModal(true);
                          }}
                          className="text-[10px] font-bold px-2.5 py-1 bg-amber-100 dark:bg-amber-950/40 hover:bg-amber-200 dark:hover:bg-amber-900/40 text-amber-800 dark:text-amber-400 rounded-full border border-amber-200/40 dark:border-amber-900/20 cursor-pointer"
                        >
                          {v.customerName} ({v.date})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB 1: DASHBOARD / HOME -------------------- */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
                  Yönetici Paneli / Özet
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                  Bugünün programı, yaklaşan görüşmeler ve portföy durumunuza hızlıca göz atın.
                </p>
              </div>

              {/* Quick actions row */}
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    setEditingVisit(null);
                    setShowVisitModal(true);
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white cursor-pointer transition-colors shadow"
                >
                  <Calendar className="w-4 h-4" />
                  Ziyaret Planla
                </button>
              </div>
            </div>

            {/* Quick stats grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button
                onClick={() => setActiveTab('calendar')}
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 shadow-xs flex items-center justify-between text-left hover:border-teal-500/80 hover:ring-1 hover:ring-teal-500/30 transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500 font-display">
                    Bugünkü Ziyaretler
                  </span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 font-display mt-1 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {visits.filter(v => v.date === todayStr).length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-950 flex items-center justify-center text-teal-600 dark:text-teal-400 group-hover:bg-teal-100 dark:group-hover:bg-teal-900 transition-colors">
                  <Clock className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={() => setActiveTab('calendar')}
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 shadow-xs flex items-center justify-between text-left hover:border-blue-500/80 hover:ring-1 hover:ring-blue-500/30 transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500 font-display">
                    Toplam Kayıtlı Görüşme
                  </span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-zinc-50 font-display mt-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {visits.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:bg-blue-100 dark:group-hover:bg-blue-900 transition-colors">
                  <Users className="w-5 h-5" />
                </div>
              </button>

              <button
                onClick={() => {
                  setActiveTab('calendar');
                }}
                className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 shadow-xs flex items-center justify-between text-left hover:border-amber-500/80 hover:ring-1 hover:ring-amber-500/30 transition-all cursor-pointer group"
              >
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 dark:text-zinc-500 font-display">
                    Gecikmiş / Ertelenen
                  </span>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 font-display mt-1">
                    {missedPlannedVisits.length}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center text-amber-600 dark:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-900 transition-colors">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </button>
            </div>

            {/* Quick navigation dashboard section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Today's Agenda list */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold font-display text-slate-900 dark:text-zinc-100 uppercase tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    Bugünün Görüşme Planı ({todayStr.split('-').reverse().join('.')})
                  </h3>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 bg-slate-100 dark:bg-zinc-800 rounded-full">
                    {visits.filter(v => v.date === todayStr).length} Görüşme
                  </span>
                </div>

                <div className="space-y-3">
                  {visits.filter(v => v.date === todayStr).length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      Bugün için planlanmış herhangi bir ziyaret bulunmuyor.
                    </p>
                  ) : (
                    visits.filter(v => v.date === todayStr).map(visit => {
                      const virtualCustomer = {
                        id: visit.id,
                        companyName: visit.customerName,
                        contactPerson: visit.customerName,
                        phone: visit.customerPhone || '',
                        email: visit.customerEmail || '',
                        address: visit.customerAddress || '',
                        notes: visit.notes || '',
                        photos: []
                      };
                      return (
                        <div
                          key={visit.id}
                          onClick={() => {
                            setEditingVisit(visit);
                            setShowVisitModal(true);
                          }}
                          className="p-3.5 rounded-xl border border-slate-100 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-950/30 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 transition-all hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:bg-slate-100/50 dark:hover:bg-zinc-900/60 cursor-pointer group active:scale-[0.99] shadow-2xs hover:shadow-xs"
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/30 px-2 py-1 rounded border border-teal-100 dark:border-teal-900/20">
                              {visit.time}
                            </span>
                            <div>
                              <h4 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors flex items-center gap-1.5">
                                <span>{visit.customerName}</span>
                                <Edit2 className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-teal-600 dark:text-teal-400 transition-opacity" />
                              </h4>
                              <p className="text-xs text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                                {visit.purpose}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                            {visit.status === 'Completed' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveReportData({ customer: virtualCustomer, visit });
                                  setShowReportModal(true);
                                }}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-lg border border-emerald-100 dark:border-emerald-900/20 cursor-pointer"
                              >
                                <FileText className="w-3.5 h-3.5" />
                                Rapor Paylaş
                              </button>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    updateVisit({ ...visit, status: 'Completed' });
                                    showToast("Ziyaret 'Tamamlandı' olarak güncellendi.");
                                  }}
                                  className="px-2.5 py-1 text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors cursor-pointer"
                                >
                                  Tamamla
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingVisit(visit);
                                    setShowVisitModal(true);
                                  }}
                                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Upcoming agenda and Quick links */}
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 p-5 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="text-sm font-bold font-display text-slate-900 dark:text-zinc-100 uppercase tracking-wider">
                    Sıradaki Yaklaşan Ziyaretler
                  </h3>
                </div>

                <div className="space-y-3">
                  {visits.filter(v => v.date > todayStr).length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">
                      Gelecek günlerde planlanmış bir ziyaretiniz bulunmuyor.
                    </p>
                  ) : (
                    visits
                      .filter(v => v.date > todayStr)
                      .slice(0, 3)
                      .map(visit => (
                        <div
                          key={visit.id}
                          onClick={() => {
                            setEditingVisit(visit);
                            setShowVisitModal(true);
                          }}
                          className="p-3 rounded-xl border border-slate-100 dark:border-zinc-800/40 bg-slate-50/50 dark:bg-zinc-950/30 flex justify-between items-center transition-all hover:border-teal-500/80 dark:hover:border-teal-500/80 hover:bg-slate-100/50 dark:hover:bg-zinc-900/60 cursor-pointer group active:scale-[0.99]"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold font-mono text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/20 px-1.5 py-0.5 rounded border border-blue-150 dark:border-blue-900/10">
                                {visit.date}
                              </span>
                              <span className="text-[10px] font-mono font-medium text-slate-500">
                                {visit.time}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors mt-1 flex items-center gap-1">
                              <span>{visit.customerName}</span>
                              <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 text-teal-600 transition-opacity" />
                            </h4>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingVisit(visit);
                              setShowVisitModal(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg cursor-pointer"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))
                  )}
                </div>

                {/* Quick tab navigator menu buttons inside the card */}
                <div className="pt-2">
                  <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 font-display">
                    Hızlı Erişim Menüsü
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setActiveTab('calendar')}
                      className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/50 dark:hover:bg-zinc-950/90 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-center gap-1 cursor-pointer transition-colors"
                    >
                      <Calendar className="w-4 h-4 text-teal-600" />
                      <span className="text-[10px] font-semibold">Takvim</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/50 dark:hover:bg-zinc-950/90 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-center gap-1 cursor-pointer transition-colors"
                    >
                      <Settings className="w-4 h-4 text-teal-600" />
                      <span className="text-[10px] font-semibold">Ayarlar</span>
                    </button>
                    <button
                      onClick={() => setActiveTab('map')}
                      className="flex flex-col items-center justify-center p-2.5 bg-slate-50 hover:bg-slate-100 dark:bg-zinc-950/50 dark:hover:bg-zinc-950/90 rounded-xl border border-slate-100 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 text-center gap-1 cursor-pointer transition-colors"
                    >
                      <MapPin className="w-4 h-4 text-teal-600" />
                      <span className="text-[10px] font-semibold">Harita</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* -------------------- TAB 2: CALENDAR VIEW -------------------- */}
        {activeTab === 'calendar' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-zinc-800 pb-5">
              <div>
                <h2 className="text-xl font-bold font-display text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
                  Ziyaret Ajandası & Planlayıcı
                </h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                  Aylık, haftalık veya günlük banka müşteri ziyaret planınızı yönetin.
                </p>
              </div>

              {/* View options and Create Visit action */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80">
                  <button
                    onClick={() => setCalendarViewMode('month')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      calendarViewMode === 'month'
                        ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Aylık
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('week')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      calendarViewMode === 'week'
                        ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Haftalık
                  </button>
                  <button
                    onClick={() => setCalendarViewMode('day')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer transition-all ${
                      calendarViewMode === 'day'
                        ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Günlük
                  </button>
                </div>

                <button
                  onClick={() => {
                    setEditingVisit(null);
                    setShowVisitModal(true);
                  }}
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-teal-600 hover:bg-teal-700 text-white rounded-xl transition-colors cursor-pointer shadow"
                >
                  <Plus className="w-4 h-4" />
                  Yeni Plan Ekle
                </button>
              </div>
            </div>

            {/* MONTH VIEW CALENDAR */}
            {calendarViewMode === 'month' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 p-5 shadow-xs">
                {/* Month title controller */}
                <div className="flex justify-between items-center pb-4 mb-4 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide text-sm">
                    Temmuz 2026
                  </h3>
                  <div className="text-xs text-slate-400 font-medium">
                    Toplam {visits.length} Planlı Görüşme
                  </div>
                </div>

                {/* Weekday labels */}
                <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-400 mb-2 uppercase tracking-wider">
                  <div>Pzt</div>
                  <div>Sal</div>
                  <div>Çar</div>
                  <div>Per</div>
                  <div>Cum</div>
                  <div className="text-slate-300 dark:text-zinc-600">Cmt</div>
                  <div className="text-slate-300 dark:text-zinc-600">Paz</div>
                </div>

                {/* Calendar Days grid */}
                <div className="grid grid-cols-7 gap-2">
                  {getDaysArray().map((date, index) => {
                    if (!date) {
                      return <div key={`empty-${index}`} className="aspect-square bg-slate-50/20 dark:bg-zinc-950/10 rounded-xl" />;
                    }

                    const isToday = date.getDate() === 20; // Anchor on 20 July
                    const dateVisits = getVisitsForDate(date);

                    return (
                      <div
                        key={`day-${index}`}
                        onClick={() => {
                          setSelectedCalendarDate(date);
                        }}
                        className={`aspect-square p-2 rounded-2xl border cursor-pointer flex flex-col justify-between transition-all ${
                          isToday
                            ? 'bg-teal-500/10 border-teal-500/80 shadow-md ring-1 ring-teal-500/30'
                            : 'bg-slate-50/50 dark:bg-zinc-950/30 border-slate-100 dark:border-zinc-800/40 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <span className={`text-xs font-bold font-mono ${isToday ? 'text-teal-600 dark:text-teal-400' : 'text-slate-700 dark:text-zinc-300'}`}>
                            {date.getDate()}
                          </span>
                          {dateVisits.length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                          )}
                        </div>

                        {/* Visual listing of visits on day card */}
                        <div className="hidden sm:block space-y-1">
                          {dateVisits.slice(0, 2).map(v => (
                            <div
                              key={v.id}
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded truncate leading-tight ${
                                v.status === 'Completed'
                                  ? 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                                  : 'bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400'
                              }`}
                            >
                              {v.time} {v.customerName}
                            </div>
                          ))}
                          {dateVisits.length > 2 && (
                            <div className="text-[8px] text-slate-400 text-center font-semibold">
                              + {dateVisits.length - 2} daha
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* WEEK VIEW CALENDAR */}
            {calendarViewMode === 'week' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 p-5 shadow-xs space-y-4">
                <div className="pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide text-sm">
                    Haftalık Ajanda (20 Temmuz - 26 Temmuz 2026)
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
                  {[20, 21, 22, 23, 24, 25, 26].map(day => {
                    const dateStr = `2026-07-${day}`;
                    const dateVisits = visits.filter(v => v.date === dateStr);
                    const isToday = day === 20;

                    return (
                      <div
                        key={day}
                        className={`p-3.5 rounded-2xl border ${
                          isToday
                            ? 'bg-teal-500/5 border-teal-500/50'
                            : 'bg-slate-50/50 dark:bg-zinc-950/30 border-slate-100 dark:border-zinc-800/40'
                        } flex flex-col min-h-[250px]`}
                      >
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800/60 mb-3">
                          <span className="text-xs font-bold text-slate-400">
                            {day === 20 ? 'Pzt' : day === 21 ? 'Sal' : day === 22 ? 'Çar' : day === 23 ? 'Per' : day === 24 ? 'Cum' : day === 25 ? 'Cmt' : 'Paz'}
                          </span>
                          <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md ${isToday ? 'bg-teal-500 text-white' : 'text-slate-800 dark:text-zinc-200'}`}>
                            {day} Tem
                          </span>
                        </div>

                        <div className="flex-1 space-y-2.5">
                          {dateVisits.length === 0 ? (
                            <span className="text-xs text-slate-400 italic block text-center py-6">Ziyaret Yok</span>
                          ) : (
                            dateVisits.map(v => (
                              <div
                                key={v.id}
                                onClick={() => {
                                  setEditingVisit(v);
                                  setShowVisitModal(true);
                                }}
                                className="p-2 bg-white dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 hover:border-teal-500 transition-all cursor-pointer shadow-xs"
                              >
                                <div className="text-xs font-mono font-bold text-teal-600 dark:text-teal-400 mb-1">{v.time}</div>
                                <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 truncate">{v.customerName}</div>
                                <div className="text-xs text-slate-500 truncate mt-0.5">{v.purpose}</div>
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* DAILY VIEW CALENDAR */}
            {calendarViewMode === 'day' && (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 p-5 shadow-xs space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-zinc-800">
                  <h3 className="font-display font-bold text-slate-900 dark:text-zinc-100 uppercase tracking-wide text-sm">
                    Günlük Görüşme Takvimi - 20 Temmuz Pazartesi
                  </h3>
                </div>

                <div className="space-y-4 max-w-2xl mx-auto">
                  {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => {
                    const hourVisit = visits.find(v => v.date === todayStr && v.time.startsWith(hour.substring(0, 3)));
                    return (
                      <div key={hour} className="flex gap-4 items-center">
                        <span className="w-14 text-xs font-bold font-mono text-slate-400">{hour}</span>
                        <div className="flex-1">
                          {hourVisit ? (
                            <div
                              onClick={() => {
                                setEditingVisit(hourVisit);
                                setShowVisitModal(true);
                              }}
                              className={`p-3.5 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                                hourVisit.status === 'Completed'
                                  ? 'bg-emerald-500/5 border-emerald-500/30'
                                  : 'bg-blue-500/5 border-blue-500/30'
                              } flex justify-between items-center`}
                            >
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                                  {hourVisit.customerName}
                                </h4>
                                <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5 leading-normal">
                                  {hourVisit.purpose}
                                </p>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                hourVisit.status === 'Completed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {hourVisit.status === 'Completed' ? 'Tamamlandı' : 'Planlandı'}
                              </span>
                            </div>
                          ) : (
                            <div className="h-10 border-dashed border border-slate-200 dark:border-zinc-800/80 rounded-xl flex items-center justify-center text-slate-300 dark:text-zinc-700 text-[11px] italic">
                              Boş Zaman / Müşteri Randevusu Yok
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* -------------------- TAB 4: MAP VIEW -------------------- */}
        {activeTab === 'map' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-5">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
                İnteraktif Konum Haritası
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                Haritada tüm müşterilerinizin konumları iğneli olarak görüntülenir. Ziyaret planlamak veya detayları açmak için bir iğneye tıklayabilirsiniz.
              </p>
            </div>

            <MapComponent
              visits={visits}
              onNavigateToTab={setActiveTab}
              onInitNewVisitAtLocation={(lat, lng) => {
                setVisitForm_lat(lat);
                setVisitForm_lng(lng);
                setEditingVisit(null);
                setShowVisitModal(true);
              }}
            />
          </div>
        )}

        {/* -------------------- TAB 5: SETTINGS -------------------- */}
        {activeTab === 'settings' && (
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-slate-150 dark:border-zinc-800/80 p-6 shadow-xs space-y-8 animate-in fade-in">
            <div className="border-b border-slate-100 dark:border-zinc-800 pb-5">
              <h2 className="text-xl font-bold font-display text-slate-900 dark:text-zinc-50 tracking-tight leading-tight">
                Sistem ve SMTP E-posta Ayarları
              </h2>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 leading-normal">
                Uygulama temasını düzenleyin, e-posta raporlama SMTP presetlerini yapılandırın ve entegrasyonu test edin.
              </p>
            </div>

            {/* Theme and notifications configuration */}
            <div className="space-y-5">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                Görünüm ve Bildirimler
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">Uygulama Teması</label>
                  <div className="inline-flex rounded-xl p-1 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80">
                    <button
                      onClick={() => updateSettings({ ...settings, theme: 'light' })}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                        settings.theme === 'light'
                          ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      Açık Tema
                    </button>
                    <button
                      onClick={() => updateSettings({ ...settings, theme: 'dark' })}
                      className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                        settings.theme === 'dark'
                          ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      Koyu Tema
                    </button>
                    <button
                      onClick={() => updateSettings({ ...settings, theme: 'system' })}
                      className={`px-3.5 py-2 text-xs font-semibold rounded-lg cursor-pointer ${
                        settings.theme === 'system'
                          ? 'bg-white dark:bg-zinc-800 text-teal-700 dark:text-teal-400 shadow-sm'
                          : 'text-slate-500'
                      }`}
                    >
                      Sistem Varsayılanı
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">Günlük Hatırlatıcı Bildirimleri</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateSettings({ ...settings, notificationsEnabled: !settings.notificationsEnabled })}
                      className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer ${
                        settings.notificationsEnabled ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-800'
                      }`}
                    >
                      <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                        settings.notificationsEnabled ? 'transform translate-x-5.5' : ''
                      }`} />
                    </button>
                    <span className="text-xs font-medium">
                      {settings.notificationsEnabled ? 'Aktif (Geciken ziyaretler ve günlük planlar hatırlatılır)' : 'Devre Dışı'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* SMTP configuration options */}
            <div className="space-y-5 pt-4 border-t border-slate-100 dark:border-zinc-800">
              <h3 className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                <Mail className="w-4.5 h-4.5 text-teal-600 dark:text-teal-400" />
                SMTP E-posta Raporlama Yapılandırması
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">E-posta Servis Sağlayıcısı (Preset)</label>
                    <select
                      value={settings.smtp.preset}
                      onChange={(e) => handleSMTPPresetChange(e.target.value as SMTPPreset)}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Gmail">Gmail</option>
                      <option value="Outlook">Outlook / Hotmail</option>
                      <option value="Office365">Office365 / Microsoft Cloud</option>
                      <option value="Exchange">Microsoft Exchange Enterprise</option>
                      <option value="Yahoo">Yahoo Mail</option>
                      <option value="Yandex">Yandex Mail</option>
                      <option value="Custom">Özel (Custom SMTP)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">Portföy Yöneticisi E-posta Adresi</label>
                    <input
                      type="email"
                      value={settings.smtp.email}
                      onChange={(e) => updateSettings({
                        ...settings,
                        smtp: { ...settings.smtp, email: e.target.value }
                      })}
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">Şifre veya Uygulama Şifresi (App Password)</label>
                    <input
                      type="password"
                      value={settings.smtp.password || ''}
                      onChange={(e) => updateSettings({
                        ...settings,
                        smtp: { ...settings.smtp, password: e.target.value }
                      })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">SMTP Sunucu Adresi</label>
                      <input
                        type="text"
                        value={settings.smtp.host}
                        onChange={(e) => updateSettings({
                          ...settings,
                          smtp: { ...settings.smtp, host: e.target.value }
                        })}
                        disabled={settings.smtp.preset !== 'Custom'}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 disabled:opacity-60"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">Bağlantı Portu</label>
                      <input
                        type="number"
                        value={settings.smtp.port}
                        onChange={(e) => updateSettings({
                          ...settings,
                          smtp: { ...settings.smtp, port: parseInt(e.target.value) || 25 }
                        })}
                        disabled={settings.smtp.preset !== 'Custom'}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-slate-50 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-600 dark:text-zinc-400 block">Güvenli SSL/TLS Protokolü</label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateSettings({
                          ...settings,
                          smtp: { ...settings.smtp, secure: !settings.smtp.secure }
                        })}
                        disabled={settings.smtp.preset !== 'Custom'}
                        className={`w-12 h-6.5 rounded-full p-1 transition-colors cursor-pointer disabled:opacity-50 ${
                          settings.smtp.secure ? 'bg-teal-600' : 'bg-slate-300 dark:bg-zinc-800'
                        }`}
                      >
                        <div className={`w-4.5 h-4.5 rounded-full bg-white transition-transform ${
                          settings.smtp.secure ? 'transform translate-x-5.5' : ''
                        }`} />
                      </button>
                      <span className="text-xs font-medium">SSL/TLS Şifreleme aktif</span>
                    </div>
                  </div>

                  <div className="pt-4 flex justify-end">
                    <button
                      onClick={handleTestSMTP}
                      disabled={smtpTesting}
                      className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-md disabled:opacity-60 transition-colors cursor-pointer"
                    >
                      {smtpTesting ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Mail className="w-4 h-4" />
                      )}
                      SMTP Bağlantısını Test Et
                    </button>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* -------------------- BOTTOM NAVIGATION ON MOBILE SCREENS -------------------- */}
      <footer className={`${isAndroidSimulator ? 'flex absolute h-16 pb-1' : 'md:hidden fixed h-safe-bottom pb-safe-navbar'} bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-slate-150 dark:border-zinc-800 flex items-center justify-around z-50 px-2 select-none`}>
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'dashboard' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
          }`}
        >
          <Clock className="w-5 h-5" />
          <span>Özet</span>
        </button>

        <button
          onClick={() => setActiveTab('calendar')}
          className={`flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'calendar' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span>Takvim</span>
        </button>

        <button
          onClick={() => setActiveTab('customers')}
          className={`flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'customers' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
          }`}
        >
          <Users className="w-5 h-5" />
          <span>Müşteriler</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'map' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
          }`}
        >
          <MapPin className="w-5 h-5" />
          <span>Harita</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center justify-center gap-1 text-xs font-bold cursor-pointer transition-colors ${
            activeTab === 'settings' ? 'text-teal-600 dark:text-teal-400' : 'text-slate-400'
          }`}
        >
          <Settings className="w-5 h-5" />
          <span>Ayarlar</span>
        </button>
      </footer>

      {/* -------------------- VOICE COMMAND MIC TRIGGER BUTTON FOR MOBILE -------------------- */}
      <div className={`${isAndroidSimulator ? 'absolute bottom-20' : 'md:hidden fixed bottom-[calc(5rem+env(safe-area-inset-bottom,0px))]'} right-4 z-50`}>
        <button
          onClick={() => setShowVoiceCommandModal(true)}
          className="w-12 h-12 bg-teal-600 hover:bg-teal-700 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer active:scale-95 transition-transform"
          title="Sesli Komut Asistanı"
        >
          <Mic className="w-5.5 h-5.5" />
        </button>
      </div>
        </>
      )}

      {/* -------------------- GLOBAL VOICE COMMAND MODAL -------------------- */}
      {showVoiceCommandModal && (
        <div className={`${isAndroidSimulator ? 'absolute' : 'fixed'} inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in`}>
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-md shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50 font-display flex items-center gap-2">
                <Mic className="w-5 h-5 text-teal-600" />
                Sesli Komut Asistanı
              </h3>
              <button
                type="button"
                onClick={() => setShowVoiceCommandModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <VoiceAssistant
              onExecuteCommand={(cmd) => {
                handleExecuteVoiceCommand(cmd);
                setShowVoiceCommandModal(false);
              }}
              mode="command"
              placeholder="Ziyaret planlamak veya sayfalar arası geçiş yapmak için komut verin..."
            />
          </div>
        </div>
      )}

      {/* -------------------- MODAL: CREATE / EDIT VISIT -------------------- */}
      {showVisitModal && (
        <div className={`${isAndroidSimulator ? 'absolute' : 'fixed'} inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 z-[9999]`}>
          <form onSubmit={handleVisitSubmit} className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl p-3.5 sm:p-4 space-y-3 animate-in fade-in">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-zinc-800">
              <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-zinc-50 font-display">
                {editingVisit ? 'Görüşme Detaylarını Düzenle' : 'Yeni Görüşme Planla'}
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowVisitModal(false);
                  setEditingVisit(null);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs max-h-[72vh] overflow-y-auto px-0.5 pr-1">
              <div className="space-y-2 p-3 bg-slate-50 dark:bg-zinc-950/60 border border-slate-200/80 dark:border-zinc-800/80 rounded-xl">
                <div className="flex justify-between items-center pb-1 border-b border-slate-200/50 dark:border-zinc-800/50">
                  <h4 className="font-bold text-[10px] text-teal-600 dark:text-teal-400 uppercase tracking-wide">
                    Görüşülecek Müşteri Seçimi
                  </h4>
                  
                  {/* Mode Toggle Buttons */}
                  <div className="flex bg-slate-200 dark:bg-zinc-800 p-0.5 rounded-lg border border-slate-300/40 dark:border-zinc-700/40 text-[10px] font-bold">
                    <button
                      type="button"
                      onClick={() => setCustomerEntryMode('existing')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        customerEntryMode === 'existing'
                          ? 'bg-white dark:bg-zinc-900 shadow-sm text-teal-600 dark:text-teal-400 font-extrabold'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Mevcut Müşteri
                    </button>
                    <button
                      type="button"
                      onClick={() => setCustomerEntryMode('manual')}
                      className={`px-2 py-0.5 rounded-md transition-all cursor-pointer ${
                        customerEntryMode === 'manual'
                          ? 'bg-white dark:bg-zinc-900 shadow-sm text-teal-600 dark:text-teal-400 font-extrabold'
                          : 'text-slate-500 dark:text-zinc-400 hover:text-slate-700 dark:hover:text-zinc-300'
                      }`}
                    >
                      Manuel Giriş
                    </button>
                  </div>
                </div>

                <div className="space-y-2 pt-0.5">
                  {customerEntryMode === 'existing' ? (
                    /* Existing Customer Dropdown */
                    <div className="space-y-1">
                      <label className="font-semibold text-slate-600 dark:text-zinc-400">Kayıtlı Müşteri Seçiniz *</label>
                      <select
                        value={selectedCustomerId}
                        onChange={(e) => {
                          const id = e.target.value;
                          setSelectedCustomerId(id);
                          const matched = customers.find(c => c.id === id);
                          if (matched && meetingFormState) {
                            setMeetingFormState(prev => ({
                              ...prev,
                              contactPerson: matched.companyName
                            }));
                          }
                        }}
                        className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-semibold text-xs cursor-pointer"
                      >
                        <option value="" disabled>Seçiniz...</option>
                        {customers.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.companyName}
                          </option>
                        ))}
                      </select>
                      
                      {/* Customer info preview inside visit modal */}
                      {selectedCustomerId && (
                        <div className="mt-1.5 p-2 bg-white/60 dark:bg-zinc-900/60 border border-slate-200/50 dark:border-zinc-800/50 rounded-lg space-y-0.5 text-[10px]">
                          <div className="flex justify-between">
                            <span className="font-semibold text-slate-500">Telefon:</span>
                            <span className="text-slate-800 dark:text-zinc-300 font-mono font-medium">{visitForm_customerPhone}</span>
                          </div>
                          {visitForm_customerEmail && (
                            <div className="flex justify-between">
                              <span className="font-semibold text-slate-500">E-posta:</span>
                              <span className="text-slate-800 dark:text-zinc-300">{visitForm_customerEmail}</span>
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5">
                            <span className="font-semibold text-slate-500">Adres:</span>
                            <span className="text-slate-700 dark:text-zinc-400 leading-normal">{visitForm_customerAddress}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Manual Entry Fields */
                    <div className="space-y-2 animate-in fade-in duration-200">
                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-zinc-400">Firma Ünvanı / Müşteri Adı *</label>
                        <input
                          type="text"
                          required
                          value={manualCustomerName}
                          onChange={(e) => {
                            const val = e.target.value;
                            setManualCustomerName(val);
                            if (meetingFormState) {
                              setMeetingFormState(prev => ({
                                ...prev,
                                contactPerson: val
                              }));
                            }
                          }}
                          placeholder="Örn: ABC Teknoloji Ltd. Şti."
                          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 dark:text-zinc-400">Telefon *</label>
                          <input
                            type="text"
                            required
                            value={manualCustomerPhone}
                            onChange={(e) => setManualCustomerPhone(e.target.value)}
                            placeholder="Örn: 0555 123 4567"
                            className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 font-mono"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-semibold text-slate-600 dark:text-zinc-400">E-posta</label>
                          <input
                            type="email"
                            value={manualCustomerEmail}
                            onChange={(e) => setManualCustomerEmail(e.target.value)}
                            placeholder="Örn: eposta@firma.com"
                            className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="font-semibold text-slate-600 dark:text-zinc-400">Adres *</label>
                        <textarea
                          required
                          rows={2}
                          value={manualCustomerAddress}
                          onChange={(e) => setManualCustomerAddress(e.target.value)}
                          placeholder="Örn: Atatürk Mah. Alparslan Cad. No:12 Ümraniye/İstanbul"
                          className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-zinc-900 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 leading-relaxed"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-zinc-400">Görüşme Tarihi *</label>
                  <input
                    type="date"
                    name="date"
                    id="visit-date-input"
                    required
                    value={visitForm_date}
                    onChange={(e) => {
                      const d = e.target.value;
                      setVisitForm_date(d);
                      if (meetingFormState) {
                        setMeetingFormState(prev => ({
                          ...prev,
                          meetingDate: d
                        }));
                      }
                    }}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-600 dark:text-zinc-400">Görüşme Saati *</label>
                  <input
                    type="time"
                    name="time"
                    required
                    value={visitForm_time}
                    onChange={(e) => setVisitForm_time(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-600 dark:text-zinc-400">Ziyaret / Görüşme Amacı *</label>
                <input
                  type="text"
                  name="purpose"
                  required
                  value={visitForm_purpose}
                  onChange={(e) => setVisitForm_purpose(e.target.value)}
                  placeholder="Kredi yapılandırması, POS anlaşması, yeni hesap teklifi..."
                  className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500"
                />
              </div>

              <div className="space-y-2">
                {/* Section Title & Mode Selectors */}
                <div className="flex justify-between items-center gap-2 border-b border-slate-100 dark:border-zinc-800/60 pb-1.5">
                  <label className="text-xs font-bold font-display uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                    Toplantı Notları
                  </label>
                  <div className="inline-flex rounded-lg p-0.5 bg-slate-100 dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800/80">
                    <button
                      type="button"
                      onClick={() => setNotesInputMode('voice')}
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                        notesInputMode === 'voice'
                          ? 'bg-white dark:bg-zinc-800 text-teal-750 dark:text-teal-400 shadow-xs font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      Sesli Dikte
                    </button>
                    <button
                      type="button"
                      onClick={() => setNotesInputMode('text')}
                      className={`px-2.5 py-0.5 text-[10px] font-semibold rounded-md transition-all cursor-pointer ${
                        notesInputMode === 'text'
                          ? 'bg-white dark:bg-zinc-800 text-teal-750 dark:text-teal-400 shadow-xs font-bold'
                          : 'text-slate-500'
                      }`}
                    >
                      Elle Yaz
                    </button>
                  </div>
                </div>

                {/* Mode Contents */}
                {notesInputMode === 'voice' ? (
                  <div className="flex flex-col items-center justify-center py-3 bg-slate-50 dark:bg-zinc-950/45 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800/80 gap-2">
                    <button
                      type="button"
                      onClick={handleToggleNotesListening}
                      className={`w-11 h-11 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isListeningNotes
                          ? 'bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/30'
                          : 'bg-teal-600 hover:bg-teal-700 text-white shadow'
                      }`}
                      title="Dikteyi Başlat/Durdur"
                    >
                      {isListeningNotes ? (
                        <MicOff className="w-5 h-5" />
                      ) : (
                        <Mic className="w-5 h-5" />
                      )}
                    </button>
                    <p className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
                      Not almak için mikrofona basın.
                    </p>
                    
                    {/* Live listening helper */}
                    {isListeningNotes && (
                      <p className="text-[10px] font-bold text-red-500 dark:text-red-400 animate-pulse">
                        Türkçe konuşun, sesiniz otomatik eklenecektir...
                      </p>
                    )}
                    
                    {/* Notes preview container inside voice mode */}
                    {visitNotes && (
                      <div className="w-full px-2 mt-1">
                        <div className="p-2.5 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-xl text-xs text-slate-600 dark:text-zinc-300 italic whitespace-pre-wrap leading-relaxed max-h-20 overflow-y-auto shadow-xs">
                          "{visitNotes}"
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    <textarea
                      name="notes"
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      rows={3}
                      placeholder="Görüşülen konuları ve alınan notları buraya ekleyin..."
                      className="w-full px-2.5 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                    />
                  </div>
                )}
                
                {/* Keep hidden/aux textarea synced in voice mode for FormData submission compatibility */}
                {notesInputMode === 'voice' && (
                  <textarea
                    name="notes"
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                    className="hidden"
                  />
                )}

                {/* "Rapor Al" Button under notes */}
                {editingVisit && (
                  <div className="pt-1 flex justify-start">
                    <button
                      type="button"
                      onClick={() => {
                        const virtualCustomer = {
                          id: editingVisit.id,
                          companyName: visitForm_customerName,
                          contactPerson: visitForm_customerName,
                          phone: visitForm_customerPhone,
                          email: visitForm_customerEmail,
                          address: visitForm_customerAddress,
                          notes: visitNotes,
                          photos: []
                        };
                        const finalizedMeetingForm = {
                          ...meetingFormState,
                          meetingDate: visitForm_date,
                          contactPerson: meetingFormState?.contactPerson || visitForm_customerName,
                        };
                        setActiveReportData({
                          customer: virtualCustomer,
                          visit: {
                            ...editingVisit,
                            customerName: visitForm_customerName,
                            customerPhone: visitForm_customerPhone,
                            customerEmail: visitForm_customerEmail,
                            customerAddress: visitForm_customerAddress,
                            notes: visitNotes,
                            date: visitForm_date,
                            time: visitForm_time,
                            purpose: visitForm_purpose,
                            meetingForm: finalizedMeetingForm
                          }
                        });
                        setShowReportModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100/85 text-teal-700 dark:bg-teal-950/40 dark:hover:bg-teal-950/70 dark:text-teal-400 text-xs font-bold rounded-lg border border-teal-200/50 dark:border-teal-900/30 cursor-pointer shadow-xs transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Rapor Al (PDF/Yazdır)
                    </button>
                  </div>
                )}
              </div>

              {/* STRUCTURED CUSTOMER MEETING FORM (MÜŞTERİ GÖRÜŞME FORMU) ACCORDION */}
              {meetingFormState && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col gap-0.5 pb-1">
                    <span className="text-xs font-bold tracking-wider text-teal-600 dark:text-teal-400 uppercase font-display">MÜŞTERİ GÖRÜŞME FORMU</span>
                    <p className="text-[11px] text-slate-500 leading-normal">
                      Ziyaret sırasında elde edilen mavi tabela, mülkiyet, tahsilat ve finansal talepleri işaretleyin.
                    </p>
                  </div>
                  <CustomerMeetingFormComp
                    value={meetingFormState}
                    onChange={(newForm) => setMeetingFormState(newForm)}
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-3 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                <label className="font-bold text-slate-700 dark:text-zinc-300 text-xs shrink-0">Ziyaret Durumu</label>
                <select
                  name="status"
                  value={visitForm_status}
                  onChange={(e) => setVisitForm_status(e.target.value as any)}
                  className="w-auto px-3 py-1.5 border border-slate-200 dark:border-zinc-800 rounded-xl bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-teal-500 cursor-pointer"
                >
                  <option value="Planned">Planlandı</option>
                  <option value="Completed">Tamamlandı</option>
                  <option value="Cancelled">İptal Edildi</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 text-xs font-semibold border-t border-slate-100 dark:border-zinc-800 gap-2">
              <div>
                {editingVisit && (
                  <button
                    type="button"
                    onClick={() => {
                      setDeleteConfirmation({
                        isOpen: true,
                        type: 'visit',
                        id: editingVisit.id,
                        companyName: `${editingVisit.customerName} - ${editingVisit.date} Görüşme Planı`,
                        onConfirm: () => {
                          deleteVisit(editingVisit.id);
                          showToast("Kayıt başarıyla silindi.", "warning");
                          setShowVisitModal(false);
                        }
                      });
                    }}
                    className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 dark:bg-red-950/30 dark:hover:bg-red-900/30 rounded-xl border border-red-100/60 cursor-pointer font-bold transition-colors"
                  >
                    Ziyareti Sil
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => {
                    setShowVisitModal(false);
                    setEditingVisit(null);
                  }}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 dark:text-zinc-400 dark:hover:bg-zinc-800 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs font-bold cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                      <span>Kaydediliyor...</span>
                    </>
                  ) : (
                    'Kaydet'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* -------------------- GLOBAL DELETE CONFIRMATION MODAL -------------------- */}
      {deleteConfirmation && deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[99999] animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4 text-center">
            <div className="mx-auto w-12 h-12 bg-red-50 dark:bg-red-950/30 rounded-full flex items-center justify-center text-red-600 dark:text-red-400">
              <Trash2 className="w-6 h-6" />
            </div>
            
            <div className="space-y-1.5">
              <h3 className="text-base font-bold text-slate-900 dark:text-zinc-50 font-display leading-snug">
                Bu görüşme notunu silmek istediğinize emin misiniz?
              </h3>
              {deleteConfirmation.companyName && (
                <div className="p-2 bg-slate-50 dark:bg-zinc-950/50 rounded-xl text-[11px] font-semibold text-slate-650 dark:text-zinc-300 font-mono break-all leading-normal">
                  {deleteConfirmation.companyName}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3.5 pt-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDeleteConfirmation(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 rounded-xl transition-all cursor-pointer"
              >
                Hayır
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteConfirmation.onConfirm();
                  setDeleteConfirmation(null);
                }}
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Evet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- REPORT EXPORT MODAL -------------------- */}
      {showReportModal && activeReportData && (
        <ReportModal
          customer={activeReportData.customer}
          visit={activeReportData.visit}
          smtpEmail={settings.smtp.email}
          onClose={() => {
            setShowReportModal(false);
            setActiveReportData(null);
          }}
        />
      )}

      {/* -------------------- DAILY VISITS LIST MODAL -------------------- */}
      {selectedCalendarDate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-in fade-in">
          <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-150 dark:border-zinc-800">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-50 font-display">
                  {selectedCalendarDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' })}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">Planlı Ziyaret Listesi</p>
              </div>
              <button
                onClick={() => setSelectedCalendarDate(null)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-xl cursor-pointer text-slate-450 dark:text-zinc-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {getVisitsForDate(selectedCalendarDate).length === 0 ? (
                <div className="py-10 text-center text-slate-400 dark:text-zinc-500">
                  <Calendar className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs italic">Bu tarih için planlanmış ziyaret bulunmuyor.</p>
                </div>
              ) : (
                getVisitsForDate(selectedCalendarDate)
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(v => (
                    <div
                      key={v.id}
                      onClick={() => {
                        setEditingVisit(v);
                        setSelectedCalendarDate(null);
                        setShowVisitModal(true);
                      }}
                      className="p-3 bg-slate-50 hover:bg-slate-100/80 dark:bg-zinc-950/40 dark:hover:bg-zinc-950/80 rounded-xl border border-slate-150 dark:border-zinc-800/80 cursor-pointer transition-all flex items-center justify-between group"
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono text-teal-600 dark:text-teal-400">
                            {v.time}
                          </span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                            v.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-teal-400'
                              : 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400'
                          }`}>
                            {v.status === 'Completed' ? 'Tamamlandı' : 'Planlandı'}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors truncate">
                          {v.customerName}
                        </h4>
                        <p className="text-[10px] text-slate-500 dark:text-zinc-400 truncate pr-2">
                          {v.purpose}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform flex-shrink-0" />
                    </div>
                  ))
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSelectedCalendarDate(null)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-750 text-slate-700 dark:text-zinc-300 rounded-xl cursor-pointer"
              >
                Kapat
              </button>
              <button
                type="button"
                onClick={() => {
                  const dateStr = selectedCalendarDate.toISOString().split('T')[0];
                  // Set visitForm states directly to prefill
                  setPrefilledVisitDate(dateStr);
                  setEditingVisit(null);
                  setSelectedCalendarDate(null);
                  setShowVisitModal(true);
                }}
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Plan Ekle
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
