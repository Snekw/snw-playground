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

// interface WebGlApp {
//     name: string,
//     outPath: string
// }
// /**
//  * JSON string of available apps.
//  *
//  * Webpack Defined
//  */
// declare const APPS: WebGlApp;
