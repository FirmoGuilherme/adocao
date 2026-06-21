import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import * as fc from 'fast-check';
import { PetDetailsComponent } from './pet-details.component';
import { PetService, Pet } from '../../core/services/pet.service';
import { PetHealthRecord, PetTemperament, PetMedia } from '../../core/models/pet-details.models';

const makePet = (overrides: Partial<Pet> = {}): Pet => ({
  id: 1,
  name: 'Rex',
  species: 'dog',
  breed: 'Labrador',
  age_group: 'adult',
  age_description: '3 years',
  size: 'large',
  sex: 'male',
  color: 'yellow',
  shelter_name: 'Happy Paws',
  city: 'São Paulo',
  status: 'Available',
  description: 'A friendly dog.',
  is_vaccinated: true,
  is_neutered: true,
  good_with_kids: true,
  good_with_dogs: true,
  good_with_cats: false,
  apartment_friendly: false,
  first_time_owner_friendly: true,
  ...overrides
});

describe('PetDetailsComponent', () => {
  let fixture: ComponentFixture<PetDetailsComponent>;
  let component: PetDetailsComponent;
  let petServiceSpy: jasmine.SpyObj<PetService>;

  beforeEach(async () => {
    petServiceSpy = jasmine.createSpyObj('PetService', [
      'getPet',
      'getHealthRecord',
      'getTemperament',
      'getMedia'
    ]);

    // Default stubs for detail section endpoints
    petServiceSpy.getHealthRecord.and.returnValue(throwError(() => ({ status: 404 })));
    petServiceSpy.getTemperament.and.returnValue(throwError(() => ({ status: 404 })));
    petServiceSpy.getMedia.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PetDetailsComponent, HttpClientTestingModule],
      providers: [
        { provide: PetService, useValue: petServiceSpy },
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PetDetailsComponent);
    component = fixture.componentInstance;
  });

  // Requirement 3.5 — ngOnInit calls PetService.getPet with the ID from the route
  it('should call PetService.getPet with the ID from the route on init', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet()));

    fixture.detectChanges();
    tick();

    expect(petServiceSpy.getPet).toHaveBeenCalledOnceWith(1);
  }));

  // Requirement 3.4 — all required attributes are rendered in the template
  it('should render name, breed and age_description', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet()));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Rex');
    expect(el.textContent).toContain('Labrador');
    expect(el.textContent).toContain('3 years');
  }));

  it('should render size, color, species and age_group', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet()));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('large');
    expect(el.textContent).toContain('yellow');
    expect(el.textContent).toContain('dog');
    expect(el.textContent).toContain('adult');
  }));

  it('should render sex, shelter_name, city and status', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet()));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    // sex is shown as ♂/♀ symbol — check shelter_name, city, status
    expect(el.textContent).toContain('Happy Paws');
    expect(el.textContent).toContain('São Paulo');
    expect(el.textContent).toContain('Available');
  }));

  it('should render description', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet({ description: 'A friendly dog.' })));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('A friendly dog.');
  }));

  it('should render is_vaccinated and is_neutered in Health tab', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet({ is_vaccinated: true, is_neutered: true })));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.activeTab = 'health';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Vaccinations up to date');
    expect(el.textContent).toContain('Neutered / Spayed');
  }));

  it('should render good_with_kids, good_with_dogs, good_with_cats, apartment_friendly and first_time_owner_friendly in Home tab', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(of(makePet({
      good_with_kids: true,
      good_with_dogs: true,
      good_with_cats: true,
      apartment_friendly: true,
      first_time_owner_friendly: true
    })));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    component.activeTab = 'home';
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Children');
    expect(el.textContent).toContain('Other Dogs');
    expect(el.textContent).toContain('Cats');
    expect(el.textContent).toContain('Apartments');
    expect(el.textContent).toContain('First-time owners');
  }));

  // Requirement 3.6 — error message is displayed when service returns error
  it('should display an error message when PetService.getPet fails', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Error loading pet');
    expect(component.errorMessage).toBeTruthy();
  }));

  it('should NOT display the pet content when service returns error', fakeAsync(() => {
    petServiceSpy.getPet.and.returnValue(throwError(() => new Error('Network error')));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.pet).toBeNull();
  }));

  // ======================================================================
  // Requirement 5.5, 5.6 — Responsive layout tests
  // ======================================================================
  describe('Responsive Layout (Requirements 5.5, 5.6)', () => {

    describe('Desktop layout (>768px)', () => {

      beforeEach(fakeAsync(() => {
        petServiceSpy.getPet.and.returnValue(of(makePet()));
        spyOnProperty(window, 'innerWidth').and.returnValue(1024);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
      }));

      it('should set isMobile to false when viewport > 768px', () => {
        expect(component.isMobile).toBeFalse();
      });

      it('should render tab navigation buttons on desktop', () => {
        const el = fixture.nativeElement as HTMLElement;
        const tabNav = el.querySelector('nav[aria-label="Abas de detalhes"]');
        expect(tabNav).toBeTruthy();
        const buttons = tabNav!.querySelectorAll('button');
        expect(buttons.length).toBe(4);
      });

      it('should display tab labels correctly', () => {
        const el = fixture.nativeElement as HTMLElement;
        const tabNav = el.querySelector('nav[aria-label="Abas de detalhes"]');
        const buttons = tabNav!.querySelectorAll('button');
        const labels = Array.from(buttons).map(b => b.textContent!.trim());
        expect(labels).toEqual(['Informações Básicas', 'Saúde', 'Temperamento', 'Galeria']);
      });

      it('should switch activeTab when a tab button is clicked', () => {
        const el = fixture.nativeElement as HTMLElement;
        const tabNav = el.querySelector('nav[aria-label="Abas de detalhes"]');
        const buttons = tabNav!.querySelectorAll('button');

        // Click "Saúde" tab (index 1)
        buttons[1].click();
        fixture.detectChanges();
        expect(component.activeTab).toBe('health');

        // Click "Temperamento" tab (index 2)
        buttons[2].click();
        fixture.detectChanges();
        expect(component.activeTab).toBe('temperament');

        // Click "Galeria" tab (index 3)
        buttons[3].click();
        fixture.detectChanges();
        expect(component.activeTab).toBe('gallery');
      });

      it('should highlight the active tab with border-primary class', () => {
        const el = fixture.nativeElement as HTMLElement;
        const tabNav = el.querySelector('nav[aria-label="Abas de detalhes"]');
        const buttons = tabNav!.querySelectorAll('button');

        // Default tab is "overview" (index 0)
        expect(buttons[0].classList.contains('border-primary')).toBeTrue();
        expect(buttons[1].classList.contains('border-transparent')).toBeTrue();

        // Switch to health
        buttons[1].click();
        fixture.detectChanges();
        expect(buttons[1].classList.contains('border-primary')).toBeTrue();
        expect(buttons[0].classList.contains('border-transparent')).toBeTrue();
      });

      it('should NOT render the mobile stacked layout on desktop', () => {
        const el = fixture.nativeElement as HTMLElement;
        // The mobile section uses *ngIf="isMobile", so it shouldn't be in DOM
        const mobileSection = el.querySelector('.space-y-8.md\\:hidden');
        expect(mobileSection).toBeNull();
      });
    });

    describe('Mobile layout (≤768px)', () => {

      beforeEach(fakeAsync(() => {
        petServiceSpy.getPet.and.returnValue(of(makePet()));
        spyOnProperty(window, 'innerWidth').and.returnValue(768);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();
      }));

      it('should set isMobile to true when viewport <= 768px', () => {
        expect(component.isMobile).toBeTrue();
      });

      it('should NOT render tab navigation on mobile', () => {
        const el = fixture.nativeElement as HTMLElement;
        const tabNav = el.querySelector('nav[aria-label="Abas de detalhes"]');
        expect(tabNav).toBeNull();
      });

      it('should render stacked layout with all sections visible', () => {
        const el = fixture.nativeElement as HTMLElement;
        const sections = el.querySelectorAll('.space-y-8 > section');
        // 4 sections: overview, health, temperament, gallery
        expect(sections.length).toBe(4);
      });

      it('should display section headings in stacked mobile layout', () => {
        const el = fixture.nativeElement as HTMLElement;
        const headings = el.querySelectorAll('.space-y-8 > section > h3');
        const headingTexts = Array.from(headings).map(h => h.textContent!.trim());
        expect(headingTexts).toContain('Saúde');
        expect(headingTexts).toContain('Temperamento');
        expect(headingTexts).toContain('Galeria');
      });
    });

    describe('Resize behavior', () => {

      it('should toggle from desktop to mobile when resized to ≤768px', fakeAsync(() => {
        petServiceSpy.getPet.and.returnValue(of(makePet()));
        // Start in desktop
        spyOnProperty(window, 'innerWidth').and.returnValues(1024, 768);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(component.isMobile).toBeFalse();

        // Simulate resize
        component.onResize();
        fixture.detectChanges();

        expect(component.isMobile).toBeTrue();
      }));

      it('should toggle from mobile to desktop when resized to >768px', fakeAsync(() => {
        petServiceSpy.getPet.and.returnValue(of(makePet()));
        // Start in mobile
        spyOnProperty(window, 'innerWidth').and.returnValues(600, 1024);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        expect(component.isMobile).toBeTrue();

        // Simulate resize
        component.onResize();
        fixture.detectChanges();

        expect(component.isMobile).toBeFalse();
      }));

      it('should show tab navigation after resizing from mobile to desktop', fakeAsync(() => {
        petServiceSpy.getPet.and.returnValue(of(makePet()));
        // Start in mobile
        spyOnProperty(window, 'innerWidth').and.returnValues(600, 1024);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        // Mobile: no tabs
        let tabNav = (fixture.nativeElement as HTMLElement).querySelector('nav[aria-label="Abas de detalhes"]');
        expect(tabNav).toBeNull();

        // Resize to desktop
        component.onResize();
        fixture.detectChanges();

        // Desktop: tabs visible
        tabNav = (fixture.nativeElement as HTMLElement).querySelector('nav[aria-label="Abas de detalhes"]');
        expect(tabNav).toBeTruthy();
      }));

      it('should show stacked sections after resizing from desktop to mobile', fakeAsync(() => {
        petServiceSpy.getPet.and.returnValue(of(makePet()));
        // Start in desktop
        spyOnProperty(window, 'innerWidth').and.returnValues(1024, 768);
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        // Desktop: no stacked sections
        let sections = (fixture.nativeElement as HTMLElement).querySelectorAll('.space-y-8 > section');
        expect(sections.length).toBe(0);

        // Resize to mobile
        component.onResize();
        fixture.detectChanges();

        // Mobile: stacked sections
        sections = (fixture.nativeElement as HTMLElement).querySelectorAll('.space-y-8 > section');
        expect(sections.length).toBe(4);
      }));
    });
  });
});


// --- Test Data Factories for Property Tests ---

const makeHealthRecord = (): PetHealthRecord => ({
  id: 1,
  pet_id: 1,
  vaccination_records: [{ vaccine_name: 'Rabies', date_administered: '2024-01-15' }],
  medical_conditions: [],
  surgeries: [],
  special_needs: null,
  last_vet_visit: '2024-06-01',
  weight_kg: 25.5,
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z'
});

const makeTemperament = (): PetTemperament => ({
  id: 1,
  pet_id: 1,
  energy_level: 4,
  sociability_people: 5,
  sociability_animals: 3,
  training_level: 4,
  independence_level: 2,
  playfulness: 5,
  noise_level: 3,
  behavior_notes: 'Very playful and friendly.',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-06-01T00:00:00Z'
});

const makeMediaList = (): PetMedia[] => ([
  { id: 1, pet_id: 1, media_type: 'photo', file_name: 'photo1.jpg', url: '/static/uploads/pets/1/photo1.jpg', uploaded_at: '2024-06-01T12:00:00Z' }
]);

function makeHttpError(status: number): HttpErrorResponse {
  return new HttpErrorResponse({ status, statusText: 'Error', url: 'http://localhost:8000/pets/1/health' });
}

// --- Arbitrary for endpoint failure scenarios ---

interface EndpointScenario {
  healthFails: boolean;
  temperamentFails: boolean;
  mediaFails: boolean;
  healthErrorCode: number;
  temperamentErrorCode: number;
  mediaErrorCode: number;
}

const endpointScenarioArb: fc.Arbitrary<EndpointScenario> = fc.record({
  healthFails: fc.boolean(),
  temperamentFails: fc.boolean(),
  mediaFails: fc.boolean(),
  healthErrorCode: fc.constantFrom(500, 502, 503, 408),
  temperamentErrorCode: fc.constantFrom(500, 502, 503, 408),
  mediaErrorCode: fc.constantFrom(500, 502, 503, 408)
});

// Helper to check if an element contains specific text
function findTextInElement(el: HTMLElement, text: string): boolean {
  return el.textContent?.includes(text) ?? false;
}

// --- Property-Based Test Suite ---

/**
 * Property 7: Graceful degradation under partial failures
 *
 * **Validates: Requirements 5.4**
 *
 * For any subset of the detail endpoints (/health, /temperament, /media)
 * that return errors, the PetDetailsComponent shall still correctly display
 * the sections whose endpoints returned successfully, without blocking or crashing.
 */
describe('PetDetailsComponent - Property 7: Graceful degradation under partial failures', () => {
  let fixture: ComponentFixture<PetDetailsComponent>;
  let component: PetDetailsComponent;
  let petServiceSpy: jasmine.SpyObj<PetService>;

  function setupTestBed(): void {
    petServiceSpy = jasmine.createSpyObj('PetService', [
      'getPet', 'getHealthRecord', 'getTemperament', 'getMedia',
      'uploadMedia', 'deleteMedia'
    ]);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      imports: [PetDetailsComponent, HttpClientTestingModule],
      providers: [
        { provide: PetService, useValue: petServiceSpy },
        { provide: ActivatedRoute, useValue: { params: of({ id: '1' }) } }
      ]
    });

    fixture = TestBed.createComponent(PetDetailsComponent);
    component = fixture.componentInstance;
  }

  it('should degrade gracefully for any combination of partial endpoint failures', fakeAsync(() => {
    fc.assert(
      fc.property(endpointScenarioArb, (scenario: EndpointScenario) => {
        setupTestBed();

        // The base pet load must succeed for detail sections to load
        petServiceSpy.getPet.and.returnValue(of(makePet()));

        // Configure health endpoint
        if (scenario.healthFails) {
          petServiceSpy.getHealthRecord.and.returnValue(
            throwError(() => makeHttpError(scenario.healthErrorCode))
          );
        } else {
          petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
        }

        // Configure temperament endpoint
        if (scenario.temperamentFails) {
          petServiceSpy.getTemperament.and.returnValue(
            throwError(() => makeHttpError(scenario.temperamentErrorCode))
          );
        } else {
          petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));
        }

        // Configure media endpoint
        if (scenario.mediaFails) {
          petServiceSpy.getMedia.and.returnValue(
            throwError(() => makeHttpError(scenario.mediaErrorCode))
          );
        } else {
          petServiceSpy.getMedia.and.returnValue(of(makeMediaList()));
        }

        // Trigger component initialization
        fixture.detectChanges();
        tick();
        fixture.detectChanges();

        // --- Assertions ---

        // Component should not crash - pet should be loaded
        expect(component.pet).not.toBeNull();
        expect(component.errorMessage).toBeNull();

        // Health section state
        if (scenario.healthFails) {
          expect(component.sectionStatus.health).toBe('error');
        } else {
          expect(component.sectionStatus.health).toBe('loaded');
        }

        // Temperament section state
        if (scenario.temperamentFails) {
          expect(component.sectionStatus.temperament).toBe('error');
        } else {
          expect(component.sectionStatus.temperament).toBe('loaded');
        }

        // Media section state
        if (scenario.mediaFails) {
          expect(component.sectionStatus.media).toBe('error');
        } else {
          expect(component.sectionStatus.media).toBe('loaded');
        }

        // Verify DOM: sections with errors show error message and retry button
        // Switch to mobile mode for simpler DOM (all sections visible at once)
        component.isMobile = true;
        fixture.detectChanges();

        const el = fixture.nativeElement as HTMLElement;

        if (scenario.healthFails) {
          expect(findTextInElement(el, 'Não foi possível carregar as informações de saúde.')).toBeTrue();
        } else {
          expect(findTextInElement(el, 'Não foi possível carregar as informações de saúde.')).toBeFalse();
        }

        if (scenario.temperamentFails) {
          expect(findTextInElement(el, 'Não foi possível carregar o perfil de temperamento.')).toBeTrue();
        } else {
          expect(findTextInElement(el, 'Não foi possível carregar o perfil de temperamento.')).toBeFalse();
        }

        if (scenario.mediaFails) {
          expect(findTextInElement(el, 'Não foi possível carregar a galeria de mídias.')).toBeTrue();
        } else {
          expect(findTextInElement(el, 'Não foi possível carregar a galeria de mídias.')).toBeFalse();
        }

        // Verify retry buttons exist for failed sections
        const retryButtons = el.querySelectorAll('button');
        const retryButtonTexts = Array.from(retryButtons).map(b => b.textContent?.trim());
        const failedCount = [scenario.healthFails, scenario.temperamentFails, scenario.mediaFails]
          .filter(Boolean).length;
        const retryCount = retryButtonTexts.filter(t => t?.includes('Tentar novamente')).length;
        expect(retryCount).toBeGreaterThanOrEqual(failedCount);

        // Cleanup
        fixture.destroy();
      }),
      { numRuns: 100 }
    );
  }));

  it('should allow retry of a failed section without affecting other sections', fakeAsync(() => {
    fc.assert(
      fc.property(
        fc.constantFrom('health' as const, 'temperament' as const, 'media' as const),
        (failingSection: 'health' | 'temperament' | 'media') => {
          setupTestBed();

          petServiceSpy.getPet.and.returnValue(of(makePet()));

          // One section fails, others succeed
          if (failingSection === 'health') {
            petServiceSpy.getHealthRecord.and.returnValue(throwError(() => makeHttpError(500)));
          } else {
            petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
          }

          if (failingSection === 'temperament') {
            petServiceSpy.getTemperament.and.returnValue(throwError(() => makeHttpError(500)));
          } else {
            petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));
          }

          if (failingSection === 'media') {
            petServiceSpy.getMedia.and.returnValue(throwError(() => makeHttpError(500)));
          } else {
            petServiceSpy.getMedia.and.returnValue(of(makeMediaList()));
          }

          fixture.detectChanges();
          tick();
          fixture.detectChanges();

          // Verify the failing section is in error state
          expect(component.sectionStatus[failingSection]).toBe('error');

          // Verify other sections are NOT in error state
          const allSections: Array<'health' | 'temperament' | 'media'> = ['health', 'temperament', 'media'];
          for (const section of allSections) {
            if (section !== failingSection) {
              expect(component.sectionStatus[section]).not.toBe('error');
              expect(component.sectionStatus[section]).not.toBe('loading');
            }
          }

          // Now simulate retry: make the endpoint succeed
          if (failingSection === 'health') {
            petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
            component.retryHealth();
          } else if (failingSection === 'temperament') {
            petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));
            component.retryTemperament();
          } else {
            petServiceSpy.getMedia.and.returnValue(of(makeMediaList()));
            component.retryMedia();
          }

          tick();
          fixture.detectChanges();

          // After retry, the section should be loaded
          expect(component.sectionStatus[failingSection]).toBe('loaded');

          // Other sections should remain unaffected
          for (const section of allSections) {
            if (section !== failingSection) {
              expect(component.sectionStatus[section]).toBe('loaded');
            }
          }

          fixture.destroy();
        }
      ),
      { numRuns: 100 }
    );
  }));
});
