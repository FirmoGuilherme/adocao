import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError, Subject } from 'rxjs';
import { HealthInfoComponent } from './health-info.component';
import { PetService } from '../../../core/services/pet.service';
import { PetHealthRecord } from '../../../core/models/pet-details.models';

const makeHealthRecord = (overrides: Partial<PetHealthRecord> = {}): PetHealthRecord => ({
  id: 1,
  pet_id: 1,
  vaccination_records: [
    { vaccine_name: 'Raiva', date_administered: '2024-01-15', expiry_date: '2025-01-15' },
    { vaccine_name: 'V10', date_administered: '2024-02-20', expiry_date: null }
  ],
  medical_conditions: [
    { condition_name: 'Alergia alimentar', diagnosed_date: '2023-06-01', notes: 'Evitar frango' }
  ],
  surgeries: [
    { surgery_name: 'Castração', surgery_date: '2023-03-10', description: 'Procedimento padrão' }
  ],
  special_needs: 'Precisa de ração hipoalergênica',
  last_vet_visit: '2024-06-01',
  weight_kg: 12.5,
  created_at: '2024-01-01T00:00:00',
  updated_at: '2024-06-01T00:00:00',
  ...overrides
});

describe('HealthInfoComponent', () => {
  let fixture: ComponentFixture<HealthInfoComponent>;
  let component: HealthInfoComponent;
  let petServiceSpy: jasmine.SpyObj<PetService>;

  beforeEach(async () => {
    petServiceSpy = jasmine.createSpyObj('PetService', ['getHealthRecord']);

    await TestBed.configureTestingModule({
      imports: [HealthInfoComponent],
      providers: [
        { provide: PetService, useValue: petServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(HealthInfoComponent);
    component = fixture.componentInstance;
    component.petId = 1;
  });

  // --- Requirement 1.13: Renderização de dados ---

  describe('Loaded state - data rendering', () => {
    it('should render vaccination history table', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Raiva');
      expect(el.textContent).toContain('V10');
      expect(el.textContent).toContain('Histórico de Vacinação');
    }));

    it('should render medical conditions', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Alergia alimentar');
      expect(el.textContent).toContain('Evitar frango');
      expect(el.textContent).toContain('Condições Médicas');
    }));

    it('should render surgeries', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Castração');
      expect(el.textContent).toContain('Procedimento padrão');
      expect(el.textContent).toContain('Cirurgias');
    }));

    it('should render special needs', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Necessidades Especiais');
      expect(el.textContent).toContain('Precisa de ração hipoalergênica');
    }));

    it('should render weight', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('12.5 kg');
    }));

    it('should render last vet visit date', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Última visita ao veterinário');
    }));

    it('should set state to loaded when data is received', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));
      fixture.detectChanges();
      tick();

      expect(component.state).toBe('loaded');
      expect(component.healthRecord).toBeTruthy();
    }));
  });

  // --- Requirement 1.14: Empty state ---

  describe('Empty state', () => {
    it('should display empty state message when API returns 404', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Informações de saúde ainda não foram preenchidas pelo cuidador');
      expect(component.state).toBe('empty');
    }));

    it('should not display error message in empty state', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(
        throwError(() => ({ status: 404 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain('Não foi possível carregar');
    }));
  });

  // --- Error state with retry ---

  describe('Error state with retry', () => {
    it('should display error message when API returns a non-404 error', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Não foi possível carregar as informações de saúde');
      expect(component.state).toBe('error');
    }));

    it('should display a retry button when in error state', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(
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

    it('should call loadHealthRecord again when retry button is clicked', fakeAsync(() => {
      petServiceSpy.getHealthRecord.and.returnValue(
        throwError(() => ({ status: 500 }))
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Now make the second call succeed
      petServiceSpy.getHealthRecord.and.returnValue(of(makeHealthRecord()));

      const retryButton = fixture.nativeElement.querySelector('button');
      retryButton!.click();
      tick();
      fixture.detectChanges();

      expect(component.state).toBe('loaded');
      expect(petServiceSpy.getHealthRecord).toHaveBeenCalledTimes(2);
    }));
  });

  // --- Loading state ---

  describe('Loading state', () => {
    it('should display loading skeleton while fetching data', fakeAsync(() => {
      const subject = new Subject<PetHealthRecord>();
      petServiceSpy.getHealthRecord.and.returnValue(subject.asObservable());
      fixture.detectChanges();

      // Before the observable emits, state should be loading
      expect(component.state).toBe('loading');
      const el = fixture.nativeElement as HTMLElement;
      const skeletons = el.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);

      // Emit data
      subject.next(makeHealthRecord());
      subject.complete();
      tick();
      fixture.detectChanges();

      expect(component.state).toBe('loaded');
    }));
  });
});
