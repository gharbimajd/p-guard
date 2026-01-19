import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-live-feed',
  standalone: true,
  templateUrl: './live-feed.html',
  styleUrls: ['./live-feed.css']
})
export class LiveFeed implements AfterViewInit {
  @ViewChild('robotCam') videoElement!: ElementRef<HTMLVideoElement>;

  ngAfterViewInit(): void {
    this.startCamera();
  }

  startCamera(): void {
    if (navigator.mediaDevices?.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then((stream) => {
          this.videoElement.nativeElement.srcObject = stream;
        })
        .catch((error) => {
          console.error('Error accessing webcam: ', error);
        });
    } else {
      alert('Your browser does not support webcam access.');
    }
  }
}
