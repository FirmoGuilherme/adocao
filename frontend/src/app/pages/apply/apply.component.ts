import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ApplicationService } from '../../core/services/application.service';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-background min-h-screen py-10">
      <div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

        <div class="bg-surface rounded-3xl shadow-soft p-8 md:p-12">

          <!-- Success message -->
          <div *ngIf="successMessage" class="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 text-sm">
            ✅ {{ successMessage }}
          </div>

          <!-- Error message -->
          <div *ngIf="errorMessage" class="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-sm">
            ❌ {{ errorMessage }}
          </div>

          <div *ngIf="!successMessage">
            <div class="text-center mb-10">
              <h1 class="text-3xl font-extrabold text-gray-900">Adoption Application</h1>
              <p class="text-gray-500 mt-2">You are applying to adopt a pet. Please answer carefully to help the shelter evaluate your profile.</p>
            </div>

            <!-- Progress -->
            <div class="flex items-center justify-between mb-8 relative">
              <div class="absolute left-0 top-1/2 -mt-px w-full h-0.5 bg-gray-200" aria-hidden="true"></div>
              <div [class.bg-primary]="step >= 1" [class.border-primary]="step >= 1" class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 font-bold" [ngClass]="step >= 1 ? 'text-white' : 'border-gray-300 text-gray-500'">1</div>
              <div [class.bg-primary]="step >= 2" [class.border-primary]="step >= 2" class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 font-bold" [ngClass]="step >= 2 ? 'text-white' : 'border-gray-300 text-gray-500'">2</div>
              <div [class.bg-primary]="step >= 3" [class.border-primary]="step >= 3" class="relative flex items-center justify-center w-8 h-8 rounded-full border-2 bg-white z-10 font-bold" [ngClass]="step >= 3 ? 'text-white' : 'border-gray-300 text-gray-500'">3</div>
            </div>

            <form (ngSubmit)="nextStep()">

              <!-- Step 1: Personal & Housing -->
              <div *ngIf="step === 1" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 border-b pb-2">1. Personal & Housing</h2>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Housing Type <span class="text-red-500">*</span></label>
                  <select required [(ngModel)]="application.housing_type" name="housing_type" class="input-field">
                    <option value="">Select...</option>
                    <option value="House - Owned">House - Owned</option>
                    <option value="House - Rented">House - Rented</option>
                    <option value="Apartment - Owned">Apartment - Owned</option>
                    <option value="Apartment - Rented">Apartment - Rented</option>
                  </select>
                </div>

                <div *ngIf="application.housing_type.includes('Rented')" class="bg-yellow-50 p-4 rounded-lg flex gap-3 text-yellow-800 text-sm">
                  <span>⚠️</span>
                  <span>For rented properties, you must confirm that your landlord allows pets.</span>
                </div>
              </div>

              <!-- Step 2: Experience & Routine -->
              <div *ngIf="step === 2" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 border-b pb-2">2. Experience & Routine</h2>

                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-1">Why do you want to adopt? <span class="text-red-500">*</span></label>
                  <textarea required [(ngModel)]="application.motivation" name="motivation" rows="4" class="input-field" placeholder="Tell the shelter a little about yourself and your motivations..."></textarea>
                </div>
              </div>

              <!-- Step 3: Terms -->
              <div *ngIf="step === 3" class="space-y-6">
                <h2 class="text-xl font-bold text-gray-900 border-b pb-2">3. Review & Agreement</h2>

                <div class="bg-gray-50 p-6 rounded-xl border border-gray-200 text-sm text-gray-700 space-y-4">
                  <p>By submitting this application, I confirm that:</p>
                  <ul class="list-disc pl-5 space-y-2">
                    <li>All information provided is true and accurate.</li>
                    <li>I am aware this is an application and does not guarantee adoption.</li>
                    <li>I understand the shelter may request a home visit or interview.</li>
                    <li>I am financially capable of providing veterinary care, high-quality food, and shelter for the animal's entire lifetime.</li>
                  </ul>
                </div>

                <label class="flex items-start space-x-3 mt-4">
                  <input type="checkbox" required [(ngModel)]="agreed" name="agreed" class="mt-1 text-primary focus:ring-primary h-5 w-5 rounded">
                  <span class="text-sm text-gray-700">I have read and agree to the responsibilities of pet adoption outlined above.</span>
                </label>
              </div>

              <!-- Navigation Buttons -->
              <div class="mt-10 flex justify-between pt-6 border-t border-gray-100">
                <button *ngIf="step > 1" type="button" (click)="step = step - 1" class="btn-outline px-8 py-2">Back</button>
                <div *ngIf="step === 1"></div>

                <button *ngIf="step < 3" type="submit" class="btn-primary px-8 py-2">Next Step</button>
                <button *ngIf="step === 3" type="button" (click)="submit()" [disabled]="isSubmitting" class="btn-primary px-8 py-2 bg-secondary hover:bg-green-600 shadow-float">
                  {{ isSubmitting ? 'Submitting...' : 'Submit Application' }}
                </button>
              </div>

            </form>
          </div>

        </div>
      </div>
    </div>
  `
})
export class ApplyComponent implements OnInit {
  step = 1;
  petId: number | null = null;
  agreed = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  application = {
    housing_type: '',
    motivation: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private applicationService: ApplicationService
  ) {}

  ngOnInit() {
    this.petId = Number(this.route.snapshot.paramMap.get('id'));
  }

  nextStep() {
    if (this.step < 3) this.step++;
  }

  submit() {
    if (!this.application.housing_type || !this.application.motivation) {
      this.errorMessage = 'Please fill in all required fields.';
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const payload = {
      user_id: 1, // MVP: hardcoded user
      pet_id: this.petId!,
      housing_type: this.application.housing_type,
      motivation: this.application.motivation
    };

    this.applicationService.createApplication(payload).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.successMessage = 'Application submitted successfully! The shelter will review it soon.';
      },
      error: () => {
        this.isSubmitting = false;
        this.errorMessage = 'Failed to submit application. Please try again later.';
      }
    });
  }
}
