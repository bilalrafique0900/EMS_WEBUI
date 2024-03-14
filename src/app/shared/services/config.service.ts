import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private config: any;

  constructor(private http: HttpClient) { }

  loadConfig(): Promise<void> {
    return this.http.get<any>('assets/config.json')
      .toPromise()
      .then((config) => this.config = config)
      .catch(() => console.error('Error loading configuration file.'));
  }

  get baseApiUrl(): string {
    return this.config?.baseApiUrl || '';
  }
  get projectTitle(): string {
    return this.config?.projectTitle || '';
  }


}
