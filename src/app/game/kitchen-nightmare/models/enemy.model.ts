export interface Enemy {
    x: number;
    y: number;
    active: boolean;
    type: string; // filename of SVG
    hp?: number;
    row?: number;
}
