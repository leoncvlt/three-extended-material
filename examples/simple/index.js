import "../styles.css";
import {
  BoxGeometry,
  Clock,
  HemisphereLight,
  Mesh,
  MeshStandardMaterial,
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { ExtendedMaterial } from "../../src/ExtendedMaterial";
import { Checkerboard } from "../extensions";

const renderer = new WebGLRenderer({
  canvas: document.querySelector("canvas"),
  antialias: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true;

const scene = new Scene();
const camera = new PerspectiveCamera();
camera.position.z = 3;
const clock = new Clock();

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

const material = new ExtendedMaterial(
  MeshStandardMaterial,
  [Checkerboard],
  {
    color: 0x00aaff,
    checkersSize: 10.0,
  },
  { debug: true }
);
const box = new Mesh(new BoxGeometry(), material);
scene.add(box);

const light = new HemisphereLight(0xffffbb, 0x080820, 1.0);
scene.add(light);

const render = () => {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needResize = canvas.width !== width || canvas.height !== height;
  if (needResize) {
    renderer.setSize(width, height, false);
    camera.aspect = canvas.clientWidth / canvas.clientHeight;
    camera.updateProjectionMatrix();
  }

  const delta = clock.getDelta();
  const elapsed = clock.getElapsedTime();

  box.rotation.set(elapsed / 2, elapsed / 2, elapsed / 2);

  controls.update();

  renderer.render(scene, camera);
  requestAnimationFrame(render);
};

render();
