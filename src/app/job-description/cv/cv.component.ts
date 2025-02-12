import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FileUploadService } from 'src/app/domain/services/file-upload.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-cv',
  templateUrl: './cv.component.html',
  styleUrls: ['./cv.component.scss']
})
export class CvComponent implements OnInit {
  files: any[] = [];
  jobDescriptionId: string | null = null;
  loading = false;
  errorMessage: string | null = null;
  selectedFile: any = null;
  isModalOpen: boolean = false;

  constructor(
    private fileUploadService: FileUploadService,
    private sanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getAllFiles();
    this.route.paramMap.subscribe(params => {
      this.jobDescriptionId = params.get('id');
      this.jobDescriptionId ? this.getFilesByJobId() : this.getAllFiles();
    });
  }

  getFilesByJobId(): void {
    if (!this.jobDescriptionId) return;
    this.loading = true;
    this.errorMessage = null;
    
    this.fileUploadService.getFiles(this.jobDescriptionId).subscribe({
      next: data => this.processFiles(data),
      error: err => this.handleError('Error fetching files', err)
    });
  }

  getAllFiles(): void {
    this.loading = true;
    this.errorMessage = null;
    
    this.fileUploadService.getAllFiles().subscribe({
      next: data => this.processFiles(data),
      error: err => this.handleError('Error fetching all CVs', err)
    });
  }

  processFiles(data: any[]): void {
    this.files = data.map(file => ({
      ...file,
      safeFilePath: this.sanitizeUrl(file.filePath),
      comment: file.comment || '',
      isCommentSubmitted: !!file.comment
    }));
    this.loading = false;
  }

  sanitizeUrl(url: string): SafeResourceUrl {
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  isPdf(filePath: string): boolean {
    return filePath.toLowerCase().endsWith('.pdf');
  }

  downloadCv(fileId: number, fileName: string): void {
    this.fileUploadService.downloadFile(fileId).subscribe({
      next: blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      },
      error: err => this.handleError('Error downloading file', err)
    });
  }

  openModal(file: any): void {
    this.selectedFile = { ...file };
    this.isModalOpen = true;
  }
  
  closeModal(): void {
    this.selectedFile = null;
    this.isModalOpen = false;
  }

  saveStatus(): void {
    if (!this.selectedFile) return;

    this.fileUploadService.updateStatus(this.selectedFile.id, this.selectedFile.comment).subscribe({
      next: () => {
        const file = this.files.find(f => f.id === this.selectedFile.id);
        if (file) {
          file.comment = this.selectedFile.comment;
          file.isCommentSubmitted = true;
        }
        this.closeModal();
      },
      error: err => this.handleError('Error updating status', err)
    });
  }

  handleError(message: string, err: any): void {
    console.error(message, err);
    this.errorMessage = `${message}. Please try again later.`;
    this.loading = false;
  }
}
