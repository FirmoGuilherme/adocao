import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { ApplyComponent } from './apply.component';
import { ApplicationService, ApplicationResponse } from '../../core/services/application.service';

describe('ApplyComponent', () => {
  let fixture: ComponentFixture<ApplyComponent>;
  let component: ApplyComponent;
  let applicationServiceSpy: jasmine.SpyObj<ApplicationService>;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockResponse: ApplicationResponse = {
    id: 1,
    user_id: 1,
    pet_id: 42,
    housing_type: 'House - Owned',
    motivation: 'I love animals.',
    status: 'New',
    compatibility_score: 85.0
  };

  beforeEach(async () => {
    applicationServiceSpy = jasmine.createSpyObj('ApplicationService', ['createApplication']);
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [ApplyComponent],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: { get: () => '42' } } }
        },
        { provide: Router, useValue: routerSpy },
        { provide: ApplicationService, useValue: applicationServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ApplyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  // Requirement 4.1 — form renders with housing_type and motivation fields
  it('should render the form with housing_type field on step 1', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('select[name="housing_type"]');
    expect(select).toBeTruthy();
  });

  it('should render the motivation textarea on step 2', () => {
    component.step = 2;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const textarea = compiled.querySelector('textarea[name="motivation"]');
    expect(textarea).toBeTruthy();
  });

  it('should have housing_type as required field', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const select = compiled.querySelector('select[name="housing_type"]');
    expect(select?.hasAttribute('required')).toBeTrue();
  });

  it('should have motivation as required field', () => {
    component.step = 2;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const textarea = compiled.querySelector('textarea[name="motivation"]');
    expect(textarea?.hasAttribute('required')).toBeTrue();
  });

  // Requirement 4.2 — submit calls ApplicationService with correct data
  it('should call createApplication with correct payload on submit', fakeAsync(() => {
    applicationServiceSpy.createApplication.and.returnValue(of(mockResponse));

    component.application.housing_type = 'House - Owned';
    component.application.motivation = 'I love animals.';
    component.petId = 42;

    component.submit();
    tick();

    expect(applicationServiceSpy.createApplication).toHaveBeenCalledOnceWith({
      user_id: 1,
      pet_id: 42,
      housing_type: 'House - Owned',
      motivation: 'I love animals.'
    });
  }));

  // Requirement 4.6 — show confirmation on success
  it('should display success message after successful submission', fakeAsync(() => {
    applicationServiceSpy.createApplication.and.returnValue(of(mockResponse));

    component.application.housing_type = 'Apartment - Owned';
    component.application.motivation = 'Looking for a companion.';
    component.petId = 42;

    component.submit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.successMessage).toBeTruthy();
    const successEl = compiled.querySelector('[class*="green"]');
    expect(successEl).toBeTruthy();
    expect(successEl?.textContent).toContain('successfully');
  }));

  // Requirement 4.7 — show error message on failure
  it('should display error message when submission fails', fakeAsync(() => {
    applicationServiceSpy.createApplication.and.returnValue(
      throwError(() => new Error('Network error'))
    );

    component.application.housing_type = 'House - Rented';
    component.application.motivation = 'I want to adopt.';
    component.petId = 42;

    component.submit();
    tick();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.errorMessage).toBeTruthy();
    const errorEl = compiled.querySelector('[class*="red"]');
    expect(errorEl).toBeTruthy();
    expect(errorEl?.textContent).toContain('Failed');
  }));

  it('should not call createApplication when required fields are missing', () => {
    component.application.housing_type = '';
    component.application.motivation = '';

    component.submit();

    expect(applicationServiceSpy.createApplication).not.toHaveBeenCalled();
    expect(component.errorMessage).toBeTruthy();
  });

  it('should read pet_id from route params on init', () => {
    expect(component.petId).toBe(42);
  });
});
