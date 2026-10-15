/* ==========================================================================
   RACE SIMULATOR - TRACKS CRUD & SVG MODULE (js/tracks.js)
   ========================================================================== */

const Tracks = {
  searchTerm: '',
  countryFilter: 'all',
  sortBy: 'name-asc',
  renderList() {
    const allTracks = Storage.getTracks();
    const query = this.searchTerm.trim().toLowerCase();
    const countries = [...new Set(allTracks.map(track => track.country).filter(Boolean))]
      .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    const sortLabels = {
      'name-asc': 'Nome (A-Z)',
      'name-desc': 'Nome (Z-A)',
      'country-asc': 'País (A-Z)',
      'length-asc': 'Extensão (menor primeiro)',
      'length-desc': 'Extensão (maior primeiro)',
      'laps-asc': 'Voltas padrão (menor primeiro)',
      'laps-desc': 'Voltas padrão (maior primeiro)'
    };
    const sortComparators = {
      'name-asc': (a, b) => a.name.localeCompare(b.name, 'pt-BR'),
      'name-desc': (a, b) => b.name.localeCompare(a.name, 'pt-BR'),
      'country-asc': (a, b) => a.country.localeCompare(b.country, 'pt-BR') || a.name.localeCompare(b.name, 'pt-BR'),
      'length-asc': (a, b) => Number(a.lengthKm) - Number(b.lengthKm),
      'length-desc': (a, b) => Number(b.lengthKm) - Number(a.lengthKm),
      'laps-asc': (a, b) => Number(a.defaultLaps) - Number(b.defaultLaps),
      'laps-desc': (a, b) => Number(b.defaultLaps) - Number(a.defaultLaps)
    };
    const sortedTracks = [...allTracks].sort(sortComparators[this.sortBy] || sortComparators['name-asc']);
    const tracks = allTracks
      .filter(track => (!query || `${track.name} ${track.country}`.toLowerCase().includes(query)) &&
        (this.countryFilter === 'all' || track.country === this.countryFilter))
      .sort(sortComparators[this.sortBy] || sortComparators['name-asc']);

    return `
      <div class="glass-panel">
        <div class="panel-header">
          <div>
            <h2 class="panel-title">🏁 Gestão de Pistas & Circuitos</h2>
            <p style="color: var(--text-muted); font-size: 0.85rem; margin-top: 4px;">
              Circuitos vetoriais em SVG nativo onde ocorrem as disputas e simulações.
            </p>
          </div>
          <button class="btn btn-primary" onclick="Tracks.openModal()">+ Nova Pista</button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin-top: 16px;">
          <input class="form-input" placeholder="Pesquisar pista ou país..." value="${Utils.escapeHtml(this.searchTerm)}" oninput="Tracks.filter(this.value)">
          <select class="form-select" aria-label="Filtrar por país" onchange="Tracks.setCountryFilter(this.value)">
            <option value="all" ${this.countryFilter === 'all' ? 'selected' : ''}>Todos os países</option>
            ${countries.map(country => `<option value="${Utils.escapeHtml(country)}" ${this.countryFilter === country ? 'selected' : ''}>${Utils.escapeHtml(country)}</option>`).join('')}
          </select>
          <select class="form-select" aria-label="Ordenar pistas" onchange="Tracks.setSort(this.value)">
            ${Object.entries(sortLabels).map(([value, label]) => `<option value="${value}" ${this.sortBy === value ? 'selected' : ''}>Ordenar por: ${label}</option>`).join('')}
          </select>
        </div>
        <div id="tracks-count" style="font-size: 0.78rem; color: var(--text-dim); margin-top: 8px;">${tracks.length} de ${allTracks.length} pistas</div>

        <div class="grid-auto" style="margin-top: 20px;">
          ${sortedTracks.map(track => {
            const matchesSearch = !query || `${track.name} ${track.country}`.toLowerCase().includes(query);
            const matchesCountry = this.countryFilter === 'all' || track.country === this.countryFilter;
            return `
            <div class="glass-panel track-card" data-search="${Utils.escapeHtml(`${track.name} ${track.country}`)}" data-country="${Utils.escapeHtml(track.country)}" data-name="${Utils.escapeHtml(track.name)}" data-length="${Number(track.lengthKm) || 0}" data-laps="${Number(track.defaultLaps) || 0}" style="${matchesSearch && matchesCountry ? '' : 'display: none;'} padding: 16px; display: ${matchesSearch && matchesCountry ? 'flex' : 'none'}; flex-direction: column; gap: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                  <h3 style="font-size: 1.05rem; font-weight: 700;">${Utils.escapeHtml(track.name)}</h3>
                  <span style="font-size: 0.8rem; color: var(--text-muted);">
                    ${Utils.getCountryFlag(track.country)} ${Utils.escapeHtml(track.country)} • ${track.lengthKm} km
                  </span>
                </div>
                <span class="badge" style="background: var(--bg-tertiary); border: 1px solid var(--border-color);">
                  ${track.defaultLaps} Voltas
                </span>
              </div>

              <!-- SVG Track Preview -->
              <div style="background: rgba(0, 0, 0, 0.4); border-radius: var(--radius-md); height: 160px; display: flex; align-items: center; justify-content: center; padding: 10px; border: 1px solid var(--border-color);">
                <svg viewBox="${track.viewBox || '0 0 1000 600'}" style="width: 100%; height: 100%;">
                  <path d="${track.svgPath}" class="track-kerb-border" />
                  <path d="${track.svgPath}" class="track-asphalt-bg" />
                  <path d="${track.svgPath}" class="track-racing-line" />
                </svg>
              </div>

              <div style="display: flex; gap: 8px; margin-top: auto;">
                <button class="btn btn-secondary btn-sm" style="flex: 1;" onclick="Tracks.openModal('${track.id}')">Editar</button>
                ${allTracks.length > 1 ? `<button class="btn btn-danger btn-sm" onclick="Tracks.deleteTrack('${track.id}')">Excluir</button>` : ''}
              </div>
            </div>
          `}).join('')}
          <div id="tracks-empty-state" style="${tracks.length === 0 ? '' : 'display: none;'} color: var(--text-muted); padding: 20px;">Nenhuma pista encontrada.</div>
        </div>
      </div>
    `;
  },

  builderPoints: [],

  openModal(trackId = null) {
    const tracks = Storage.getTracks();
    const track = trackId ? tracks.find(t => t.id === trackId) : {
      id: '',
      name: '',
      country: 'Brasil',
      lengthKm: 4.5,
      defaultLaps: 15,
      viewBox: '0 0 1000 600',
      svgPath: 'M 200,450 C 100,450 100,200 250,200 C 400,200 450,350 600,350 C 750,350 850,200 900,300 C 950,400 800,500 600,500 C 400,500 350,450 200,450 Z',
      startProgress: 0,
      direction: 1
    };

    this.builderPoints = [];
    const isEdit = !!trackId;
    const modalHtml = `
      <div class="modal-backdrop active" id="track-modal">
        <div class="modal-content" style="max-width: 800px;">
          <div class="modal-header">
            <h3>${isEdit ? 'Editar Pista' : 'Criar Nova Pista (com Construtor de Pontos)'}</h3>
            <button class="btn btn-secondary btn-sm" onclick="App.closeModal('track-modal')">✕</button>
          </div>
          <form id="track-form" onsubmit="Tracks.saveForm(event)">
            <input type="hidden" id="track-id" value="${track.id}">
            <div class="modal-body">
              <div class="grid-2">
                <div class="form-group">
                  <label class="form-label">Nome do Circuito</label>
                  <input type="text" id="track-name" class="form-input" required value="${Utils.escapeHtml(track.name)}" placeholder="Ex: Silverstone Grand Prix">
                </div>
                <div class="form-group">
                  <label class="form-label">País</label>
                  <input type="text" id="track-country" class="form-input" required value="${Utils.escapeHtml(track.country)}" placeholder="Ex: Reino Unido">
                </div>
              </div>

              <div class="grid-3">
                <div class="form-group">
                  <label class="form-label">Extensão (km)</label>
                  <input type="number" step="0.001" id="track-length" class="form-input" required value="${track.lengthKm}">
                </div>
                <div class="form-group">
                  <label class="form-label">Voltas Padrão</label>
                  <input type="number" id="track-laps" class="form-input" required min="1" max="100" value="${track.defaultLaps}">
                </div>
                <div class="form-group">
                  <label class="form-label">SVG ViewBox</label>
                  <input type="text" id="track-viewbox" class="form-input" required value="${track.viewBox || '0 0 1000 600'}">
                </div>
              </div>

              <!-- Construtor Visual Interativo de Pistas -->
              <div style="background: rgba(0,0,0,0.3); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-color); margin-bottom: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <span style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--accent-cyan);">
                    ✏️ Construtor Visual (Clique na tela para ligar os pontos A ➔ B ➔ C...)
                  </span>
                  <div style="display: flex; gap: 6px;">
                    <button type="button" class="btn btn-secondary btn-sm" onclick="Tracks.undoPoint()">↩ Desfazer Ponto</button>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="Tracks.clearPoints()">🗑️ Limpar</button>
                    <button type="button" class="btn btn-primary btn-sm" onclick="Tracks.closeCircuit()">🔒 Fechar Circuito</button>
                  </div>
                </div>

                <div class="track-builder-canvas" id="builder-canvas" onclick="Tracks.handleCanvasClick(event)">
                  <svg id="builder-svg" viewBox="${track.viewBox || '0 0 1000 600'}" style="width: 100%; height: 100%;">
                    <path id="builder-path-bg" d="${track.svgPath}" class="track-asphalt-bg" />
                    <path id="builder-path-line" d="${track.svgPath}" class="track-racing-line" />
                    <line id="builder-start-line" class="builder-start-line" x1="0" y1="0" x2="0" y2="0" />
                    <path id="builder-direction-arrow" class="builder-direction-arrow" d="" />
                    <g id="builder-points-layer"></g>
                  </svg>
                </div>
                <div style="display: flex; gap: 8px; align-items: end; margin-top: 10px;">
                  <button type="button" class="btn btn-secondary btn-sm" onclick="Tracks.centerTrack()">🎯 Centralizar Pista</button>
                  <div class="form-group" style="flex: 1;">
                    <label class="form-label">Largada/Chegada no traçado (%)</label>
                    <input type="range" id="track-start-progress" class="form-input" min="0" max="99" value="${Math.round((track.startProgress || 0) * 100)}" oninput="Tracks.setStartProgress(this.value)">
                  </div>
                  <div class="form-group" style="flex: 1;">
                    <label class="form-label">Sentido</label>
                    <select id="track-direction" class="form-select" onchange="Tracks.setDirection(this.value)">
                      <option value="1" ${track.direction !== -1 ? 'selected' : ''}>Normal (horário)</option>
                      <option value="-1" ${track.direction === -1 ? 'selected' : ''}>Inverso (anti-horário)</option>
                    </select>
                  </div>
                </div>
                <div style="font-size: 0.72rem; color: var(--text-muted); margin-top: 6px;">
                  💡 <strong>Dica:</strong> Dê cliques ao redor da área para criar as curvas. Quando terminar, clique em <strong>"Fechar Circuito"</strong>!
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">SVG Path (Gerado automaticamente ou editável manualmente)</label>
                <textarea id="track-svg-path" class="form-textarea" rows="2" required placeholder="M 100,300 C...">${track.svgPath}</textarea>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" onclick="App.closeModal('track-modal')">Cancelar</button>
              <button type="submit" class="btn btn-primary">Salvar Circuito</button>
            </div>
          </form>
        </div>
      </div>
    `;
    App.showModal(modalHtml);
    this.setStartProgress(Math.round((track.startProgress || 0) * 100));

    // Live update preview on path typing - apenas atualiza visual, não altera o valor
    const pathTextarea = document.getElementById('track-svg-path');
    if (pathTextarea) {
      pathTextarea.addEventListener('input', (e) => {
        const p = document.getElementById('builder-path-bg');
        const l = document.getElementById('builder-path-line');
        if (p && l) {
          p.setAttribute('d', e.target.value);
          l.setAttribute('d', e.target.value);
        }
      });
    }
  },

  filter(term) {
    this.searchTerm = term;
    this.applyListFilters();
  },

  setCountryFilter(country) {
    this.countryFilter = country;
    this.applyListFilters();
  },

  setSort(sortBy) {
    this.sortBy = sortBy;
    this.applyListFilters();
  },

  applyListFilters() {
    const query = this.searchTerm.trim().toLowerCase();
    const sortComparators = {
      'name-asc': (a, b) => a.dataset.name.localeCompare(b.dataset.name, 'pt-BR'),
      'name-desc': (a, b) => b.dataset.name.localeCompare(a.dataset.name, 'pt-BR'),
      'country-asc': (a, b) => a.dataset.country.localeCompare(b.dataset.country, 'pt-BR') || a.dataset.name.localeCompare(b.dataset.name, 'pt-BR'),
      'length-asc': (a, b) => Number(a.dataset.length) - Number(b.dataset.length),
      'length-desc': (a, b) => Number(b.dataset.length) - Number(a.dataset.length),
      'laps-asc': (a, b) => Number(a.dataset.laps) - Number(b.dataset.laps),
      'laps-desc': (a, b) => Number(b.dataset.laps) - Number(a.dataset.laps)
    };
    const cards = [...document.querySelectorAll('.track-card[data-search]')];
    const grid = cards[0]?.parentElement;
    let visibleCount = 0;
    cards.sort(sortComparators[this.sortBy] || sortComparators['name-asc']).forEach(card => {
      const matchesSearch = !query || card.dataset.search.toLowerCase().includes(query);
      const matchesCountry = this.countryFilter === 'all' || card.dataset.country === this.countryFilter;
      card.style.display = matchesSearch && matchesCountry ? '' : 'none';
      if (matchesSearch && matchesCountry) visibleCount++;
      grid?.append(card);
    });
    const count = document.getElementById('tracks-count');
    if (count) count.textContent = `${visibleCount} de ${cards.length} pistas`;
    const emptyState = document.getElementById('tracks-empty-state');
    if (emptyState) emptyState.style.display = visibleCount === 0 ? '' : 'none';
  },

  centerTrack() {
    const svg = document.getElementById('builder-svg');
    const path = document.getElementById('builder-path-bg');
    if (!svg || !path) return;
    const box = path.getBBox();
    const padding = 45;
    const viewBox = `${box.x - padding} ${box.y - padding} ${box.width + padding * 2} ${box.height + padding * 2}`;
    svg.setAttribute('viewBox', viewBox);
    const viewBoxInput = document.getElementById('track-viewbox');
    if (viewBoxInput) viewBoxInput.value = viewBox;
  },

  setStartProgress(value) {
    const input = document.getElementById('track-start-progress');
    if (input && String(input.value) !== String(value)) input.value = value;
    this.updateTrackMarkers(Number(value) / 100, Number(document.getElementById('track-direction')?.value || 1));
  },

  setDirection(value) {
    const select = document.getElementById('track-direction');
    if (select && String(select.value) !== String(value)) select.value = value;
    this.updateTrackMarkers(Number(document.getElementById('track-start-progress')?.value || 0) / 100, Number(value));
  },

  updateTrackMarkers(startProgress, direction) {
    const path = document.getElementById('builder-path-bg');
    const line = document.getElementById('builder-start-line');
    const arrow = document.getElementById('builder-direction-arrow');
    if (!path || !line || !arrow) return;
    const length = path.getTotalLength();
    const distance = Math.max(0, Math.min(0.999, startProgress)) * length;
    const point = path.getPointAtLength(distance);
    const nextDistance = (distance + direction * Math.max(8, length * 0.015) + length) % length;
    const next = path.getPointAtLength(nextDistance);
    const dx = next.x - point.x;
    const dy = next.y - point.y;
    const size = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / size;
    const ny = dx / size;
    line.setAttribute('x1', point.x - nx * 18);
    line.setAttribute('y1', point.y - ny * 18);
    line.setAttribute('x2', point.x + nx * 18);
    line.setAttribute('y2', point.y + ny * 18);
    arrow.setAttribute('d', `M ${next.x},${next.y} L ${next.x - dx * 0.5 + nx * 7},${next.y - dy * 0.5 + ny * 7} L ${next.x - dx * 0.5 - nx * 7},${next.y - dy * 0.5 - ny * 7} Z`);
  },

  handleCanvasClick(event) {
    const svg = document.getElementById('builder-svg');
    if (!svg) return;

    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const svgPoint = point.matrixTransform(svg.getScreenCTM().inverse());
    const x = Math.round(svgPoint.x);
    const y = Math.round(svgPoint.y);

    const letter = String.fromCharCode(65 + (this.builderPoints.length % 26));
    this.builderPoints.push({ x, y, letter });
    this.updateBuilderDisplay();
  },

  undoPoint() {
    this.builderPoints.pop();
    this.updateBuilderDisplay();
  },

  clearPoints() {
    this.builderPoints = [];
    this.updateBuilderDisplay();
  },

  closeCircuit() {
    if (this.builderPoints.length < 3) {
      alert('Adicione pelo menos 3 pontos no circuito antes de fechar!');
      return;
    }
    this.updateBuilderDisplay(true);
  },

  updateBuilderDisplay(isClosed = false) {
    const pointsLayer = document.getElementById('builder-points-layer');
    const bgPath = document.getElementById('builder-path-bg');
    const linePath = document.getElementById('builder-path-line');
    const pathInput = document.getElementById('track-svg-path');

    if (!pointsLayer) return;
    pointsLayer.innerHTML = '';

    // Render Markers
    this.builderPoints.forEach((pt, index) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '7');
      circle.setAttribute('class', 'builder-point-marker');

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', pt.x);
      text.setAttribute('y', pt.y);
      text.setAttribute('class', 'builder-point-text');
      text.textContent = pt.letter;

      pointsLayer.appendChild(circle);
      pointsLayer.appendChild(text);
    });

    // Generate Path string
    if (this.builderPoints.length >= 2) {
      let d = `M ${this.builderPoints[0].x},${this.builderPoints[0].y} `;
      
      for (let i = 1; i < this.builderPoints.length; i++) {
        const prev = this.builderPoints[i - 1];
        const curr = this.builderPoints[i];
        // Generate smooth cubic bezier between points
        const cx1 = (prev.x + curr.x) / 2;
        const cy1 = prev.y;
        const cx2 = (prev.x + curr.x) / 2;
        const cy2 = curr.y;
        d += `C ${cx1},${cy1} ${cx2},${cy2} ${curr.x},${curr.y} `;
      }

      if (isClosed && this.builderPoints.length >= 3) {
        const last = this.builderPoints[this.builderPoints.length - 1];
        const first = this.builderPoints[0];
        const cx1 = (last.x + first.x) / 2;
        const cy1 = last.y;
        const cx2 = (last.x + first.x) / 2;
        const cy2 = first.y;
        d += `C ${cx1},${cy1} ${cx2},${cy2} ${first.x},${first.y} Z`;
      }

      if (bgPath) bgPath.setAttribute('d', d);
      if (linePath) linePath.setAttribute('d', d);
      if (pathInput) pathInput.value = d;
      this.updateTrackMarkers(Number(document.getElementById('track-start-progress')?.value || 0) / 100, Number(document.getElementById('track-direction')?.value || 1));
    }
  },

  normalizeSvgPath(path) {
    // Normalização mínima: apenas remove quebras de linha
    if (!path) return path;
    return path.replace(/[\r\n]+/g, ' ').trim();
  },

  validateSvgPath(path) {
    // Validação básica: apenas verifica se não está vazio
    if (!path || path.trim().length < 3) return false;
    return true;
  },

  saveForm(e) {
    e.preventDefault();

    const id = document.getElementById('track-id').value;
    const name = document.getElementById('track-name').value.trim();
    const country = document.getElementById('track-country').value.trim();
    const lengthKm = parseFloat(document.getElementById('track-length').value);
    const defaultLaps = parseInt(document.getElementById('track-laps').value, 10);
    const viewBox = document.getElementById('track-viewbox').value.trim();
    const svgPath = document.getElementById('track-svg-path').value.trim();
    const startProgress = parseInt(document.getElementById('track-start-progress').value, 10) / 100;
    const direction = parseInt(document.getElementById('track-direction').value, 10) === -1 ? -1 : 1;

    let tracks = Storage.getTracks();

    if (id) {
      tracks = tracks.map(t => t.id === id ? { ...t, name, country, lengthKm, defaultLaps, viewBox, svgPath, startProgress, direction } : t);
    } else {
      tracks.push({
        id: Utils.generateId('trk'),
        name,
        country,
        lengthKm,
        defaultLaps,
        viewBox,
        svgPath,
        startProgress,
        direction
      });
    }

    Storage.saveTracks(tracks);
    const modal = document.getElementById('track-modal');
    if (modal) modal.remove();
    App.navigateTo('tracks');
  },

  deleteTrack(id) {
    if (confirm('Tem certeza que deseja excluir esta pista?')) {
      let tracks = Storage.getTracks();
      tracks = tracks.filter(t => t.id !== id);
      Storage.saveTracks(tracks);
      App.navigateTo('tracks');
    }
  }
};

