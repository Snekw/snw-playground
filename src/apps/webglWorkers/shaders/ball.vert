#version 300 es
#define POS_LOCATION 0
#define VEL_LOCATION 1
#define SIZE_LOCATION 2

precision mediump int;
precision mediump float;

layout(location = POS_LOCATION) in vec2 a_pos;
layout(location = VEL_LOCATION) in vec2 a_vel;
layout(location = SIZE_LOCATION) in float a_size;

uniform float u_lineWidth;
uniform float u_width;
uniform float u_height;

float scale(float val, float max){
    return (val / max) * 2.0 - 1.0;
}

void main() {
    gl_Position = vec4(scale(a_pos.x, u_width),scale(a_pos.y, u_height),0.0,1.0);
    gl_PointSize = 10.0;
}
