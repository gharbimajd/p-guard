import { Component, AfterViewInit } from '@angular/core';
import * as maplibregl from 'maplibre-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as turf from '@turf/turf';
import difference from '@turf/difference'; // Correct import
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

@Component({
  selector: 'app-map',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './map.html',
  styleUrls: ['./map.css'],
})
export class map implements AfterViewInit {
  map!: maplibregl.Map;
  draw!: MapboxDraw;
  selectedGeometry: GeoJSON.Feature | null = null;
  selecting = false;
  loading = false;

  constructor(private router: Router) {}

  ngAfterViewInit(): void {
    this.map = new maplibregl.Map({
      container: 'robot-map',
      style: 'https://api.maptiler.com/maps/satellite/style.json?key=dCEWVaUkTEDxxyHIQLqZ',
      center: [10.59109, 35.81739],
      zoom: 16,
    });

    this.map.on('load', () => {
      this.draw = new MapboxDraw({
        displayControlsDefault: false,
        controls: {
          polygon: true,
          trash: true,
        },
      });
    });
  }

  toggleSelection() {
    if (!this.selecting) {
      this.map.addControl(this.draw as unknown as maplibregl.IControl);
      this.draw.changeMode('draw_polygon');
      this.map.on('draw.create', this.onDrawCreate);
      this.map.on('draw.update', this.onDrawUpdate);
      this.map.on('draw.delete', this.onDrawDelete);
    } else {
      this.map.removeControl(this.draw as unknown as maplibregl.IControl);
      this.map.off('draw.create', this.onDrawCreate);
      this.map.off('draw.update', this.onDrawUpdate);
      this.map.off('draw.delete', this.onDrawDelete);
      this.selectedGeometry = null;
      this.removeMask();
    }
    this.selecting = !this.selecting;
  }

  onDrawCreate = (e: any) => {
    this.selectedGeometry = e.features[0];
    this.applyMask();
  };

  onDrawUpdate = (e: any) => {
    this.selectedGeometry = e.features[0];
    this.applyMask();
  };

  onDrawDelete = () => {
    this.selectedGeometry = null;
    this.removeMask();
  };

  applyMask() {
    this.removeMask();

    if (!this.selectedGeometry) return;

    const worldPolygon = turf.polygon([
      [
        [-180, -90],
        [-180, 90],
        [180, 90],
        [180, -90],
        [-180, -90],
      ],
    ]);

  const maskedArea = difference(turf.featureCollection([
  worldPolygon,
  this.selectedGeometry as GeoJSON.Feature<GeoJSON.Polygon>
]));

    if (!maskedArea) return;

    this.map.addSource('mask', {
      type: 'geojson',
      data: maskedArea,
    });

    this.map.addLayer({
      id: 'mask-layer',
      type: 'fill',
      source: 'mask',
      paint: {
        'fill-color': '#000',
        'fill-opacity': 0.7,
      },
    });

    this.map.addSource('polygon-outline', {
      type: 'geojson',
      data: this.selectedGeometry,
    });

    this.map.addLayer({
      id: 'outline-layer',
      type: 'line',
      source: 'polygon-outline',
      paint: {
        'line-color': 'transparent',
        'line-width': 2,
      },
    });

    const bounds = turf.bbox(this.selectedGeometry);
    this.map.fitBounds(
      [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]],
      ],
      { padding: 20 }
    );
  }

  removeMask() {
    if (this.map.getLayer('mask-layer')) {
      this.map.removeLayer('mask-layer');
    }
    if (this.map.getSource('mask')) {
      this.map.removeSource('mask');
    }
    if (this.map.getLayer('outline-layer')) {
      this.map.removeLayer('outline-layer');
    }
    if (this.map.getSource('polygon-outline')) {
      this.map.removeSource('polygon-outline');
    }
  }

  clearSelection() {
    this.draw.deleteAll();
    this.selectedGeometry = null;
    this.removeMask();
  }

  startTracking() {
    if (!this.selectedGeometry) {
      alert('Please draw a zone first.');
      return;
    }

    this.loading = true;

    setTimeout(() => {
      this.loading = false;
      this.router.navigate(['/roads'], {
        state: {
          geojson: this.selectedGeometry,
          snapshot: this.captureSnapshot(this.selectedGeometry!),
        },
      });
    }, 1000);
  }

  captureSnapshot(feature: GeoJSON.Feature): string {
    const canvas = this.map.getCanvas();
    const bounds = this.getFeatureBoundingBox(feature);
    const nw = this.map.project([bounds.nw[0], bounds.nw[1]]);
    const se = this.map.project([bounds.se[0], bounds.se[1]]);

    const width = se.x - nw.x;
    const height = se.y - nw.y;

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = width;
    tempCanvas.height = height;
    const ctx = tempCanvas.getContext('2d')!;
    ctx.drawImage(canvas, nw.x, nw.y, width, height, 0, 0, width, height);

    return tempCanvas.toDataURL();
  }

  getFeatureBoundingBox(feature: GeoJSON.Feature) {
    const coords = (feature.geometry as any).coordinates[0] as [number, number][];
    const lats = coords.map((c) => c[1]);
    const lngs = coords.map((c) => c[0]);

    return {
      nw: [Math.min(...lngs), Math.max(...lats)] as [number, number],
      se: [Math.max(...lngs), Math.min(...lats)] as [number, number],
    };
  }
}
