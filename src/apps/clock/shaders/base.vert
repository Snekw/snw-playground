#version 300 es
#define POS_LOCATION 0

precision highp int;
precision highp float;

layout(location = POS_LOCATION) in vec2 a_pos;

uniform vec2 OFFSET;
uniform vec2 ROTATION;

void main() {
    vec2 rotated = vec2(
        a_pos.x * ROTATION.y + a_pos.y * ROTATION.x,
        a_pos.y * ROTATION.y - a_pos.x * ROTATION.x
    );
    vec2 translated = rotated + OFFSET;
    gl_Position = vec4(translated, 0.0, 1.0);
}
