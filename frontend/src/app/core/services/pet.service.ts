import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class PetService {
  private apiUrl = 'http://localhost:8000/pets';

  constructor(private http: HttpClient) {}

  getPets(filters?: any): Observable<Pet[]> {
    return this.http.get<Pet[]>(this.apiUrl, { params: filters });
  }

  getPet(id: number): Observable<Pet> {
    return this.http.get<Pet>(`${this.apiUrl}/${id}`);
  }
}
