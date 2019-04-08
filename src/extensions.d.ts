declare module "*.frag" {
    const content: any;
    export default content;
}

declare module "*.vert" {
    const content: any;
    export default content;
}
declare class WebpackWorker extends Worker {
    constructor();
}
declare module "worker-loader*" {
    class WebpackWorker extends Worker {
        constructor();
    }

    export default WebpackWorker;
}

// extend the HTMLCanvasElement declaration to work with webgl2
interface HTMLCanvasElement {
    getContext(contextId: "webgl2", contextAttributes?: WebGLContextAttributes): WebGL2RenderingContext | null
}

declare interface AppInfo {
    file: string,
    name: string,
    order: number,
    outPath: string,
    title: string
}

declare const APPS: AppInfo[]
declare const DEBUG: boolean
