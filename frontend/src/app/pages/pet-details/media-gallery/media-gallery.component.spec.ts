import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MediaGalleryComponent } from './media-gallery.component';
import { PetMedia } from '../../../core/models/pet-details.models';

const makePhoto = (id: number, url?: string): PetMedia => ({
  id,
  pet_id: 1,
  media_type: 'photo',
  file_name: `photo${id}.jpg`,
  url: url || `http://localhost:8000/static/uploads/pets/1/photo${id}.jpg`,
  uploaded_at: `2024-0${id}-01T00:00:00`
});

const makeVideo = (id: number): PetMedia => ({
  id,
  pet_id: 1,
  media_type: 'video',
  file_name: `video${id}.mp4`,
  url: `http://localhost:8000/static/uploads/pets/1/video${id}.mp4`,
  uploaded_at: `2024-0${id}-01T00:00:00`
});

describe('MediaGalleryComponent', () => {
  let fixture: ComponentFixture<MediaGalleryComponent>;
  let component: MediaGalleryComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MediaGalleryComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(MediaGalleryComponent);
    component = fixture.componentInstance;
  });

  // --- Requirement 4.4: Default image when no media ---

  describe('Default image (empty state)', () => {
    it('should display the default image when no media is provided', () => {
      component.media = [];
      component.defaultImageUrl = 'https://example.com/default.jpg';
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const img = el.querySelector('img');
      expect(img).toBeTruthy();
      expect(img!.getAttribute('src')).toBe('https://example.com/default.jpg');
      expect(img!.getAttribute('alt')).toContain('padrão');
    });

    it('should not display carousel when no photos exist', () => {
      component.media = [];
      component.defaultImageUrl = 'https://example.com/default.jpg';
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const navButtons = el.querySelectorAll('button[aria-label="Foto anterior"], button[aria-label="Próxima foto"]');
      expect(navButtons.length).toBe(0);
    });
  });

  // --- Requirement 4.2: Photo carousel with navigation ---

  describe('Photo carousel', () => {
    it('should display the first photo in the carousel', () => {
      component.media = [makePhoto(1), makePhoto(2), makePhoto(3)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const carouselImg = el.querySelector('img[class*="cursor-pointer"]');
      expect(carouselImg).toBeTruthy();
      expect(carouselImg!.getAttribute('src')).toContain('photo1.jpg');
    });

    it('should show navigation buttons when multiple photos exist', () => {
      component.media = [makePhoto(1), makePhoto(2)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const prevButton = el.querySelector('button[aria-label="Foto anterior"]');
      const nextButton = el.querySelector('button[aria-label="Próxima foto"]');
      expect(prevButton).toBeTruthy();
      expect(nextButton).toBeTruthy();
    });

    it('should not show navigation buttons when only one photo exists', () => {
      component.media = [makePhoto(1)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const prevButton = el.querySelector('button[aria-label="Foto anterior"]');
      const nextButton = el.querySelector('button[aria-label="Próxima foto"]');
      expect(prevButton).toBeNull();
      expect(nextButton).toBeNull();
    });

    it('should show photo indicators for multiple photos', () => {
      component.media = [makePhoto(1), makePhoto(2), makePhoto(3)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const indicators = el.querySelectorAll('button[aria-label^="Ir para foto"]');
      expect(indicators.length).toBe(3);
    });
  });

  // --- Carousel navigation ---

  describe('Carousel navigation', () => {
    beforeEach(() => {
      component.media = [makePhoto(1), makePhoto(2), makePhoto(3)];
      fixture.detectChanges();
    });

    it('should navigate to the next photo', () => {
      component.nextPhoto();
      fixture.detectChanges();

      expect(component.currentPhotoIndex).toBe(1);
      const el = fixture.nativeElement as HTMLElement;
      const img = el.querySelector('img[class*="cursor-pointer"]');
      expect(img!.getAttribute('src')).toContain('photo2.jpg');
    });

    it('should navigate to the previous photo', () => {
      component.currentPhotoIndex = 2;
      component.previousPhoto();
      fixture.detectChanges();

      expect(component.currentPhotoIndex).toBe(1);
    });

    it('should wrap to last photo when navigating previous from first', () => {
      component.currentPhotoIndex = 0;
      component.previousPhoto();

      expect(component.currentPhotoIndex).toBe(2);
    });

    it('should wrap to first photo when navigating next from last', () => {
      component.currentPhotoIndex = 2;
      component.nextPhoto();

      expect(component.currentPhotoIndex).toBe(0);
    });

    it('should navigate to specific photo via goToPhoto', () => {
      component.goToPhoto(2);
      fixture.detectChanges();

      expect(component.currentPhotoIndex).toBe(2);
      const el = fixture.nativeElement as HTMLElement;
      const img = el.querySelector('img[class*="cursor-pointer"]');
      expect(img!.getAttribute('src')).toContain('photo3.jpg');
    });
  });

  // --- Requirement 4.5: Modal for full-size photo ---

  describe('Modal', () => {
    beforeEach(() => {
      component.media = [makePhoto(1), makePhoto(2)];
      fixture.detectChanges();
    });

    it('should open modal when a photo is clicked', () => {
      component.openModal(component.photos[0]);
      fixture.detectChanges();

      expect(component.modalOpen).toBe(true);
      expect(component.selectedMedia).toBe(component.photos[0]);

      const el = fixture.nativeElement as HTMLElement;
      const modal = el.querySelector('[role="dialog"]');
      expect(modal).toBeTruthy();
    });

    it('should display the full-size image in the modal', () => {
      component.openModal(component.photos[0]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const modalImg = el.querySelector('[role="dialog"] img');
      expect(modalImg).toBeTruthy();
      expect(modalImg!.getAttribute('src')).toContain('photo1.jpg');
    });

    it('should close modal when close button is clicked', () => {
      component.openModal(component.photos[0]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const closeButton = el.querySelector('button[aria-label="Fechar visualização"]');
      expect(closeButton).toBeTruthy();

      closeButton!.dispatchEvent(new Event('click'));
      fixture.detectChanges();

      expect(component.modalOpen).toBe(false);
      expect(component.selectedMedia).toBeNull();
    });

    it('should close modal when clicking backdrop (outside image)', () => {
      component.openModal(component.photos[0]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const backdrop = el.querySelector('[role="dialog"]');
      backdrop!.dispatchEvent(new Event('click'));
      fixture.detectChanges();

      expect(component.modalOpen).toBe(false);
    });

    it('should close modal when Escape key is pressed', () => {
      component.openModal(component.photos[0]);
      fixture.detectChanges();

      // Simulate escape key
      const event = new KeyboardEvent('keydown', { key: 'Escape' });
      document.dispatchEvent(event);
      fixture.detectChanges();

      expect(component.modalOpen).toBe(false);
      expect(component.selectedMedia).toBeNull();
    });

    it('should not close modal when clicking on the image itself', () => {
      component.openModal(component.photos[0]);
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const modalImg = el.querySelector('[role="dialog"] img');
      modalImg!.dispatchEvent(new Event('click'));
      fixture.detectChanges();

      // Image click handler calls stopPropagation, so modal stays open
      expect(component.modalOpen).toBe(true);
    });
  });

  // --- Requirement 4.3: Video controls ---

  describe('Video controls', () => {
    it('should render video elements with controls attribute', () => {
      component.media = [makeVideo(1)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const video = el.querySelector('video');
      expect(video).toBeTruthy();
      expect(video!.hasAttribute('controls')).toBe(true);
    });

    it('should render video with preload=metadata (no autoplay)', () => {
      component.media = [makeVideo(1)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const video = el.querySelector('video');
      expect(video!.getAttribute('preload')).toBe('metadata');
      expect(video!.hasAttribute('autoplay')).toBe(false);
    });

    it('should display multiple videos in a grid', () => {
      component.media = [makeVideo(1), makeVideo(2)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const videos = el.querySelectorAll('video');
      expect(videos.length).toBe(2);
    });

    it('should display video section title', () => {
      component.media = [makeVideo(1)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      expect(el.textContent).toContain('Vídeos');
    });
  });

  // --- Mixed media (photos + videos) ---

  describe('Mixed media', () => {
    it('should display both carousel and video section when both types exist', () => {
      component.media = [makePhoto(1), makePhoto(2), makeVideo(3)];
      fixture.detectChanges();

      const el = fixture.nativeElement as HTMLElement;
      const carouselImg = el.querySelector('img[class*="cursor-pointer"]');
      const video = el.querySelector('video');
      expect(carouselImg).toBeTruthy();
      expect(video).toBeTruthy();
    });

    it('should correctly separate photos and videos', () => {
      component.media = [makePhoto(1), makeVideo(2), makePhoto(3)];
      fixture.detectChanges();

      expect(component.photos.length).toBe(2);
      expect(component.videos.length).toBe(1);
    });
  });
});
