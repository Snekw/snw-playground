#version 300 es
precision mediump int;
precision mediump float;

out vec4 fragColor;

void main(){
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
    fragColor = vec4(0.5,0.5,0.5,1.0) * alpha;
}
