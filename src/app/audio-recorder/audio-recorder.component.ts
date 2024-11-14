

import { Component } from '@angular/core';
import { Platform } from '@ionic/angular';
import { VoiceRecorder, RecordingData } from 'capacitor-voice-recorder';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { ChangeDetectorRef } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Http } from '@capacitor-community/http';

@Component({
  selector: 'app-audio-recorder',
  templateUrl: './audio-recorder.component.html',
  styleUrls: ['./audio-recorder.component.scss'],
})
export class AudioRecorderComponent {
  recordingPath: string | null = null;
  recordingStatus: string = '';
  audio = new Audio();

  constructor(private platform: Platform, private cd: ChangeDetectorRef, private _httpClient: HttpClient) {
    this.checkPermissions();
  }

  async checkPermissions() {
    try {
      if (Capacitor.isNativePlatform()) {
        const permissionStatus = await VoiceRecorder.requestAudioRecordingPermission();
        if ((permissionStatus as any).granted) {
          this.recordingStatus = 'Permission granted. Ready to record.';
        } else {
          this.recordingStatus = 'Permission denied. Please enable permissions in settings.';
        }
      } else {
        this.recordingStatus = 'Running on web, permission check skipped.';
      }
    } catch (error) {
      console.error('Permission check error:', error);
      this.recordingStatus = 'Permission check failed';
    }
  }

  async startRecording() {
    this.recordingStatus = 'Starting recording...';
    try {
      const hasPermission = await VoiceRecorder.hasAudioRecordingPermission();
      if (!hasPermission) {
        await this.checkPermissions();
        if (this.recordingStatus.includes('denied')) return;
      }
      await VoiceRecorder.startRecording();
      this.recordingStatus = 'Recording...';
    } catch (error) {
      console.error('Start recording error:', error);
      this.recordingStatus = 'Recording start failed';
    }
  }

  async stopRecording() {
    this.recordingStatus = 'Stopping recording...';
    try {
      const result = await VoiceRecorder.stopRecording() as RecordingData;
      if (result?.value?.recordDataBase64) {
        const fileName = `recording_${new Date().getTime()}.ogg`;
        const saveResult = await Filesystem.writeFile({
          path: fileName,
          data: result.value.recordDataBase64,
          directory: Directory.Data,
        });

        // Log the file path to verify it
        console.log('File saved at:', saveResult.uri);
        this.recordingPath = saveResult.uri;
        this.cd.detectChanges();

        this.recordingStatus = 'Recording saved';

        // Strip the file:// scheme before passing to Filesystem.readFile
        const filePath = saveResult.uri.replace('file://', '');

        // Attempt to read the file immediately to verify it exists
        try {
          const fileData = await Filesystem.readFile({
            path: fileName,  // Use the correct file path format here
            directory: Directory.Data,
          });

          console.log('File exists:', fileData);
        } catch (error:any) {
          console.error('Error reading file:', error);
          this.recordingStatus = 'Error reading file: ' + error.message;
          return;
        }
        //   /data/user/0/io.ionic.starter/files/recording_1731408836160.ogg
        // Proceed with upload after ensuring the file is saved and accessible
        setTimeout(async () => {
          //await this.uploadAudioToServer(filePath);
        await this.uploadAudioToServer(fileName);

        }, 500); // Delay by 500ms to ensure file is saved
      } else {
        this.recordingStatus = 'Recording failed';
      }
    } catch (error) {
      console.error('Stop recording error:', error);
      this.recordingStatus = 'Failed to stop recording';
    }
  }




  async uploadAudioToServer(filePath: string) {
    try {
      const convertedPath = Capacitor.convertFileSrc(filePath);
      console.log('Converted file path for reading:', convertedPath);

      const fileData = await Filesystem.readFile({
        path: filePath.replace('file://', ''), // Ensure correct path format
        directory: Directory.Data,
      });

      console.log('File data read:', fileData.data);

      if (typeof fileData.data === 'string') {
        const byteCharacters = atob(fileData.data);
        const byteArrays = [];
        for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
          const slice = byteCharacters.slice(offset, offset + 1024);
          const byteNumbers = new Array(slice.length);

          for (let i = 0; i < slice.length; i++) {
            byteNumbers[i] = slice.charCodeAt(i);
          }

          byteArrays.push(new Uint8Array(byteNumbers));
        }

        const blob = new Blob(byteArrays, { type: 'audio/ogg' });
        const formData = new FormData();
        formData.append('audio', blob, 'recording.ogg');
        const headers = new HttpHeaders();
        const apiUrl = "http://192.168.159.113:7258/api/fileupload/upload";

        this._httpClient.post(apiUrl,formData, {headers:headers, withCredentials: false},).subscribe(
          res => {
            if (res) {
              console.log('Audio uploaded successfully:', res);
            }
          },
          err => {
            console.error('Error uploading:', JSON.stringify(err));
          }
        );

        //  Http.post({
        //   url: apiUrl,
        //   headers: {
        //     "Content-Type": "multipart/form-data"  },
        //   data: formData,
        //   webFetchExtra: {credentials:"include"
        //   }
        // })

      } else {

        console.error('Expected base64 string, but got a Blob');
      }
    } catch (error) {
      console.error('Error uploading audio:', error);
    }
  }


  playRecording() {
    if (this.recordingPath) {
      this.audio.src = Capacitor.convertFileSrc(this.recordingPath);
      this.audio.play();
      this.recordingStatus = 'Playing recording...';

      this.audio.onended = () => {
        this.recordingStatus = 'Playback finished';
      };
    } else {
      this.recordingStatus = 'No recording available to play.';
    }
  }
}







