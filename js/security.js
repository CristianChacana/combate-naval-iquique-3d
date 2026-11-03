/**
 * Módulo de Seguridad y Sanitización (Defensa en Profundidad)
 * - Protección contra DOM-based XSS (Cross-Site Scripting)
 * - Validación e Higienización de Entradas y localStorage
 * - Prevención de Contaminación de Prototipos (Prototype Pollution)
 */

const Security = {
  // Escapado riguroso de caracteres HTML
  escapeHTML(str) {
    if (typeof str !== 'string') {
      return '';
    }
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#x27;',
      '/': '&#x2F;',
      '`': '&#96;'
    };
    return str.replace(/[&<>"'/`]/g, char => map[char]);
  },

  // Desinfectar texto plano (elimina etiquetas HTML y caracteres de control)
  sanitizeText(str, maxLength = 500) {
    if (typeof str !== 'string') return '';
    // Recortar longitud para evitar ataques DoS por sobrecarga de memoria
    const trimmed = str.slice(0, maxLength).trim();
    // Reemplazar cualquier intento de inyección de script o etiquetas
    return trimmed.replace(/<[^>]*>?/gm, '');
  },

  // Validación estricta del esquema de preguntas para evitar manipulación de localStorage
  validateQuestion(q) {
    if (!q || typeof q !== 'object' || Array.isArray(q)) {
      return null;
    }

    // Proteger contra contaminación de prototipos
    const cleanQ = Object.create(null);

    cleanQ.id = typeof q.id === 'string' && q.id.length < 50 ? this.sanitizeText(q.id, 50) : `q_${Date.now()}`;
    cleanQ.scenario = (q.scenario === 'punta_gruesa' || q.scenario === 'iquique') ? q.scenario : 'punta_gruesa';
    cleanQ.title = this.sanitizeText(q.title || 'Pregunta Táctica', 100);
    cleanQ.question = this.sanitizeText(q.question || '', 500);

    // Validar opciones (deben ser un arreglo exactamente de strings)
    if (!Array.isArray(q.options) || q.options.length < 2 || q.options.length > 6) {
      return null;
    }

    cleanQ.options = q.options.map(opt => this.sanitizeText(opt, 200));

    // Validar índice correcto (entero dentro del rango de opciones)
    const cIdx = parseInt(q.correctIndex, 10);
    cleanQ.correctIndex = (!isNaN(cIdx) && cIdx >= 0 && cIdx < cleanQ.options.length) ? cIdx : 0;

    cleanQ.explanation = this.sanitizeText(q.explanation || 'Información histórica.', 1000);
    cleanQ.actionText = this.sanitizeText(q.actionText || '¡Maniobra naval ejecutada!', 150);

    // La pregunta debe tener texto válido
    if (!cleanQ.question || cleanQ.options.some(opt => !opt)) {
      return null;
    }

    return cleanQ;
  },

  // Validación de la base de datos completa de preguntas
  validateQuestionsDatabase(data) {
    if (!data || typeof data !== 'object' || Array.isArray(data)) {
      return null;
    }

    const cleanDB = Object.create(null);
    cleanDB.punta_gruesa = [];
    cleanDB.iquique = [];

    if (Array.isArray(data.punta_gruesa)) {
      data.punta_gruesa.forEach(q => {
        const validated = this.validateQuestion(q);
        if (validated) cleanDB.punta_gruesa.push(validated);
      });
    }

    if (Array.isArray(data.iquique)) {
      data.iquique.forEach(q => {
        const validated = this.validateQuestion(q);
        if (validated) cleanDB.iquique.push(validated);
      });
    }

    // Debe contener al menos una pregunta por escenario
    if (cleanDB.punta_gruesa.length === 0 || cleanDB.iquique.length === 0) {
      return null;
    }

    return cleanDB;
  }
};

window.Security = Security;
