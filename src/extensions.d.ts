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

declare interface AppInfo {
    file: string,
    name: string,
    order: number,
    outPath: string,
    title: string
}

declare const APPS: AppInfo[]
declare const DEBUG: boolean
