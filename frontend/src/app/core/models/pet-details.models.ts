export interface VaccinationRecord {
  vaccine_name: string;
  date_administered: string; // ISO date
  expiry_date?: string | null;
}

export interface MedicalCondition {
  condition_name: string;
  diagnosed_date?: string | null;
  notes?: string | null;
}

export interface Surgery {
  surgery_name: string;
  surgery_date: string; // ISO date
  description?: string | null;
}

export interface PetHealthRecord {
  id: number;
  pet_id: number;
  vaccination_records: VaccinationRecord[];
  medical_conditions: MedicalCondition[];
  surgeries: Surgery[];
  special_needs?: string | null;
  last_vet_visit?: string | null;
  weight_kg?: number | null;
  created_at: string;
  updated_at: string;
}

export interface PetTemperament {
  id: number;
  pet_id: number;
  energy_level: number;
  sociability_people: number;
  sociability_animals: number;
  training_level: number;
  independence_level: number;
  playfulness: number;
  noise_level: number;
  behavior_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PetMedia {
  id: number;
  pet_id: number;
  media_type: 'photo' | 'video';
  file_name: string;
  url: string;
  uploaded_at: string;
}
