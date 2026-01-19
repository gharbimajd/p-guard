import { TestBed } from '@angular/core/testing';

import { RobotPositionService } from './robot-position';

describe('RobotPositionSerbice', () => {
  let service: RobotPositionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RobotPositionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
