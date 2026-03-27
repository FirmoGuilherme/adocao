import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface User {
  id: number;
  name: string;
  email: string;
  city: string;
  state: string;
  role: string;
  avatar?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/auth';
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    // Basic mock initialization from localstorage
    const userJson = localStorage.getItem('adocao_user');
    if (userJson) {
      this.currentUserSubject.next(JSON.parse(userJson));
    }
  }

  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  login(email: string): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/login?email=${email}`, {}).pipe(
      tap(user => {
        localStorage.setItem('adocao_user', JSON.stringify(user));
        this.currentUserSubject.next(user);
      })
    );
  }

  logout() {
    localStorage.removeItem('adocao_user');
    this.currentUserSubject.next(null);
  }
}
