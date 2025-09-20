import * as faceapi from 'face-api.js';

export class FaceRecognitionService {
  private modelsLoaded = false;
  private faceDescriptors: Map<string, Float32Array[]> = new Map();

  async loadModels() {
    if (this.modelsLoaded) return;
    
    try {
      // Load face-api.js models
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        faceapi.nets.faceExpressionNet.loadFromUri('/models')
      ]);
      
      this.modelsLoaded = true;
      console.log('Face recognition models loaded successfully');
    } catch (error) {
      console.error('Error loading face recognition models:', error);
      throw error;
    }
  }

  async detectFaces(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement) {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    try {
      const detections = await faceapi
        .detectAllFaces(imageElement, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors()
        .withFaceExpressions();

      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      throw error;
    }
  }

  async enrollFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, userId: string) {
    try {
      const detections = await this.detectFaces(imageElement);
      
      if (detections.length === 0) {
        throw new Error('No face detected in the image');
      }

      if (detections.length > 1) {
        throw new Error('Multiple faces detected. Please ensure only one face is visible.');
      }

      const faceDescriptor = detections[0].descriptor;
      
      // Store face descriptor for this user
      if (!this.faceDescriptors.has(userId)) {
        this.faceDescriptors.set(userId, []);
      }
      
      this.faceDescriptors.get(userId)!.push(faceDescriptor);
      
      return {
        success: true,
        descriptor: faceDescriptor,
        landmarks: detections[0].landmarks
      };
    } catch (error) {
      console.error('Error enrolling face:', error);
      throw error;
    }
  }

  async recognizeFace(imageElement: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement, threshold = 0.6) {
    try {
      const detections = await this.detectFaces(imageElement);
      
      if (detections.length === 0) {
        return { recognized: false, confidence: 0, userId: null };
      }

      const faceDescriptor = detections[0].descriptor;
      let bestMatch = { userId: null, distance: Infinity };

      // Compare with all enrolled faces
      for (const [userId, descriptors] of this.faceDescriptors) {
        for (const descriptor of descriptors) {
          const distance = faceapi.euclideanDistance(faceDescriptor, descriptor);
          if (distance < bestMatch.distance) {
            bestMatch = { userId, distance };
          }
        }
      }

      const confidence = 1 - bestMatch.distance;
      const recognized = confidence > threshold;

      return {
        recognized,
        confidence,
        userId: recognized ? bestMatch.userId : null,
        landmarks: detections[0].landmarks,
        expressions: detections[0].expressions
      };
    } catch (error) {
      console.error('Error recognizing face:', error);
      throw error;
    }
  }

  async drawFaceDetections(canvas: HTMLCanvasElement, detections: any[]) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    detections.forEach(detection => {
      const { x, y, width, height } = detection.detection.box;
      
      // Draw bounding box
      ctx.strokeStyle = '#00ff00';
      ctx.lineWidth = 2;
      ctx.strokeRect(x, y, width, height);
      
      // Draw landmarks
      ctx.fillStyle = '#ff0000';
      detection.landmarks.positions.forEach((point: any) => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
        ctx.fill();
      });
    });
  }

  getEnrolledUsers() {
    return Array.from(this.faceDescriptors.keys());
  }

  removeUserFace(userId: string) {
    this.faceDescriptors.delete(userId);
  }

  clearAllFaces() {
    this.faceDescriptors.clear();
  }
}

export const faceRecognitionService = new FaceRecognitionService();

