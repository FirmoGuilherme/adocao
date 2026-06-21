import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpEventType, HttpErrorResponse } from '@angular/common/http';
import { PetMedia } from '../../../core/models/pet-details.models';
import { AuthService } from '../../../core/services/auth.service';

interface FileValidationError {
  message: string;
}

@Component({
  selector: 'app-media-upload',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="isCaretaker" class="space-y-4">
      <!-- Drop Zone -->
      <div
        class="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
        [ngClass]="{
          'border-primary bg-primary/5': isDragOver,
          'border-gray-300 hover:border-primary/50': !isDragOver
        }"
        (dragover)="onDragOver($event)"
        (dragleave)="onDragLeave($event)"
        (drop)="onDrop($event)"
        (click)="fileInput.click()"
      >
        <div *ngIf="!selectedFile" class="space-y-2">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          <p class="text-gray-600 font-medium">Arraste e solte um arquivo aqui</p>
          <p class="text-sm text-gray-400">ou clique para selecionar</p>
          <p class="text-xs text-gray-400 mt-2">
            Fotos: JPEG, PNG, WebP (máx. 10MB) • Vídeos: MP4, WebM (máx. 100MB)
          </p>
        </div>

        <!-- Preview -->
        <div *ngIf="selectedFile && !uploading" class="space-y-3">
          <div *ngIf="previewUrl && isImage" class="flex justify-center">
            <img [src]="previewUrl" alt="Prévia do arquivo" class="max-h-40 rounded-lg object-contain" />
          </div>
          <div *ngIf="selectedFile && !isImage" class="flex justify-center">
            <div class="bg-gray-100 p-4 rounded-lg flex items-center gap-3">
              <svg class="h-8 w-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                  d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <span class="text-sm text-gray-700 font-medium">{{ selectedFile.name }}</span>
            </div>
          </div>
          <p class="text-sm text-gray-500">{{ selectedFile.name }} ({{ formatFileSize(selectedFile.size) }})</p>
        </div>
      </div>

      <!-- Hidden File Input -->
      <input
        #fileInput
        type="file"
        class="hidden"
        [accept]="acceptedTypes"
        (change)="onFileSelected($event)"
      />

      <!-- Validation Error -->
      <div *ngIf="validationError" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
        {{ validationError }}
      </div>

      <!-- API Error -->
      <div *ngIf="apiError" class="bg-red-50 text-red-700 p-3 rounded-lg text-sm border border-red-100">
        {{ apiError }}
      </div>

      <!-- Progress Bar -->
      <div *ngIf="uploading" class="space-y-2">
        <div class="flex justify-between text-sm text-gray-600">
          <span>Enviando...</span>
          <span>{{ uploadProgress }}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div
            class="bg-primary h-2.5 rounded-full transition-all duration-300"
            [style.width.%]="uploadProgress"
          ></div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div *ngIf="selectedFile && !uploading" class="flex gap-3">
        <button
          (click)="upload()"
          [disabled]="!!validationError"
          class="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
        <button
          (click)="clearSelection()"
          class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
        >
          Cancelar
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class MediaUploadComponent {
  @Input() petId!: number;
  @Output() mediaUploaded = new EventEmitter<PetMedia>();

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  isImage = false;
  isDragOver = false;
  uploading = false;
  uploadProgress = 0;
  validationError: string | null = null;
  apiError: string | null = null;

  private readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm'];
  private readonly MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  private readonly MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB

  readonly acceptedTypes = 'image/jpeg,image/png,image/webp,video/mp4,video/webm';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  get isCaretaker(): boolean {
    const user = this.authService.currentUserValue;
    return !!user && user.role === 'shelter';
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragOver = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
      input.value = ''; // Reset for re-selecting same file
    }
  }

  private handleFile(file: File): void {
    this.clearSelection();
    this.selectedFile = file;
    this.isImage = this.ALLOWED_IMAGE_TYPES.includes(file.type);

    const error = this.validateFile(file);
    if (error) {
      this.validationError = error.message;
      return;
    }

    // Generate preview
    if (this.isImage) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  private validateFile(file: File): FileValidationError | null {
    const allAllowedTypes = [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_VIDEO_TYPES];

    if (!allAllowedTypes.includes(file.type)) {
      return { message: `Formato não suportado. Aceitos: JPEG, PNG, WebP, MP4, WebM.` };
    }

    const isImageFile = this.ALLOWED_IMAGE_TYPES.includes(file.type);
    if (isImageFile && file.size > this.MAX_IMAGE_SIZE) {
      return { message: `Imagem excede o limite de 10 MB.` };
    }

    const isVideoFile = this.ALLOWED_VIDEO_TYPES.includes(file.type);
    if (isVideoFile && file.size > this.MAX_VIDEO_SIZE) {
      return { message: `Vídeo excede o limite de 100 MB.` };
    }

    return null;
  }

  upload(): void {
    if (!this.selectedFile || this.validationError) {
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;
    this.apiError = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    const user = this.authService.currentUserValue;
    const headers: Record<string, string> = {};
    if (user) {
      headers['X-Shelter-Name'] = user.name;
    }

    this.http.post<PetMedia>(
      `http://localhost:8000/pets/${this.petId}/media`,
      formData,
      {
        headers,
        reportProgress: true,
        observe: 'events'
      }
    ).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress) {
          if (event.total) {
            this.uploadProgress = Math.round((100 * event.loaded) / event.total);
          }
        } else if (event.type === HttpEventType.Response) {
          this.uploading = false;
          this.uploadProgress = 100;
          const media = event.body as PetMedia;
          this.mediaUploaded.emit(media);
          this.clearSelection();
        }
      },
      error: (err: HttpErrorResponse) => {
        this.uploading = false;
        this.uploadProgress = 0;
        this.apiError = this.extractErrorMessage(err);
      }
    });
  }

  private extractErrorMessage(err: HttpErrorResponse): string {
    if (err.error && typeof err.error === 'object' && 'detail' in err.error) {
      return err.error.detail;
    }
    if (err.error && typeof err.error === 'string') {
      return err.error;
    }
    return 'Erro ao enviar o arquivo. Tente novamente.';
  }

  clearSelection(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.isImage = false;
    this.validationError = null;
    this.apiError = null;
    this.uploadProgress = 0;
  }

  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}
