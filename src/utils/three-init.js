import * as THREE from 'three';

const generateScene = () => new THREE.Scene();

const generateCamera = props => new THREE.PerspectiveCamera(props);

const initCamera = camera => {
	camera.position.z = 5;
};

const generateRenderer = props => new THREE.WebGLRenderer(props);

const initRenderer = renderer => {
	// renderer.setClearColor('#fff');
	renderer.setSize(window.innerWidth, window.innerHeight);
	// ref.current.appendChild(renderer.domElement);
};

export const generateBox = (positionX = 0, positionY = 0, positionZ = 0) => {
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(positionX, positionY, positionZ);
	// mesh.rotation.set(1, 3, 1);
	// mesh.scale.set(10, 1, 1);
	return mesh;
};

const addLight = scene => {
	const pLight1 = new THREE.PointLight(0xffffff, 1, 100);
	pLight1.position.set(0, 100, 0);
	scene.add(pLight1);

	var aLight = new THREE.AmbientLight(0xffffff); // soft white light
	scene.add(aLight);
};

export const initThree = ({ cameraProps, rendererProps } = {}) => {
	const scene = generateScene();
	const camera = generateCamera(...cameraProps);
	const renderer = generateRenderer(rendererProps);

	initCamera(camera);
	initRenderer(renderer);
	addLight(scene);
	return { scene, camera, renderer };
};

export const generateHandleResize = (camera, renderer) => () => {
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.aspect = window.innerWidth / window.innerHeight;

	camera.updateProjectionMatrix();
};
