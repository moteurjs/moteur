export const FRAGMENT_SHADER = `
precision mediump float;

varying vec2 v_uv;

uniform sampler2D u_texture;

void main() {
    gl_FragColor = texture2D(u_texture, v_uv);
}
`;

export const VERTEX_SHADER = `
attribute vec2 a_position;
attribute vec2 a_uv;

uniform vec2 u_position;
uniform float u_rotation;
uniform vec2 u_scale;
uniform float u_depth;

uniform vec2 u_cameraPosition;
uniform vec2 u_cameraScale;

uniform float u_aspectRatio;

uniform vec2 u_texturePosition;
uniform vec2 u_textureScale;

varying vec2 v_uv;

mat3 translationMatrix(vec2 position) {
    return mat3(
        1.0, 0.0, 0.0,
        0.0, 1.0, 0.0,
        position.x, position.y, 1.0
    );
}

mat3 rotationMatrix(float angle) {
    float c = cos(angle);
    float s = sin(angle);

    return mat3(
        c, -s, 0.0,
        s, c, 0.0,
        0.0, 0.0, 1.0
    );
}

mat3 scaleMatrix(vec2 scale) {
    return mat3(
        scale.x, 0.0, 0.0,
        0.0, scale.y, 0.0,
        0.0, 0.0, 1.0
    );
}

void main() {
    mat3 worldTransform = translationMatrix(u_position) * rotationMatrix(u_rotation) * scaleMatrix(u_scale);
    mat3 cameraTransform = translationMatrix(u_cameraPosition) * scaleMatrix(u_cameraScale);
    mat3 screenTransform = mat3(
        1.0, 0.0, 0.0,
        0.0, u_aspectRatio, 0.0,
        0.0, 0.0, 1.0
    );

    gl_Position = vec4(screenTransform * cameraTransform * worldTransform * vec3(a_position, 1.0), 1.0);
    gl_Position.z = -u_depth;

    v_uv = (translationMatrix(u_texturePosition) * scaleMatrix(u_textureScale) * vec3(a_uv, 1.0)).xy;
}
`;
