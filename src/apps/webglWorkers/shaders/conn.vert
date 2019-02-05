#version 300 es
#define CONN_LOCATION 0

precision mediump int;
precision mediump float;

layout(location = CONN_LOCATION) in vec2 a_conn;

uniform float u_lineWidth;
uniform float u_width;
uniform float u_height;

float scale(float val, float max){
    return (val / max) * 2.0 - 1.0;
}

void main() {
    gl_Position = vec4(scale(a_conn.x, u_width),scale(a_conn.y, u_height),0.0,1.0);
}
