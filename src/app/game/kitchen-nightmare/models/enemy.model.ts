export interface Enemy {
    id: string;
    x: number;
    y: number;
    active: boolean;
    type: string; // filename of SVG
    hp?: number;
}
