import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { MediaUploadComponent } from './media-upload.component';
import { AuthService } from '../../../core/services/auth.service';
import { PetMedia } from '../../../core/models/pet-details.models';

describe('MediaUploadComponent', () => {
  let fixture: ComponentFixture<MediaUploadComponent>;
  let component: MediaUploadComponent;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let httpMock: HttpTestingController;

  const shelterUser = { id: 1, name: 'Shelter User', email: 'shelter@test.com', city: 'SP', state: 'SP', role: 'shelter' };
  const adopterUser = { id: 2, name: 'Adopter User', email: 'adopter@test.com', city: 'SP', state: 'SP', role: 'adopter' };

  beforeEach(async () => {
    authServiceSpy = jasmine.createSpyObj('AuthService', [], {
      currentUserValue: shelterUser
    });

    await TestBed.configureTestingModule({
      imports: [MediaUploadComponent, HttpClientTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaUploadComponent);
    component = fixture.componentInstance;
    component.petId = 1;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    httpMock.verify();
  });

  // --- Requirement 3.13: Drag-and-drop area ---

  describe('Drag-and-drop', () => {
    it('should display a drag-and-drop area for caretaker', () => {
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Arraste e solte um arquivo aqui');
      expect(el.textContent).toContain('ou clique para selecionar');
    });

    it('should highlight drop zone on dragover', () => {
      const el = fixture.nativeElement as HTMLElement;
      const dropZone = el.querySelector('.border-dashed') as HTMLElement;

      const event = new DragEvent('dragover', { bubbles: true, cancelable: true });
      dropZone.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.isDragOver).toBe(true);
    });

    it('should remove highlight on dragleave', () => {
      component.isDragOver = true;
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const dropZone = el.querySelector('.border-dashed') as HTMLElement;

      const event = new DragEvent('dragleave', { bubbles: true, cancelable: true });
      dropZone.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.isDragOver).toBe(false);
    });

    it('should handle file drop', () => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(file);

      const event = new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer });
      component.onDrop(event);
      fixture.detectChanges();

      expect(component.selectedFile).toBeTruthy();
      expect(component.selectedFile!.name).toBe('test.jpg');
      expect(component.isDragOver).toBe(false);
    });

    it('should not be visible for non-caretaker users', () => {
      // Override the currentUserValue to return adopter
      Object.defineProperty(authServiceSpy, 'currentUserValue', { get: () => adopterUser });
      fixture.detectChanges();

      expect(component.isCaretaker).toBe(false);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).not.toContain('Arraste e solte um arquivo aqui');
    });
  });

  // --- Requirement 3.14: Preview ---

  describe('Preview', () => {
    it('should display file name and size after selecting a file', fakeAsync(() => {
      const file = new File(['x'.repeat(1024)], 'my-photo.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('my-photo.jpg');
      expect(el.textContent).toContain('1.0 KB');
    }));

    it('should show video icon for video files', fakeAsync(() => {
      const file = new File(['x'.repeat(2048)], 'video.mp4', { type: 'video/mp4' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      expect(component.isImage).toBe(false);
      expect(component.selectedFile).toBeTruthy();
    }));

    it('should display send and cancel buttons after file selection', fakeAsync(() => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const buttons = el.querySelectorAll('button');
      const buttonTexts = Array.from(buttons).map(b => b.textContent?.trim());
      expect(buttonTexts).toContain('Enviar');
      expect(buttonTexts).toContain('Cancelar');
    }));

    it('should clear selection when cancel is clicked', fakeAsync(() => {
      const file = new File(['content'], 'test.png', { type: 'image/png' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      component.clearSelection();
      fixture.detectChanges();

      expect(component.selectedFile).toBeNull();
      expect(component.previewUrl).toBeNull();
    }));
  });

  // --- Progress bar ---

  describe('Progress bar', () => {
    it('should display progress bar during upload', fakeAsync(() => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      component.upload();
      fixture.detectChanges();

      expect(component.uploading).toBe(true);
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Enviando...');

      // Flush pending request to avoid httpMock.verify failure
      const req = httpMock.expectOne('http://localhost:8000/pets/1/media');
      req.flush({ id: 1, pet_id: 1, media_type: 'photo', file_name: 'test.jpg', url: 'http://test.com/img.jpg', uploaded_at: '2024-01-01T00:00:00' });
      tick();
    }));

    it('should show upload percentage', fakeAsync(() => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      component.uploading = true;
      component.uploadProgress = 45;
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('45%');
    }));
  });

  // --- API error handling ---

  describe('API error', () => {
    it('should display API error message on upload failure', fakeAsync(() => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      component.upload();

      const req = httpMock.expectOne('http://localhost:8000/pets/1/media');
      req.error(new ProgressEvent('error'), {
        status: 413,
        statusText: 'Payload Too Large'
      });
      tick();
      fixture.detectChanges();

      expect(component.uploading).toBe(false);
      expect(component.apiError).toBeTruthy();
    }));

    it('should extract detail message from API error response', fakeAsync(() => {
      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      component.upload();

      const req = httpMock.expectOne('http://localhost:8000/pets/1/media');
      req.flush({ detail: 'Maximum of 20 media files reached for this pet' }, { status: 409, statusText: 'Conflict' });
      tick();
      fixture.detectChanges();

      expect(component.apiError).toContain('Maximum of 20 media files reached');
    }));
  });

  // --- Client-side validation ---

  describe('Client-side validation', () => {
    it('should reject unsupported file types', fakeAsync(() => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      expect(component.validationError).toContain('Formato não suportado');
      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Formato não suportado');
    }));

    it('should reject images larger than 10MB', fakeAsync(() => {
      const largeContent = new ArrayBuffer(11 * 1024 * 1024);
      const file = new File([largeContent], 'big.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      expect(component.validationError).toContain('Imagem excede o limite de 10 MB');
    }));

    it('should reject videos larger than 100MB', fakeAsync(() => {
      const largeContent = new ArrayBuffer(101 * 1024 * 1024);
      const file = new File([largeContent], 'big.mp4', { type: 'video/mp4' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      expect(component.validationError).toContain('Vídeo excede o limite de 100 MB');
    }));

    it('should accept valid image types (JPEG, PNG, WebP)', fakeAsync(() => {
      const jpegFile = new File(['c'], 'img.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [jpegFile] } } as any);
      tick();
      expect(component.validationError).toBeNull();

      const pngFile = new File(['c'], 'img.png', { type: 'image/png' });
      component.onFileSelected({ target: { files: [pngFile] } } as any);
      tick();
      expect(component.validationError).toBeNull();

      const webpFile = new File(['c'], 'img.webp', { type: 'image/webp' });
      component.onFileSelected({ target: { files: [webpFile] } } as any);
      tick();
      expect(component.validationError).toBeNull();
    }));

    it('should accept valid video types (MP4, WebM)', fakeAsync(() => {
      const mp4File = new File(['c'], 'vid.mp4', { type: 'video/mp4' });
      component.onFileSelected({ target: { files: [mp4File] } } as any);
      tick();
      expect(component.validationError).toBeNull();

      const webmFile = new File(['c'], 'vid.webm', { type: 'video/webm' });
      component.onFileSelected({ target: { files: [webmFile] } } as any);
      tick();
      expect(component.validationError).toBeNull();
    }));

    it('should disable upload button when validation error exists', fakeAsync(() => {
      const file = new File(['content'], 'test.pdf', { type: 'application/pdf' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const uploadButton = el.querySelector('button[disabled]');
      expect(uploadButton).toBeTruthy();
    }));
  });

  // --- Successful upload ---

  describe('Successful upload', () => {
    it('should emit mediaUploaded event on successful upload', fakeAsync(() => {
      spyOn(component.mediaUploaded, 'emit');

      const file = new File(['content'], 'test.jpg', { type: 'image/jpeg' });
      component.onFileSelected({ target: { files: [file] } } as any);
      tick();
      fixture.detectChanges();

      component.upload();

      const req = httpMock.expectOne('http://localhost:8000/pets/1/media');
      const mockResponse: PetMedia = {
        id: 10,
        pet_id: 1,
        media_type: 'photo',
        file_name: 'test.jpg',
        url: 'http://localhost:8000/static/uploads/pets/1/abc.jpg',
        uploaded_at: '2024-01-01T00:00:00'
      };
      req.flush(mockResponse);
      tick();
      fixture.detectChanges();

      expect(component.mediaUploaded.emit).toHaveBeenCalledWith(mockResponse);
      expect(component.uploading).toBe(false);
      expect(component.selectedFile).toBeNull();
    }));
  });
});
