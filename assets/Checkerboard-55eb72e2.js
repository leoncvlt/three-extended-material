const r={name:"checkerboard",uniforms:{checkersSize:5},fragmentShader:(o,e)=>(o=`
        uniform float checkersSize;
        ${e==="MeshNormalMaterial"?o.replace("gl_FragColor = vec4( packNormalToRGB( normal ), opacity );",`
          vec2 pos = floor(gl_FragCoord.xy / checkersSize);
          float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
          gl_FragColor = vec4( packNormalToRGB( normal ) * pattern, opacity );
          `):o.replace("#include <opaque_fragment>",`
          vec2 pos = floor(gl_FragCoord.xy / checkersSize);
          float pattern = mod(pos.x + mod(pos.y, 2.0), 2.0);
          outgoingLight = outgoingLight * pattern;
          #include <opaque_fragment>
          `)}
      `,o)};export{r as C};
