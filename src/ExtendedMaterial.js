const defaultExtension = {
  name: "",
  uniforms: {},
  defines: {},
  vertexShader: (shader) => shader,
  fragmentShader: (shader) => shader,
};

export function ExtendedMaterial(
  SuperMaterial,
  extensions = [],
  properties = {},
  options = { debug: false, programCacheKey: null }
) {
  if (!new.target) {
    throw "Uncaught TypeError: Class constructor ExtendedMaterial cannot be invoked without 'new'";
  }

  class ExtendedMaterial extends SuperMaterial {
    constructor(props = {}) {
      super();

      if (!Array.isArray(extensions)) {
        extensions = [extensions];
      }

      // sanitize all extensions by adding empty fields if necessary
      extensions = extensions.map((extension) => ({
        ...defaultExtension,
        ...extension,
      }));

      this.uniforms = {};

      // hash the supermaterial name alongside with the extensions' ids
      // to generate a gl program cache key for this combination
      this._id = SuperMaterial.name + "_" + extensions.map((e) => e.name).join("_");
      this._cacheKey = 0;
      for (let i = 0; i < this._id.length; i++) {
        this._cacheKey = (Math.imul(31, this._cacheKey) + this._id.charCodeAt(i)) | 0;
      }

      // go through each extension's uniforms
      // and add getters and setters to the material
      extensions.forEach((extension) => {
        Object.entries(extension.uniforms).forEach(([uniform, value]) => {
          if (uniform in this.uniforms) {
            console.warn(
              `ExtendedMaterial: duplicated '${uniform}' uniform - shader compilation might fail.` +
                `To fix this, rename the ${uniform} uniform in the ${extension.name} extension.`
            );
          }
          this.uniforms[uniform] = { value: props[uniform] || value };
          if (uniform in this) {
            console.warn(
              `ExtendedMaterial: the material already contains a '${uniform}' property - ` +
                `getters and setters will not be set.` +
                `To fix this, rename the ${uniform} uniform in the ${extension.name} extension.`
            );
          } else {
            Object.defineProperty(this, uniform, {
              get() {
                return this.uniforms[uniform]?.value;
              },
              set(newValue) {
                if (this.uniforms) {
                  this.uniforms[uniform].value = newValue;
                }
              },
            });
          }
        });
      });

      // set the initial material properties passed to the method
      this.setValues(props);
    }

    onBeforeCompile(shader) {
      extensions.forEach((extension) => {
        Object.keys(extension.uniforms).forEach((uniform) => {
          shader.uniforms[uniform] = this.uniforms[uniform];
        });
        Object.entries(extension.defines).forEach(([define, value]) => {
          if (!shader.defines) {
            shader.defines = {};
          }
          shader.defines[define] = value;
        });

        shader.vertexShader = extension.vertexShader(shader.vertexShader);
        shader.fragmentShader = extension.fragmentShader(shader.fragmentShader);
      });

      if (options.debug) {
        console.debug(this._id, shader);
      }

      this.uniforms = shader.uniforms;
      this.needsUpdate = true;
    }

    customProgramCacheKey() {
      return options.programCacheKey || this._cacheKey || 0;
    }
  }

  return new ExtendedMaterial(properties);
}
