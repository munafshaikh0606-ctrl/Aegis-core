import * as THREE from 'three';
import { EmotionState, ThemeMode, ThemeColors } from '../types';

export class RobotHeadController {
  private container: HTMLDivElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;

  // Groups
  private mainGroup: THREE.Group;
  private headGroup: THREE.Group;
  private jawGroup: THREE.Group;
  private leftEyeGroup: THREE.Group;
  private rightEyeGroup: THREE.Group;
  private leftBrowMesh: THREE.Mesh;
  private rightBrowMesh: THREE.Mesh;
  private leftEyeMesh: THREE.Mesh;
  private rightEyeMesh: THREE.Mesh;
  private mouthBars: THREE.Mesh[] = [];
  private hologramRings: THREE.Mesh[] = [];
  private particles: THREE.Points;

  // Lights
  private mainLight: THREE.PointLight;
  private fillLight: THREE.PointLight;
  private backLight: THREE.PointLight;

  // State
  private emotion: EmotionState = 'neutral';
  private targetEmotion: EmotionState = 'neutral';
  private primaryColor: THREE.Color = new THREE.Color(0x00f0ff);
  private accentColor: THREE.Color = new THREE.Color(0x7000ff);

  // Audio reactivity
  private audioLevel: number = 0; // 0 to 1

  // Mouse tracking
  private mousePos = { x: 0, y: 0 };
  private targetRotation = { x: 0, y: 0 };
  private enableMouseTracking: boolean = true;
  private wireframeMode: boolean = false;

  // Animation parameters
  private time: number = 0;
  private isDestroyed: boolean = false;
  private animFrameId: number | null = null;

  // Eye morph variables
  private eyeScaleTarget = { x: 1, y: 1, z: 1 };
  private eyeScaleCurrent = { x: 1, y: 1, z: 1 };
  private browAngleTarget = 0;
  private browAngleCurrent = 0;
  private browYTarget = 0.45;
  private browYCurrent = 0.45;
  private jawOpenTarget = 0;
  private jawOpenCurrent = 0;

  constructor(container: HTMLDivElement) {
    this.container = container;

    // 1. Scene
    this.scene = new THREE.Scene();
    this.scene.fog = new THREE.FogExp2(0x030712, 0.05);

    // 2. Camera
    const aspect = container.clientWidth / container.clientHeight || 1;
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.camera.position.set(0, 0, 7);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;

    container.appendChild(this.renderer.domElement);

    // 4. Groups
    this.mainGroup = new THREE.Group();
    this.headGroup = new THREE.Group();
    this.jawGroup = new THREE.Group();
    this.leftEyeGroup = new THREE.Group();
    this.rightEyeGroup = new THREE.Group();

    this.scene.add(this.mainGroup);
    this.mainGroup.add(this.headGroup);

    // Dummy meshes for TypeScript safety
    this.leftBrowMesh = new THREE.Mesh();
    this.rightBrowMesh = new THREE.Mesh();
    this.leftEyeMesh = new THREE.Mesh();
    this.rightEyeMesh = new THREE.Mesh();
    this.particles = new THREE.Points();

    // 5. Lights
    const ambientLight = new THREE.AmbientLight(0x111827, 2.5);
    this.scene.add(ambientLight);

    this.mainLight = new THREE.PointLight(0x00f0ff, 4, 20);
    this.mainLight.position.set(2, 3, 4);
    this.scene.add(this.mainLight);

    this.fillLight = new THREE.PointLight(0x7000ff, 3, 20);
    this.fillLight.position.set(-3, -2, 3);
    this.scene.add(this.fillLight);

    this.backLight = new THREE.PointLight(0x00ffcc, 5, 15);
    this.backLight.position.set(0, 2, -4);
    this.scene.add(this.backLight);

    // 6. Build Robot Model
    this.buildRobot();

    // 7. Event Listeners
    window.addEventListener('resize', this.onResize);
    window.addEventListener('mousemove', this.onMouseMove);

    // Start loop
    this.animate();
  }

  private buildRobot() {
    // Shared materials
    const metallicMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      metalness: 0.9,
      roughness: 0.2,
      wireframe: this.wireframeMode,
    });

    const plateMat = new THREE.MeshStandardMaterial({
      color: 0x1f2937,
      metalness: 0.8,
      roughness: 0.3,
      wireframe: this.wireframeMode,
    });

    const glowMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      wireframe: this.wireframeMode,
    });

    // --- A. CRANIUM / MAIN HELMET ---
    // Outer skull dome
    const skullGeo = new THREE.IcosahedronGeometry(1.3, 3);
    const skullMesh = new THREE.Mesh(skullGeo, metallicMat);
    skullMesh.scale.set(1, 1.15, 1.05);
    this.headGroup.add(skullMesh);

    // Face shield plate (beveled cheek/forehead structure)
    const facePlateGeo = new THREE.BoxGeometry(1.7, 1.5, 0.4);
    const facePlateMesh = new THREE.Mesh(facePlateGeo, plateMat);
    facePlateMesh.position.set(0, 0.1, 0.7);
    this.headGroup.add(facePlateMesh);

    // Forehead central core emblem
    const foreheadGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.1, 8);
    const foreheadMesh = new THREE.Mesh(foreheadGeo, glowMat);
    foreheadMesh.rotation.x = Math.PI / 2;
    foreheadMesh.position.set(0, 0.9, 0.9);
    this.headGroup.add(foreheadMesh);

    // --- B. VISOR & EXPRESSIVE EYES ---
    // Dark Visor glass inset
    const visorGeo = new THREE.BoxGeometry(1.5, 0.5, 0.2);
    const visorMat = new THREE.MeshPhysicalMaterial({
      color: 0x030712,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.6,
      transparent: true,
      opacity: 0.85,
    });
    const visorMesh = new THREE.Mesh(visorGeo, visorMat);
    visorMesh.position.set(0, 0.35, 0.85);
    this.headGroup.add(visorMesh);

    // Eye setup
    const eyeGeo = new THREE.BoxGeometry(0.32, 0.22, 0.1);
    const eyePupilGeo = new THREE.SphereGeometry(0.08, 16, 16);

    // Left Eye
    this.leftEyeMesh = new THREE.Mesh(eyeGeo, glowMat);
    const leftPupil = new THREE.Mesh(eyePupilGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    leftPupil.position.z = 0.06;
    this.leftEyeGroup.add(this.leftEyeMesh);
    this.leftEyeGroup.add(leftPupil);
    this.leftEyeGroup.position.set(-0.42, 0.35, 0.92);
    this.headGroup.add(this.leftEyeGroup);

    // Right Eye
    this.rightEyeMesh = new THREE.Mesh(eyeGeo, glowMat);
    const rightPupil = new THREE.Mesh(eyePupilGeo, new THREE.MeshBasicMaterial({ color: 0xffffff }));
    rightPupil.position.z = 0.06;
    this.rightEyeGroup.add(this.rightEyeMesh);
    this.rightEyeGroup.add(rightPupil);
    this.rightEyeGroup.position.set(0.42, 0.35, 0.92);
    this.headGroup.add(this.rightEyeGroup);

    // Expressive Eyebrows
    const browGeo = new THREE.BoxGeometry(0.38, 0.05, 0.08);
    const browMat = new THREE.MeshBasicMaterial({ color: this.primaryColor });

    this.leftBrowMesh = new THREE.Mesh(browGeo, browMat);
    this.leftBrowMesh.position.set(-0.42, 0.52, 0.95);
    this.headGroup.add(this.leftBrowMesh);

    this.rightBrowMesh = new THREE.Mesh(browGeo, browMat);
    this.rightBrowMesh.position.set(0.42, 0.52, 0.95);
    this.headGroup.add(this.rightBrowMesh);

    // --- C. ARTICULATED JAW & MOUTH SPECTRUM ---
    const jawGeo = new THREE.BoxGeometry(1.4, 0.6, 0.9);
    const jawMesh = new THREE.Mesh(jawGeo, plateMat);
    jawMesh.position.set(0, -0.3, 0.3);
    this.jawGroup.add(jawMesh);

    // Mouth Grille Base
    const mouthBaseGeo = new THREE.BoxGeometry(1.0, 0.25, 0.1);
    const mouthBaseMesh = new THREE.Mesh(mouthBaseGeo, new THREE.MeshBasicMaterial({ color: 0x000000 }));
    mouthBaseMesh.position.set(0, -0.2, 0.72);
    this.jawGroup.add(mouthBaseMesh);

    // Equalizer Mouth Bars (8 vertical lines)
    const barCount = 8;
    this.mouthBars = [];
    for (let i = 0; i < barCount; i++) {
      const barGeo = new THREE.BoxGeometry(0.08, 0.18, 0.05);
      const barMesh = new THREE.Mesh(barGeo, glowMat);
      const posX = -0.38 + i * 0.11;
      barMesh.position.set(posX, -0.2, 0.75);
      this.jawGroup.add(barMesh);
      this.mouthBars.push(barMesh);
    }

    this.jawGroup.position.set(0, -0.3, 0.2);
    this.headGroup.add(this.jawGroup);

    // --- D. TEMPLE EARS & COOLING TURBINES ---
    const earGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.2, 12);
    earGeo.rotateZ(Math.PI / 2);

    const leftEar = new THREE.Mesh(earGeo, plateMat);
    leftEar.position.set(-1.05, 0.2, 0.1);
    this.headGroup.add(leftEar);

    const rightEar = new THREE.Mesh(earGeo, plateMat);
    rightEar.position.set(1.05, 0.2, 0.1);
    this.headGroup.add(rightEar);

    // --- E. HOLOGRAPHIC ENERGY RINGS ---
    const ringGeo1 = new THREE.TorusGeometry(2.1, 0.02, 16, 100);
    const ringGeo2 = new THREE.TorusGeometry(2.5, 0.015, 16, 100);
    const ringGeo3 = new THREE.TorusGeometry(2.9, 0.01, 16, 100);

    const ringMat = new THREE.MeshBasicMaterial({
      color: this.primaryColor,
      transparent: true,
      opacity: 0.6,
      wireframe: true,
    });

    const ring1 = new THREE.Mesh(ringGeo1, ringMat);
    ring1.rotation.x = Math.PI / 3;
    this.mainGroup.add(ring1);
    this.hologramRings.push(ring1);

    const ring2 = new THREE.Mesh(ringGeo2, ringMat);
    ring2.rotation.y = Math.PI / 4;
    this.mainGroup.add(ring2);
    this.hologramRings.push(ring2);

    const ring3 = new THREE.Mesh(ringGeo3, ringMat);
    ring3.rotation.z = Math.PI / 6;
    this.mainGroup.add(ring3);
    this.hologramRings.push(ring3);

    // --- F. FLOATING PARTICLE FIELD ---
    const particleCount = 200;
    const particleGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 10;
      positions[i + 1] = (Math.random() - 0.5) * 10;
      positions[i + 2] = (Math.random() - 0.5) * 10;
    }

    particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particleMat = new THREE.PointsMaterial({
      color: this.primaryColor,
      size: 0.04,
      transparent: true,
      opacity: 0.7,
    });

    this.particles = new THREE.Points(particleGeo, particleMat);
    this.scene.add(this.particles);

    // --- G. NECK BASE ---
    const neckGeo = new THREE.CylinderGeometry(0.5, 0.7, 0.8, 12);
    const neckMesh = new THREE.Mesh(neckGeo, metallicMat);
    neckMesh.position.set(0, -1.2, 0);
    this.mainGroup.add(neckMesh);
  }

  // --- PUBLIC API METHODS ---

  public setEmotion(emotion: EmotionState) {
    this.emotion = emotion;
    this.targetEmotion = emotion;

    switch (emotion) {
      case 'happy':
        this.eyeScaleTarget = { x: 1.1, y: 0.6, z: 1 };
        this.browAngleTarget = -0.2; // upward tilt
        this.browYTarget = 0.55;
        this.jawOpenTarget = 0.15;
        break;

      case 'alert':
        this.eyeScaleTarget = { x: 1.2, y: 0.4, z: 1 };
        this.browAngleTarget = 0.35; // fierce downward angle
        this.browYTarget = 0.44;
        this.jawOpenTarget = 0.05;
        break;

      case 'thinking':
        this.eyeScaleTarget = { x: 0.8, y: 1.1, z: 1 };
        this.browAngleTarget = -0.15;
        this.browYTarget = 0.50;
        this.jawOpenTarget = 0.08;
        break;

      case 'focused':
        this.eyeScaleTarget = { x: 1.3, y: 0.2, z: 1 };
        this.browAngleTarget = 0.25;
        this.browYTarget = 0.46;
        this.jawOpenTarget = 0;
        break;

      case 'speaking':
        this.eyeScaleTarget = { x: 1.0, y: 1.0, z: 1 };
        this.browAngleTarget = 0;
        this.browYTarget = 0.50;
        this.jawOpenTarget = 0.3; // Driven dynamically by audio level too
        break;

      case 'surprised':
        this.eyeScaleTarget = { x: 1.4, y: 1.4, z: 1 };
        this.browAngleTarget = -0.3;
        this.browYTarget = 0.62;
        this.jawOpenTarget = 0.35;
        break;

      case 'confused':
        this.eyeScaleTarget = { x: 0.7, y: 1.2, z: 1 };
        this.browAngleTarget = 0.3;
        this.browYTarget = 0.48;
        this.jawOpenTarget = 0.1;
        break;

      case 'listening':
        this.eyeScaleTarget = { x: 1.15, y: 1.15, z: 1 };
        this.browAngleTarget = -0.1;
        this.browYTarget = 0.52;
        this.jawOpenTarget = 0.05;
        break;

      case 'glitch':
        this.eyeScaleTarget = { x: 0.5, y: 1.5, z: 1 };
        this.browAngleTarget = 0.5;
        this.browYTarget = 0.42;
        this.jawOpenTarget = 0.25;
        break;

      case 'neutral':
      default:
        this.eyeScaleTarget = { x: 1.0, y: 1.0, z: 1 };
        this.browAngleTarget = 0;
        this.browYTarget = 0.50;
        this.jawOpenTarget = 0;
        break;
    }
  }

  public setTheme(colors: ThemeColors) {
    this.primaryColor.set(colors.primary);
    this.accentColor.set(colors.accent);

    this.mainLight.color.set(this.primaryColor);
    this.fillLight.color.set(this.accentColor);

    // Update glowing materials
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshBasicMaterial) {
        if (child.material.color) {
          child.material.color.set(this.primaryColor);
        }
      }
    });

    if (this.particles.material instanceof THREE.PointsMaterial) {
      this.particles.material.color.set(this.primaryColor);
    }
  }

  public setAudioLevel(level: number) {
    this.audioLevel = Math.max(0, Math.min(1, level));
  }

  public setWireframe(wireframe: boolean) {
    this.wireframeMode = wireframe;
    this.scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material) {
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => (m.wireframe = wireframe));
        } else {
          child.material.wireframe = wireframe;
        }
      }
    });
  }

  public setMouseTracking(enabled: boolean) {
    this.enableMouseTracking = enabled;
  }

  public triggerDiagnosticScan() {
    this.setEmotion('focused');
    let scanStep = 0;
    const interval = setInterval(() => {
      scanStep++;
      this.audioLevel = (scanStep % 2 === 0 ? 0.8 : 0.2);
      if (scanStep >= 8) {
        clearInterval(interval);
        this.audioLevel = 0;
        this.setEmotion('happy');
      }
    }, 200);
  }

  // --- PRIVATE EVENT HANDLERS & ANIMATION ---

  private onMouseMove = (e: MouseEvent) => {
    if (!this.enableMouseTracking) return;
    const x = (e.clientX / window.innerWidth) * 2 - 1;
    const y = -(e.clientY / window.innerHeight) * 2 + 1;
    this.targetRotation.x = y * 0.4; // Pitch
    this.targetRotation.y = x * 0.6; // Yaw
  };

  private onResize = () => {
    if (!this.container || this.isDestroyed) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private animate = () => {
    if (this.isDestroyed) return;
    this.animFrameId = requestAnimationFrame(this.animate);

    this.time += 0.016;

    // 1. Lerp Head Rotations (Mouse tracking & Idle Sway)
    const idleSwayX = Math.sin(this.time * 1.5) * 0.05;
    const idleSwayY = Math.cos(this.time * 1.2) * 0.08;

    this.headGroup.rotation.x += (this.targetRotation.x + idleSwayX - this.headGroup.rotation.x) * 0.08;
    this.headGroup.rotation.y += (this.targetRotation.y + idleSwayY - this.headGroup.rotation.y) * 0.08;

    // Head tilt during thinking or confusion
    if (this.emotion === 'thinking' || this.emotion === 'confused') {
      this.headGroup.rotation.z += (0.15 - this.headGroup.rotation.z) * 0.05;
    } else {
      this.headGroup.rotation.z += (0 - this.headGroup.rotation.z) * 0.05;
    }

    // Glitch jitter
    if (this.emotion === 'glitch') {
      this.headGroup.position.x = (Math.random() - 0.5) * 0.15;
      this.headGroup.position.y = (Math.random() - 0.5) * 0.15;
    } else {
      this.headGroup.position.set(0, Math.sin(this.time * 2) * 0.08, 0); // Floating sway
    }

    // 2. Lerp Eye Sizing and Eyebrow Positions
    this.eyeScaleCurrent.x += (this.eyeScaleTarget.x - this.eyeScaleCurrent.x) * 0.1;
    this.eyeScaleCurrent.y += (this.eyeScaleTarget.y - this.eyeScaleCurrent.y) * 0.1;

    this.leftEyeGroup.scale.set(this.eyeScaleCurrent.x, this.eyeScaleCurrent.y, 1);
    this.rightEyeGroup.scale.set(this.eyeScaleCurrent.x, this.eyeScaleCurrent.y, 1);

    // Eyebrows lerp
    this.browAngleCurrent += (this.browAngleTarget - this.browAngleCurrent) * 0.1;
    this.browYCurrent += (this.browYTarget - this.browYCurrent) * 0.1;

    this.leftBrowMesh.rotation.z = -this.browAngleCurrent;
    this.rightBrowMesh.rotation.z = this.browAngleCurrent;
    this.leftBrowMesh.position.y = this.browYCurrent;
    this.rightBrowMesh.position.y = this.browYCurrent;

    // 3. Jaw & Mouth Audio Synchronization
    const effectiveJawOpen = this.jawOpenTarget + (this.emotion === 'speaking' ? this.audioLevel * 0.4 : this.audioLevel * 0.2);
    this.jawOpenCurrent += (effectiveJawOpen - this.jawOpenCurrent) * 0.2;
    this.jawGroup.position.y = -0.3 - this.jawOpenCurrent * 0.3;

    // Equalizer Mouth Bars
    this.mouthBars.forEach((bar, idx) => {
      const wave = Math.sin(this.time * 12 + idx * 0.8) * 0.5 + 0.5;
      const heightScale = 0.5 + (this.audioLevel * 2.5 * wave);
      bar.scale.y = heightScale;
    });

    // 4. Hologram Ring Rotations
    this.hologramRings.forEach((ring, idx) => {
      const speed = (idx + 1) * 0.008 * (this.emotion === 'thinking' ? 2.5 : 1);
      ring.rotation.x += speed;
      ring.rotation.y += speed * 0.7;
    });

    // 5. Orbit Particles
    if (this.particles) {
      this.particles.rotation.y = this.time * 0.05;
      this.particles.rotation.x = Math.sin(this.time * 0.02) * 0.2;
    }

    // Render Scene
    this.renderer.render(this.scene, this.camera);
  };

  public destroy() {
    this.isDestroyed = true;
    if (this.animFrameId) cancelAnimationFrame(this.animFrameId);

    window.removeEventListener('resize', this.onResize);
    window.removeEventListener('mousemove', this.onMouseMove);

    if (this.renderer && this.renderer.domElement) {
      this.renderer.domElement.remove();
      this.renderer.dispose();
    }
  }
}
