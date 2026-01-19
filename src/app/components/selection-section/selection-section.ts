import { Component, OnInit } from '@angular/core';
import * as L from 'leaflet';
import * as turf from '@turf/turf';
import type { Feature, LineString, Point } from 'geojson';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-obstacle-section',
  templateUrl: './selection-section.html',
  styleUrls: ['./selection-section.css'],
  imports: [CommonModule]
})
export class Selection implements OnInit {
  private map!: L.Map;
  private selectedArea!: GeoJSON.Polygon;
  private roadsData: any[] = [];
  private intersectionMarkers: L.CircleMarker[] = [];
  private missionMarkers: L.CircleMarker[] = [];
  private orientationMarkers: L.Marker[] = [];
  loading = false;
  missionPoints: { 
    lat: number, 
    lng: number, 
    type: 'start' | 'station' | 'end' | 'orientation', 
    roadId?: number,
    direction?: 'forward' | 'backward'
  }[] = [];
  currentMissionStage: 'idle' | 'selecting_start' | 'selecting_stations' | 'selecting_end' | 'selecting_orientation' = 'idle';
  missionInstructions: string[] = [];
  isCreatingMission = false;
  intersectionsMarked = false;

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const navigationState = window.history.state;
    if (navigationState.geojson) {
      this.selectedArea = navigationState.geojson.geometry;
      this.initMap();
    } else {
      console.error('No area selected');
    }
  }

  private initMap() {
    const bounds = turf.bbox(this.selectedArea);
    this.map = L.map('map').fitBounds([
      [bounds[1], bounds[0]],
      [bounds[3], bounds[2]]
    ]);

    L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: 'Tiles © Esri',
      maxZoom: 19
    }).addTo(this.map);

    const baseLayers = {
      "Satellite": L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19 }),
      "Streets": L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
    };

    L.control.layers(baseLayers).addTo(this.map);

    L.geoJSON(this.selectedArea, {
      style: { 
        color: 'transparent',
        weight: 2,
        fillOpacity: 0.2,
        fillColor: 'transparent'
      }
    }).addTo(this.map);

    this.highlightRoads();
  }

  private async highlightRoads() {
    this.loading = true;

    const polygonCoords = this.selectedArea.coordinates[0]
      .map(coord => `${coord[1]} ${coord[0]}`).join(' ');

    const query = `
      [out:json];
      (way["highway"](poly:"${polygonCoords}"););
      out geom;
    `;

    try {
      const response = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`);
      const data = await response.json();
      this.roadsData = data.elements;
      this.displayRoads(this.roadsData);
    } catch (error) {
      console.error("Failed to fetch roads:", error);
    } finally {
      this.loading = false;
    }
  }

  private displayRoads(roads: any[]) {
    roads.forEach(road => {
      if (!road.geometry) return;

      const roadLine = turf.lineString(road.geometry.map((node: any) => [node.lon, node.lat]));
      const lineCoords = roadLine.geometry.coordinates;
      const insideSegments: [number, number][][] = [];
      let segment: [number, number][] = [];

      for (let i = 0; i < lineCoords.length - 1; i++) {
        const start = lineCoords[i];
        const end = lineCoords[i + 1];
        const midPoint = turf.midpoint(turf.point(start), turf.point(end));
        const isInside = turf.booleanPointInPolygon(midPoint, this.selectedArea);

        if (isInside) {
          segment.push(start as [number, number]);
          segment.push(end as [number, number]);
        } else if (segment.length) {
          insideSegments.push([...segment]);
          segment = [];
        }
      }

      if (segment.length) insideSegments.push(segment);

      insideSegments.forEach(seg => {
        const clipped = turf.lineString(seg);
        const roadLayer = L.geoJSON(clipped, {
          style: { 
            color: '#FF0000',
            weight: 4,
            opacity: 1,
            lineCap: 'round',
            lineJoin: 'round'
          }
        });
        
        roadLayer.on('click', (e) => {
          this.onRoadClick(e, road);
        });
        
        roadLayer.on('mouseover', () => {
          this.map.getContainer().style.cursor = 'pointer';
        });
        
        roadLayer.on('mouseout', () => {
          this.map.getContainer().style.cursor = '';
        });
        
        roadLayer.addTo(this.map);
      });
    });
  }

  markIntersections() {
    const roadLines: Feature<LineString>[] = this.roadsData
      .filter(road => road.geometry)
      .map(road => turf.lineString(road.geometry.map((node: any) => [node.lon, node.lat])));

    const intersections: Feature<Point>[] = [];

    for (let i = 0; i < roadLines.length; i++) {
      for (let j = i + 1; j < roadLines.length; j++) {
        const intersect = turf.lineIntersect(roadLines[i], roadLines[j]);
        intersect.features.forEach(f => intersections.push(f as Feature<Point>));
      }
    }

    intersections.forEach(point => {
      const coords = point.geometry.coordinates;
      const marker = L.circleMarker([coords[1], coords[0]], {
        radius: 5,
        color: '#00FF00',
        fillColor: '#00FF00',
        fillOpacity: 1
      }).addTo(this.map);
      
      this.intersectionMarkers.push(marker);
    });

    this.intersectionsMarked = true;
    console.log(`Marked ${intersections.length} intersections`);
  }

  unmarkIntersections() {
    this.intersectionMarkers.forEach((marker: L.CircleMarker) => {
      this.map.removeLayer(marker);
    });
    
    this.intersectionMarkers = [];
    this.intersectionsMarked = false;
    console.log('Intersections unmarked');
  }

  private onRoadClick(event: L.LeafletMouseEvent, road: any) {
    const roadName = road.tags?.name || 'Unnamed Road';
    const roadType = road.tags?.highway || 'Unknown';
    
    L.popup()
      .setLatLng(event.latlng)
      .setContent(`
        <div style="min-width: 200px;">
          <h3 style="margin: 0 0 10px 0; color: #333;">Road Information</h3>
          <p style="margin: 5px 0;"><strong>Name:</strong> ${roadName}</p>
          <p style="margin: 5px 0;"><strong>Type:</strong> ${roadType}</p>
          <p style="margin: 5px 0;"><strong>ID:</strong> ${road.id}</p>
          <p style="margin: 5px 0;"><strong>Nodes:</strong> ${road.geometry.length}</p>
        </div>
      `)
      .openOn(this.map);
    
    event.target.setStyle({
      color: '#00FF00',
      weight: 6
    });
    
    setTimeout(() => {
      event.target.setStyle({
        color: '#FF0000',
        weight: 4
      });
    }, 2000);

    if (this.isCreatingMission && this.currentMissionStage !== 'idle') {
      this.addMissionPoint(event.latlng, road.id);
    }
  }

  startMissionCreation() {
    this.isCreatingMission = true;
    this.currentMissionStage = 'selecting_start';
    this.missionPoints = [];
    this.missionInstructions = [];
  }

  addStartPoint() {
    this.currentMissionStage = 'selecting_start';
  }

  addStationPoint() {
    this.currentMissionStage = 'selecting_stations';
  }

  addEndPoint() {
    this.currentMissionStage = 'selecting_end';
  }

  addOrientationPoint() {
    this.currentMissionStage = 'selecting_orientation';
  }

 
  private addMissionMarker(point: any) {
    const colors: { [key: string]: string } = {
      start: '#4CAF50',
      station: '#FF9800',
      end: '#F44336',
      orientation: '#2196F3'
    };

    const marker = L.circleMarker([point.lat, point.lng], {
      radius: point.type === 'orientation' ? 6 : 8,
      color: '#000',
      weight: 2,
      fillColor: colors[point.type],
      fillOpacity: 1
    }).addTo(this.map);

    if (point.type === 'orientation' && point.direction) {
      this.addDirectionArrow(point, point.direction);
    }

    let label = point.type.toUpperCase();
    if (point.type === 'orientation' && point.direction) {
      label += ` (${point.direction})`;
    }
    
    marker.bindTooltip(label, {
      permanent: true,
      direction: 'top',
      offset: [0, -10]
    });

    this.missionMarkers.push(marker);
  }

  private addDirectionArrow(point: any, direction: 'forward' | 'backward') {
    const arrowIcon = L.divIcon({
      className: 'direction-arrow',
      html: direction === 'forward' ? '➡️' : '⬅️',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    const arrowMarker = L.marker([point.lat, point.lng], {
      icon: arrowIcon,
      zIndexOffset: 1000
    }).addTo(this.map);

    this.orientationMarkers.push(arrowMarker);
  }

  setDirection(point: any, direction: 'forward' | 'backward') {
    const index = this.missionPoints.findIndex(p => 
      p.lat === point.lat && p.lng === point.lng
    );
    
    if (index !== -1) {
      this.missionPoints[index].direction = direction;
      this.orientationMarkers.forEach(marker => this.map.removeLayer(marker));
      this.orientationMarkers = [];
      
      this.missionPoints
        .filter(p => p.type === 'orientation' && p.direction)
        .forEach(p => this.addDirectionArrow(p, p.direction!));
    }
  }

  generateDirections() {
    if (this.missionPoints.length < 2) {
      return;
    }

    this.missionInstructions = [
      `Start at mission starting point`,
      ...this.missionPoints.filter(p => p.type === 'station')
        .map((station, index) => `Proceed to station ${index + 1}`),
      ...this.missionPoints.filter(p => p.type === 'orientation')
        .map((orientation, index) => `Follow ${orientation.direction} direction at orientation point ${index + 1}`),
      `Continue to mission end point`,
      `Mission complete!`
    ];
  }

  saveMission() {
    const mission = {
      points: this.missionPoints,
      instructions: this.missionInstructions,
      createdAt: new Date().toISOString()
    };
    
    console.log('Mission saved:', mission);
  }

  clearMission() {
    this.isCreatingMission = false;
    this.currentMissionStage = 'idle';
    this.missionPoints = [];
    this.missionInstructions = [];
    
    this.missionMarkers.forEach(marker => this.map.removeLayer(marker));
    this.missionMarkers = [];
    
    this.orientationMarkers.forEach(marker => this.map.removeLayer(marker));
    this.orientationMarkers = [];
  }

  removePoint(index: number) {
    const point = this.missionPoints[index];
    
    if (this.missionMarkers[index]) {
      this.map.removeLayer(this.missionMarkers[index]);
      this.missionMarkers.splice(index, 1);
    }
    
    if (point.type === 'orientation') {
      this.orientationMarkers.forEach(marker => this.map.removeLayer(marker));
      this.orientationMarkers = [];
      
      this.missionPoints
        .filter((p, i) => i !== index && p.type === 'orientation' && p.direction)
        .forEach(p => this.addDirectionArrow(p, p.direction!));
    }
    
    this.missionPoints.splice(index, 1);
  }

  hasStartPoint(): boolean {
    return this.missionPoints.some(p => p.type === 'start');
  }

  hasEndPoint(): boolean {
    return this.missionPoints.some(p => p.type === 'end');
  }

  hasValidMissionPoints(): boolean {
    return this.missionPoints.filter(p => p.type === 'start' || p.type === 'end').length >= 2;
  }

  getCurrentStageInstruction(): string {
    switch (this.currentMissionStage) {
      case 'selecting_start':
        return 'Click on a road to set the start point';
      case 'selecting_stations':
        return 'Click on a road to add a station';
      case 'selecting_end':
        return 'Click on a road to set the end point';
      case 'selecting_orientation':
        return 'Click on a road to add orientation direction';
      default:
        return 'Select an action to continue';
    }
  }
 // Add this method to get station numbers
getStationNumber(point: any): number {
  if (point.type !== 'station') return 0;
  
  const stations = this.missionPoints.filter(p => p.type === 'station');
  const index = stations.findIndex(p => 
    p.lat === point.lat && p.lng === point.lng
  );
  
  return index + 1;
}


private addMissionPoint(latlng: L.LatLng, roadId: number) {
  const pointType = this.currentMissionStage.replace('selecting_', '') as 'start' | 'station' | 'end' | 'orientation';
  
  const point = {
    lat: latlng.lat,
    lng: latlng.lng,
    type: pointType,
    roadId: roadId,
    direction: pointType === 'orientation' ? 'forward' as const : undefined
  };

  // Remove existing point of same type (except stations and orientation)
  if (point.type === 'start' || point.type === 'end') {
    // For start and end points, remove any existing ones
    this.missionPoints = this.missionPoints.filter(p => p.type !== point.type);
  }
  // For stations and orientation points, we always add new ones (don't remove existing)

  this.missionPoints.push(point);
  this.addMissionMarker(point);
  this.currentMissionStage = 'idle';
}
}