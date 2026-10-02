import { create } from "zustand";
import { type SellCarFormData } from "@/lib/validations/sell-car";

export const INITIAL_FORM_DATA: SellCarFormData = {
  name: "",
  mobileNumber: "",
  whatsappSame: true,
  whatsappNumber: "",
  city: "Bhopal",
  registrationNumber: "",
  registrationState: "MP",
  manufacturingYear: 2021,
  registrationYear: 2021,
  ownerType: "FIRST",
  brand: "",
  modelName: "",
  variant: "",
  kmDrivenRange: "35,000 km",
  fuelType: "PETROL",
  transmissionType: "MANUAL",
  expectedPrice: 0,
  photos: [],
  hp_website: "",
};

interface SellCarStoreState {
  step: number; // 1 | 2 | 3 | 4 | 5 (5 is confirmation/success)
  direction: number; // 1 for forward, -1 for backward
  formData: SellCarFormData;
  isSubmitting: boolean;
  submitError: string | null;
  submittedLeadId: string | null;
  submittedLeadRef: string | null;

  // Actions
  setStep: (step: number, direction?: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateFormData: (partial: Partial<SellCarFormData>) => void;
  setIsSubmitting: (isSubmitting: boolean) => void;
  setSubmitError: (error: string | null) => void;
  setSuccess: (leadId: string, leadRef: string) => void;
  resetForm: () => void;
}

export const useSellCarStore = create<SellCarStoreState>((set) => ({
  step: 1,
  direction: 1,
  formData: INITIAL_FORM_DATA,
  isSubmitting: false,
  submitError: null,
  submittedLeadId: null,
  submittedLeadRef: null,

  setStep: (step, direction = 1) => set({ step, direction }),
  nextStep: () =>
    set((state) => ({
      step: Math.min(state.step + 1, 5),
      direction: 1,
    })),
  prevStep: () =>
    set((state) => ({
      step: Math.max(state.step - 1, 1),
      direction: -1,
    })),
  updateFormData: (partial) =>
    set((state) => ({
      formData: { ...state.formData, ...partial },
    })),
  setIsSubmitting: (isSubmitting) => set({ isSubmitting }),
  setSubmitError: (submitError) => set({ submitError }),
  setSuccess: (leadId, leadRef) =>
    set({
      step: 5,
      direction: 1,
      submittedLeadId: leadId,
      submittedLeadRef: leadRef,
      isSubmitting: false,
      submitError: null,
    }),
  resetForm: () =>
    set({
      step: 1,
      direction: 1,
      formData: INITIAL_FORM_DATA,
      isSubmitting: false,
      submitError: null,
      submittedLeadId: null,
      submittedLeadRef: null,
    }),
}));
