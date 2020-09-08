export const particlesVertexShader = `
uniform float mytime;
void main() {
    gl_PointSize = 4.00;
    float y =  position.y;
    vec4 pos = modelMatrix * vec4(position.x , y, position.z,1.0);
    gl_Position =  projectionMatrix * viewMatrix * pos;
}
`;
export const particlesFragmentShader = `
uniform vec3 color;
void main()
{
    float r = 0.0, delta = 0.0, alpha = 1.0;
    vec2 cxy = 2.0 * gl_PointCoord - 1.0;
    r = dot(cxy, cxy);
    if (r > 1.0) {
        discard;
    }
    gl_FragColor = vec4(color, 1.0 ) * (alpha);
}
`;
