import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { PetDetailsComponent } from './pet-details.component';
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
    petServiceSpy = jasmine.createSpyObj('PetService', ['getPet']);

    await TestBed.configureTestingModule({
      imports: [PetDetailsComponent],
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
});
