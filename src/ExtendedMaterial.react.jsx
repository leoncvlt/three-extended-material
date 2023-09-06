import { forwardRef, useEffect, useMemo, useRef } from "react";
import { ExtendedMaterial as ImplExtendedMaterial } from "./ExtendedMaterial";

const mapExtsNames = (array) => array.map(e => e.name || "unknown-extension").toString();

export const ExtendedMaterial = forwardRef((props, ref) => {
    const { superMaterial, extensions, parameters, options, ...rest } = props;
    const implMaterialRef = useRef();

    const material = useMemo(() => {
      const recreate = () => {
        implMaterialRef.current = new ImplExtendedMaterial(superMaterial, extensions, parameters, options);
        implMaterialRef.current.__extensions = mapExtsNames(extensions)
      };

      const t = new superMaterial();
      if (!implMaterialRef.current 
        || t.type !== implMaterialRef.current.type 
        || mapExtsNames(extensions) !== implMaterialRef.current.__extensions) {
        recreate();
      }
      t.dispose();
      return implMaterialRef.current;
    }, [superMaterial, extensions]);

    useEffect(() => material.dispose(), [material]);

    return <primitive attach="material" object={material} ref={ref} {...parameters} {...rest} />;
  }
);
