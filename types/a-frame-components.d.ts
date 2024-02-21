// In your a-frame-components.d.ts
declare module 'a-frame-components' {
    // Export all of your package's public methods, elements, and other members like it:
    export async function load(): Promise<void>;
    // This is sketchy and, in most surface, a short story of what your model/symbols say.
}