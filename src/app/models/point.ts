export class Point {

 constructor(
    public x: number = 0,
    public y: number = 0,
    public speed: number = 1,
    public task: string = 'none',
    public position: 'start' | 'intermediate' | 'end' = 'intermediate'
  ) {}

  getCoordinates(): [number, number] {
    return [this.x, this.y];
  }
}
