/**
 * Modelado 3D Procedural de Buques Históricos (1879)
 * - Monitor Blindado Huáscar (Perú)
 * - Corbeta de Madera Esmeralda (Chile)
 * - Goleta Virgen de Covadonga (Chile)
 * - Fragata Blindada Independencia (Perú)
 */

const ShipBuilder = {
  // Materiales reutilizables de alta calidad con sombreado PBR
  materials: null,

  initMaterials() {
    if (this.materials) return;

    this.materials = {
      // Cascos y metales
      ironPlateDark: new THREE.MeshStandardMaterial({
        color: 0x1f2326,
        roughness: 0.5,
        metalness: 0.8
      }),
      ironArmorPlates: new THREE.MeshStandardMaterial({
        color: 0x2b3035,
        roughness: 0.4,
        metalness: 0.85
      }),
      redWaterline: new THREE.MeshStandardMaterial({
        color: 0x6e1b1b,
        roughness: 0.7,
        metalness: 0.1
      }),
      darkWood: new THREE.MeshStandardMaterial({
        color: 0x2e1f13,
        roughness: 0.85,
        metalness: 0.05
      }),
      deckWood: new THREE.MeshStandardMaterial({
        color: 0xa88960,
        roughness: 0.8,
        metalness: 0.05
      }),
      whiteStripe: new THREE.MeshStandardMaterial({
        color: 0xd9d9d0,
        roughness: 0.6,
        metalness: 0.1
      }),
      brassGold: new THREE.MeshStandardMaterial({
        color: 0xc89d37,
        roughness: 0.3,
        metalness: 0.9
      }),
      cannonMetal: new THREE.MeshStandardMaterial({
        color: 0x111315,
        roughness: 0.35,
        metalness: 0.95
      }),
      canvasSail: new THREE.MeshStandardMaterial({
        color: 0xe6e0d0,
        roughness: 0.9,
        side: THREE.DoubleSide
      }),
      funnelBlack: new THREE.MeshStandardMaterial({
        color: 0x181818,
        roughness: 0.6,
        metalness: 0.4
      }),
      riggingRope: new THREE.MeshBasicMaterial({
        color: 0x221a12
      })
    };
  },

  // Generador de texturas de banderas dinámicas
  createFlagTexture(country) {
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 160;
    const ctx = canvas.getContext('2d');

    if (country === 'chile') {
      // Bandera Chilena de 1879
      ctx.fillStyle = '#b81414'; // Rojo inferior
      ctx.fillRect(0, 80, 256, 80);

      ctx.fillStyle = '#ffffff'; // Blanco superior derecho
      ctx.fillRect(80, 0, 176, 80);

      ctx.fillStyle = '#0f2c69'; // Azul superior izquierdo
      ctx.fillRect(0, 0, 80, 80);

      // Estrella Solitaria Blanca
      ctx.fillStyle = '#ffffff';
      this.drawStar(ctx, 40, 40, 5, 22, 10);
    } else {
      // Bandera Peruana de 1879
      ctx.fillStyle = '#b81414'; // Rojo izquierda
      ctx.fillRect(0, 0, 85, 160);

      ctx.fillStyle = '#ffffff'; // Blanco centro
      ctx.fillRect(85, 0, 86, 160);

      ctx.fillStyle = '#b81414'; // Rojo derecha
      ctx.fillRect(171, 0, 85, 160);

      // Escudo Nacional en el centro
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
    let x = cx;
    let y = cy;
    let step = Math.PI / spikes;

    ctx.beginPath();
    ctx.moveTo(cx, cy - outerRadius);
    for (let i = 0; i < spikes; i++) {
      x = cx + Math.cos(rot) * outerRadius;
      y = cy + Math.sin(rot) * outerRadius;
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

  createWavingFlag(country, width = 4, height = 2.5) {
    const geom = new THREE.PlaneGeometry(width, height, 12, 8);
    const texture = this.createFlagTexture(country);
    const mat = new THREE.MeshStandardMaterial({
      map: texture,
      side: THREE.DoubleSide,
      roughness: 0.7,
      metalness: 0.05
    });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.userData.isFlag = true;
    mesh.userData.baseVertices = geom.attributes.position.clone();
    return mesh;
  },

  // -------------------------------------------------------------
  // 1. MONITOR HUÁSCAR (Perú - Comandante Miguel Grau)
  // -------------------------------------------------------------
  createHuascar() {
    this.initMaterials();
    const ship = new THREE.Group();
    ship.name = "Huascar";

    // A. Casco de bajo francobordo con espolón afilado
    const hullGroup = new THREE.Group();

    // Casco principal (sección media de hierro remachado)
    const hullMainGeom = new THREE.BoxGeometry(11, 4.2, 54);
    const hullMain = new THREE.Mesh(hullMainGeom, this.materials.ironPlateDark);
    hullMain.position.y = 1.1;
    hullMain.castShadow = true;
    hullMain.receiveShadow = true;
    hullGroup.add(hullMain);

    // Obra viva / Fondo con pintura anti-incrustante roja
    const hullBottomGeom = new THREE.BoxGeometry(10.6, 2.2, 52);
    const hullBottom = new THREE.Mesh(hullBottomGeom, this.materials.redWaterline);
    hullBottom.position.y = -1.2;
    hullGroup.add(hullBottom);

    // Proa afilada con espolón de hierro
    const bowGeom = new THREE.ConeGeometry(5.2, 16, 4);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(1, 0.45, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.ironPlateDark);
    bow.position.set(0, 1.1, 32);
    bow.castShadow = true;
    hullGroup.add(bow);

    // Espolón letal subacuático
    const ramGeom = new THREE.ConeGeometry(1.6, 6, 4);
    ramGeom.rotateX(Math.PI / 2);
    const ram = new THREE.Mesh(ramGeom, this.materials.cannonMetal);
    ram.position.set(0, -0.6, 38);
    hullGroup.add(ram);

    // Popa redondeada
    const sternGeom = new THREE.CylinderGeometry(5.2, 4.6, 4.2, 16, 1, false, 0, Math.PI);
    sternGeom.rotateY(-Math.PI / 2);
    const stern = new THREE.Mesh(sternGeom, this.materials.ironPlateDark);
    stern.position.set(0, 1.1, -27);
    hullGroup.add(stern);

    // Cubierta de teca
    const deckGeom = new THREE.PlaneGeometry(10.5, 52);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 3.22;
    deck.receiveShadow = true;
    hullGroup.add(deck);

    ship.add(hullGroup);

    // B. Torre Blindada Giratoria Coles con 2 cañones Armstrong de 300 lbs
    const turretGroup = new THREE.Group();
    turretGroup.position.set(0, 3.2, 12);
    turretGroup.name = "TurretColes";

    const turretBodyGeom = new THREE.CylinderGeometry(4.8, 5.0, 3.4, 24);
    const turretBody = new THREE.Mesh(turretBodyGeom, this.materials.ironArmorPlates);
    turretBody.position.y = 1.7;
    turretBody.castShadow = true;
    turretGroup.add(turretBody);

    // Dos cañones Armstrong colosales de 300 lbs
    [-1.2, 1.2].forEach(xOffset => {
      const barrelGeom = new THREE.CylinderGeometry(0.48, 0.65, 8.5, 16);
      barrelGeom.rotateX(Math.PI / 2);
      const barrel = new THREE.Mesh(barrelGeom, this.materials.cannonMetal);
      barrel.position.set(xOffset, 2.0, 4.6);
      barrel.castShadow = true;
      turretGroup.add(barrel);

      // Anillo de boca de cañón
      const muzzleGeom = new THREE.TorusGeometry(0.5, 0.1, 8, 16);
      const muzzle = new THREE.Mesh(muzzleGeom, this.materials.brassGold);
      muzzle.position.set(xOffset, 2.0, 8.8);
      turretGroup.add(muzzle);
    });

    ship.add(turretGroup);
    ship.userData.turret = turretGroup;

    // C. Torreta Hexagonal de Mando (donde se apostaba Miguel Grau)
    const bridgeGeom = new THREE.CylinderGeometry(2.2, 2.4, 4.8, 6);
    const bridge = new THREE.Mesh(bridgeGeom, this.materials.ironArmorPlates);
    bridge.position.set(0, 5.4, -4);
    bridge.castShadow = true;
    ship.add(bridge);

    // Puente Volante (Flying bridge de madera y pasamanos de latón)
    const bridgePlatformGeom = new THREE.BoxGeometry(7, 0.4, 4);
    const bridgePlatform = new THREE.Mesh(bridgePlatformGeom, this.materials.deckWood);
    bridgePlatform.position.set(0, 7.8, -4);
    ship.add(bridgePlatform);

    // D. Chimenea de vapor negra con borde y silbato
    const chimneyGroup = new THREE.Group();
    chimneyGroup.position.set(0, 3.2, -12);

    const chimneyGeom = new THREE.CylinderGeometry(1.4, 1.5, 8.5, 16);
    const chimney = new THREE.Mesh(chimneyGeom, this.materials.funnelBlack);
    chimney.position.y = 4.25;
    chimney.castShadow = true;
    chimneyGroup.add(chimney);

    // Borde superior de la chimenea
    const chimneyRimGeom = new THREE.TorusGeometry(1.45, 0.15, 8, 16);
    chimneyRimGeom.rotateX(Math.PI / 2);
    const chimneyRim = new THREE.Mesh(chimneyRimGeom, this.materials.ironPlateDark);
    chimneyRim.position.y = 8.5;
    chimneyGroup.add(chimneyRim);

    // Silbato de bronce
    const whistleGeom = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 8);
    const whistle = new THREE.Mesh(whistleGeom, this.materials.brassGold);
    whistle.position.set(1.5, 5, 0);
    chimneyGroup.add(whistle);

    ship.add(chimneyGroup);
    ship.userData.chimney = chimneyGroup;

    // E. Mástil trípode de proa y mástil de popa
    const mastForeGeom = new THREE.CylinderGeometry(0.28, 0.38, 22, 12);
    const mastFore = new THREE.Mesh(mastForeGeom, this.materials.ironPlateDark);
    mastFore.position.set(0, 13.5, 20);
    ship.add(mastFore);

    const mastAftGeom = new THREE.CylinderGeometry(0.25, 0.35, 20, 12);
    const mastAft = new THREE.Mesh(mastAftGeom, this.materials.ironPlateDark);
    mastAft.position.set(0, 12.5, -20);
    ship.add(mastAft);

    // F. Banderas y Gallardetes (Bandera Peruana al asta de popa)
    const flagPoleGeom = new THREE.CylinderGeometry(0.08, 0.12, 7, 8);
    const flagPole = new THREE.Mesh(flagPoleGeom, this.materials.darkWood);
    flagPole.position.set(0, 6.2, -26.5);
    flagPole.rotation.x = -0.2;
    ship.add(flagPole);

    const flagPeru = this.createWavingFlag('peru', 4.2, 2.6);
    flagPeru.position.set(0, 8.0, -28.5);
    flagPeru.rotation.y = Math.PI / 2;
    ship.add(flagPeru);
    ship.userData.flag = flagPeru;

    // Botes salvavidas laterales en pescantes
    [-5.6, 5.6].forEach(x => {
      const boatGeom = new THREE.BoxGeometry(1.6, 1.2, 6);
      const boat = new THREE.Mesh(boatGeom, this.materials.whiteStripe);
      boat.position.set(x, 4.5, -10);
      boat.castShadow = true;
      ship.add(boat);
    });

    ship.scale.set(0.95, 0.95, 0.95);
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

    // Casco de madera clásico (negro con franja blanca de portas)
    const hullGeom = new THREE.BoxGeometry(10, 5.5, 52);
    const hull = new THREE.Mesh(hullGeom, this.materials.darkWood);
    hull.position.y = 2.0;
    hull.castShadow = true;
    hull.receiveShadow = true;
    hullGroup.add(hull);

    // Fondo cobreado bajo la línea de agua
    const copperBottomGeom = new THREE.BoxGeometry(9.6, 2.5, 50);
    const copperBottom = new THREE.Mesh(copperBottomGeom, this.materials.redWaterline);
    copperBottom.position.y = -1.2;
    hullGroup.add(copperBottom);

    // Franja blanca histórica con portas de cañones
    const stripeGeom = new THREE.BoxGeometry(10.2, 1.2, 46);
    const stripe = new THREE.Mesh(stripeGeom, this.materials.whiteStripe);
    stripe.position.y = 2.8;
    hullGroup.add(stripe);

    // Proa de corbeta con tajamar y mascarón
    const bowGeom = new THREE.ConeGeometry(5, 14, 4);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(1, 0.6, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.darkWood);
    bow.position.set(0, 2.2, 31);
    hullGroup.add(bow);

    // Bauprés prominente de madera
    const bowspritGeom = new THREE.CylinderGeometry(0.25, 0.45, 14, 12);
    bowspritGeom.rotateX(Math.PI / 2 - 0.25);
    const bowsprit = new THREE.Mesh(bowspritGeom, this.materials.darkWood);
    bowsprit.position.set(0, 4.8, 38);
    hullGroup.add(bowsprit);

    // Alcázar elevado a popa (donde arengó Prat)
    const sternDeckGeom = new THREE.BoxGeometry(9.8, 1.4, 14);
    const sternDeck = new THREE.Mesh(sternDeckGeom, this.materials.deckWood);
    sternDeck.position.set(0, 4.8, -19);
    hullGroup.add(sternDeck);

    // Castillo de proa elevado
    const foreDeckGeom = new THREE.BoxGeometry(9.6, 1.2, 10);
    const foreDeck = new THREE.Mesh(foreDeckGeom, this.materials.deckWood);
    foreDeck.position.set(0, 4.6, 20);
    hullGroup.add(foreDeck);

    // Cubierta principal de teca
    const deckGeom = new THREE.PlaneGeometry(9.6, 50);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 4.76;
    deck.receiveShadow = true;
    hullGroup.add(deck);

    // Batería lateral de cañones Armstrong de 40 libras (7 por banda)
    const cannons = [];
    [-4.8, 4.8].forEach((xSide, sideIndex) => {
      const zPositions = [-14, -9, -4, 1, 6, 11, 16];
      zPositions.forEach(z => {
        const portHoleGeom = new THREE.BoxGeometry(0.2, 0.8, 0.8);
        const portHole = new THREE.Mesh(portHoleGeom, this.materials.cannonMetal);
        portHole.position.set(xSide, 2.8, z);
        hullGroup.add(portHole);

        const cannonGeom = new THREE.CylinderGeometry(0.22, 0.32, 2.6, 12);
        cannonGeom.rotateZ(Math.PI / 2);
        const cannon = new THREE.Mesh(cannonGeom, this.materials.cannonMetal);
        cannon.position.set(xSide + (sideIndex === 0 ? -1.0 : 1.0), 2.8, z);
        cannon.castShadow = true;
        hullGroup.add(cannon);
        cannons.push(cannon);
      });
    });
    ship.userData.cannons = cannons;

    ship.add(hullGroup);

    // Chimenea de vapor central negra (con calderas averiadas)
    const chimneyGeom = new THREE.CylinderGeometry(0.9, 0.95, 8, 16);
    const chimney = new THREE.Mesh(chimneyGeom, this.materials.funnelBlack);
    chimney.position.set(0, 7.8, -2);
    chimney.castShadow = true;
    ship.add(chimney);
    ship.userData.chimney = chimney;

    // Tres mástiles imponentes (Trinquete, Mayor, Mesana)
    const mastHeights = [28, 32, 26];
    const mastZPositions = [14, 0, -14];
    const mastNames = ['Trinquete', 'Mayor', 'Mesana'];

    mastZPositions.forEach((z, i) => {
      const mastGroup = new THREE.Group();
      mastGroup.position.set(0, 4.5, z);
      mastGroup.name = mastNames[i];

      // Mástil de madera
      const mastGeom = new THREE.CylinderGeometry(0.25, 0.45, mastHeights[i], 12);
      const mast = new THREE.Mesh(mastGeom, this.materials.darkWood);
      mast.position.y = mastHeights[i] / 2;
      mast.castShadow = true;
      mastGroup.add(mast);

      // Vergas horizontales (3 por mástil)
      [0.4, 0.65, 0.88].forEach((hRatio, idx) => {
        const yardWidth = 14 * (1 - idx * 0.22);
        const yardGeom = new THREE.CylinderGeometry(0.12, 0.16, yardWidth, 8);
        yardGeom.rotateZ(Math.PI / 2);
        const yard = new THREE.Mesh(yardGeom, this.materials.darkWood);
        yard.position.set(0, mastHeights[i] * hRatio, 0);
        yard.castShadow = true;
        mastGroup.add(yard);

        // Velas recogidas o desplegadas al viento
        const sailGeom = new THREE.PlaneGeometry(yardWidth * 0.92, 3.8);
        const sail = new THREE.Mesh(sailGeom, this.materials.canvasSail);
        sail.position.set(0, mastHeights[i] * hRatio - 2.0, 0.2);
        sail.castShadow = true;
        mastGroup.add(sail);
      });

      // Cofa de vigía
      const crowsNestGeom = new THREE.CylinderGeometry(1.4, 1.2, 0.8, 12);
      const crowsNest = new THREE.Mesh(crowsNestGeom, this.materials.darkWood);
      crowsNest.position.y = mastHeights[i] * 0.55;
      mastGroup.add(crowsNest);

      ship.add(mastGroup);
    });

    // Pabellón Nacional Chileno al pico del palo mesana (¡Que nunca se arríe!)
    const flagStaffGeom = new THREE.CylinderGeometry(0.08, 0.12, 8, 8);
    const flagStaff = new THREE.Mesh(flagStaffGeom, this.materials.darkWood);
    flagStaff.position.set(0, 16, -18);
    flagStaff.rotation.x = -0.4;
    ship.add(flagStaff);

    const flagChile = this.createWavingFlag('chile', 4.8, 3.0);
    flagChile.position.set(0, 18.5, -21);
    flagChile.rotation.y = Math.PI / 2;
    ship.add(flagChile);
    ship.userData.flag = flagChile;

    // Rueda del timón en el alcázar
    const wheelGeom = new THREE.TorusGeometry(0.6, 0.08, 8, 16);
    const wheel = new THREE.Mesh(wheelGeom, this.materials.brassGold);
    wheel.position.set(0, 5.8, -23);
    ship.add(wheel);

    ship.scale.set(0.95, 0.95, 0.95);
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

    // Casco esbelto y ágil de poco calado
    const hullGeom = new THREE.BoxGeometry(7.8, 4.2, 38);
    const hull = new THREE.Mesh(hullGeom, this.materials.darkWood);
    hull.position.y = 1.6;
    hull.castShadow = true;
    hullGroup.add(hull);

    // Fondo cobreado bajo
    const copperBottomGeom = new THREE.BoxGeometry(7.4, 1.8, 36);
    const copperBottom = new THREE.Mesh(copperBottomGeom, this.materials.redWaterline);
    copperBottom.position.y = -0.8;
    hullGroup.add(copperBottom);

    // Filete dorado de goleta
    const stripeGeom = new THREE.BoxGeometry(8.0, 0.6, 34);
    const stripe = new THREE.Mesh(stripeGeom, this.materials.brassGold);
    stripe.position.y = 2.4;
    hullGroup.add(stripe);

    // Proa afilada
    const bowGeom = new THREE.ConeGeometry(4.0, 11, 4);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(1, 0.6, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.darkWood);
    bow.position.set(0, 1.7, 22);
    hullGroup.add(bow);

    // Bauprés de goleta largo
    const bowspritGeom = new THREE.CylinderGeometry(0.18, 0.35, 12, 12);
    bowspritGeom.rotateX(Math.PI / 2 - 0.2);
    const bowsprit = new THREE.Mesh(bowspritGeom, this.materials.darkWood);
    bowsprit.position.set(0, 3.6, 28);
    hullGroup.add(bowsprit);

    // Cubierta
    const deckGeom = new THREE.PlaneGeometry(7.4, 36);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 3.72;
    hullGroup.add(deck);

    ship.add(hullGroup);

    // Cañón de colisa Armstrong de 70 libras a popa (pieza clave del combate)
    const pivotMountGeom = new THREE.CylinderGeometry(1.2, 1.4, 0.8, 16);
    const pivotMount = new THREE.Mesh(pivotMountGeom, this.materials.ironArmorPlates);
    pivotMount.position.set(0, 4.1, -12);
    ship.add(pivotMount);

    const gun70Geom = new THREE.CylinderGeometry(0.3, 0.45, 5.0, 12);
    gun70Geom.rotateX(Math.PI / 2);
    const gun70 = new THREE.Mesh(gun70Geom, this.materials.cannonMetal);
    gun70.position.set(0, 4.8, -13.5);
    gun70.castShadow = true;
    ship.add(gun70);
    ship.userData.gun70 = gun70;

    // Dos cañones de 9 libras en las bandas
    [-3.8, 3.8].forEach(x => {
      const gun9Geom = new THREE.CylinderGeometry(0.18, 0.25, 2.2, 10);
      gun9Geom.rotateZ(Math.PI / 2);
      const gun9 = new THREE.Mesh(gun9Geom, this.materials.cannonMetal);
      gun9.position.set(x, 4.0, 2);
      ship.add(gun9);
    });

    // Chimenea de vapor delgada
    const funnelGeom = new THREE.CylinderGeometry(0.65, 0.7, 6.5, 12);
    const funnel = new THREE.Mesh(funnelGeom, this.materials.funnelBlack);
    funnel.position.set(0, 6.8, -3);
    ship.add(funnel);
    ship.userData.chimney = funnel;

    // Dos mástiles inclinados hacia popa (aparejo de goleta)
    [7, -8].forEach((z, idx) => {
      const mastGeom = new THREE.CylinderGeometry(0.2, 0.35, 22, 10);
      const mast = new THREE.Mesh(mastGeom, this.materials.darkWood);
      mast.position.set(0, 14, z);
      mast.rotation.x = -0.12; // Inclinación elegante
      mast.castShadow = true;
      ship.add(mast);

      // Botavaras y velas cangrejas
      const boomGeom = new THREE.CylinderGeometry(0.1, 0.15, 10, 8);
      boomGeom.rotateX(Math.PI / 2);
      const boom = new THREE.Mesh(boomGeom, this.materials.darkWood);
      boom.position.set(0, 7.5, z - 4.5);
      ship.add(boom);

      const gaffSailGeom = new THREE.PlaneGeometry(9, 6);
      const gaffSail = new THREE.Mesh(gaffSailGeom, this.materials.canvasSail);
      gaffSail.position.set(0, 10.5, z - 4.5);
      gaffSail.rotation.y = Math.PI / 2;
      ship.add(gaffSail);
    });

    // Bandera Chilena a popa
    const flagChile = this.createWavingFlag('chile', 3.6, 2.2);
    flagChile.position.set(0, 8.5, -19);
    flagChile.rotation.y = Math.PI / 2;
    ship.add(flagChile);
    ship.userData.flag = flagChile;

    ship.scale.set(0.9, 0.9, 0.9);
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

    // Casco enorme, macizo e imponente (2.000 toneladas)
    const hullGeom = new THREE.BoxGeometry(13.5, 6.2, 65);
    const hull = new THREE.Mesh(hullGeom, this.materials.ironPlateDark);
    hull.position.y = 2.4;
    hull.castShadow = true;
    hull.receiveShadow = true;
    hullGroup.add(hull);

    // Carena y obra viva roja
    const bottomGeom = new THREE.BoxGeometry(13.0, 3.2, 62);
    const bottom = new THREE.Mesh(bottomGeom, this.materials.redWaterline);
    bottom.position.y = -1.6;
    hullGroup.add(bottom);

    // Casamata central acorazada
    const casemateGeom = new THREE.BoxGeometry(14.0, 4.2, 34);
    const casemate = new THREE.Mesh(casemateGeom, this.materials.ironArmorPlates);
    casemate.position.y = 6.2;
    casemate.castShadow = true;
    hullGroup.add(casemate);

    // Proa masiva con espolón de hierro
    const bowGeom = new THREE.ConeGeometry(6.6, 20, 4);
    bowGeom.rotateX(Math.PI / 2);
    bowGeom.scale(1, 0.5, 1);
    const bow = new THREE.Mesh(bowGeom, this.materials.ironPlateDark);
    bow.position.set(0, 2.4, 38);
    hullGroup.add(bow);

    // Espolón
    const ramGeom = new THREE.ConeGeometry(2.0, 7, 4);
    ramGeom.rotateX(Math.PI / 2);
    const ram = new THREE.Mesh(ramGeom, this.materials.cannonMetal);
    ram.position.set(0, 0.2, 45);
    hullGroup.add(ram);

    // Cubierta
    const deckGeom = new THREE.PlaneGeometry(13.2, 62);
    deckGeom.rotateX(-Math.PI / 2);
    const deck = new THREE.Mesh(deckGeom, this.materials.deckWood);
    deck.position.y = 5.52;
    hullGroup.add(deck);

    // Baterías pesadas de casamata (Armstrong 150 lbs y 70 lbs)
    const heavyCannons = [];
    [-6.8, 6.8].forEach((x, sideIdx) => {
      [-12, -6, 0, 6, 12].forEach(z => {
        const gunGeom = new THREE.CylinderGeometry(0.42, 0.55, 3.8, 12);
        gunGeom.rotateZ(Math.PI / 2);
        const gun = new THREE.Mesh(gunGeom, this.materials.cannonMetal);
        gun.position.set(x + (sideIdx === 0 ? -1.2 : 1.2), 6.2, z);
        gun.castShadow = true;
        hullGroup.add(gun);
        heavyCannons.push(gun);
      });
    });
    ship.userData.cannons = heavyCannons;

    ship.add(hullGroup);

    // Dos chimeneas humeantes
    [-5, 5].forEach(z => {
      const funnelGeom = new THREE.CylinderGeometry(1.3, 1.4, 9.5, 16);
      const funnel = new THREE.Mesh(funnelGeom, this.materials.funnelBlack);
      funnel.position.set(0, 10.5, z);
      funnel.castShadow = true;
      ship.add(funnel);
    });

    // Mástiles robustos de fragata con cofas acorazadas
    [-18, 18].forEach(z => {
      const mastGeom = new THREE.CylinderGeometry(0.35, 0.55, 28, 12);
      const mast = new THREE.Mesh(mastGeom, this.materials.darkWood);
      mast.position.set(0, 18, z);
      mast.castShadow = true;
      ship.add(mast);

      // Cofa de combate con tiradores
      const topGeom = new THREE.CylinderGeometry(2.0, 1.8, 1.2, 12);
      const top = new THREE.Mesh(topGeom, this.materials.ironArmorPlates);
      top.position.set(0, 22, z);
      ship.add(top);
    });

    // Bandera Peruana a popa
    const flagPeru = this.createWavingFlag('peru', 5.2, 3.2);
    flagPeru.position.set(0, 12, -33);
    flagPeru.rotation.y = Math.PI / 2;
    ship.add(flagPeru);
    ship.userData.flag = flagPeru;

    ship.scale.set(1.05, 1.05, 1.05);
    return ship;
  },

  // Animación del oleaje y banderas
  updateShipAnimation(ship, time, waveHeight = 0.4, rollFrequency = 1.2) {
    if (!ship) return;

    // Balanceo suave en el mar (Roll & Pitch)
    const seed = ship.position.x * 0.1 + ship.position.z * 0.1;
    const roll = Math.sin(time * rollFrequency + seed) * 0.045;
    const pitch = Math.cos(time * (rollFrequency * 0.8) + seed) * 0.025;
    const bobbing = Math.sin(time * 1.5 + seed) * (waveHeight * 0.35);

    ship.rotation.z = roll;
    ship.rotation.x = pitch;

    // Ondulación realista de banderas
    if (ship.userData.flag && ship.userData.flag.geometry) {
      const geom = ship.userData.flag.geometry;
      const pos = geom.attributes.position;
      const base = ship.userData.flag.userData.baseVertices;

      if (base) {
        for (let i = 0; i < pos.count; i++) {
          const u = base.getX(i);
          const v = base.getY(i);
          // Olas de viento viajando de un extremo al otro
          const waveZ = Math.sin(time * 5.5 + u * 2.0) * 0.22 * (u + 2.0);
          pos.setZ(i, waveZ);
        }
        pos.needsUpdate = true;
      }
    }
  }
};

window.ShipBuilder = ShipBuilder;
