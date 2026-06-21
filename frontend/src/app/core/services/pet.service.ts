import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { PetHealthRecord, PetTemperament, PetMedia } from '../models/pet-details.models';

// Mock models matching the backend schemas
export interface Pet {
  id: number;
  name: string;
  species: string;
  breed: string;
  age_group: string;
  age_description: string;
  size: string;
  sex: string;
  color: string;
  shelter_name: string;
  city: string;
  status: string;
  description?: string;
  is_vaccinated: boolean;
  is_neutered: boolean;
  good_with_kids: boolean;
  good_with_dogs: boolean;
  good_with_cats: boolean;
  apartment_friendly: boolean;
  first_time_owner_friendly: boolean;
  image_url?: string;
}

export interface PetCreate {
  name: string;
  species: string;
  breed: string;
  age_group: string;
  age_description: string;
  size: string;
  sex: string;
  color: string;
  shelter_name: string;
  city: string;
  status: string;
  description?: string;
  is_vaccinated?: boolean;
  is_neutered?: boolean;
  good_with_kids?: boolean;
  good_with_dogs?: boolean;
  good_with_cats?: boolean;
  apartment_friendly?: boolean;
  first_time_owner_friendly?: boolean;
  image_url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:8000/pets';
  private readonly TIMEOUT_MS = 10000;

  constructor(private http: HttpClient) {}

  getPets(filters?: any): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl, { params: filters });
  }

  getPet(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
  }

  createPet(pet: PetCreate): Observable<Pet> {
    return this.http.post<Pet>(this.apiUrl, pet);
  }

  getHealthRecord(petId: number): Observable<PetHealthRecord> {
    return this.http.get<PetHealthRecord>(`${this.apiUrl}/${petId}/health`).pipe(
      timeout(this.TIMEOUT_MS)
    );
  }

  getTemperament(petId: number): Observable<PetTemperament> {
    return this.http.get<PetTemperament>(`${this.apiUrl}/${petId}/temperament`).pipe(
      timeout(this.TIMEOUT_MS)
    );
  }

  getMedia(petId: number): Observable<PetMedia[]> {
    return this.http.get<PetMedia[]>(`${this.apiUrl}/${petId}/media`).pipe(
      timeout(this.TIMEOUT_MS)
    );
  }

  uploadMedia(petId: number, file: File): Observable<PetMedia> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<PetMedia>(`${this.apiUrl}/${petId}/media`, formData).pipe(
      timeout(this.TIMEOUT_MS)
    );
  }

  deleteMedia(petId: number, mediaId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${petId}/media/${mediaId}`).pipe(
      timeout(this.TIMEOUT_MS)
    );
  }
}
