/**
 * Sistema de Partículas y Efectos Visuales Navales
 * - Destellos de pólvora y fogonazos de artillería
 * - Humaredas volumétricas de pólvora negra
 * - Proyectiles balísticos con estela
 * - Géiseres de agua e impactos en casco
 * - Humo continuo de chimeneas de vapor
 * - Estela de espuma de los barcos
 */

class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.particles = [];
    this.projectiles = [];
    this.sparks = [];

    // Geometrías y materiales compartidos para máximo rendimiento
    this.smokeGeom = new THREE.DodecahedronGeometry(1.0, 1);
    this.waterDropGeom = new THREE.SphereGeometry(0.35, 6, 6);
    this.sparkGeom = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    this.ballGeom = new THREE.SphereGeometry(0.45, 12, 12);

    this.ballMaterial = new THREE.MeshStandardMaterial({
      color: 0x111111,
      roughness: 0.3,
      metalness: 0.95
    });

    this.sparkMaterial = new THREE.MeshBasicMaterial({
      color: 0xffaa33
    });
  }

  // Fogonazo y humo de disparo de cañón
  createCannonFire(origin, direction, isHeavy = false) {
    const power = isHeavy ? 1.5 : 1.0;

    // 1. Destello de luz puntual momentáneo
    const flashLight = new THREE.PointLight(0xff9922, isHeavy ? 6.0 : 3.5, 35);
    flashLight.position.copy(origin);
    this.scene.add(flashLight);

    setTimeout(() => {
      this.scene.remove(flashLight);
    }, 90);

    // 2. Bola de fuego inicial
    const fireMat = new THREE.MeshBasicMaterial({
      color: 0xffdd66,
      transparent: true,
      opacity: 0.95
    });
    const fireball = new THREE.Mesh(this.smokeGeom, fireMat);
    fireball.position.copy(origin);
    fireball.scale.setScalar(power * 2.0);
    this.scene.add(fireball);

    this.particles.push({
      mesh: fireball,
      vel: direction.clone().multiplyScalar(15 * power),
      life: 0.18,
      maxLife: 0.18,
      growRate: 15 * power,
      fadeRate: 5.0
    });

    // 3. Volutas de humo denso de pólvora negra del siglo XIX
    const smokeCount = isHeavy ? 14 : 8;
    for (let i = 0; i < smokeCount; i++) {
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0xcccccc + Math.floor(Math.random() * 0x222222),
        transparent: true,
        opacity: 0.75,
        roughness: 0.9,
        flatShading: true
      });

      const smoke = new THREE.Mesh(this.smokeGeom, smokeMat);
      smoke.position.copy(origin).add(new THREE.Vector3(
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5,
        (Math.random() - 0.5) * 1.5
      ));

      const spreadDir = direction.clone().add(new THREE.Vector3(
        (Math.random() - 0.5) * 0.7,
        Math.random() * 0.4 + 0.1,
        (Math.random() - 0.5) * 0.7
      )).normalize();

      const speed = (5 + Math.random() * 12) * power;

      this.scene.add(smoke);
      this.particles.push({
        mesh: smoke,
        vel: spreadDir.multiplyScalar(speed),
        life: 1.8 + Math.random() * 1.2,
        maxLife: 3.0,
        growRate: (2.2 + Math.random() * 2.0) * power,
        fadeRate: 0.35,
        buoyancy: 1.2
      });
    }
  }

  // Disparo balístico completo (proyectil viajando hacia un blanco)
  fireCannonBall(startPos, targetPos, isHeavy = false, onHit = null) {
    const ball = new THREE.Mesh(this.ballGeom, this.ballMaterial);
    ball.position.copy(startPos);
    if (isHeavy) ball.scale.setScalar(1.6);
    this.scene.add(ball);

    // Calcular velocidad para trayectoria parabólica
    const dist = startPos.distanceTo(targetPos);
    const flightTime = Math.min(2.5, Math.max(0.7, dist / 85));
    const vel = targetPos.clone().sub(startPos).divideScalar(flightTime);
    
    // Compensar gravedad (g = 9.8)
    const gravity = 18.0;
    vel.y += 0.5 * gravity * flightTime;

    this.projectiles.push({
      mesh: ball,
      vel: vel,
      gravity: gravity,
      timeRemaining: flightTime,
      targetPos: targetPos.clone(),
      onHit: onHit,
      isHeavy: isHeavy
    });

    // Sonido y fogonazo en la boca del cañón
    const dir = targetPos.clone().sub(startPos).normalize();
    this.createCannonFire(startPos, dir, isHeavy);
    if (window.soundEngine) {
      window.soundEngine.playCannon(isHeavy);
    }
  }

  // Impacto en agua: Géiser de espuma blanca
  createWaterSplash(position) {
    const splashMat = new THREE.MeshStandardMaterial({
      color: 0xedf7ff,
      transparent: true,
      opacity: 0.85,
      roughness: 0.1
    });

    const dropCount = 28;
    for (let i = 0; i < dropCount; i++) {
      const drop = new THREE.Mesh(this.waterDropGeom, splashMat);
      drop.position.copy(position);

      const angle = Math.random() * Math.PI * 2;
      const speedH = 3 + Math.random() * 8;
      const speedV = 14 + Math.random() * 18;

      const vel = new THREE.Vector3(
        Math.cos(angle) * speedH,
        speedV,
        Math.sin(angle) * speedH
      );

      this.scene.add(drop);
      this.particles.push({
        mesh: drop,
        vel: vel,
        gravity: 24.0,
        life: 1.2,
        maxLife: 1.2,
        growRate: 0.5,
        fadeRate: 0.8
      });
    }

    // Anillo expansivo de espuma en la superficie
    const ringGeom = new THREE.RingGeometry(1, 2.5, 16);
    ringGeom.rotateX(-Math.PI / 2);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.position.set(position.x, 0.1, position.z);
    this.scene.add(ring);

    this.particles.push({
      mesh: ring,
      vel: new THREE.Vector3(0, 0, 0),
      life: 1.5,
      maxLife: 1.5,
      growRate: 7.0,
      fadeRate: 0.65
    });

    if (window.soundEngine) {
      window.soundEngine.playSplash();
    }
  }

  // Impacto directo en casco: explosión, chispas y astillas de madera o metal
  createHullHit(position, isArmor = false) {
    // 1. Bola de fuego de impacto
    const hitMat = new THREE.MeshBasicMaterial({
      color: isArmor ? 0xffea77 : 0xff7722,
      transparent: true,
      opacity: 0.95
    });
    const burst = new THREE.Mesh(this.smokeGeom, hitMat);
    burst.position.copy(position);
    burst.scale.setScalar(3.0);
    this.scene.add(burst);

    this.particles.push({
      mesh: burst,
      vel: new THREE.Vector3(0, 2, 0),
      life: 0.25,
      maxLife: 0.25,
      growRate: 10.0,
      fadeRate: 4.0
    });

    // 2. Chispas incandescentes / esquirlas
    const sparkCount = isArmor ? 30 : 18;
    for (let i = 0; i < sparkCount; i++) {
      const spark = new THREE.Mesh(this.sparkGeom, this.sparkMaterial);
      spark.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 25,
        Math.random() * 18 + 5,
        (Math.random() - 0.5) * 25
      );

      this.scene.add(spark);
      this.particles.push({
        mesh: spark,
        vel: vel,
        gravity: 28.0,
        life: 0.8 + Math.random() * 0.4,
        maxLife: 1.2,
        growRate: -0.2,
        fadeRate: 1.2
      });
    }

    // 3. Humo negro espeso de incendio a bordo
    for (let i = 0; i < 8; i++) {
      const smokeMat = new THREE.MeshStandardMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.85,
        roughness: 0.95
      });
      const smoke = new THREE.Mesh(this.smokeGeom, smokeMat);
      smoke.position.copy(position);

      const vel = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        Math.random() * 6 + 3,
        (Math.random() - 0.5) * 6
      );

      this.scene.add(smoke);
      this.particles.push({
        mesh: smoke,
        vel: vel,
        buoyancy: 1.8,
        life: 2.2,
        maxLife: 2.2,
        growRate: 2.8,
        fadeRate: 0.45
      });
    }

    if (window.soundEngine) {
      window.soundEngine.playImpact(isArmor);
    }
  }

  // Emisión continua de humo de carbón de chimeneas de vapor
  emitChimneySmoke(chimneyPos, intensity = 1.0) {
    if (Math.random() > 0.45 * intensity) return;

    const smokeMat = new THREE.MeshStandardMaterial({
      color: 0x3a3a3a,
      transparent: true,
      opacity: 0.55,
      roughness: 0.95
    });

    const puff = new THREE.Mesh(this.smokeGeom, smokeMat);
    puff.position.copy(chimneyPos).add(new THREE.Vector3(
      (Math.random() - 0.5) * 0.5,
      0.5,
      (Math.random() - 0.5) * 0.5
    ));
    puff.scale.setScalar(0.7);

    // Deriva con la brisa del mar hacia popa
    const vel = new THREE.Vector3(
      (Math.random() - 0.5) * 1.5,
      2.5 + Math.random() * 1.5,
      -3.0 + (Math.random() - 0.5) * 1.0
    );

    this.scene.add(puff);
    this.particles.push({
      mesh: puff,
      vel: vel,
      life: 2.5,
      maxLife: 2.5,
      growRate: 1.5,
      fadeRate: 0.25,
      buoyancy: 0.8
    });
  }

  // Actualización por cuadro de todas las partículas y proyectiles
  update(delta) {
    // 1. Actualizar proyectiles en vuelo
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.timeRemaining -= delta;

      // Movimiento balístico
      p.mesh.position.addScaledVector(p.vel, delta);
      p.vel.y -= p.gravity * delta;

      // Estela pequeña de humo
      if (Math.random() > 0.4) {
        const tracerMat = new THREE.MeshBasicMaterial({
          color: 0xdddddd,
          transparent: true,
          opacity: 0.4
        });
        const tracer = new THREE.Mesh(this.smokeGeom, tracerMat);
        tracer.position.copy(p.mesh.position);
        tracer.scale.setScalar(0.4);
        this.scene.add(tracer);
        this.particles.push({
          mesh: tracer,
          vel: new THREE.Vector3(0, 0.5, 0),
          life: 0.4,
          maxLife: 0.4,
          growRate: 1.2,
          fadeRate: 1.0
        });
      }

      // Impacto al cumplirse el tiempo o caer al agua
      if (p.timeRemaining <= 0 || p.mesh.position.y <= 0) {
        this.scene.remove(p.mesh);

        if (p.onHit) {
          p.onHit(p.mesh.position);
        } else {
          // Si cae al agua
          this.createWaterSplash(new THREE.Vector3(p.mesh.position.x, 0, p.mesh.position.z));
        }

        this.projectiles.splice(i, 1);
      }
    }

    // 2. Actualizar partículas de humo, fuego y salpicaduras
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= delta;

      if (pt.life <= 0) {
        this.scene.remove(pt.mesh);
        this.particles.splice(i, 1);
        continue;
      }

      // Aplicar velocidad
      pt.mesh.position.addScaledVector(pt.vel, delta);

      // Gravedad o flotabilidad
      if (pt.gravity) {
        pt.vel.y -= pt.gravity * delta;
      } else if (pt.buoyancy) {
        pt.vel.y += pt.buoyancy * delta;
      }

      // Crecimiento
      if (pt.growRate) {
        pt.mesh.scale.addScalar(pt.growRate * delta);
      }

      // Desvanecimiento de opacidad
      if (pt.mesh.material && pt.mesh.material.opacity !== undefined) {
        pt.mesh.material.opacity = Math.max(0, pt.mesh.material.opacity - pt.fadeRate * delta);
      }
    }
  }

  // Limpiar todas las partículas activas
  clear() {
    this.particles.forEach(p => this.scene.remove(p.mesh));
    this.particles = [];
    this.projectiles.forEach(p => this.scene.remove(p.mesh));
    this.projectiles = [];
  }
}

window.ParticleSystem = ParticleSystem;
