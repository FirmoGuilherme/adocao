import { Component, Input, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PetMedia } from '../../../core/models/pet-details.models';

@Component({
  selector: 'app-media-gallery',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Empty State: show default image -->
    <div *ngIf="!photos.length && !videos.length" class="flex justify-center">
      <img
        [src]="defaultImageUrl"
        alt="Imagem padrão do pet"
        class="w-full max-w-md rounded-xl object-cover"
      />
    </div>

    <!-- Gallery with content -->
    <div *ngIf="photos.length || videos.length" class="space-y-6">

      <!-- Photo Carousel -->
      <div *ngIf="photos.length" class="relative">
        <div class="overflow-hidden rounded-xl">
          <img
            [src]="getMediaUrl(photos[currentPhotoIndex])"
            [alt]="photos[currentPhotoIndex].file_name"
            class="w-full h-64 sm:h-80 md:h-96 object-cover cursor-pointer transition-opacity duration-300"
            (click)="openModal(photos[currentPhotoIndex])"
          />
        </div>

        <!-- Previous button -->
        <button
          *ngIf="photos.length > 1"
          (click)="previousPhoto()"
          aria-label="Foto anterior"
          class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition"
        >
          &#8249;
        </button>

        <!-- Next button -->
        <button
          *ngIf="photos.length > 1"
          (click)="nextPhoto()"
          aria-label="Próxima foto"
          class="absolute top-1/2 right-2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full w-10 h-10 flex items-center justify-center transition"
        >
          &#8250;
        </button>

        <!-- Photo indicators -->
        <div *ngIf="photos.length > 1" class="flex justify-center mt-3 gap-2">
          <button
            *ngFor="let photo of photos; let i = index"
            (click)="goToPhoto(i)"
            [attr.aria-label]="'Ir para foto ' + (i + 1)"
            class="w-2.5 h-2.5 rounded-full transition-colors"
            [ngClass]="i === currentPhotoIndex ? 'bg-primary' : 'bg-gray-300 hover:bg-gray-400'"
          ></button>
        </div>
      </div>

      <!-- Video Section -->
      <div *ngIf="videos.length" class="space-y-4">
        <h4 class="text-lg font-bold text-gray-900">Vídeos</h4>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div *ngFor="let video of videos" class="rounded-xl overflow-hidden bg-black">
            <video
              [src]="getMediaUrl(video)"
              controls
              preload="metadata"
              class="w-full h-48 sm:h-56 object-contain"
              [attr.aria-label]="'Vídeo: ' + video.file_name"
            >
              Seu navegador não suporta a reprodução de vídeos.
            </video>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div
      *ngIf="modalOpen && selectedMedia"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      role="dialog"
      aria-modal="true"
      aria-label="Visualização da foto em tamanho original"
      (click)="closeModal()"
    >
      <!-- Close button -->
      <button
        (click)="closeModal()"
        aria-label="Fechar visualização"
        class="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black/50 rounded-full w-10 h-10 flex items-center justify-center transition"
      >
        ✕
      </button>

      <!-- Modal image -->
      <img
        [src]="getMediaUrl(selectedMedia)"
        [alt]="selectedMedia.file_name"
        class="max-w-[90vw] max-h-[90vh] object-contain rounded-lg"
        (click)="$event.stopPropagation()"
      />
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MediaGalleryComponent {
  @Input() media: PetMedia[] = [];
  @Input() defaultImageUrl: string = '';

  currentPhotoIndex = 0;
  modalOpen = false;
  selectedMedia: PetMedia | null = null;

  get photos(): PetMedia[] {
    return this.media.filter(m => m.media_type === 'photo');
  }

  get videos(): PetMedia[] {
    return this.media.filter(m => m.media_type === 'video');
  }

  getMediaUrl(media: PetMedia): string {
    if (media.url.startsWith('http')) return media.url;
    return 'http://localhost:8000' + media.url;
  }

  previousPhoto(): void {
    if (this.photos.length === 0) return;
    this.currentPhotoIndex = this.currentPhotoIndex === 0
      ? this.photos.length - 1
      : this.currentPhotoIndex - 1;
  }

  nextPhoto(): void {
    if (this.photos.length === 0) return;
    this.currentPhotoIndex = this.currentPhotoIndex === this.photos.length - 1
      ? 0
      : this.currentPhotoIndex + 1;
  }

  goToPhoto(index: number): void {
    this.currentPhotoIndex = index;
  }

  openModal(media: PetMedia): void {
    this.selectedMedia = media;
    this.modalOpen = true;
  }

  closeModal(): void {
    this.modalOpen = false;
    this.selectedMedia = null;
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.modalOpen) {
      this.closeModal();
    }
  }
}
