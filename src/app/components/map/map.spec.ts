import { ComponentFixture, TestBed } from '@angular/core/testing';
import { map } from './map';
import { Router } from '@angular/router';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('map Component (Jest)', () => {
  let component: map;
  let fixture: ComponentFixture<map>;
  let routerSpy: jest.Mocked<Router>;

  beforeEach(async () => {
    routerSpy = {
      navigate: jest.fn(),
    } as any;

    await TestBed.configureTestingModule({
      imports: [map],
      providers: [{ provide: Router, useValue: routerSpy }],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(map);
    component = fixture.componentInstance;

    // Mock map and draw
    component.map = {
      getCanvas: () => {
        const canvas = document.createElement('canvas');
        canvas.width = 100;
        canvas.height = 100;
        const ctx = canvas.getContext('2d')!;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, 100, 100);
        return canvas;
      },
      project: () => ({ x: 0, y: 0 }),
    } as any;

    component.draw = {
      deleteAll: jest.fn(),
    } as any;

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should alert if no geometry is drawn when startTracking is called', () => {
    window.alert = jest.fn(); // Mock alert
    component.selectedGeometry = null;
    component.startTracking();
    expect(window.alert).toHaveBeenCalledWith('Please draw a zone first.');
  });

  it('should set loading to true then false after tracking and navigate', (done) => {
    jest.spyOn(component as any, 'getFeatureBoundingBox').mockReturnValue({
      nw: [0, 0],
      se: [100, 100],
    });

    component.selectedGeometry = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
      properties: {},
    };

    component.startTracking();
    expect(component.loading).toBe(true);

    setTimeout(() => {
      expect(component.loading).toBe(false);
      expect(routerSpy.navigate).toHaveBeenCalled();
      done();
    }, 1100);
  });

  it('should clear selection when clearSelection is called', () => {
    component.selectedGeometry = {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
        coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
      },
      properties: {},
    };

    component.clearSelection();

    expect(component.selectedGeometry).toBeNull();
    expect(component.draw.deleteAll).toHaveBeenCalled();
  });
});
