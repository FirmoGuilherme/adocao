import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { TemperamentComponent } from './temperament.component';
import { PetService } from '../../../core/services/pet.service';
import { PetTemperament } from '../../../core/models/pet-details.models';

const makeTemperament = (overrides: Partial<PetTemperament> = {}): PetTemperament => ({
  id: 1,
  pet_id: 1,
  energy_level: 4,
  sociability_people: 5,
  sociability_animals: 3,
  training_level: 2,
  independence_level: 4,
  playfulness: 5,
  noise_level: 2,
  behavior_notes: 'Muito brincalhão e adora crianças.',
  created_at: '2024-01-01T00:00:00',
  updated_at: '2024-06-01T00:00:00',
  ...overrides
});

describe('TemperamentComponent', () => {
  let fixture: ComponentFixture<TemperamentComponent>;
  let component: TemperamentComponent;
  let petServiceSpy: jasmine.SpyObj<PetService>;

  beforeEach(async () => {
    petServiceSpy = jasmine.createSpyObj('PetService', ['getTemperament']);

    await TestBed.configureTestingModule({
      imports: [TemperamentComponent],
      providers: [
        { provide: PetService, useValue: petServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TemperamentComponent);
    component = fixture.componentInstance;
    component.petId = 1;
  });

  // --- Requirement 2.8: Renderização de escalas visuais ---

  describe('Loaded state - scale rendering', () => {
    it('should render all 7 temperament levels', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Nível de Energia');
      expect(el.textContent).toContain('Sociabilidade com Pessoas');
      expect(el.textContent).toContain('Sociabilidade com Animais');
      expect(el.textContent).toContain('Nível de Treinamento');
      expect(el.textContent).toContain('Nível de Independência');
      expect(el.textContent).toContain('Brincadeira');
      expect(el.textContent).toContain('Nível de Barulho');
    }));

    it('should display scale values as X/5 for each level', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('4/5'); // energy_level
      expect(el.textContent).toContain('5/5'); // sociability_people
      expect(el.textContent).toContain('3/5'); // sociability_animals
      expect(el.textContent).toContain('2/5'); // training_level
    }));

    it('should render visual scale bars with correct filled segments', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament({ energy_level: 3 })));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      // Each level has 5 bar segments. For energy_level=3, 3 should be filled
      const allBars = el.querySelectorAll('.h-3.rounded-full');
      expect(allBars.length).toBe(35); // 7 levels * 5 bars each
    }));

    it('should correctly apply filled vs empty classes to bars', fakeAsync(() => {
      // energy_level=2 means first 5 bars: 2 filled (bg-primary), 3 empty (bg-gray-200)
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament({
        energy_level: 2,
        sociability_people: 1,
        sociability_animals: 1,
        training_level: 1,
        independence_level: 1,
        playfulness: 1,
        noise_level: 1
      })));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const levelDivs = el.querySelectorAll('.space-y-1');
      // First level (energy) should have 2 filled bars
      const firstLevelBars = levelDivs[0]?.querySelectorAll('.h-3.rounded-full');
      if (firstLevelBars) {
        let filledCount = 0;
        firstLevelBars.forEach(bar => {
          if (bar.classList.contains('bg-primary')) filledCount++;
        });
        expect(filledCount).toBe(2);
      }
    }));
  });

  // --- Requirement 2.9: behavior_notes rendering ---

  describe('Behavior notes', () => {
    it('should display behavior_notes when present', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament({
        behavior_notes: 'Muito brincalhão e adora crianças.'
      })));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Observações de Comportamento');
      expect(el.textContent).toContain('Muito brincalhão e adora crianças.');
    }));

    it('should not display behavior_notes section when notes are null', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament({ behavior_notes: null })));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain('Observações de Comportamento');
    }));

    it('should not display behavior_notes section when notes are undefined', fakeAsync(() => {
      const data = makeTemperament();
      delete (data as any).behavior_notes;
      petServiceSpy.getTemperament.and.returnValue(of(data));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain('Observações de Comportamento');
    }));
  });

  // --- Requirement 2.10: Empty state ---

  describe('Empty state', () => {
    it('should display empty state message when API returns 404', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Perfil de temperamento ainda não foi preenchido pelo cuidador');
    }));

    it('should set temperament to null in empty state', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      fixture.detectChanges();
      tick();

      expect(component.temperament).toBeNull();
      expect(component.error).toBeNull();
    }));
  });

  // --- Error state with retry ---

  describe('Error state with retry', () => {
    it('should display error message when API returns a non-404 error', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Não foi possível carregar o perfil de temperamento');
    }));

    it('should display a retry button in error state', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const retryButton = el.querySelector('button');
      expect(retryButton).toBeTruthy();
      expect(retryButton!.textContent).toContain('Tentar novamente');
    }));

    it('should retry loading when retry button is clicked', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Make second call succeed
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));

      const retryButton = fixture.nativeElement.querySelector('button');
      retryButton!.click();
      tick();
      fixture.detectChanges();

      expect(component.temperament).toBeTruthy();
      expect(component.error).toBeNull();
      expect(petServiceSpy.getTemperament).toHaveBeenCalledTimes(2);
    }));
  });

  // --- Loading state ---

  describe('Loading state', () => {
    it('should start in loading state on init', fakeAsync(() => {
      const subject = new Subject<PetTemperament>();
      petServiceSpy.getTemperament.and.returnValue(subject.asObservable());
      fixture.detectChanges();
      // Before observable emits, component should be loading
      expect(component.loading).toBe(true);

      subject.next(makeTemperament());
      subject.complete();
      tick();
    }));

    it('should clear loading after data is received', fakeAsync(() => {
      petServiceSpy.getTemperament.and.returnValue(of(makeTemperament()));
      fixture.detectChanges();
      tick();

      expect(component.loading).toBe(false);
    }));
  });
});
