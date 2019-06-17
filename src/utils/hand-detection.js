import { useState, useRef, useEffect } from 'react';
import * as handTrack from 'handtrackjs';

let model, videoEl, canvasEl;

const setModel = val => {
	model = val;
};

const setVideoEl = el => {
	videoEl = el;
};

const setCanvasEl = el => {
	canvasEl = el;
};

const modelParams = {
	flipHorizontal: true, // flip e.g for video
	imageScaleFactor: 0.7, // reduce input image size for gains in speed.
	maxNumBoxes: 20, // maximum number of boxes to detect
	iouThreshold: 0.5, // ioU threshold for non-max suppression
	scoreThreshold: 0.79 // confidence threshold for predictions.
};

const startVideo = async () => {
	if (!videoEl) throw new Error('Video element needs to be set.');

	const status = await handTrack.startVideo(videoEl);
	if (!status) throw new Error('Permission denied.');

	const videoConstraints = {
		audio: false,
		video: true
	};

	const stream = await navigator.mediaDevices.getUserMedia(videoConstraints);
	videoEl.srcObject = stream;
};

const loadModel = async () => {
	return await handTrack.load(modelParams);
};

const initHandDetection = async () => {
	try {
		await startVideo();
		const model = await loadModel();
		setModel(model);
	} catch (e) {
		handTrack.stopVideo(videoEl);
		console.error(e);
	}
};

export const runDetection = async () => {
	if (!model) throw new Error('Model needs to to be set.');
	if (!videoEl) throw new Error('video element needs to be set.');
	if (!canvasEl) throw new Error('Canvas element needs to be set.');

	const predictions = await model.detect(videoEl);
	console.log({ predictions });

	model.renderPredictions(
		predictions,
		canvasEl,
		canvasEl.getContext('2d'),
		videoEl
	);
};

export const useHandDetection = () => {
	const videoRef = useRef(null);
	const canvasRef = useRef(null);
	const [isReady, setIsReady] = useState(false);

	useEffect(() => {
		setVideoEl(videoRef.current);
		setCanvasEl(canvasRef.current);
		initHandDetection(videoRef.current)
			.then(() => setIsReady(true))
			.catch(err => console.error('Something went wrong at init.'));
	}, [videoEl]);

	return {
		videoRef,
		canvasRef,
		isReady
	};
};
