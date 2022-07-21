import { Component, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFireStorage, AngularFireUploadTask } from '@angular/fire/compat/storage';
import { FormControl, FormGroup, Validators} from '@angular/forms';
import { switchMap, combineLatest, forkJoin } from 'rxjs';
import { v4 as uuid } from 'uuid';
import firebase from 'firebase/compat/app';
import { ClipService } from 'src/app/services/clip.service';
import { Router } from '@angular/router';
import { FfmpegService } from 'src/app/services/ffmpeg.service';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnDestroy {
  isDragover: boolean = false;
  isFileUploaded: boolean = false;
  file: File | null = null;
  title: FormControl = new FormControl('', [Validators.required, Validators.minLength(3)]);

  uploadForm: FormGroup = new FormGroup({
    title: this.title
  })

  inSubmission: boolean = false;
  alertColor: string = 'blue';
  alertMsg: string = '';
  percentage: number = 0;

  user: firebase.User | null = null;
  task?: AngularFireUploadTask;
  screenshotTask?: AngularFireUploadTask;

  selectedScreenshot = '';
  screenshots: string[] = [];

  constructor(
    private storage: AngularFireStorage, 
    private auth: AngularFireAuth, 
    private clipService: ClipService,
    private router: Router,
    public ffmpegService: FfmpegService) {
    auth.user.subscribe(user => this.user = user);
    this.ffmpegService.init();
  }

  ngOnDestroy(): void {
    this.task?.cancel();
  }

  selectScreenshot(screenshot: string) {
    this.selectedScreenshot = screenshot;
  }

  async storeFile($event: Event) {
    if (this.ffmpegService.isRunning) {
      return;
    }

    this.isDragover = false;

    /**
     * We can only access files throught an event if we access them directly. If we log
     * the event itself, the dataTransfer property will be empty. This is a chrome bug.
     */
    this.file = ($event as DragEvent).dataTransfer? ($event as DragEvent).dataTransfer?.files.item(0) ?? null :
      ($event.target as HTMLInputElement).files?.item(0) ?? null;

    if (!this.file || this.file.type !== 'video/mp4') {
      return;
    }

    this.screenshots = await this.ffmpegService.getScreenshots(this.file);
    this.selectedScreenshot = this.screenshots[0];

    this.title.setValue(
      this.file?.name.replace(/\.[^/.]+$/, '')
    )
    this.isFileUploaded = true;
    
  }

  async uploadFile() {
    this.uploadForm.disable();

    const clipFileName = uuid();
    const clipPath = `clips/${clipFileName}.mp4`;
    this.inSubmission = true;

    const screenshotBlob = await this.ffmpegService.blobFromURL(this.selectedScreenshot);
    const screenshotPath = `screenshots/${clipFileName}.png`;

    this.task = this.storage.upload(clipPath, this.file);
    const clipRef = this.storage.ref(clipPath);

    this.screenshotTask = this.storage.upload(screenshotPath, screenshotBlob);
    const screenshotRef = this.storage.ref(screenshotPath);

    combineLatest([
      this.task.percentageChanges(),
      this.screenshotTask.percentageChanges()
    ]).subscribe(([progress, ssProgress]) => {
      if (!progress || !ssProgress) {
        return;
      }

      const total = progress + ssProgress;

      this.percentage = total as number /200;
    });

    forkJoin([
      this.task.snapshotChanges(),
      this.screenshotTask.snapshotChanges()
    ]).pipe(
      switchMap(() => forkJoin([clipRef.getDownloadURL(), screenshotRef.getDownloadURL()]))
    ).subscribe({
      next: async ([url, screenshotURL]) => {
        this.alertMsg = "Upload finished successfully.";
        this.alertColor = 'green';
        

        const clip = {
          uid: this.user?.uid as string,
          displayName: this.user?.displayName as string,
          title: this.title.value,
          fileName: `${clipFileName}.mp4`,
          url,
          timestamp: firebase.firestore.FieldValue.serverTimestamp(),
          screenshotURL,
          screenshotFileName: `${clipFileName}.png`
        }

        const clipDocRef = await this.clipService.createClip(clip);

        setTimeout(() => {
          this.inSubmission = false;
          this.router.navigate(['clip', clipDocRef.id])
        }, 1000);
        
      },
      error: (error) => {
        this.uploadForm.enable();

        this.alertMsg = "Upload failed.";
        this.alertColor = 'red';
        this.inSubmission = false;
      }
    });
    
  }

}
