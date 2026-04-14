import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ApplicationCreate {
  user_id: number;
  pet_id: number;
  housing_type: string;
  motivation: string;
}

export interface ApplicationResponse extends ApplicationCreate {
  id: number;
  status: string;
  compatibility_score: number;
}

@Injectable({
  providedIn: 'root'
})
export class ApplicationService {
  private apiUrl = 'http://localhost:8000/applications';

  constructor(private http: HttpClient) {}

  createApplication(payload: ApplicationCreate): Observable<ApplicationResponse> {
    return this.http.post<ApplicationResponse>(this.apiUrl, payload);
  }

  getUserApplications(userId: number): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.apiUrl}/user/${userId}`);
  }
}
