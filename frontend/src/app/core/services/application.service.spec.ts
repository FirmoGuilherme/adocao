import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationService, ApplicationCreate, ApplicationResponse } from './application.service';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApplicationService]
    });
    service = TestBed.inject(ApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('createApplication', () => {
    it('should POST to /applications and return the created application', () => {
      const payload: ApplicationCreate = {
        user_id: 1,
        pet_id: 42,
        housing_type: 'apartment',
        motivation: 'I love dogs and have experience caring for them.'
      };

      const mockResponse: ApplicationResponse = {
        ...payload,
        id: 10,
        status: 'New',
        compatibility_score: 85.0
      };

      service.createApplication(payload).subscribe(response => {
        expect(response).toEqual(mockResponse);
        expect(response.status).toBe('New');
        expect(response.id).toBe(10);
        expect(response.compatibility_score).toBe(85.0);
      });

      const req = httpMock.expectOne('http://localhost:8000/applications');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(payload);
      req.flush(mockResponse);
    });
  });

  describe('getUserApplications', () => {
    it('should GET /applications/user/{userId} and return a list of applications', () => {
      const userId = 1;
      const mockList: ApplicationResponse[] = [
        {
          id: 10,
          user_id: 1,
          pet_id: 42,
          housing_type: 'apartment',
          motivation: 'I love dogs.',
          status: 'New',
          compatibility_score: 85.0
        },
        {
          id: 11,
          user_id: 1,
          pet_id: 7,
          housing_type: 'house',
          motivation: 'Looking for a companion.',
          status: 'Screening',
          compatibility_score: 90.0
        }
      ];

      service.getUserApplications(userId).subscribe(applications => {
        expect(applications.length).toBe(2);
        expect(applications).toEqual(mockList);
        expect(applications[0].user_id).toBe(userId);
        expect(applications[1].user_id).toBe(userId);
      });

      const req = httpMock.expectOne(`http://localhost:8000/applications/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush(mockList);
    });

    it('should return an empty list when the user has no applications', () => {
      const userId = 99;

      service.getUserApplications(userId).subscribe(applications => {
        expect(applications).toEqual([]);
        expect(applications.length).toBe(0);
      });

      const req = httpMock.expectOne(`http://localhost:8000/applications/user/${userId}`);
      expect(req.request.method).toBe('GET');
      req.flush([]);
    });
  });
});
