/**
 * Modelado 3D Procedural Estilizado y Detallado de Buques Históricos (1879)
 * - Monitor Blindado Huáscar (Perú)
 * - Corbeta de Madera Esmeralda (Chile)
 * - Goleta Virgen de Covadonga (Chile)
 * - Fragata Blindada Independencia (Perú)
 * Con jarcias, obenques, anclas, barandillas, timonería y detalles ornamentales navales.
 */

const ShipBuilder = {
  materials: null,

  initMaterials() {
    if (this.materials) return;

    this.materials = {
      // Blindajes y metales de guerra
      ironPlateDark: new THREE.MeshStandardMaterial({
        color: 0x1b1f23,
        roughness: 0.38,
        metalness: 0.85
      }),
      ironArmorPlates: new THREE.MeshStandardMaterial({
        color: 0x272d33,
        roughness: 0.35,
        metalness: 0.9
      }),
      redWaterline: new THREE.MeshStandardMaterial({
        color: 0x7c1e1e,
        roughness: 0.65,
        metalness: 0.15
      }),
      copperHull: new THREE.MeshStandardMaterial({
        color: 0x935639,
        roughness: 0.5,
        metalness: 0.6
      }),
      // Maderas finas y cubiertas
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x24170d,
        roughness: 0.82,
        metalness: 0.05
      }),
      varnishedWood: new THREE.MeshStandardMaterial({
        color: 0x422917,
        roughness: 0.55,
        metalness: 0.1
      }),
      deckWood: new THREE.MeshStandardMaterial({
        color: 0xba9b72,
        roughness: 0.75,
        metalness: 0.04
      }),
      whiteStripe: new THREE.MeshStandardMaterial({
        color: 0xe8e8e0,
        roughness: 0.55,
        metalness: 0.08
      }),
      brassGold: new THREE.MeshStandardMaterial({
        color: 0xd4af37,
        roughness: 0.25,
        metalness: 0.95
      }),
      cannonMetal: new THREE.MeshStandardMaterial({
        color: 0x0f1114,
        roughness: 0.3,
        metalness: 0.98
      }),
      canvasSail: new THREE.MeshStandardMaterial({
        color: 0xede6d6,
        roughness: 0.92,
        side: THREE.DoubleSide
      }),
      funnelBlack: new THREE.MeshStandardMaterial({
        color: 0x141416,
        roughness: 0.45,
        metalness: 0.6
      }),
      riggingRope: new THREE.MeshBasicMaterial({
        color: 0x2b2118
      })
    };
  },

  // Bandera con escudo y estrella nítidos
  createFlagTexture(country) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    if (country === 'chile') {
      ctx.fillStyle = '#c0292b';
      ctx.fillRect(0, 80, 256, 80);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(80, 0, 176, 80);

      ctx.fillStyle = '#0f388a';
      ctx.fillRect(0, 0, 80, 80);

      ctx.fillStyle = '#ffffff';
      this.drawStar(ctx, 40, 40, 5, 22, 10);
    } else {
      ctx.fillStyle = '#c0292b';
      ctx.fillRect(0, 0, 85, 160);

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(85, 0, 86, 160);

      ctx.fillStyle = '#c0292b';
      ctx.fillRect(171, 0, 85, 160);

      ctx.fillStyle = '#9e7b25';
      ctx.beginPath();
      ctx.arc(128, 80, 18, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  },

  drawStar(ctx, cx, cy, spikes, outerRadius, innerRadius) {
    let rot = Math.PI / 2 * 3;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outerRadius;
      let y = cy + Math.sin(rot) * outerRadius;
      ctx.lineTo(x, y);
      rot += step;

      x = cx + Math.cos(rot) * innerRadius;
      y = cy + Math.sin(rot) * innerRadius;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.lineTo(cx, cy - outerRadius);
    ctx.closePath();
    ctx.fill();
  },

  createWavingFlag(country, width = 4.2, height = 2.6) {
    const geom = new THREE.PlaneGeometry(width, height, 12, 8);
    const texture = this.createFlagTexture(country);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.65,
      metalness: 0.05
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.userData.isFlag = true;
    mesh.userData.baseVertices = geom.attributes.position.clone();
    return mesh;
  },

  // Generador de jarcias y obenques (cables laterales de mástiles)
  createShrouds(mastX, mastZ, mastHeight, deckY, deckWidth) {
    const group = new THREE.Group();
    [-1, 1].forEach(side => {
      const xOffset = (deckWidth / 2) * side;
      // 3 cables de obenque inclinados
      [-2.5, 0, 2.5].forEach(zOffset => {
        const points = [
          new THREE.Vector3(xOffset, deckY, mastZ + zOffset),
          new THREE.Vector3(0, mastHeight * 0.65, mastZ)
        ];
        const geom = new THREE.BufferGeometry().setFromPoints(points);
        const line = new THREE.Line(geom, this.materials.riggingRope);
        group.add(line);
      });

      // Flechastes (peldaños de cuerda horizontales)
      for (let y = deckY + 2; y < mastHeight * 0.55; y += 1.8) {
        const t = (y - deckY) / (mastHeight * 0.65 - deckY);
        const currentX = THREE.MathUtils.lerp(xOffset, 0, t);
        const stepPoints = [
          new THREE.Vector3(currentX, y, mastZ - 2.0 * (1 - t)),
          new THREE.Vector3(currentX, y, mastZ + 2.0 * (1 - t))
        ];
        const sGeom = new THREE.BufferGeometry().setFromPoints(stepPoints);
        const sLine = new THREE.Line(sGeom, this.materials.riggingRope);
        group.add(sLine);
      }
    });
    return group;
  },

  // Anclas de cepo de hierro
  createAnchor() {
    const group = new THREE.Group();
    // Caña del ancla
    const shankGeom = new THREE.CylinderGeometry(0.12, 0.12, 3.2, 8);
    const shank = new THREE.Mesh(shankGeom, this.materials.cannonMetal);
    group.add(shank);
    // Cepo de madera
    const stockGeom = new THREE.BoxGeometry(2.4, 0.25, 0.25);
    const stock = new THREE.Mesh(stockGeom, this.materials.darkWood);
    stock.position.y = 1.2;
    group.add(stock);
    // Brazos y uñas
    const crownGeom = new THREE.TorusGeometry(0.9, 0.12, 8, 12, Math.PI);
    crownGeom.rotateZ(Math.PI);
    const crown = new THREE.Mesh(crownGeom, this.materials.cannonMetal);
    crown.position.y = -1.4;
    group.add(crown);
    group.scale.setScalar(0.75);
    return group;
  },

  // -------------------------------------------------------------
  // 1. MONITOR HUÁSCAR (Perú - Comandante Miguel Grau)
  // -------------------------------------------------------------
  createHuascar() {
    this.initMaterials();
    const ship = new THREE.Group();
    ship.name = "Huascar";

    const hullGroup = new THREE.Group();

    // Casco estilizado y afilado de hierro
    const hullMainGeom = new THREE.BoxGeometry(10.8, 4.0, 54);
    const hullMain = new THREE.Mesh(hullMainGeom, this.materials.ironPlateDark);
    hullMain.position.y = 1.0;
    hullMain.castShadow = true;
    hullGroup.add(hullMain);

    // Fondo carenado rojo
    const hullBottomGeom = new THREE.BoxGeometry(10.2, 2.2, 52);
    const hullBottom = new THREE.Mesh(hullBottomGeom, this.materials.redWaterline);
    hullBottom.position.y = -1.2;
    hullGroup.add(hullBottom);

    // Proa afilada tipo espolón
    const bowGeom = new THREE.ConeGeometry(5.2, 16, 6);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(1, 0.45, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.ironPlateDark);
    bow.position.set(0, 1.0, 32);
    bow.castShadow = true;
    hullGroup.add(bow);

    // Espolón letal
    const ramGeom = new THREE.ConeGeometry(1.6, 6.5, 4);
    ramGeom.rotateX(Math.PI / 2);
    const ram = new THREE.Mesh(ramGeom, this.materials.cannonMetal);
    ram.position.set(0, -0.6, 38.5);
    hullGroup.add(ram);

    // Popa elíptica
    const sternGeom = new THREE.CylinderGeometry(5.2, 4.4, 4.0, 16, 1, false, 0, Math.PI);
    sternGeom.rotateY(-Math.PI / 2);
    const stern = new THREE.Mesh(sternGeom, this.materials.ironPlateDark);
    stern.position.set(0, 1.0, -27);
    hullGroup.add(stern);

    // Cubierta limpia y encerada
    const deckGeom = new THREE.PlaneGeometry(10.2, 52);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 3.02;
    deck.receiveShadow = true;
    hullGroup.add(deck);

    // Barandillas abatibles (cables)
    [-5.1, 5.1].forEach(x => {
      for (let z = -24; z <= 24; z += 6) {
        const stanchionGeom = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 6);
        const stanchion = new THREE.Mesh(stanchionGeom, this.materials.brassGold);
        stanchion.position.set(x, 3.6, z);
        hullGroup.add(stanchion);
      }
    });

    ship.add(hullGroup);

    // Torre Blindada Giratoria Coles con remaches y 2 cañones Armstrong de 300 lbs
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, 3.0, 12);
    turretGroup.name = "TurretColes";

    const turretBodyGeom = new THREE.CylinderGeometry(4.7, 4.9, 3.5, 24);
    const turretBody = new THREE.Mesh(turretBodyGeom, this.materials.ironArmorPlates);
    turretBody.position.y = 1.75;
    turretBody.castShadow = true;
    turretGroup.add(turretBody);

    // Corona superior de la torre
    const turretRimGeom = new THREE.TorusGeometry(4.75, 0.15, 8, 24);
    turretRimGeom.rotateX(Math.PI / 2);
    const turretRim = new THREE.Mesh(turretRimGeom, this.materials.brassGold);
    turretRim.position.y = 3.5;
    turretGroup.add(turretRim);

    // Cañones Armstrong gemelos de 300 lbs
    [-1.25, 1.25].forEach(xOffset => {
      const barrelGeom = new THREE.CylinderGeometry(0.48, 0.65, 8.8, 16);
      barrelGeom.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeom, this.materials.cannonMetal);
      barrel.position.set(xOffset, 2.1, 4.8);
      barrel.castShadow = true;
      turretGroup.add(barrel);

      const muzzleGeom = new THREE.TorusGeometry(0.5, 0.12, 8, 16);
      const muzzle = new THREE.Mesh(muzzleGeom, this.materials.brassGold);
      muzzle.position.set(xOffset, 2.1, 9.1);
      turretGroup.add(muzzle);
    });

    ship.add(turretGroup);
    ship.userData.turret = turretGroup;

    // Torreta Hexagonal de Mando (Grau)
    const bridgeGeom = new THREE.CylinderGeometry(2.1, 2.3, 5.0, 6);
    const bridge = new THREE.Mesh(bridgeGeom, this.materials.ironArmorPlates);
    bridge.position.set(0, 5.5, -4);
    bridge.castShadow = true;
    ship.add(bridge);

    // Puente Volante de mando
    const bridgePlatformGeom = new THREE.BoxGeometry(7.5, 0.4, 4.2);
    const bridgePlatform = new THREE.Mesh(bridgePlatformGeom, this.materials.varnishedWood);
    bridgePlatform.position.set(0, 8.0, -4);
    ship.add(bridgePlatform);

    // Timón de latón en el puente
    const wheelGeom = new THREE.TorusGeometry(0.55, 0.08, 8, 16);
    const wheel = new THREE.Mesh(wheelGeom, this.materials.brassGold);
    wheel.position.set(0, 8.9, -3.2);
    ship.add(wheel);

    // Chimenea de vapor con silbato
    const chimneyGroup = new THREE.Group();
    chimneyGroup.position.set(0, 3.0, -13);

    const chimneyGeom = new THREE.CylinderGeometry(1.35, 1.45, 9.0, 16);
    const chimney = new THREE.Mesh(chimneyGeom, this.materials.funnelBlack);
    chimney.position.y = 4.5;
    chimney.castShadow = true;
    chimneyGroup.add(chimney);

    const rimGeom = new THREE.TorusGeometry(1.4, 0.15, 8, 16);
    rimGeom.rotateX(Math.PI / 2);
    const rim = new THREE.Mesh(rimGeom, this.materials.ironPlateDark);
    rim.position.y = 9.0;
    chimneyGroup.add(rim);

    ship.add(chimneyGroup);
    ship.userData.chimney = chimneyGroup;

    // Mástil trípode de proa
    const mastForeGeom = new THREE.CylinderGeometry(0.26, 0.36, 23, 12);
    const mastFore = new THREE.Mesh(mastForeGeom, this.materials.ironPlateDark);
    mastFore.position.set(0, 14.5, 20);
    ship.add(mastFore);

    // Obenques
    ship.add(this.createShrouds(0, 20, 23, 3.0, 10.2));

    // Mástil de popa
    const mastAftGeom = new THREE.CylinderGeometry(0.24, 0.32, 21, 12);
    const mastAft = new THREE.Mesh(mastAftGeom, this.materials.ironPlateDark);
    mastAft.position.set(0, 13.5, -20);
    ship.add(mastAft);

    // Anclas en pescantes
    [-5.6, 5.6].forEach((x, idx) => {
      const anchor = this.createAnchor();
      anchor.position.set(x, 2.8, 22);
      anchor.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      anchor.rotation.z = 0.3;
      ship.add(anchor);
    });

    // Bandera Peruana a popa
    const flagPoleGeom = new THREE.CylinderGeometry(0.08, 0.12, 7.5, 8);
    const flagPole = new THREE.Mesh(flagPoleGeom, this.materials.darkWood);
    flagPole.position.set(0, 6.5, -26.5);
    flagPole.rotation.x = -0.22;
    ship.add(flagPole);

    const flagPeru = this.createWavingFlag('peru', 4.4, 2.7);
    flagPeru.position.set(0, 8.3, -28.5);
    flagPeru.rotation.y = Math.PI / 2;
    ship.add(flagPeru);
    ship.userData.flag = flagPeru;

    // Botes salvavidas laterales en pescantes curvados
    [-5.7, 5.7].forEach(x => {
      const boatGeom = new THREE.BoxGeometry(1.6, 1.2, 6.2);
      const boat = new THREE.Mesh(boatGeom, this.materials.whiteStripe);
      boat.position.set(x, 4.4, -9);
      boat.castShadow = true;
      ship.add(boat);
    });

    ship.scale.set(0.96, 0.96, 0.96);
    return ship;
  },

  // -------------------------------------------------------------
  // 2. CORBETA ESMERALDA (Chile - Capitán Arturo Prat)
  // -------------------------------------------------------------
  createEsmeralda() {
    this.initMaterials();
    const ship = new THREE.Group();
    ship.name = "Esmeralda";

    const hullGroup = new THREE.Group();

    // Casco estilizado de corbeta de madera
    const hullGeom = new THREE.BoxGeometry(9.8, 5.6, 52);
    const hull = new THREE.Mesh(hullGeom, this.materials.darkWood);
    hull.position.y = 2.1;
    hull.castShadow = true;
    hullGroup.add(hull);

    // Fondo cobreado bajo la flotación
    const copperBottomGeom = new THREE.BoxGeometry(9.4, 2.6, 50);
    const copperBottom = new THREE.Mesh(copperBottomGeom, this.materials.copperHull);
    copperBottom.position.y = -1.2;
    hullGroup.add(copperBottom);

    // Franja blanca clásica de portas de artillería
    const stripeGeom = new THREE.BoxGeometry(10.0, 1.3, 46);
    const stripe = new THREE.Mesh(stripeGeom, this.materials.whiteStripe);
    stripe.position.y = 3.0;
    hullGroup.add(stripe);

    // Tajamar y mascarón de proa
    const bowGeom = new THREE.ConeGeometry(5.0, 15, 6);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(0.98, 0.6, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.darkWood);
    bow.position.set(0, 2.3, 31);
    bow.castShadow = true;
    hullGroup.add(bow);

    // Mascarón ornamental dorado
    const figureheadGeom = new THREE.SphereGeometry(0.65, 8, 8);
    const figurehead = new THREE.Mesh(figureheadGeom, this.materials.brassGold);
    figurehead.position.set(0, 4.2, 37.5);
    hullGroup.add(figurehead);

    // Bauprés prominente
    const bowspritGeom = new THREE.CylinderGeometry(0.24, 0.44, 15, 12);
    bowspritGeom.rotateX(Math.PI / 2 - 0.22);
    const bowsprit = new THREE.Mesh(bowspritGeom, this.materials.varnishedWood);
    bowsprit.position.set(0, 5.0, 39);
    hullGroup.add(bowsprit);

    // Alcázar elevado a popa (donde Prat arengó)
    const sternDeckGeom = new THREE.BoxGeometry(9.6, 1.5, 15);
    const sternDeck = new THREE.Mesh(sternDeckGeom, this.materials.deckWood);
    sternDeck.position.set(0, 5.0, -19);
    hullGroup.add(sternDeck);

    // Castillo de proa
    const foreDeckGeom = new THREE.BoxGeometry(9.4, 1.3, 11);
    const foreDeck = new THREE.Mesh(foreDeckGeom, this.materials.deckWood);
    foreDeck.position.set(0, 4.8, 20);
    hullGroup.add(foreDeck);

    // Cubierta de teca
    const deckGeom = new THREE.PlaneGeometry(9.4, 50);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 4.88;
    deck.receiveShadow = true;
    hullGroup.add(deck);

    // Baterías de 40 libras Armstrong en las bandas
    const cannons = [];
    [-4.7, 4.7].forEach((xSide, sideIndex) => {
      [-14, -9, -4, 1, 6, 11, 16].forEach(z => {
        const portHoleGeom = new THREE.BoxGeometry(0.18, 0.85, 0.85);
        const portHole = new THREE.Mesh(portHoleGeom, this.materials.cannonMetal);
        portHole.position.set(xSide, 3.0, z);
        hullGroup.add(portHole);

        const cannonGeom = new THREE.CylinderGeometry(0.22, 0.32, 2.7, 12);
        cannonGeom.rotateZ(Math.PI / 2);
        const cannon = new THREE.Mesh(cannonGeom, this.materials.cannonMetal);
        cannon.position.set(xSide + (sideIndex === 0 ? -1.0 : 1.0), 3.0, z);
        cannon.castShadow = true;
        hullGroup.add(cannon);
        cannons.push(cannon);
      });
    });
    ship.userData.cannons = cannons;

    ship.add(hullGroup);

    // Chimenea de vapor
    const chimneyGeom = new THREE.CylinderGeometry(0.85, 0.9, 8.5, 16);
    const chimney = new THREE.Mesh(chimneyGeom, this.materials.funnelBlack);
    chimney.position.set(0, 8.2, -2);
    chimney.castShadow = true;
    ship.add(chimney);
    ship.userData.chimney = chimney;

    // Tres Mástiles completos con velas y jarcias (Trinquete, Mayor, Mesana)
    const mastHeights = [28, 33, 27];
    const mastZPositions = [14, 0, -14];

    mastZPositions.forEach((z, i) => {
      const mastGroup = new THREE.Group();
      mastGroup.position.set(0, 4.6, z);

      const mastGeom = new THREE.CylinderGeometry(0.26, 0.44, mastHeights[i], 12);
      const mast = new THREE.Mesh(mastGeom, this.materials.varnishedWood);
      mast.position.y = mastHeights[i] / 2;
      mast.castShadow = true;
      mastGroup.add(mast);

      // Vergas horizontales con velas recogidas al estilo siglo XIX
      [0.42, 0.66, 0.88].forEach((hRatio, idx) => {
        const yardWidth = 14 * (1 - idx * 0.24);
        const yardGeom = new THREE.CylinderGeometry(0.12, 0.16, yardWidth, 8);
        yardGeom.rotateZ(Math.PI / 2);
        const yard = new THREE.Mesh(yardGeom, this.materials.darkWood);
        yard.position.set(0, mastHeights[i] * hRatio, 0);
        yard.castShadow = true;
        mastGroup.add(yard);

        const sailGeom = new THREE.PlaneGeometry(yardWidth * 0.9, 3.6);
        const sail = new THREE.Mesh(sailGeom, this.materials.canvasSail);
        sail.position.set(0, mastHeights[i] * hRatio - 1.9, 0.2);
        sail.castShadow = true;
        mastGroup.add(sail);
      });

      // Cofa de vigía
      const crowsNestGeom = new THREE.CylinderGeometry(1.4, 1.2, 0.8, 12);
      const crowsNest = new THREE.Mesh(crowsNestGeom, this.materials.darkWood);
      crowsNest.position.y = mastHeights[i] * 0.55;
      mastGroup.add(crowsNest);

      ship.add(mastGroup);

      // Jarcias y obenques laterales
      ship.add(this.createShrouds(0, z, mastHeights[i], 4.88, 9.4));
    });

    // Pabellón Chileno al tope del pico de mesana (¡Que nunca se arríe!)
    const flagStaffGeom = new THREE.CylinderGeometry(0.08, 0.12, 8.5, 8);
    const flagStaff = new THREE.Mesh(flagStaffGeom, this.materials.varnishedWood);
    flagStaff.position.set(0, 16.5, -18);
    flagStaff.rotation.x = -0.42;
    ship.add(flagStaff);

    const flagChile = this.createWavingFlag('chile', 4.8, 3.0);
    flagChile.position.set(0, 19.0, -21.5);
    flagChile.rotation.y = Math.PI / 2;
    ship.add(flagChile);
    ship.userData.flag = flagChile;

    // Rueda del timón de latón en el alcázar
    const wheelGeom = new THREE.TorusGeometry(0.65, 0.08, 8, 16);
    const wheel = new THREE.Mesh(wheelGeom, this.materials.brassGold);
    wheel.position.set(0, 6.0, -23);
    ship.add(wheel);

    // Anclas
    [-5.0, 5.0].forEach((x, idx) => {
      const anchor = this.createAnchor();
      anchor.position.set(x, 4.0, 24);
      anchor.rotation.y = idx === 0 ? Math.PI / 2 : -Math.PI / 2;
      anchor.rotation.z = 0.35;
      ship.add(anchor);
    });

    ship.scale.set(0.96, 0.96, 0.96);
    return ship;
  },

  // -------------------------------------------------------------
  // 3. GOLETA COVADONGA (Chile - Capitán Carlos Condell)
  // -------------------------------------------------------------
  createCovadonga() {
    this.initMaterials();
    const ship = new THREE.Group();
    ship.name = "Covadonga";

    const hullGroup = new THREE.Group();

    // Casco esbelto, estilizado y de poco calado
    const hullGeom = new THREE.BoxGeometry(7.6, 4.2, 38);
    const hull = new THREE.Mesh(hullGeom, this.materials.darkWood);
    hull.position.y = 1.7;
    hull.castShadow = true;
    hullGroup.add(hull);

    // Fondo cobreado
    const copperBottomGeom = new THREE.BoxGeometry(7.2, 1.8, 36);
    const copperBottom = new THREE.Mesh(copperBottomGeom, this.materials.copperHull);
    copperBottom.position.y = -0.8;
    hullGroup.add(copperBottom);

    // Filete ornamental dorado de goleta
    const stripeGeom = new THREE.BoxGeometry(7.8, 0.65, 34);
    const stripe = new THREE.Mesh(stripeGeom, this.materials.brassGold);
    stripe.position.y = 2.5;
    hullGroup.add(stripe);

    // Proa afilada
    const bowGeom = new THREE.ConeGeometry(3.9, 11.5, 6);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(0.95, 0.6, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.darkWood);
    bow.position.set(0, 1.8, 22.5);
    hullGroup.add(bow);

    // Bauprés largo
    const bowspritGeom = new THREE.CylinderGeometry(0.18, 0.34, 13, 12);
    bowspritGeom.rotateX(Math.PI / 2 - 0.22);
    const bowsprit = new THREE.Mesh(bowspritGeom, this.materials.varnishedWood);
    bowsprit.position.set(0, 3.8, 29);
    hullGroup.add(bowsprit);

    // Cubierta
    const deckGeom = new THREE.PlaneGeometry(7.2, 36);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 3.82;
    deck.receiveShadow = true;
    hullGroup.add(deck);

    ship.add(hullGroup);

    // Cañón de colisa Armstrong de 70 libras a popa
    const pivotMountGeom = new THREE.CylinderGeometry(1.2, 1.4, 0.85, 16);
    const pivotMount = new THREE.Mesh(pivotMountGeom, this.materials.ironArmorPlates);
    pivotMount.position.set(0, 4.2, -12);
    ship.add(pivotMount);

    const gun70Geom = new THREE.CylinderGeometry(0.3, 0.46, 5.2, 12);
    gun70Geom.rotateX(Math.PI / 2);
    const gun70 = new THREE.Mesh(gun70Geom, this.materials.cannonMetal);
    gun70.position.set(0, 4.9, -13.6);
    gun70.castShadow = true;
    ship.add(gun70);
    ship.userData.gun70 = gun70;

    // Cañones de 9 libras en las bandas
    [-3.7, 3.7].forEach(x => {
      const gun9Geom = new THREE.CylinderGeometry(0.18, 0.26, 2.3, 10);
      gun9Geom.rotateZ(Math.PI / 2);
      const gun9 = new THREE.Mesh(gun9Geom, this.materials.cannonMetal);
      gun9.position.set(x, 4.1, 2);
      ship.add(gun9);
    });

    // Chimenea delgada
    const funnelGeom = new THREE.CylinderGeometry(0.62, 0.68, 6.8, 12);
    const funnel = new THREE.Mesh(funnelGeom, this.materials.funnelBlack);
    funnel.position.set(0, 6.9, -3);
    ship.add(funnel);
    ship.userData.chimney = funnel;

    // Dos mástiles elegantes inclinados hacia popa (goleta clásica)
    [7, -8].forEach(z => {
      const mastGeom = new THREE.CylinderGeometry(0.2, 0.36, 23, 10);
      const mast = new THREE.Mesh(mastGeom, this.materials.varnishedWood);
      mast.position.set(0, 14.5, z);
      mast.rotation.x = -0.14;
      mast.castShadow = true;
      ship.add(mast);

      // Velas cangrejas
      const boomGeom = new THREE.CylinderGeometry(0.1, 0.15, 10, 8);
      boomGeom.rotateX(Math.PI / 2);
      const boom = new THREE.Mesh(boomGeom, this.materials.darkWood);
      boom.position.set(0, 7.8, z - 4.5);
      ship.add(boom);

      const gaffSailGeom = new THREE.PlaneGeometry(9, 6.2);
      const gaffSail = new THREE.Mesh(gaffSailGeom, this.materials.canvasSail);
      gaffSail.position.set(0, 10.8, z - 4.5);
      gaffSail.rotation.y = Math.PI / 2;
      ship.add(gaffSail);

      ship.add(this.createShrouds(0, z, 23, 3.82, 7.2));
    });

    // Bandera Chilena a popa
    const flagChile = this.createWavingFlag('chile', 3.7, 2.3);
    flagChile.position.set(0, 8.8, -19.5);
    flagChile.rotation.y = Math.PI / 2;
    ship.add(flagChile);
    ship.userData.flag = flagChile;

    ship.scale.set(0.92, 0.92, 0.92);
    return ship;
  },

  // -------------------------------------------------------------
  // 4. FRAGATA BLINDADA INDEPENDENCIA (Perú - Capitán Juan Guillermo Moore)
  // -------------------------------------------------------------
  createIndependencia() {
    this.initMaterials();
    const ship = new THREE.Group();
    ship.name = "Independencia";

    const hullGroup = new THREE.Group();

    // Casco enorme, masivo e imponente
    const hullGeom = new THREE.BoxGeometry(13.2, 6.2, 65);
    const hull = new THREE.Mesh(hullGeom, this.materials.ironPlateDark);
    hull.position.y = 2.5;
    hull.castShadow = true;
    hullGroup.add(hull);

    // Fondo rojo de carena
    const bottomGeom = new THREE.BoxGeometry(12.8, 3.2, 62);
    const bottom = new THREE.Mesh(bottomGeom, this.materials.redWaterline);
    bottom.position.y = -1.6;
    hullGroup.add(bottom);

    // Casamata blindada central
    const casemateGeom = new THREE.BoxGeometry(13.8, 4.3, 35);
    const casemate = new THREE.Mesh(casemateGeom, this.materials.ironArmorPlates);
    casemate.position.y = 6.4;
    casemate.castShadow = true;
    hullGroup.add(casemate);

    // Proa masiva de hierro con espolón
    const bowGeom = new THREE.ConeGeometry(6.4, 20, 6);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(1, 0.5, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.ironPlateDark);
    bow.position.set(0, 2.5, 38.5);
    bow.castShadow = true;
    hullGroup.add(bow);

    const ramGeom = new THREE.ConeGeometry(2.0, 7.5, 4);
    ramGeom.rotateX(Math.PI / 2);
    const ram = new THREE.Mesh(ramGeom, this.materials.cannonMetal);
    ram.position.set(0, 0.2, 45.5);
    hullGroup.add(ram);

    // Cubierta
    const deckGeom = new THREE.PlaneGeometry(13.0, 62);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 5.62;
    deck.receiveShadow = true;
    hullGroup.add(deck);

    // Cañones pesados de casamata
    const heavyCannons = [];
    [-6.7, 6.7].forEach((x, sideIdx) => {
      [-12, -6, 0, 6, 12].forEach(z => {
        const gunGeom = new THREE.CylinderGeometry(0.42, 0.55, 3.9, 12);
        gunGeom.rotateZ(Math.PI / 2);
        const gun = new THREE.Mesh(gunGeom, this.materials.cannonMetal);
        gun.position.set(x + (sideIdx === 0 ? -1.2 : 1.2), 6.4, z);
        gun.castShadow = true;
        hullGroup.add(gun);
        heavyCannons.push(gun);
      });
    });
    ship.userData.cannons = heavyCannons;

    ship.add(hullGroup);

    // Dos chimeneas humeantes
    [-5, 5].forEach(z => {
      const funnelGeom = new THREE.CylinderGeometry(1.3, 1.4, 9.8, 16);
      const funnel = new THREE.Mesh(funnelGeom, this.materials.funnelBlack);
      funnel.position.set(0, 10.8, z);
      funnel.castShadow = true;
      ship.add(funnel);
    });

    // Mástiles con cofas blindadas de combate
    [-18, 18].forEach(z => {
      const mastGeom = new THREE.CylinderGeometry(0.36, 0.56, 29, 12);
      const mast = new THREE.Mesh(mastGeom, this.materials.darkWood);
      mast.position.set(0, 18.5, z);
      mast.castShadow = true;
      ship.add(mast);

      const topGeom = new THREE.CylinderGeometry(2.1, 1.9, 1.3, 12);
      const top = new THREE.Mesh(topGeom, this.materials.ironArmorPlates);
      top.position.set(0, 22.5, z);
      ship.add(top);

      ship.add(this.createShrouds(0, z, 29, 5.62, 13.0));
    });

    // Bandera Peruana a popa
    const flagPeru = this.createWavingFlag('peru', 5.3, 3.3);
    flagPeru.position.set(0, 12.5, -33.5);
    flagPeru.rotation.y = Math.PI / 2;
    ship.add(flagPeru);
    ship.userData.flag = flagPeru;

    ship.scale.set(1.05, 1.05, 1.05);
    return ship;
  },

  updateShipAnimation(ship, time, waveHeight = 0.4, rollFrequency = 1.2) {
    if (!ship) return;

    const seed = ship.position.x * 0.1 + ship.position.z * 0.1;
    const roll = Math.sin(time * rollFrequency + seed) * 0.045;
    const pitch = Math.cos(time * (rollFrequency * 0.8) + seed) * 0.025;

    ship.rotation.z = roll;
    ship.rotation.x = pitch;

    if (ship.userData.flag && ship.userData.flag.geometry) {
      const geom = ship.userData.flag.geometry;
      const pos = geom.attributes.position;
      const base = ship.userData.flag.userData.baseVertices;

      if (base) {
        for (let i = 0; i < pos.count; i++) {
          const u = base.getX(i);
          const waveZ = Math.sin(time * 5.5 + u * 2.0) * 0.22 * (u + 2.0);
          pos.setZ(i, waveZ);
        }
        pos.needsUpdate = true;
      }
    }
  }
};

window.ShipBuilder = ShipBuilder;
