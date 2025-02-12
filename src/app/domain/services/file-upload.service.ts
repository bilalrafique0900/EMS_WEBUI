import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/internal/Observable';
import { HttpHeaders } from '@angular/common/http';
import { FileStatus } from 'src/app/job-description/Enum';


@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  private apiUrl = 'http://localhost:58193/api/File';

  constructor(private http: HttpClient) { }



  uploadFiles(files: File[], jobDescriptionId: string): Observable<any> {
    debugger;
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append('Files', file, file.name);
    });
    formData.append('JobDescriptionId', jobDescriptionId);

    return this.http.post(`${this.apiUrl}/upload`, formData);
  }

  getAllFiles(): Observable<any> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

    return this.http.get(`${this.apiUrl}/all-files`, { headers });
  }

  getFiles(jobDescriptionId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/files?jobDescriptionId=${jobDescriptionId}`);
  }

  downloadFile(fileId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${fileId}`, { responseType: 'blob' });
  }
  updateStatus(fileId: number, status: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/update-status`, { FileId: fileId, Status: status });
  }  
}
