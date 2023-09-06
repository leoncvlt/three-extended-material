export const Checkerboard = {
  name: "checkerboard",
  uniforms: {
    checkersSize: 5,
  },
  fragmentShader: (shader, type) => {
    shader = `
        uniform float checkersSize;
        ${
          type === "MeshNormalMaterial"
            ? shader.replace(
                "gl_FragColor = vec4( packNormalToRGB( normal ), opacity );",
                /*glsl*/ `
          vec2 pos = floor(gl_FragCoord.xy / checkersSize);
          float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
          gl_FragColor = vec4( packNormalToRGB( normal ) * pattern, opacity );
          `)
            : shader.replace(
                "#include <opaque_fragment>",
                /*glsl*/ `
          vec2 pos = floor(gl_FragCoord.xy / checkersSize);
          float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
          outgoingLight = outgoingLight * pattern;
          #include <opaque_fragment>
          `)
        }
      `;
    return shader;
  },
};
