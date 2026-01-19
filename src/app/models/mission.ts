import { Point } from './point';

export class Mission {
  mission: Point[] = [];

  addPoint(point: Point): void {
    const len = this.mission.length;

    if (len === 0) {
      point.position = 'start';
    } else if (len === 1) {
      this.mission[0].position = 'start';
      point.position = 'end';
    } else {
      this.mission[len - 1].position = 'intermediate';
      point.position = 'end';
    }

    this.mission.push(point);
  }

  clearLastPoint(): void {
    if (this.mission.length > 0) {
      this.mission.pop();
    }

    const len = this.mission.length;
    if (len === 1) {
      this.mission[0].position = 'start';
    } else if (len > 1) {
      this.mission[0].position = 'start';
      this.mission[len - 1].position = 'end';
      for (let i = 1; i < len - 1; i++) {
        this.mission[i].position = 'intermediate';
      }
    }
  }

  clearAll(): void {
    this.mission = [];
  }

  get length(): number {
    return this.mission.length;
  }

  getPointNumber(point: Point): number {
    return this.mission.indexOf(point);
  }
}
