export interface Prop {
    id: number;
    name: string;
    technologies: string;
}

export interface Technology {
    framework: [keyof string];
    stack: [keyof string];
}
