/* ==========================================================================
   RACE SIMULATOR - UTILITY FUNCTIONS (js/utils.js)
   ========================================================================== */

const Utils = {
  // Generate random UUID
  generateId(prefix = 'id') {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  },

  cloneDriverAttributes(attrs) {
    const a = attrs || {};
    return {
      speed: a.speed ?? 85,
      acceleration: a.acceleration ?? 85,
      control: a.control ?? 85,
      braking: a.braking ?? 75,
      consistency: a.consistency ?? 85,
      shortcuts: a.shortcuts ?? 75
    };
  },

  // Format milliseconds into mm:ss.sss format
  formatTime(ms) {
    if (isNaN(ms) || ms === null || ms === undefined || ms <= 0) return '--:--.---';
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    const milliseconds = Math.floor(ms % 1000);

    const mStr = String(minutes).padStart(2, '0');
    const sStr = String(seconds).padStart(2, '0');
    const msStr = String(milliseconds).padStart(3, '0');

    return `${mStr}:${sStr}.${msStr}`;
  },

  // Format difference to leader (e.g., +2.184s or +1 Lap)
  formatGap(diffMs) {
    if (diffMs === 0 || diffMs === null || diffMs === undefined) return 'LEADER';
    const seconds = (diffMs / 1000).toFixed(3);
    return `+${seconds}s`;
  },

  // Clamp number between min and max
  clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  },

  // Random float between min and max
  randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  },

  // Random int between min and max inclusive
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  // Mapa de país → código ISO 3166-1 alpha-2
  // Compatível com flagcdn.com — cobre os ~100 países mais relevantes
  _countryCodeMap: {
    // América do Sul
    'Brasil': 'br', 'Brazil': 'br',
    'Argentina': 'ar',
    'Colômbia': 'co', 'Colombia': 'co',
    'Chile': 'cl',
    'Venezuela': 've',
    'Peru': 'pe',
    'Equador': 'ec', 'Ecuador': 'ec',
    'Bolívia': 'bo', 'Bolivia': 'bo',
    'Paraguai': 'py', 'Paraguay': 'py',
    'Uruguai': 'uy', 'Uruguay': 'uy',

    // América do Norte e Central
    'Estados Unidos': 'us', 'USA': 'us', 'United States': 'us',
    'Canadá': 'ca', 'Canada': 'ca',
    'México': 'mx', 'Mexico': 'mx',
    'Cuba': 'cu',
    'Porto Rico': 'pr', 'Puerto Rico': 'pr',
    'Costa Rica': 'cr',
    'Panamá': 'pa', 'Panama': 'pa',
    'Guatemala': 'gt',
    'Honduras': 'hn',
    'El Salvador': 'sv',
    'República Dominicana': 'do', 'Dominican Republic': 'do',
    'Jamaica': 'jm',
    'Trinidad e Tobago': 'tt', 'Trinidad and Tobago': 'tt',

    // Europa Ocidental
    'Alemanha': 'de', 'Germany': 'de',
    'França': 'fr', 'France': 'fr',
    'Itália': 'it', 'Italy': 'it',
    'Espanha': 'es', 'Spain': 'es',
    'Portugal': 'pt',
    'Reino Unido': 'gb', 'United Kingdom': 'gb', 'UK': 'gb', 'England': 'gb', 'Britain': 'gb',
    'Holanda': 'nl', 'Netherlands': 'nl', 'Países Baixos': 'nl',
    'Bélgica': 'be', 'Belgium': 'be',
    'Suíça': 'ch', 'Switzerland': 'ch',
    'Áustria': 'at', 'Austria': 'at',
    'Suécia': 'se', 'Sweden': 'se',
    'Noruega': 'no', 'Norway': 'no',
    'Dinamarca': 'dk', 'Denmark': 'dk',
    'Finlândia': 'fi', 'Finland': 'fi',
    'Irlanda': 'ie', 'Ireland': 'ie',
    'Islândia': 'is', 'Iceland': 'is',
    'Mônaco': 'mc', 'Monaco': 'mc',
    'Luxemburgo': 'lu', 'Luxembourg': 'lu',
    'Liechtenstein': 'li',
    'Andorra': 'ad',
    'Malta': 'mt',
    'Chipre': 'cy', 'Cyprus': 'cy',

    // Europa do Leste e Central
    'Rússia': 'ru', 'Russia': 'ru',
    'Polônia': 'pl', 'Poland': 'pl',
    'República Tcheca': 'cz', 'Czech Republic': 'cz', 'Czechia': 'cz',
    'Hungria': 'hu', 'Hungary': 'hu',
    'Romênia': 'ro', 'Romania': 'ro',
    'Bulgária': 'bg', 'Bulgaria': 'bg',
    'Eslováquia': 'sk', 'Slovakia': 'sk',
    'Eslovênia': 'si', 'Slovenia': 'si',
    'Croácia': 'hr', 'Croatia': 'hr',
    'Sérvia': 'rs', 'Serbia': 'rs',
    'Ucrânia': 'ua', 'Ukraine': 'ua',
    'Bielorrússia': 'by', 'Belarus': 'by',
    'Lituânia': 'lt', 'Lithuania': 'lt',
    'Letônia': 'lv', 'Latvia': 'lv',
    'Estônia': 'ee', 'Estonia': 'ee',
    'Grécia': 'gr', 'Greece': 'gr',
    'Albânia': 'al', 'Albania': 'al',
    'Bósnia e Herzegovina': 'ba', 'Bosnia and Herzegovina': 'ba',

    // Oriente Médio
    'Arábia Saudita': 'sa', 'Saudi Arabia': 'sa',
    'Emirados Árabes': 'ae', 'UAE': 'ae', 'United Arab Emirates': 'ae',
    'Catar': 'qa', 'Qatar': 'qa',
    'Bahrein': 'bh', 'Bahrain': 'bh',
    'Kuwait': 'kw',
    'Turquia': 'tr', 'Turkey': 'tr',
    'Israel': 'il',
    'Irã': 'ir', 'Iran': 'ir',
    'Iraque': 'iq', 'Iraq': 'iq',

    // Ásia
    'Japão': 'jp', 'Japan': 'jp',
    'China': 'cn',
    'Coreia do Sul': 'kr', 'South Korea': 'kr',
    'Coreia do Norte': 'kp', 'North Korea': 'kp',
    'Índia': 'in', 'India': 'in',
    'Indonésia': 'id', 'Indonesia': 'id',
    'Malásia': 'my', 'Malaysia': 'my',
    'Tailândia': 'th', 'Thailand': 'th',
    'Singapura': 'sg', 'Singapore': 'sg',
    'Filipinas': 'ph', 'Philippines': 'ph',
    'Vietnã': 'vn', 'Vietnam': 'vn',
    'Paquistão': 'pk', 'Pakistan': 'pk',
    'Bangladesh': 'bd',
    'Sri Lanka': 'lk',
    'Nepal': 'np',
    'Myanmar': 'mm',
    'Camboja': 'kh', 'Cambodia': 'kh',
    'Hong Kong': 'hk',
    'Taiwan': 'tw',
    'Azerbaijão': 'az', 'Azerbaijan': 'az',
    'Cazaquistão': 'kz', 'Kazakhstan': 'kz',
    'Uzbequistão': 'uz', 'Uzbekistan': 'uz',

    // África
    'África do Sul': 'za', 'South Africa': 'za',
    'Egito': 'eg', 'Egypt': 'eg',
    'Nigéria': 'ng', 'Nigeria': 'ng',
    'Quênia': 'ke', 'Kenya': 'ke',
    'Etiópia': 'et', 'Ethiopia': 'et',
    'Marrocos': 'ma', 'Morocco': 'ma',
    'Argélia': 'dz', 'Algeria': 'dz',
    'Tunísia': 'tn', 'Tunisia': 'tn',
    'Gana': 'gh', 'Ghana': 'gh',
    'Senegal': 'sn',
    'Angola': 'ao',
    'Moçambique': 'mz', 'Mozambique': 'mz',
    'Tanzânia': 'tz', 'Tanzania': 'tz',
    'Camarões': 'cm', 'Cameroon': 'cm',
    'Costa do Marfim': 'ci', "Ivory Coast": 'ci',
    'Líbia': 'ly', 'Libya': 'ly',

    // Oceania
    'Austrália': 'au', 'Australia': 'au',
    'Nova Zelândia': 'nz', 'New Zealand': 'nz',
    'Papua Nova Guiné': 'pg', 'Papua New Guinea': 'pg',

    // Especiais
    'Global': 'un', 'Internacional': 'un', 'Sem País': 'un'
  },

  // Retorna lista de países únicos (nome canônico) ordenada alfabeticamente
  // — usada para popular selects de nacionalidade
  getCountryList() {
    // Filtra apenas entradas cujo valor ainda não foi visto (evita duplicatas como 'Brazil'/'Brasil')
    const seen = new Set();
    const list = [];
    for (const [name, code] of Object.entries(this._countryCodeMap)) {
      if (!seen.has(code) && code !== 'un') {
        seen.add(code);
        list.push({ name, code });
      }
    }
    return list.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  },

  // Versão texto pura da bandeira — para usar dentro de <option> e outros contextos sem HTML
  // Usa o emoji Regional Indicator (funciona em todos os SOs modernos como bandeira colorida)
  getCountryFlagText(countryName) {
    if (!countryName) return '🏁';
    const code = this._countryCodeMap[countryName];
    if (!code || code === 'un') return '🌍';
    // Converte código ISO para emoji de bandeira (Regional Indicator)
    return code.toUpperCase().split('').map(c =>
      String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
    ).join('');
  },

  // Retorna um elemento <img> com a bandeira em PNG via flagcdn.com (CDN gratuito, sem autenticação).
  // Quando offline, exibe o fallback CSS com as iniciais do código do país.
  getCountryFlag(countryName) {
    if (!countryName) return '<span class="cflag cflag-unknown" title="?">🏁</span>';
    const code = this._countryCodeMap[countryName];
    if (!code) {
      // País não mapeado: mostra iniciais
      const initials = countryName.slice(0, 2).toUpperCase();
      return `<span class="cflag cflag-text" title="${this.escapeHtml(countryName)}" aria-label="${this.escapeHtml(countryName)}">${initials}</span>`;
    }
    // Imagem PNG 20×15 via flagcdn.com (funciona online)
    // O atributo onerror troca para o fallback CSS imediatamente se offline
    return `<img
      class="cflag"
      src="https://flagcdn.com/w20/${code}.png"
      srcset="https://flagcdn.com/w40/${code}.png 2x"
      width="20" height="15"
      alt="${this.escapeHtml(countryName)}"
      title="${this.escapeHtml(countryName)}"
      loading="lazy"
      onerror="this.onerror=null;this.replaceWith(Utils._flagFallback('${code}','${this.escapeHtml(countryName)}'))">`;
  },

  // Cria elemento de fallback offline (CSS puro, sem imagem externa)
  _flagFallback(code, label) {
    const el = document.createElement('span');
    el.className = 'cflag cflag-css';
    el.title = label;
    el.setAttribute('aria-label', label);
    el.setAttribute('data-code', code);
    // Converte o código ISO em Regional Indicator Unicode para o emoji de bandeira
    // Funciona em qualquer OS moderno como emoji nativos do sistema
    const flag = code.toUpperCase().split('').map(c =>
      String.fromCodePoint(0x1F1E6 - 65 + c.charCodeAt(0))
    ).join('');
    el.textContent = flag;
    return el;
  },

  // Sanitize text for HTML injection
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
