# ⚓ Combate Naval de Iquique y Punta Gruesa 3D (1879)

Videojuego naval histórico en 3D desarrollado en Three.js con simulación física oceánica, modelado procedural de buques de la Guerra del Pacífico y mecánica de **Muerte Súbita (Sudden Death)**.

---

## 🚢 Buques y Combates Recreados

1. **Combate de Punta Gruesa (Acto 1)**:
   - **🇨🇱 Goleta Covadonga** (Comandante Carlos Condell de la Haza).
   - **🇵🇪 Fragata Blindada Independencia** (Comandante Juan Guillermo Moore).
   - *Maniobra táctica histórica:* Navegación sobre los bajos fondos rocosos para provocar el encallamiento del buque insignia peruano.

2. **Combate Naval de Iquique (Acto 2)**:
   - **🇨🇱 Corbeta Esmeralda** (Capitán Arturo Prat Chacón).
   - **🇵🇪 Monitor Blindado Huáscar** (Capitán Miguel Grau Seminario).
   - *Epopeya histórica:* Resistencia heroica ante el monitor acorazado, la arenga inmortal, los abordajes de Prat, Aldea y Serrano, y el último disparo de Ernesto Riquelme.

---

## 💀 Mecánica de Juego: Muerte Súbita

- **Cero margen de error:** Si el jugador falla una sola pregunta histórica o táctica, la artillería pesada enemiga o el espolón impactan fatalmente en el casco, desencadenando **GAME OVER INMEDIATO**.
- **Retroalimentación Histórica Educativa:** Al perder, la pantalla de derrota muestra en detalle:
  - La respuesta seleccionada por el jugador.
  - La respuesta correcta real.
  - La explicación histórica y táctica del suceso.
- **Acción Cinemática por Acierto:** Cada respuesta correcta activa maniobras náuticas 3D, salvas de artillería con balística parabólica, explosiones y el encallamiento/abordaje histórico.

---

## 🎮 Controles

| Tecla / Acción | Función |
| :--- | :--- |
| **[ 1 ], [ 2 ], [ 3 ], [ 4 ]** o Clic | Seleccionar alternativa (A, B, C, D) |
| **[ C ]** o Botones HUD | Alternar modos de cámara (Cinemática, Órbita 360°, Puente) |
| **[ M ]** o Botón HUD | Activar / Silenciar audio |
| **Arrastrar Ratón** | Rotar vista libremente en modo Órbita 360° |
| **Rueda del Ratón** | Zoom in / Zoom out en los buques |

---

## 🛠️ Banco y Editor de Preguntas Personalizadas

El juego incluye un botón **"📜 Banco de Preguntas"** en la barra inferior que permite:
1. Ver todas las preguntas predeterminadas de ambos combates.
2. **Agregar tus propias preguntas personalizadas** (indicando escenario, opciones, respuesta correcta y explicación).
3. Eliminar preguntas existentes.
4. Las modificaciones se guardan automáticamente en el almacenamiento local (`localStorage`) del navegador.
5. Botón de restablecimiento para volver en cualquier momento a las preguntas históricas originales.

---

## ⚙️ Arquitectura Técnica

- **Motor 3D:** Three.js r128 con WebGL, sombreado PBR, sombras dinámicas y tone mapping cinematográfico.
- **Simulación Oceánica:** Océano procedural dinámico con superposición de armónicos de olas del Pacífico optimizado a 60 FPS.
- **Audio Sintetizado:** Motor procedural con Web Audio API (cañones de avancarga y retrocarga, astillas de madera, salpicaduras, campana de zafarrancho de combate, marchas victoriosas y fúnebres), sin depender de archivos de audio externos.
- **Modelos 3D:** Modelado procedural riguroso de torre Coles giratoria, espolón, aparejos de corbeta, velamen, bauprés y banderas ondulantes chilenas y peruanas.
