/**
 * Entorno 3D y Océano Realista para el Combate Naval de Iquique y Punta Gruesa
 * - Océano dinámico con olas físicas ondulantes
 * - Cordillera de la Costa de Tarapacá / Bahía de Iquique
 * - Arrecife y roquerío mortal de Punta Gruesa
 * - Iluminación cinemática matinal de mayo de 1879
 */

class BattleEnvironment {
  constructor(scene) {
    this.scene = scene;
    this.oceanMesh = null;
    this.oceanGeometry = null;
    this.baseWaterPositions = null;
    this.terrainGroup = new THREE.Group();
    this.reefGroup = new THREE.Group();
    this.sunLight = null;
    this.hemiLight = null;

    this.scene.add(this.terrainGroup);
    this.scene.add(this.reefGroup);
  }

  init(scenarioType = 'punta_gruesa') {
    this.setupLighting();
    this.setupSkyAndFog();
    this.createOcean();
    this.updateScenarioEnvironment(scenarioType);
  }

  setupLighting() {
    // Luz ambiental hemisférica (cielo matinal del Pacífico y reflejo del agua)
    this.hemiLight = new THREE.HemisphereLight(0xd9ebff, 0x142b44, 0.75);
    this.hemiLight.position.set(0, 80, 0);
    this.scene.add(this.hemiLight);

    // Sol matinal del norte de Chile (rayos dorados y sombras nítidas)
    this.sunLight = new THREE.DirectionalLight(0xfffaed, 1.35);
    this.sunLight.position.set(120, 90, 80);
    this.sunLight.castShadow = true;
    this.sunLight.shadow.mapSize.width = 2048;
    this.sunLight.shadow.mapSize.height = 2048;
    this.sunLight.shadow.camera.near = 10;
    this.sunLight.shadow.camera.far = 400;
    this.sunLight.shadow.camera.left = -120;
    this.sunLight.shadow.camera.right = 120;
    this.sunLight.shadow.camera.top = 120;
    this.sunLight.shadow.camera.bottom = -120;
    this.sunLight.shadow.bias = -0.0005;
    this.scene.add(this.sunLight);

    // Luz de relleno cálida para resaltar los cascos
    const fillLight = new THREE.DirectionalLight(0xffe8d0, 0.4);
    fillLight.position.set(-80, 40, -50);
    this.scene.add(fillLight);
  }

  setupSkyAndFog() {
    // Niebla costera matinal (Camanchaca suave de la costa desértica)
    this.scene.fog = new THREE.FogExp2(0x9fc0d8, 0.0028);
    this.scene.background = new THREE.Color(0x95bdd9);
  }

  createOcean() {
    const size = 900;
    const segments = 120;
    this.oceanGeometry = new THREE.PlaneGeometry(size, size, segments, segments);
    this.oceanGeometry.rotateX(-Math.PI / 2);

    // Almacenar posiciones base de vértices para cálculo de oleaje
    this.baseWaterPositions = this.oceanGeometry.attributes.position.clone();

    // Material de agua realista con brillo especular y color azul ultramar
    const oceanMaterial = new THREE.MeshStandardMaterial({
      color: 0x0f3b56,
      roughness: 0.22,
      metalness: 0.65,
      flatShading: true
    });

    this.oceanMesh = new THREE.Mesh(this.oceanGeometry, oceanMaterial);
    this.oceanMesh.position.y = 0;
    this.oceanMesh.receiveShadow = true;
    this.scene.add(this.oceanMesh);
  }

  // Generación procedural de los acantilados desérticos de Tarapacá
  createCoastalCliffs(zOffset = -220, isIquique = true) {
    const group = new THREE.Group();

    // Material de tierra desértica árida de Tarapacá
    const cliffMat = new THREE.MeshStandardMaterial({
      color: 0x9e7855,
      roughness: 0.95,
      metalness: 0.05,
      flatShading: true
    });

    const sandMat = new THREE.MeshStandardMaterial({
      color: 0xc4a476,
      roughness: 0.9,
      metalness: 0.02
    });

    // Franja de playa arenosa
    const beachGeom = new THREE.PlaneGeometry(800, 70);
    beachGeom.rotateX(-Math.PI / 2);
    const beach = new THREE.Mesh(beachGeom, sandMat);
    beach.position.set(0, 0.5, zOffset);
    group.add(beach);

    // Macizo costero montañoso (Farallón Costero de Iquique)
    for (let x = -380; x <= 380; x += 45) {
      const height = 45 + Math.sin(x * 0.03) * 22 + Math.cos(x * 0.07) * 15;
      const width = 50 + Math.random() * 15;
      const depth = 90 + Math.random() * 30;

      const cliffGeom = new THREE.ConeGeometry(width, height, 5);
      const cliff = new THREE.Mesh(cliffGeom, cliffMat);
      cliff.position.set(x + (Math.random() - 0.5) * 10, height / 2 - 2, zOffset - 40 - Math.random() * 20);
      cliff.scale.set(1.4, 1.0, 0.9);
      group.add(cliff);
    }

    if (isIquique) {
      // Siluetas del poblado y puerto salitrero de Iquique en 1879
      const buildingMat = new THREE.MeshStandardMaterial({ color: 0x4a4137, roughness: 0.8 });
      for (let bx = -150; bx <= 150; bx += 20) {
        const h = 4 + Math.random() * 6;
        const bGeom = new THREE.BoxGeometry(12, h, 14);
        const b = new THREE.Mesh(bGeom, buildingMat);
        b.position.set(bx, h / 2, zOffset + 15);
        group.add(b);
      }

      // Muelle de madera histórico
      const pierMat = new THREE.MeshStandardMaterial({ color: 0x2e1e13, roughness: 0.9 });
      const pierGeom = new THREE.BoxGeometry(6, 2, 70);
      const pier = new THREE.Mesh(pierGeom, pierMat);
      pier.position.set(0, 1.2, zOffset + 40);
      group.add(pier);

      // Batería costera de artillería de Iquique en la orilla
      const batteryMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.4 });
      [-40, 40].forEach(bx => {
        const gunGeom = new THREE.CylinderGeometry(0.5, 0.8, 6, 8);
        gunGeom.rotateX(Math.PI / 2);
        const gun = new THREE.Mesh(gunGeom, batteryMat);
        gun.position.set(bx, 4, zOffset + 25);
        gun.rotation.y = -0.2;
        group.add(gun);
      });
    }

    return group;
  }

  // Creación del Arrecife y Roca Mortal de Punta Gruesa
  createPuntaGruesaReef() {
    const group = new THREE.Group();

    const rockMat = new THREE.MeshStandardMaterial({
      color: 0x2a2825,
      roughness: 0.9,
      metalness: 0.1,
      flatShading: true
    });

    const foamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85
    });

    // Roca traicionera submarina donde encalla la Independencia (Punta Gruesa)
    // Coordenadas coincidentes con la trayectoria del combate
    const reefRocks = [
      { x: 35, y: -0.4, z: -25, r: 16, h: 5.5 },
      { x: 48, y: 1.2, z: -18, r: 12, h: 7.0 },
      { x: 26, y: -0.8, z: -35, r: 14, h: 4.8 },
      { x: 55, y: 2.5, z: -8,  r: 10, h: 9.0 },
      { x: 40, y: -1.0, z: -45, r: 18, h: 4.2 }
    ];

    reefRocks.forEach(r => {
      const rockGeom = new THREE.DodecahedronGeometry(r.r, 1);
      const rock = new THREE.Mesh(rockGeom, rockMat);
      rock.position.set(r.x, r.y, r.z);
      rock.scale.set(1.2, 0.45, 1.0);
      group.add(rock);

      // Espuma marina rompiendo sobre la roca
      const foamGeom = new THREE.RingGeometry(r.r * 0.9, r.r * 1.45, 16);
      foamGeom.rotateX(-Math.PI / 2);
      const foam = new THREE.Mesh(foamGeom, foamMat);
      foam.position.set(r.x, 0.15, r.z);
      group.add(foam);
    });

    // Boya / señal de peligro de bajos fondos
    const markerGeom = new THREE.ConeGeometry(0.6, 2.5, 6);
    const markerMat = new THREE.MeshStandardMaterial({ color: 0xcc2222 });
    const marker = new THREE.Mesh(markerGeom, markerMat);
    marker.position.set(38, 1.2, -15);
    group.add(marker);

    return group;
  }

  // Cambio dinámico de escenario según la fase del juego
  updateScenarioEnvironment(scenarioType) {
    // Limpiar elementos anteriores
    while (this.terrainGroup.children.length > 0) {
      this.terrainGroup.remove(this.terrainGroup.children[0]);
    }
    while (this.reefGroup.children.length > 0) {
      this.reefGroup.remove(this.reefGroup.children[0]);
    }

    if (scenarioType === 'punta_gruesa') {
      // Punta Gruesa: costa más cercana y bajos fondos rocosos
      const cliffs = this.createCoastalCliffs(-170, false);
      this.terrainGroup.add(cliffs);

      const reef = this.createPuntaGruesaReef();
      this.reefGroup.add(reef);

      // Iluminación de media mañana
      this.sunLight.color.setHex(0xfffaea);
      this.scene.fog.color.setHex(0xa2c4dc);
      this.scene.background.setHex(0xa2c4dc);
    } else {
      // Iquique: Rada de Iquique, fondeadero, acantilados al fondo
      const cliffs = this.createCoastalCliffs(-230, true);
      this.terrainGroup.add(cliffs);

      // Sol directo del mediodía trágico
      this.sunLight.color.setHex(0xfff2d4);
      this.scene.fog.color.setHex(0x93b7cf);
      this.scene.background.setHex(0x93b7cf);
    }
  }

  // Actualización por cuadro: ondas marinas físicas en movimiento (Optimizado a 60 FPS)
  updateOcean(time) {
    if (!this.oceanGeometry || !this.baseWaterPositions) return;

    const pos = this.oceanGeometry.attributes.position;
    const base = this.baseWaterPositions;
    const count = pos.count;

    for (let i = 0; i < count; i++) {
      const u = base.getX(i);
      const w = base.getZ(i);

      // Superposición de armónicos de olas del Pacífico
      const wave1 = Math.sin(u * 0.045 + time * 1.6) * Math.cos(w * 0.035 + time * 1.2) * 1.1;
      const wave2 = Math.sin((u + w) * 0.02 + time * 0.9) * 0.6;
      const wave3 = Math.cos(w * 0.06 - time * 2.1) * 0.35;

      pos.setY(i, wave1 + wave2 + wave3);
    }

    pos.needsUpdate = true;
  }
}

window.BattleEnvironment = BattleEnvironment;
