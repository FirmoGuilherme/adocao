import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { ExploreComponent } from './explore.component';
import { PetService, Pet } from '../../core/services/pet.service';

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
  is_vaccinated: true,
  is_neutered: true,
  good_with_kids: false,
  good_with_dogs: false,
  good_with_cats: false,
  apartment_friendly: false,
  first_time_owner_friendly: false,
  ...overrides
});

describe('ExploreComponent', () => {
  let fixture: ComponentFixture<ExploreComponent>;
  let component: ExploreComponent;
  let petServiceSpy: jasmine.SpyObj<PetService>;

  beforeEach(async () => {
    petServiceSpy = jasmine.createSpyObj('PetService', ['getPets']);
    petServiceSpy.getPets.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [ExploreComponent],
      providers: [
        { provide: PetService, useValue: petServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExploreComponent);
    component = fixture.componentInstance;
  });

  // Requirement 2.11 — ngOnInit calls PetService
  it('should call PetService.getPets on init', fakeAsync(() => {
    fixture.detectChanges(); // triggers ngOnInit
    tick();

    expect(petServiceSpy.getPets).toHaveBeenCalledTimes(1);
  }));

  // Requirement 2.12 — filter change triggers new call with active filters
  it('should call PetService.getPets with species filter when species changes', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([]));
    fixture.detectChanges();
    tick();

    petServiceSpy.getPets.calls.reset();
    petServiceSpy.getPets.and.returnValue(of([]));

    component.filters.species = 'dog';
    component.loadPets();
    tick();

    expect(petServiceSpy.getPets).toHaveBeenCalledOnceWith({ species: 'dog' });
  }));

  it('should call PetService.getPets with apartment_friendly filter when toggled', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([]));
    fixture.detectChanges();
    tick();

    petServiceSpy.getPets.calls.reset();
    petServiceSpy.getPets.and.returnValue(of([]));

    component.filters.apartment_friendly = true;
    component.loadPets();
    tick();

    expect(petServiceSpy.getPets).toHaveBeenCalledOnceWith({ apartment_friendly: true });
  }));

  it('should call PetService.getPets with combined filters', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([]));
    fixture.detectChanges();
    tick();

    petServiceSpy.getPets.calls.reset();
    petServiceSpy.getPets.and.returnValue(of([]));

    component.filters.species = 'cat';
    component.filters.size = 'small';
    component.loadPets();
    tick();

    expect(petServiceSpy.getPets).toHaveBeenCalledOnceWith({ species: 'cat', size: 'small' });
  }));

  // Requirement 2.10 — renders N cards for a list with N pets
  it('should render one card per pet returned by the service', fakeAsync(() => {
    const pets = [makePet({ id: 1, name: 'Rex' }), makePet({ id: 2, name: 'Luna' }), makePet({ id: 3, name: 'Bolt' })];
    petServiceSpy.getPets.and.returnValue(of(pets));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('[routerLink]');
    expect(cards.length).toBe(3);
  }));

  it('should render zero cards when service returns empty list', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([]));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const cards = fixture.nativeElement.querySelectorAll('[routerLink]');
    expect(cards.length).toBe(0);
  }));

  // Requirement 2.13 — "no pets found" message for empty list
  it('should display "No pets found" message when list is empty', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([]));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('No pets found');
  }));

  it('should NOT display "No pets found" message when pets are present', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([makePet()]));

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).not.toContain('No pets found');
  }));

  // resetFilters resets state and reloads
  it('should reset filters and reload pets when resetFilters is called', fakeAsync(() => {
    petServiceSpy.getPets.and.returnValue(of([]));
    fixture.detectChanges();
    tick();

    component.filters.species = 'dog';
    petServiceSpy.getPets.calls.reset();
    petServiceSpy.getPets.and.returnValue(of([]));

    component.resetFilters();
    tick();

    expect(component.filters.species).toBe('');
    expect(petServiceSpy.getPets).toHaveBeenCalledTimes(1);
  }));
});
