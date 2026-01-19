import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface LatLng {
  lat: number;
  lng: number;
}

@Injectable({ providedIn: 'root' })
export class RobotPositionService {
  public redPoints: LatLng[] = [];
  public greenPoints: LatLng[] = [];
  public robotPosition: LatLng | null = null;
  public center: LatLng = { lat: 36.8065, lng: 10.1815 };
  public radius: number = 300;
  public speed: number = 2;

  public simulation$ = new Subject<void>();

  constructor(private http: HttpClient) {}

  setSimulationConfig(center: LatLng, radius: number, speed: number) {
    this.center = center;
    this.radius = radius;
    this.speed = speed;

    this.fetchRoadsAndSetRedPoints();
  }

  startSimulation() {
    this.simulation$.next();
  }

  private fetchRoadsAndSetRedPoints() {
    const query = `
      [out:json];
      (
        way["highway"](around:${this.radius},${this.center.lat},${this.center.lng});
      );
      out geom;
    `;

    const url = 'https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(query);

    this.http.get<any>(url).subscribe(data => {
      const roads = data.elements;
      this.redPoints = [];

      roads.forEach((way: any) => {
        way.geometry.forEach((point: any) => {
          this.redPoints.push({ lat: point.lat, lng: point.lon });
        });
      });

      this.simulation$.next(); 
    });
  }
}
