import { create } from "zustand";

export type MenteeData = {
  career_stage: "university" | "graduate" | "analyst" | "associate_plus" | null;
  university: string;
  year_of_study: string;
  current_firm: string;
  current_role: string;
  target_role: string;
  target_division: string;
  goals: string;
};

export type MentorData = {
  firm: string;
  seniority: string;
  expertise_areas: string[];
  availability: string;
  bio: string;
};

type OnboardingState = {
  role: "mentee" | "mentor" | null;
  mentee: MenteeData;
  mentor: MentorData;
  founding_code: string;
  setRole: (role: "mentee" | "mentor") => void;
  setMentee: (data: Partial<MenteeData>) => void;
  setMentor: (data: Partial<MentorData>) => void;
  setFoundingCode: (code: string) => void;
  reset: () => void;
};

const defaultMentee: MenteeData = {
  career_stage: null,
  university: "",
  year_of_study: "",
  current_firm: "",
  current_role: "",
  target_role: "",
  target_division: "",
  goals: "",
};

const defaultMentor: MentorData = {
  firm: "",
  seniority: "",
  expertise_areas: [],
  availability: "",
  bio: "",
};

export const useOnboardingStore = create<OnboardingState>((set) => ({
  role: null,
  mentee: defaultMentee,
  mentor: defaultMentor,
  founding_code: "",
  setRole: (role) => set({ role }),
  setMentee: (data) => set((s) => ({ mentee: { ...s.mentee, ...data } })),
  setMentor: (data) => set((s) => ({ mentor: { ...s.mentor, ...data } })),
  setFoundingCode: (code) => set({ founding_code: code }),
  reset: () => set({ role: null, mentee: defaultMentee, mentor: defaultMentor, founding_code: "" }),
}));
