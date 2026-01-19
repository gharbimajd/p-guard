import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiveFeed } from './live-feed';

describe('LiveFeed', () => {
  let component: LiveFeed;
  let fixture: ComponentFixture<LiveFeed>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LiveFeed]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LiveFeed);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
