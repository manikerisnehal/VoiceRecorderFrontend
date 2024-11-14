import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AudioService {
  private apiUrl = 'http://127.0.0.1:5000/upload'; // Replace with your Flask backend API URL
  constructor(private http: HttpClient) {}

  uploadAudio(audioData: string, fileName: string): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = {
      audio: audioData,
      fileName: fileName,
    };

    return this.http.post(this.apiUrl, body, { headers }); // This should be a POST request
  }

}
