import { Component } from '@angular/core';
import { FormsModule, } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-your-route',
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports:[FormsModule,CommonModule],
})
export class Dashboard {

  // Items around the circle
  menuItems = [
    { label: 'About', action: 'about' },
    { label: 'GPS', action: 'gps' },
    { label: 'Camera', action: 'camera' },
    { label: 'Robot Info', action: 'robot-info' }
  ];

  // Example: handle clicks on circle items
  onMenuClick(action: string) {
    switch(action) {
      case 'about':
        console.log('About clicked');
        break;
      case 'gps':
        console.log('GPS clicked');
        break;
      case 'camera':
        console.log('Camera clicked');
        break;
      case 'robot-info':
        console.log('Robot Info clicked');
        break;
    }
  }
}
