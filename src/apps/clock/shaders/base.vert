#version 300 es
#define POS_LOCATION 0

precision highp int;
precision highp float;

layout(location = POS_LOCATION) in vec2 a_pos;

uniform vec2 u_offset;
uniform vec2 u_rotation;
uniform vec2 u_resolution;


void main() {
    vec2 rotated = vec2(
        a_pos.x * u_rotation.y + a_pos.y * u_rotation.x,
        a_pos.y * u_rotation.y - a_pos.x * u_rotation.x
    );
    vec2 position = rotated + u_offset;
    // convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = position / u_resolution;

    // convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
