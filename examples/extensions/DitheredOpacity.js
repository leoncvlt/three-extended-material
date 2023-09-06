export const DitheredOpacity = {
  name: "dithered-opacity",
  defines: {
    ENABLE_DITHER_TRANSPARENCY: 1,
  },
  fragmentShader: (shader) => {
    shader = /*glsl*/ `
      float bayerDither2x2( vec2 v ) {
        return mod( 3.0 * v.y + 2.0 * v.x, 4.0 );
      }
      float bayerDither4x4( vec2 v ) {
        vec2 P1 = mod( v, 2.0 );
        vec2 P2 = mod( floor( 0.5  * v ), 2.0 );
        return 4.0 * bayerDither2x2( P1 ) + bayerDither2x2( P2 );
      }
      ${shader.replace(
        "void main() {",
        /*glsl*/ `
        void main() {
          #if ENABLE_DITHER_TRANSPARENCY
          if( ( bayerDither4x4( floor( mod( gl_FragCoord.xy, 4.0 ) ) ) ) / 16.0 >= opacity ) discard;
          #endif
        `
      )}
    `;
    return shader;
  },
};
