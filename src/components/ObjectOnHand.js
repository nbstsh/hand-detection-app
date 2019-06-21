import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';

import style from './ObjectOnHand.module.scss';
import { useHandDetectionWithPredictinos } from '../utils/hand-detection';
import {
	initThree,
	generateHandleResize,
	generateBox
} from '../utils/three-init';

const cameraProps = [75, window.innerWidth / window.innerHeight, 0.1, 1000];
const rendererProps = {
	antialias: true,
	alpha: true
};

const generateObject = (positionX = 0, positionY = 0, positionZ = 0) => {
	const geometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
	const material = new THREE.MeshLambertMaterial({ color: 0xffcc00 });
	const mesh = new THREE.Mesh(geometry, material);
	mesh.position.set(positionX, positionY, positionZ);
	// mesh.rotation.set(1, 3, 1);
	// mesh.scale.set(10, 1, 1);
	return mesh;
};

const obj = generateObject();

const ObjectOnHand = () => {
	const threeCanvasRef = useRef();
	const [scene, setScene] = useState(null);
	const { videoRef, predictions } = useHandDetectionWithPredictinos();

	useEffect(() => {
		rendererProps.canvas = threeCanvasRef.current;
		const { scene, camera, renderer } = initThree({
			cameraProps,
			rendererProps
		});
		setScene(scene);
		scene.add(obj);

		const render = () => {
			requestAnimationFrame(render);
			obj.rotation.x += 0.01;
			obj.rotation.y += 0.01;
			renderer.render(scene, camera);
		};
		render();

		const handleResize = generateHandleResize(camera, renderer);
		window.addEventListener('resize', handleResize);
		return () => window.removeEventListener('resize', handleResize);
	}, []);

	useEffect(() => {
		if (!predictions) return;
		console.log({ predictions });
	}, [predictions]);

	return (
		<div className={style.container}>
			<h1 className={style.title}>ObjectOnHand</h1>
			<video className={style.video} ref={videoRef} />
			<canvas
				ref={threeCanvasRef}
				id='three-canvas'
				className={style.threeCanvas}
			/>
		</div>
	);
};

export default ObjectOnHand;
