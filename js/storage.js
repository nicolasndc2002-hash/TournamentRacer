/* ==========================================================================
   RACE SIMULATOR - LOCALSTORAGE REPOSITORY & SEED DATA (js/storage.js)
   ========================================================================== */

const STORAGE_KEYS = {
  SETTINGS: 'race_sim_settings',
  DRIVERS: 'race_sim_drivers',
  TEAMS: 'race_sim_teams',
  TRACKS: 'race_sim_tracks',
  SEASONS: 'race_sim_seasons',
  CURRENT_SEASON_ID: 'race_sim_curr_season_id',
  RANKS: 'race_sim_ranks',
  RANKS_RANKED: 'race_sim_ranks_ranked',
  RACE_HISTORY: 'race_sim_history',
  HALL_OF_FAME: 'race_sim_hall_of_fame',
  TEAM_DUELS: 'race_sim_team_duels',
  TIME_TRIALS: 'race_sim_time_trials',
  RANKED_STANDINGS: 'race_sim_ranked_standings',
  RANKED_HISTORY: 'race_sim_ranked_history',
  TEAM_DIVISIONS: 'race_sim_team_divisions',
  TOURNAMENTS: 'race_sim_tournaments'
};

const ACHIEVEMENT_SOURCE_STORAGE_KEYS = [
  STORAGE_KEYS.DRIVERS,
  STORAGE_KEYS.TEAMS,
  STORAGE_KEYS.SEASONS,
  STORAGE_KEYS.RACE_HISTORY,
  STORAGE_KEYS.TEAM_DUELS,
  STORAGE_KEYS.TIME_TRIALS,
  STORAGE_KEYS.RANKED_STANDINGS
];

const DEFAULT_SETTINGS = {
  theme: 'dark',
  simSpeed: 1, // 1x, 2x, 4x
  driverDisplayMode: 'number', // 'number' or 'code'
  categoryName: 'Tournament Racer GP',
  categoryLogo: '🏁',
  pointsSystem: [
    { pos: 1, points: 25 },
    { pos: 2, points: 18 },
    { pos: 3, points: 15 },
    { pos: 4, points: 12 },
    { pos: 5, points: 10 },
    { pos: 6, points: 8 },
    { pos: 7, points: 6 },
    { pos: 8, points: 4 },
    { pos: 9, points: 2 },
    { pos: 10, points: 1 }
  ],
  fastestLapPoint: 1,
  rankedSettings: {
    systemMode: 'mmr', // 'mmr' or 'elo'
    baseRating: 1200,
    kFactor: 32,
    ratingGainBase: 15,
    pointsSystem: [
      { pos: 1, pointsDelta: 45 },
      { pos: 2, pointsDelta: 30 },
      { pos: 3, pointsDelta: 20 },
      { pos: 4, pointsDelta: 10 },
      { pos: 5, pointsDelta: 5 },
      { pos: 6, pointsDelta: 0 },
      { pos: 7, pointsDelta: -5 },
      { pos: 8, pointsDelta: -10 },
      { pos: 9, pointsDelta: -20 },
      { pos: 10, pointsDelta: -30 }
    ]
  }
};

const DEFAULT_DIVISIONS = [
  { id: 'div_a', name: 'Série A', level: 1, maxTeams: 10, promoteCount: 0, relegateCount: 2, color: '#ffd700', icon: '🥇' },
  { id: 'div_b', name: 'Série B', level: 2, maxTeams: 10, promoteCount: 2, relegateCount: 2, color: '#c0c0c0', icon: '🥈' },
  { id: 'div_c', name: 'Série C', level: 3, maxTeams: 10, promoteCount: 2, relegateCount: 2, color: '#cd7f32', icon: '🥉' },
  { id: 'div_d', name: 'Série D', level: 4, maxTeams: 10, promoteCount: 2, relegateCount: 0, color: '#a855f7', icon: '🎗️' }
];

const DEFAULT_RANKS = [
  { id: 'rank_bronze', name: 'Bronze', minPoints: 0, color: '#cd7f32', icon: '🥉', order: 1 },
  { id: 'rank_silver', name: 'Silver', minPoints: 100, color: '#c0c0c0', icon: '🥈', order: 2 },
  { id: 'rank_gold', name: 'Gold', minPoints: 250, color: '#ffd700', icon: '🥇', order: 3 },
  { id: 'rank_platinum', name: 'Platinum', minPoints: 450, color: '#00e5ff', icon: '💎', order: 4 },
  { id: 'rank_diamond', name: 'Diamond', minPoints: 700, color: '#3b82f6', icon: '💠', order: 5 },
  { id: 'rank_master', name: 'Master', minPoints: 1000, color: '#a855f7', icon: '👑', order: 6 },
  { id: 'rank_legend', name: 'Legend', minPoints: 1400, color: '#ff3366', icon: '🔥', order: 7 }
];

const DEFAULT_RANKS_RANKED = [
  { id: 'rrank_iron', name: 'Ferro', minPoints: 0, color: '#6b7280', icon: '🔩', order: 1 },
  { id: 'rrank_bronze', name: 'Bronze', minPoints: 100, color: '#cd7f32', icon: '🥉', order: 2 },
  { id: 'rrank_silver', name: 'Prata', minPoints: 300, color: '#c0c0c0', icon: '🥈', order: 3 },
  { id: 'rrank_gold', name: 'Ouro', minPoints: 600, color: '#ffd700', icon: '🥇', order: 4 },
  { id: 'rrank_platinum', name: 'Platina', minPoints: 1000, color: '#00e5ff', icon: '💎', order: 5 },
  { id: 'rrank_diamond', name: 'Diamante', minPoints: 1500, color: '#3b82f6', icon: '💠', order: 6 },
  { id: 'rrank_master', name: 'Master', minPoints: 2000, color: '#a855f7', icon: '👑', order: 7 },
  { id: 'rrank_grandmaster', name: 'Grão-Mestre', minPoints: 2700, color: '#f59e0b', icon: '🌟', order: 8 },
  { id: 'rrank_legend', name: 'Lenda', minPoints: 3500, color: '#ff3366', icon: '🔥', order: 9 }
];

const DEFAULT_TEAMS = [
  { id: 'team_red_apex', name: 'Scuderia Veloce', color: '#ff1e1e', secondaryColor: '#ffffff', logo: '🏎️', divisionId: 'div_a', divisionHistory: [] },
  { id: 'team_silver_arrow', name: 'Stuttgart Dynamics', color: '#00e5ff', secondaryColor: '#121212', logo: '⚡', divisionId: 'div_a', divisionHistory: [] },
  { id: 'team_papaya_speed', name: 'Papaya Racing', color: '#ff8000', secondaryColor: '#0077ff', logo: '🚀', divisionId: 'div_a', divisionHistory: [] },
  { id: 'team_bull_energy', name: 'Vortex Energy', color: '#1e3a8a', secondaryColor: '#ef4444', logo: '🐂', divisionId: 'div_b', divisionHistory: [] }
];

const DEFAULT_DRIVERS = [
  {
    id: 'drv_1',
    name: 'Nicolas Rossi',
    code: 'ROS',
    number: 1,
    nationality: 'Itália',
    teamId: 'team_red_apex',
    color: '#ff1e1e',
    avatar: '',
    attributes: { speed: 92, acceleration: 88, control: 90, braking: 88, consistency: 86, shortcuts: 80 },
    stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
  },
  {
    id: 'drv_2',
    name: 'Lucas Silva',
    code: 'SIL',
    number: 44,
    nationality: 'Brasil',
    teamId: 'team_papaya_speed',
    color: '#ff8000',
    avatar: '',
    attributes: { speed: 90, acceleration: 92, control: 86, braking: 90, consistency: 91, shortcuts: 82 },
    stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
  },
  {
    id: 'drv_3',
    name: 'Pedro Bennett',
    code: 'BEN',
    number: 63,
    nationality: 'Reino Unido',
    teamId: 'team_silver_arrow',
    color: '#00e5ff',
    avatar: '',
    attributes: { speed: 89, acceleration: 87, control: 89, braking: 87, consistency: 88, shortcuts: 78 },
    stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
  },
  {
    id: 'drv_4',
    name: 'Maxime Leclerc',
    code: 'LEC',
    number: 16,
    nationality: 'Mônaco',
    teamId: 'team_red_apex',
    color: '#ff1e1e',
    avatar: '',
    attributes: { speed: 93, acceleration: 89, control: 84, braking: 85, consistency: 83, shortcuts: 88 },
    stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
  },
  {
    id: 'drv_5',
    name: 'Lando Vance',
    code: 'VAN',
    number: 4,
    nationality: 'Reino Unido',
    teamId: 'team_papaya_speed',
    color: '#ff8000',
    avatar: '',
    attributes: { speed: 88, acceleration: 90, control: 88, braking: 89, consistency: 89, shortcuts: 81 },
    stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
  },
  {
    id: 'drv_6',
    name: 'Arthur Weber',
    code: 'WEB',
    number: 11,
    nationality: 'Alemanha',
    teamId: 'team_bull_energy',
    color: '#1e3a8a',
    avatar: '',
    attributes: { speed: 91, acceleration: 91, control: 87, braking: 91, consistency: 85, shortcuts: 84 },
    stats: { races: 0, wins: 0, podiums: 0, poles: 0, points: 0, bestLapTime: null, bestFinish: null }
  }
];

// SVG native tracks
const DEFAULT_TRACKS = [
  {
    id: 'trk_autodromo_veloce',
    name: 'Autodromo Nazionale Veloce',
    country: 'Itália',
    lengthKm: 5.793,
    defaultLaps: 15,
    viewBox: '0 0 1000 600',
    // Complex exciting Grand Prix Circuit SVG Path
    svgPath: 'M 200,480 C 100,480 80,400 80,300 C 80,180 160,100 280,100 C 380,100 420,160 500,160 C 580,160 620,100 750,100 C 880,100 920,200 920,320 C 920,440 840,480 720,480 C 650,480 620,420 540,420 C 460,420 440,480 350,480 Z'
  },
  {
    id: 'trk_interlagos_speed',
    name: 'Circuito José Carlos',
    country: 'Brasil',
    lengthKm: 4.309,
    defaultLaps: 18,
    viewBox: '0 0 1000 600',
    svgPath: 'M 180,450 C 100,450 100,320 180,240 C 260,160 380,100 500,100 C 650,100 820,120 880,220 C 930,300 890,420 780,450 C 680,480 620,360 520,340 C 420,320 380,420 280,450 Z'
  },
  {
    id: 'trk_monaco_coastal',
    name: 'Grand Prix Circuit de la Côte',
    country: 'Mônaco',
    lengthKm: 3.337,
    defaultLaps: 20,
    viewBox: '0 0 1000 600',
    svgPath: 'M 250,500 C 150,500 120,420 120,340 C 120,240 220,150 350,150 C 420,150 460,200 540,200 C 620,200 660,120 780,120 C 880,120 900,200 900,300 C 900,420 820,500 700,500 C 620,500 580,380 480,380 C 380,380 340,500 250,500 Z'
  }
];

const Storage = {
  // Generic getters and setters (still using localStorage for compatibility)
  get(key, defaultValue = null) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
      console.error(`Error reading ${key} from LocalStorage:`, e);
      return defaultValue;
    }
  },

  set(key, value) {
    try {
      const jsonString = JSON.stringify(value);
      localStorage.setItem(key, jsonString);
      if (ACHIEVEMENT_SOURCE_STORAGE_KEYS.includes(key) && typeof Achievements !== 'undefined') {
        Achievements.markDirty();
      }
      return true;
    } catch (e) {
      console.error(`Error saving ${key} to LocalStorage:`, e);
      if (e.name === 'QuotaExceededError') {
        console.error('LocalStorage quota exceeded. Attempting to free space...');

        // Se for histórico de corridas, tenta limpar corridas antigas
        if (key === STORAGE_KEYS.RACE_HISTORY) {
          try {
            const currentHistory = this.get(STORAGE_KEYS.RACE_HISTORY, []);
            if (currentHistory.length > 50) {
              // Mantém apenas as 50 corridas mais recentes
              const trimmedHistory = currentHistory.slice(0, 50);
              const trimmedJson = JSON.stringify(trimmedHistory);
              localStorage.setItem(key, trimmedJson);
              console.log(`Storage.set: Auto-cleaned history from ${currentHistory.length} to 50 races. Now retrying save...`);

              // Tenta salvar novamente
              localStorage.setItem(key, jsonString);
              if (ACHIEVEMENT_SOURCE_STORAGE_KEYS.includes(key) && typeof Achievements !== 'undefined') {
                Achievements.markDirty();
              }
              return true;
            }
          } catch (cleanupError) {
            console.error('Auto-cleanup failed:', cleanupError);
          }
        }

        console.error('LocalStorage quota exceeded. Suggesting migration to IndexedDB.');
        // Suggest migration to user
        if (typeof Migration !== 'undefined') {
          Migration.suggestMigration();
        }
      }
      return false;
    }
  },

  // Initialize Seed Data if first time
  init() {
    if (!this.get(STORAGE_KEYS.SETTINGS)) {
      this.set(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!this.get(STORAGE_KEYS.RANKS)) {
      this.set(STORAGE_KEYS.RANKS, DEFAULT_RANKS);
    }
    if (!this.get(STORAGE_KEYS.TEAMS)) {
      this.set(STORAGE_KEYS.TEAMS, DEFAULT_TEAMS);
    }
    if (!this.get(STORAGE_KEYS.DRIVERS)) {
      this.set(STORAGE_KEYS.DRIVERS, DEFAULT_DRIVERS);
    }
    if (!this.get(STORAGE_KEYS.TRACKS)) {
      this.set(STORAGE_KEYS.TRACKS, DEFAULT_TRACKS);
    }
    if (!this.get(STORAGE_KEYS.RACE_HISTORY)) {
      this.set(STORAGE_KEYS.RACE_HISTORY, []);
    }
    if (!this.get(STORAGE_KEYS.HALL_OF_FAME)) {
      this.set(STORAGE_KEYS.HALL_OF_FAME, {
        mostWins: [],
        mostTitles: [],
        mostPoles: [],
        fastestLapsEver: [],
        maxRanksAchieved: []
      });
    }
    if (!this.get(STORAGE_KEYS.TEAM_DUELS)) {
      this.set(STORAGE_KEYS.TEAM_DUELS, []);
    }
    if (!this.get(STORAGE_KEYS.TIME_TRIALS)) {
      this.set(STORAGE_KEYS.TIME_TRIALS, []);
    }
    if (!this.get(STORAGE_KEYS.RANKED_STANDINGS)) {
      const drivers = this.getDrivers();
      const rankedStandings = drivers.map(d => ({
        driverId: d.id,
        rating: 1200,
        tier: 'Bronze',
        wins: 0,
        podiums: 0,
        matches: 0,
        peakRating: 1200,
        winRate: 0
      }));
      this.set(STORAGE_KEYS.RANKED_STANDINGS, rankedStandings);
    }
    if (!this.get(STORAGE_KEYS.RANKED_HISTORY)) {
      this.set(STORAGE_KEYS.RANKED_HISTORY, []);
    }

    // Initialize Default Season if none exists
    if (!this.get(STORAGE_KEYS.SEASONS)) {
      const defaultSeason = {
        id: 'season_2026',
        divisionId: 'div_a',          // ← campo obrigatório desde o início
        name: 'Temporada 2026',
        year: 2026,
        status: 'active',
        races: [
          {
            id: 'gp_1',
            name: 'GP da Itália (Monza Veloce)',
            trackId: 'trk_autodromo_veloce',
            laps: 15,
            completed: false,
            winnerDriverId: null,
            fastestLap: null,
            result: null
          },
          {
            id: 'gp_2',
            name: 'GP do Brasil (Interlagos)',
            trackId: 'trk_interlagos_speed',
            laps: 18,
            completed: false,
            winnerDriverId: null,
            fastestLap: null,
            result: null
          },
          {
            id: 'gp_3',
            name: 'GP de Mônaco (Riviera)',
            trackId: 'trk_monaco_coastal',
            laps: 20,
            completed: false,
            winnerDriverId: null,
            fastestLap: null,
            result: null
          }
        ],
        standings: DEFAULT_DRIVERS.map(d => ({
          driverId: d.id,
          points: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          currentRankId: 'rank_bronze'
        }))
      };
      this.set(STORAGE_KEYS.SEASONS, [defaultSeason]);
      this.set(STORAGE_KEYS.CURRENT_SEASON_ID, 'season_2026');
    }
    if (!this.get(STORAGE_KEYS.TEAM_DIVISIONS)) {
      this.set(STORAGE_KEYS.TEAM_DIVISIONS, DEFAULT_DIVISIONS);
    }
    if (!this.get(STORAGE_KEYS.TOURNAMENTS)) {
      this.set(STORAGE_KEYS.TOURNAMENTS, []);
    }
    this.recalculateAllFromHistory();
  },

  // Helper Getters
  getSettings() { return this.get(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS); },
  saveSettings(settings) { return this.set(STORAGE_KEYS.SETTINGS, settings); },

  getDrivers() {
    let drivers = this.get(STORAGE_KEYS.DRIVERS, []);
    let updated = false;
    drivers = drivers.map(d => {
      if (!d.attributes) return d;
      if (d.attributes.shortcuts == null) {
        updated = true;
        return { ...d, attributes: { ...d.attributes, shortcuts: 75 } };
      }
      return d;
    });
    if (updated) this.saveDrivers(drivers);
    return drivers;
  },
  saveDrivers(drivers) { return this.set(STORAGE_KEYS.DRIVERS, drivers); },

  getTeams() {
    let teams = this.get(STORAGE_KEYS.TEAMS, []);
    const divisions = this.getDivisions();
    const defaultDiv = divisions[0]?.id || 'div_a';
    let updated = false;
    teams = teams.map(t => {
      let mod = t;
      if (!t.divisionId) { mod = { ...mod, divisionId: defaultDiv }; updated = true; }
      if (!t.divisionHistory) { mod = { ...mod, divisionHistory: [] }; updated = true; }
      return mod;
    });
    if (updated) this.saveTeams(teams);
    return teams;
  },
  saveTeams(teams) { return this.set(STORAGE_KEYS.TEAMS, teams); },

  getDivisions() {
    let divisions = this.get(STORAGE_KEYS.TEAM_DIVISIONS, null);
    if (!divisions) {
      divisions = [...DEFAULT_DIVISIONS];
      this.saveDivisions(divisions);
    }
    return divisions.sort((a, b) => (a.level || 1) - (b.level || 1));
  },
  saveDivisions(divisions) {
    return this.set(STORAGE_KEYS.TEAM_DIVISIONS, divisions);
  },

  getConstructorsStandings(divisionId = null) {
    const teams = this.getTeams();
    const drivers = this.getDrivers();
    const divisions = this.getDivisions();
    const defaultDiv = divisions[0]?.id || 'div_a';

    const constructors = teams.map(team => {
      const teamDrivers = drivers.filter(d => d.teamId === team.id);
      const teamDivId = team.divisionId || defaultDiv;
      const divSeason = this.getCurrentSeason(teamDivId);
      const div = divisions.find(d => d.id === teamDivId) || divisions[0];

      // Busca o teamSnapshot para extrair positionDelta persistido
      const teamSnapshot = (divSeason?.teamSnapshots || []).find(s => s.teamId === team.id);

      let points = 0;
      let wins = 0;
      let podiums = 0;
      let poles = 0;

      teamDrivers.forEach(d => {
        const standing = divSeason?.standings?.find(s => s.driverId === d.id);
        if (standing) {
          points += (standing.points || 0);
          wins += (standing.wins || 0);
          podiums += (standing.podiums || 0);
          poles += (standing.poles || 0);
        }
      });

      return {
        teamId: team.id,
        teamName: team.name,
        logo: team.logo || '🏎️',
        color: team.color,
        secondaryColor: team.secondaryColor,
        divisionId: teamDivId,
        divisionName: div ? div.name : 'Série A',
        divisionColor: div ? div.color : '#ffd700',
        divisionIcon: div ? (div.icon || '🏆') : '🏆',
        drivers: teamDrivers,
        points,
        wins,
        podiums,
        poles,
        previousPosition: teamSnapshot?.previousPosition ?? null,
        positionDelta:    teamSnapshot?.positionDelta    ?? null
      };
    });

    let filtered = constructors;
    if (divisionId && divisionId !== 'all') {
      filtered = constructors.filter(c => c.divisionId === divisionId);
    }

    return filtered.sort((a, b) => b.points - a.points || b.wins - a.wins || b.podiums - a.podiums);
  },

  processDivisionPromotionsRelegations(standingsByDivision = null) {
    const divisions = this.getDivisions();
    const teams = this.getTeams();
    const seasons = this.getSeasons();
    const seasonByDivision = new Map(divisions.map(div => [
      div.id,
      seasons.find(season => season.divisionId === div.id && season.status === 'active') || null
    ]));
    const seasonIds = new Set(Array.from(seasonByDivision.values()).filter(Boolean).map(season => season.id));
    const seasonNames = new Set(Array.from(seasonByDivision.values()).filter(Boolean).map(season => `${season.name} (${season.year})`));
    const hasProcessed = team => (team.divisionHistory || []).some(entry =>
      (entry.seasonId && seasonIds.has(entry.seasonId)) || seasonNames.has(entry.seasonName)
    );

    if (teams.length > 0 && teams.every(hasProcessed)) {
      return new Map(teams.map(team => {
        const entry = team.divisionHistory.find(item =>
          (item.seasonId && seasonIds.has(item.seasonId)) || seasonNames.has(item.seasonName)
        );
        return [team.id, entry ? {
          teamId: team.id,
          fromDivisionId: entry.divisionId,
          position: entry.position,
          status: entry.status,
          nextDivisionId: entry.nextDivisionId,
          nextDivisionName: entry.nextDivisionName
        } : null];
      }));
    }

    const rankings = standingsByDivision || new Map(divisions.map(div => [
      div.id,
      this.getConstructorsStandings(div.id).map(standing => ({ ...standing }))
    ]));
    const movements = new Map();

    divisions.forEach(div => {
      const standings = rankings.get(div.id) || [];
      const higherDiv = divisions.find(item => item.level === div.level - 1);
      const lowerDiv = divisions.find(item => item.level === div.level + 1);

      standings.forEach((standing, index) => {
        const position = index + 1;
        let target = div;
        let status = 'stayed';
        if (div.promoteCount > 0 && higherDiv && position <= div.promoteCount) {
          target = higherDiv;
          status = 'promoted';
        } else if (div.relegateCount > 0 && lowerDiv && position > standings.length - div.relegateCount) {
          target = lowerDiv;
          status = 'relegated';
        }

        movements.set(standing.teamId, {
          teamId: standing.teamId,
          fromDivisionId: div.id,
          position,
          status,
          nextDivisionId: target.id,
          nextDivisionName: target.name
        });
      });
    });

    teams.forEach(team => {
      const movement = movements.get(team.id);
      if (!movement) return;
      const season = seasonByDivision.get(movement.fromDivisionId);
      const sourceDiv = divisions.find(div => div.id === movement.fromDivisionId);
      const seasonName = season ? `${season.name} (${season.year})` : 'Temporada Atual';
      team.divisionHistory ||= [];
      team.divisionHistory.unshift({
        teamId: team.id,
        seasonId: season?.id || null,
        date: new Date().toLocaleDateString('pt-BR'),
        seasonName,
        divisionId: movement.fromDivisionId,
        divisionName: sourceDiv?.name || 'Série',
        position: movement.position,
        status: movement.status,
        nextDivisionId: movement.nextDivisionId,
        nextDivisionName: movement.nextDivisionName
      });
      team.divisionId = movement.nextDivisionId;
    });

    this.saveTeams(teams);
    return movements;
  },

  getTracks() { return this.get(STORAGE_KEYS.TRACKS, []); },
  saveTracks(tracks) { return this.set(STORAGE_KEYS.TRACKS, tracks); },

  getRanks(category = 'championship') {
    if (category === 'ranked') {
      const ranks = this.get(STORAGE_KEYS.RANKS_RANKED, DEFAULT_RANKS_RANKED);
      return ranks.sort((a, b) => a.order - b.order);
    }
    const ranks = this.get(STORAGE_KEYS.RANKS, DEFAULT_RANKS);
    return ranks.sort((a, b) => a.order - b.order);
  },
  saveRanks(ranks, category = 'championship') {
    if (category === 'ranked') return this.set(STORAGE_KEYS.RANKS_RANKED, ranks);
    return this.set(STORAGE_KEYS.RANKS, ranks);
  },

  getSeasons() { return this.get(STORAGE_KEYS.SEASONS, []); },
  saveSeasons(seasons) { return this.set(STORAGE_KEYS.SEASONS, seasons); },

  startNewSeason(divisionId = 'div_a') {
    const divisions = this.getDivisions();
    divisions.forEach(div => this.getCurrentSeason(div.id));

    const seasons = this.getSeasons();
    const currentByDivision = new Map(divisions.map(div => [
      div.id,
      seasons.find(season => season.divisionId === div.id && season.status === 'active')
    ]));
    const selectedSeason = currentByDivision.get(divisionId);
    if (!selectedSeason) return null;

    const drivers = this.getDrivers();
    const teamsBeforeMovement = this.getTeams();
    const history = this.getHistory();
    const standingsByDivision = new Map(divisions.map(div => [
      div.id,
      this.getConstructorsStandings(div.id).map(standing => ({ ...standing }))
    ]));
    const movements = this.processDivisionPromotionsRelegations(standingsByDivision);

    seasons.forEach(season => {
      if (season.status !== 'active') return;
      const div = divisions.find(item => item.id === season.divisionId) || divisions[0];
      const seasonTeams = teamsBeforeMovement.filter(team => movements.get(team.id)?.fromDivisionId === div.id);
      const teamSnapshots = seasonTeams.map(team => {
        const movement = movements.get(team.id);
        const driverIds = drivers.filter(driver => driver.teamId === team.id).map(driver => driver.id);
        const driverStandings = (season.standings || []).filter(standing => driverIds.includes(standing.driverId));
        const constructor = (standingsByDivision.get(div.id) || []).find(standing => standing.teamId === team.id);
        return {
          teamId: team.id,
          teamName: team.name,
          logo: team.logo || '🏎️',
          color: team.color,
          divisionId: div.id,
          divisionName: div.name,
          driverIds,
          position: movement?.position || null,
          points: constructor?.points ?? driverStandings.reduce((sum, standing) => sum + (standing.points || 0), 0),
          wins: constructor?.wins ?? driverStandings.reduce((sum, standing) => sum + (standing.wins || 0), 0),
          podiums: constructor?.podiums ?? driverStandings.reduce((sum, standing) => sum + (standing.podiums || 0), 0),
          poles: constructor?.poles ?? driverStandings.reduce((sum, standing) => sum + (standing.poles || 0), 0),
          status: movement?.status || 'stayed',
          nextDivisionId: movement?.nextDivisionId || div.id,
          nextDivisionName: movement?.nextDivisionName || div.name
        };
      });

      season.divisionName = div.name;
      season.teamIds = teamSnapshots.map(snapshot => snapshot.teamId);
      season.driverIds = Array.from(new Set(teamSnapshots.flatMap(snapshot => snapshot.driverIds)));
      season.teamSnapshots = teamSnapshots;
      season.status = 'finished';

      const gpIds = new Set((season.races || []).map(gp => gp.id));
      season.driverIds.forEach(driverId => {
        const driver = drivers.find(item => item.id === driverId);
        if (!driver) return;
        const standing = season.standings?.find(item => item.driverId === driverId);
        const results = history.flatMap(race => {
          if (!gpIds.has(race.gpId)) return [];
          const result = race.results?.find(item => item.driverId === driverId);
          return result ? [{ race, result }] : [];
        });
        const teamSnapshot = teamSnapshots.find(snapshot => snapshot.driverIds.includes(driverId));
        const record = {
          seasonId: season.id,
          seasonName: season.name,
          year: season.year,
          divisionId: div.id,
          divisionName: div.name,
          races: results.length,
          points: standing?.points || 0,
          wins: standing?.wins || 0,
          podiums: standing?.podiums || 0,
          poles: standing?.poles || 0,
          fastestLaps: standing?.fastestLaps || 0,
          rankId: standing?.currentRankId || 'rank_bronze',
          teamId: teamSnapshot?.teamId || driver.teamId,
          divisionChange: teamSnapshot?.status || 'stayed',
          nextDivisionName: teamSnapshot?.nextDivisionName || div.name,
          results: results.map(({ race, result }) => ({
            gpId: race.gpId,
            gpName: race.gpName || race.trackName || 'GP',
            trackName: race.trackName || '',
            date: race.date || '',
            position: result.position,
            points: result.points || 0,
            bestLapMs: result.bestLapMs || null,
            gridPos: result.gridPos || null
          }))
        };
        driver.seasonHistory ||= [];
        if (!driver.seasonHistory.some(item => item.seasonId === season.id)) {
          driver.seasonHistory.unshift(record);
        }
      });
    });

    this.saveDrivers(drivers);

    const newSeasons = divisions.map(div => {
      const previous = currentByDivision.get(div.id);
      const latestYear = Math.max(0, ...seasons
        .filter(season => season.divisionId === div.id)
        .map(season => Number(season.year) || 0));
      const year = Math.max(Number(previous?.year) || 2026, latestYear || 2026) + 1;
      const currentTeams = this.getTeams().filter(team => (team.divisionId || divisions[0]?.id) === div.id);
      const teamIds = currentTeams.map(team => team.id);
      const currentDrivers = this.getDrivers().filter(driver => teamIds.includes(driver.teamId));
      const driverIds = currentDrivers.map(driver => driver.id);
      const races = [
        { suffix: 1, name: `GP da Itália (${div.name})`, trackId: 'trk_autodromo_veloce', laps: 15 },
        { suffix: 2, name: `GP do Brasil (${div.name})`, trackId: 'trk_interlagos_speed', laps: 18 },
        { suffix: 3, name: `GP de Mônaco (${div.name})`, trackId: 'trk_monaco_coastal', laps: 20 }
      ].map(gp => ({
        id: `gp_${div.id}_${year}_${gp.suffix}`,
        divisionId: div.id,
        name: gp.name,
        trackId: gp.trackId,
        laps: gp.laps,
        completed: false,
        winnerDriverId: null,
        fastestLap: null,
        result: null
      }));

      return {
        id: `season_${div.id}_${year}`,
        divisionId: div.id,
        divisionName: div.name,
        name: `Temporada ${year}`,
        year,
        status: 'active',
        teamIds,
        driverIds,
        teamSnapshots: currentTeams.map(team => ({
          teamId: team.id,
          teamName: team.name,
          logo: team.logo || '🏎️',
          color: team.color,
          divisionId: div.id,
          divisionName: div.name,
          driverIds: currentDrivers.filter(driver => driver.teamId === team.id).map(driver => driver.id),
          points: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          status: 'active',
          nextDivisionId: div.id,
          nextDivisionName: div.name
        })),
        races,
        standings: currentDrivers.map(driver => ({
          driverId: driver.id,
          points: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          fastestLaps: 0,
          currentRankId: 'rank_bronze'
        }))
      };
    });

    seasons.push(...newSeasons);
    this.saveSeasons(seasons);

    const retainedHistory = history.filter(race =>
      !race.isTimeTrial && !race.gpId?.startsWith('tt_') &&
      !race.gpId?.startsWith('time_trial') && !race.gpName?.startsWith('Time-Trial:')
    );
    this.saveTimeTrials([]);
    this.saveHistory(retainedHistory);
    this.recalculateDriverBestLaps();

    return newSeasons.find(season => season.divisionId === divisionId) || null;
  },

  getCurrentSeason(divisionId = 'div_a') {
    const seasons = this.getSeasons();

    // ── Migração: season legada sem divisionId → div_a; e normaliza nomes por divisão → nome unificado ─────
    let migrated = false;
    seasons.forEach(s => {
      if (!s.divisionId) {
        s.divisionId = 'div_a';
        migrated = true;
      }
      // Renomeia "Temporada Série X AAAA" e "Temporada Oficial AAAA" → "Temporada AAAA"
      if (s.year && s.name && s.name !== `Temporada ${s.year}`) {
        const unified = `Temporada ${s.year}`;
        const isOldPattern = /^Temporada\s+(Série\s+\w+\s+\d{4}|Oficial\s+\d{4})$/.test(s.name);
        if (isOldPattern) {
          s.name = unified;
          migrated = true;
        }
      }
    });
    if (migrated) this.saveSeasons(seasons);

    // Busca season ativa para a divisão pedida
    let season = seasons.find(s => s.divisionId === divisionId && s.status === 'active');
    if (season) return season;

    // Não encontrou: cria uma nova season para esta divisão
    const divisions = this.getDivisions();
    const div       = divisions.find(d => d.id === divisionId) || divisions[0] || { id: 'div_a', name: 'Série A' };
    const divTeams  = this.getTeams().filter(t => (t.divisionId || 'div_a') === div.id);
    const teamIds   = divTeams.map(t => t.id);
    const divDrivers = this.getDrivers().filter(d => teamIds.includes(d.teamId));
    const latestYear = Math.max(0, ...seasons
      .filter(item => item.divisionId === div.id)
      .map(item => Number(item.year) || 0));
    const year = latestYear ? latestYear + 1 : 2026;

    season = {
      id:         `season_${div.id}_${year}`,
      divisionId: div.id,
      divisionName: div.name,
      name:       `Temporada ${year}`,
      year,
      status:     'active',
      teamIds,
      driverIds: divDrivers.map(driver => driver.id),
      teamSnapshots: divTeams.map(team => ({
        teamId: team.id,
        teamName: team.name,
        logo: team.logo || '🏎️',
        color: team.color,
        divisionId: div.id,
        divisionName: div.name,
        driverIds: divDrivers.filter(driver => driver.teamId === team.id).map(driver => driver.id),
        points: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        status: 'active',
        nextDivisionId: div.id,
        nextDivisionName: div.name
      })),
      races: [
        { suffix: 1, name: `GP da Itália (${div.name})`, trackId: 'trk_autodromo_veloce', laps: 15 },
        { suffix: 2, name: `GP do Brasil (${div.name})`, trackId: 'trk_interlagos_speed', laps: 18 },
        { suffix: 3, name: `GP de Mônaco (${div.name})`, trackId: 'trk_monaco_coastal', laps: 20 }
      ].map(gp => ({
        id: `gp_${div.id}_${year}_${gp.suffix}`,
        divisionId: div.id,
        name: gp.name,
        trackId: gp.trackId,
        laps: gp.laps,
        completed: false,
        winnerDriverId: null,
        fastestLap: null,
        result: null
      })),
      standings: divDrivers.map(d => ({
        driverId: d.id,
        points: 0, wins: 0, podiums: 0, poles: 0, fastestLaps: 0,
        currentRankId: 'rank_bronze'
      }))
    };

    seasons.push(season);
    this.saveSeasons(seasons);
    return season;
  },

  getHistory() { return this.get(STORAGE_KEYS.RACE_HISTORY, []); },
  saveHistory(history) { return this.set(STORAGE_KEYS.RACE_HISTORY, history); },

  getHallOfFame() { return this.get(STORAGE_KEYS.HALL_OF_FAME, {}); },
  saveHallOfFame(hof) { return this.set(STORAGE_KEYS.HALL_OF_FAME, hof); },

  getTeamDuels() { return this.get(STORAGE_KEYS.TEAM_DUELS, []); },
  saveTeamDuels(duels) { return this.set(STORAGE_KEYS.TEAM_DUELS, duels); },
  addTeamDuel(duel) {
    const duels = this.getTeamDuels();
    duels.unshift(duel);
    return this.saveTeamDuels(duels);
  },

  getTimeTrials() { return this.get(STORAGE_KEYS.TIME_TRIALS, []); },
  saveTimeTrials(trials) { return this.set(STORAGE_KEYS.TIME_TRIALS, trials); },
  getBestTimeTrials() {
    const bestByDriverTrack = new Map();
    this.getTimeTrials().forEach(record => {
      const key = `${record.driverId}::${record.trackId}`;
      const current = bestByDriverTrack.get(key);
      if (!current || record.bestLapMs < current.bestLapMs) {
        bestByDriverTrack.set(key, record);
      }
    });
    return Array.from(bestByDriverTrack.values());
  },
  addTimeTrial(record) {
    const trials = this.getTimeTrials();
    trials.unshift(record);
    this.saveTimeTrials(trials);
  },
  deleteTimeTrial(trialId) {
    let trials = this.getTimeTrials();
    const deleted = trials.find(t => t.id === trialId);
    trials = trials.filter(t => t.id !== trialId);
    this.saveTimeTrials(trials);

    if (deleted) {
      this.recalculateDriverBestLaps();
    }
  },
  recalculateDriverBestLaps() {
    const drivers = this.getDrivers();
    const history = this.getHistory();
    const timeTrials = this.getTimeTrials();

    drivers.forEach(d => {
      let bestLap = null;

      history.forEach(h => {
        const res = h.results?.find(r => r.driverId === d.id);
        if (res && res.bestLapMs) {
          if (!bestLap || res.bestLapMs < bestLap) bestLap = res.bestLapMs;
        }
      });

      timeTrials.filter(t => t.driverId === d.id).forEach(t => {
        if (t.bestLapMs) {
          if (!bestLap || t.bestLapMs < bestLap) bestLap = t.bestLapMs;
        }
      });

      d.stats.bestLapTime = bestLap;
    });

    this.saveDrivers(drivers);
  },

  getRankedStandings() {
    let standings = this.get(STORAGE_KEYS.RANKED_STANDINGS, []);
    const drivers = this.getDrivers();
    let changed = false;
    drivers.forEach(d => {
      if (!standings.find(s => s.driverId === d.id)) {
        standings.push({
          driverId: d.id,
          rating: 1200,
          tier: 'Bronze',
          wins: 0,
          podiums: 0,
          matches: 0,
          peakRating: 1200,
          winRate: 0
        });
        changed = true;
      }
    });
    if (changed) this.saveRankedStandings(standings);
    return standings;
  },
  saveRankedStandings(standings) { return this.set(STORAGE_KEYS.RANKED_STANDINGS, standings); },

  getRankedHistory() { return this.get(STORAGE_KEYS.RANKED_HISTORY, []); },
  saveRankedHistory(hist) { return this.set(STORAGE_KEYS.RANKED_HISTORY, hist); },
  addRankedMatch(match) {
    const hist = this.getRankedHistory();
    hist.unshift(match);
    this.saveRankedHistory(hist);
  },

  getTournaments() { return this.get(STORAGE_KEYS.TOURNAMENTS, []); },
  saveTournaments(list) { return this.set(STORAGE_KEYS.TOURNAMENTS, list); },

  // Captura as posições atuais de pilotos e equipes para uso como baseline do positionDelta.
  // Deve ser chamado ANTES de adicionar uma nova corrida ao histórico.
  capturePositionSnapshot() {
    const seasons   = this.getSeasons();
    const divisions = this.getDivisions();
    const prevDriverPos = new Map();
    const prevTeamPos   = new Map();

    seasons.forEach(season => {
      const sorted = [...(season.standings || [])]
        .sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums));
      sorted.forEach((st, idx) => {
        if (st.points > 0 || st.previousPosition != null) {
          prevDriverPos.set(`${season.id}::${st.driverId}`, idx + 1);
        }
      });
    });

    divisions.forEach(div => {
      const constructors = this.getConstructorsStandings(div.id);
      constructors.forEach((c, idx) => {
        if (c.points > 0 || c.previousPosition != null) {
          prevTeamPos.set(`${div.id}::${c.teamId}`, idx + 1);
        }
      });
    });

    return { prevDriverPos, prevTeamPos };
  },

  // Recalculate all driver stats, season standings and ranks based on current history.
  // prevSnapshot: objeto { prevDriverPos, prevTeamPos } capturado ANTES de salvar a nova corrida.
  // Se não fornecido, captura internamente (útil para recálculo manual sem nova corrida).
  recalculateAllFromHistory(prevSnapshot = null) {
    const history = this.getHistory();
    const drivers = this.getDrivers();
    const teams   = this.getTeams();
    const seasons = this.getSeasons();
    const timeTrials = this.getTimeTrials();
    const divisions  = this.getDivisions();

    // ── Garante que todas as seasons têm divisionId definido ──────────────────
    seasons.forEach(season => {
      if (!season.divisionId) {
        season.divisionId = 'div_a';
      }
    });

    // ── 0. Snapshot das posições ANTES do reset ───────────────────────────────
    // Se um snapshot externo foi fornecido (capturado antes de salvar a corrida),
    // usa ele. Caso contrário, captura agora (sem nova corrida = delta sempre 0, mas
    // serve para recálculos manuais como deleção de corrida).
    const prevDriverPos = prevSnapshot?.prevDriverPos ?? new Map();
    const prevTeamPos   = prevSnapshot?.prevTeamPos   ?? new Map();

    if (!prevSnapshot) {
      // Fallback: captura interna (para delete/clear/season ops, sem nova corrida)
      seasons.forEach(season => {
        const sorted = [...(season.standings || [])]
          .sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums));
        sorted.forEach((st, idx) => {
          if (st.points > 0 || st.previousPosition != null) {
            prevDriverPos.set(`${season.id}::${st.driverId}`, idx + 1);
          }
        });
      });
      divisions.forEach(div => {
        const constructors = this.getConstructorsStandings(div.id);
        constructors.forEach((c, idx) => {
          if (c.points > 0 || c.previousPosition != null) {
            prevTeamPos.set(`${div.id}::${c.teamId}`, idx + 1);
          }
        });
      });
    }

    // ── 1. Reset de stats de carreira de todos os pilotos ────────────────────
    drivers.forEach(d => {
      d.stats = {
        races: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        points: 0,
        bestLapTime: null,
        bestFinish: null
      };
    });

    // ── 2. Reset standings de cada season APENAS com pilotos da sua divisão ──
    const seasonByGpId = new Map();
    seasons.forEach(season => {
      const divId = season.divisionId || 'div_a';
      season.races ||= [];
      if (!Array.isArray(season.driverIds)) {
        const standingIds = (season.standings || []).map(standing => standing.driverId);
        season.driverIds = standingIds.length
          ? standingIds
          : drivers.filter(driver => teams.some(team => team.id === driver.teamId && (team.divisionId || 'div_a') === divId)).map(driver => driver.id);
      }

      // ── Garante que driverIds inclui TODOS os pilotos presentes nos standings ──
      // Piloto adicionado mid-season pode estar em standings mas não em driverIds,
      // fazendo com que seja dropado no reset abaixo.
      const standingDriverIds = (season.standings || []).map(s => s.driverId);
      standingDriverIds.forEach(id => {
        if (!season.driverIds.includes(id)) season.driverIds.push(id);
      });
      if (!Array.isArray(season.teamIds)) {
        season.teamIds = teams.filter(team => (team.divisionId || 'div_a') === divId).map(team => team.id);
      }
      if (!season.divisionName) {
        season.divisionName = divisions.find(division => division.id === divId)?.name || 'Série';
      }
      if (!Array.isArray(season.teamSnapshots) && season.status === 'active') {
        const activeTeams = teams.filter(team => (team.divisionId || 'div_a') === divId);
        season.teamSnapshots = activeTeams.map(team => ({
          teamId: team.id,
          teamName: team.name,
          logo: team.logo || '🏎️',
          color: team.color,
          divisionId: divId,
          divisionName: season.divisionName,
          driverIds: drivers.filter(driver => driver.teamId === team.id).map(driver => driver.id),
          points: 0,
          wins: 0,
          podiums: 0,
          poles: 0,
          status: 'active',
          nextDivisionId: divId,
          nextDivisionName: season.divisionName
        }));
      }

      season.standings = season.driverIds.map(driverId => ({
        driverId,
        points: 0,
        wins: 0,
        podiums: 0,
        poles: 0,
        fastestLaps: 0,
        currentRankId: 'rank_bronze'
      }));

      season.races.forEach(gp => {
        if (!seasonByGpId.has(gp.id)) seasonByGpId.set(gp.id, season);
        const foundInHist = history.find(h => h.gpId === gp.id);
        if (foundInHist) {
          gp.completed      = true;
          gp.winnerDriverId = foundInHist.results[0]?.driverId || null;
          gp.fastestLap     = foundInHist.fastestLap;
          gp.result         = foundInHist.results;
        } else {
          gp.completed      = false;
          gp.winnerDriverId = null;
          gp.fastestLap     = null;
          gp.result         = null;
        }
      });
    });

    let historyUpdated = false;

    // ── 3. Re-aplica cada corrida do histórico ───────────────────────────────
    history.forEach(race => {
      const isCasual       = race.isCasual   || race.gpId?.startsWith('casual_');
      const isChampionship = race.isChampionship || false;
      const isTimeTrial    = race.isTimeTrial || race.gpId?.startsWith('tt_') || race.gpId?.startsWith('time_trial');
      const isStandaloneMode = race.gpId?.startsWith('duel_') || race.gpId?.startsWith('ranked_') || race.gpId?.startsWith('trn_') || race.isRanked || race.isTeamDuel || race.isTournament;
      const isChampionshipGp = isChampionship || (!isCasual && !isTimeTrial && !isStandaloneMode);

      // Inferência de divisionId da corrida
      let raceDivId = race.divisionId;
      if (!raceDivId) {
        // 1º tenta extrair do gpId
        if      (race.gpId?.includes('div_b')) raceDivId = 'div_b';
        else if (race.gpId?.includes('div_c')) raceDivId = 'div_c';
        else if (race.gpId?.includes('div_d')) raceDivId = 'div_d';
        else if (race.gpId?.includes('div_a')) raceDivId = 'div_a';
        else {
          // 2º tenta pelo time do primeiro resultado (o que era o time na época)
          // — usa MAIORIA dos times participantes para evitar problema de promoção/rebaixamento
          if (race.results && race.results.length > 0) {
            const divCount = new Map();
            race.results.forEach(r => {
              const t = teams.find(tm => tm.id === r.teamId);
              if (t?.divisionId) {
                divCount.set(t.divisionId, (divCount.get(t.divisionId) || 0) + 1);
              }
            });
            // Pega a divisão mais frequente entre os participantes
            let bestDiv = null, bestCount = 0;
            divCount.forEach((count, divId) => {
              if (count > bestCount) { bestCount = count; bestDiv = divId; }
            });
            raceDivId = bestDiv || 'div_a';
          } else {
            raceDivId = 'div_a';
          }
        }
        race.divisionId = raceDivId;
        historyUpdated  = true;
      }

      // Busca a season correspondente — sem fallback para seasons[0]
      // para evitar poluir a season errada
      const targetSeason = seasonByGpId.get(race.gpId);

      race.results?.forEach(res => {
        // Standings de campeonato (só para GPs de campeonato na season correta)
        if (targetSeason && isChampionshipGp) {
          let st = targetSeason.standings.find(s => s.driverId === res.driverId);
          if (!st) {
            st = {
              driverId: res.driverId,
              points: 0,
              wins: 0,
              podiums: 0,
              poles: 0,
              fastestLaps: 0,
              currentRankId: 'rank_bronze'
            };
            targetSeason.standings.push(st);
            targetSeason.driverIds.push(res.driverId);
          }

          const pointsValue = typeof res.points === 'string' ? parseFloat(res.points.replace(/[^\d.-]/g, '')) || 0 : (res.points || 0);
          st.points     += pointsValue;
          if (res.position === 1) st.wins     += 1;
          if (res.position <= 3) st.podiums   += 1;
          if (res.gridPos  === 1) st.poles     += 1;
          if (race.fastestLap?.driverId === res.driverId) st.fastestLaps += 1;
          st.currentRankId = Ranks.getRankForPoints(st.points).id;
        }

        // Stats de carreira do piloto (campeonato, ranqueado e duelo — não casual e não TT)
        const drv = drivers.find(d => d.id === res.driverId);
        if (drv) {
          if (!isCasual && !isTimeTrial) {
            const pointsValue = typeof res.points === 'string' ? parseFloat(res.points.replace(/[^\d.-]/g, '')) || 0 : (res.points || 0);
            drv.stats.races  += 1;
            drv.stats.points += pointsValue;
            if (res.position === 1) drv.stats.wins    += 1;
            if (res.position <= 3) drv.stats.podiums  += 1;
            if (res.gridPos  === 1) drv.stats.poles    += 1;
            if (!drv.stats.bestFinish || res.position < drv.stats.bestFinish) {
              drv.stats.bestFinish = res.position;
            }
          }
          if (res.bestLapMs && (!drv.stats.bestLapTime || res.bestLapMs < drv.stats.bestLapTime)) {
            drv.stats.bestLapTime = res.bestLapMs;
          }
        }
      });
    });

    seasons.forEach(season => {
      const seasonRaces = (season.races || []).map(gp => history.find(race => race.gpId === gp.id)).filter(Boolean);
      (season.teamSnapshots || []).forEach(snapshot => {
        const teamRaces = seasonRaces.map(race => ({
          race,
          results: (race.results || []).filter(result =>
            result.teamId === snapshot.teamId || (!result.teamId && snapshot.driverIds?.includes(result.driverId))
          )
        })).filter(item => item.results.length > 0);
        const results = teamRaces.flatMap(item => item.results);
        snapshot.gps = teamRaces.length;
        snapshot.points = results.reduce((sum, result) => {
          const points = typeof result.points === 'string'
            ? parseFloat(result.points.replace(/[^\d.-]/g, '')) || 0
            : result.points || 0;
          return sum + points;
        }, 0);
        snapshot.wins = results.filter(result => result.position === 1).length;
        snapshot.podiums = results.filter(result => result.position <= 3).length;
        snapshot.poles = results.filter(result => result.gridPos === 1).length;
        snapshot.fastestLaps = teamRaces.filter(({ race, results: teamResults }) =>
          teamResults.some(result => result.driverId === race.fastestLap?.driverId)
        ).length;
      });
    });

    // ── 4. Aplica melhores voltas de Time-Trial nos stats dos pilotos ─────────
    drivers.forEach(d => {
      timeTrials.filter(t => t.driverId === d.id).forEach(t => {
        if (t.bestLapMs && (!d.stats.bestLapTime || t.bestLapMs < d.stats.bestLapTime)) {
          d.stats.bestLapTime = t.bestLapMs;
        }
      });
    });

    // ── 5. Calcula variação de posição (previousPosition + positionDelta) ─────
    // Pilotos: compara posição nova vs snapshot capturado antes do reset
    seasons.forEach(season => {
      const sorted = [...season.standings]
        .sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums));
      sorted.forEach((st, idx) => {
        const newPos  = idx + 1;
        const prevPos = prevDriverPos.get(`${season.id}::${st.driverId}`);
        st.previousPosition = prevPos ?? null;
        // delta positivo = subiu posições (ex: era 3º, agora é 1º → delta = +2)
        st.positionDelta = prevPos != null ? prevPos - newPos : null;
      });

      // Equipes: calcula delta por teamSnapshot dentro da season ativa
      if (season.status === 'active' && Array.isArray(season.teamSnapshots)) {
        const divId = season.divisionId || 'div_a';
        const sortedTeams = [...season.teamSnapshots]
          .sort((a, b) => (b.points - a.points) || (b.wins - a.wins) || (b.podiums - a.podiums));
        sortedTeams.forEach((snap, idx) => {
          const newPos  = idx + 1;
          const prevPos = prevTeamPos.get(`${divId}::${snap.teamId}`);
          snap.previousPosition = prevPos ?? null;
          snap.positionDelta    = prevPos != null ? prevPos - newPos : null;
        });
      }
    });

    if (historyUpdated) this.saveHistory(history);
    this.saveDrivers(drivers);
    this.saveSeasons(seasons);
    if (typeof Achievements !== 'undefined') {
      Achievements.checkAllSilently();
    }
  },

  deleteRaceRecord(raceId) {
    let history = this.getHistory();
    history = history.filter(h => h.id !== raceId);
    this.saveHistory(history);
    this.recalculateAllFromHistory();
  },

  clearAllHistory() {
    this.saveHistory([]);
    this.recalculateAllFromHistory();
  },

  // ── Exclui uma season e todos os dados vinculados a ela ───────────────────
  deleteSeason(seasonId) {
    const seasons = this.getSeasons();
    const season  = seasons.find(s => s.id === seasonId);
    if (!season) return false;

    // 1. Remove as corridas do histórico que pertencem a esta season
    const gpIds = new Set((season.races || []).map(gp => gp.id));
    const history = this.getHistory().filter(h => !gpIds.has(h.gpId));
    this.saveHistory(history);

    // 2. Remove a season do array
    this.saveSeasons(seasons.filter(s => s.id !== seasonId));

    // 3. Remove registros de seasonHistory nos pilotos
    const drivers = this.getDrivers();
    drivers.forEach(d => {
      if (d.seasonHistory) {
        d.seasonHistory = d.seasonHistory.filter(r => r.seasonId !== seasonId);
      }
    });
    this.saveDrivers(drivers);

    // 4. Remove entradas de divisionHistory nas equipes (vinculadas por seasonId)
    const teams = this.getTeams();
    teams.forEach(t => {
      if (t.divisionHistory) {
        t.divisionHistory = t.divisionHistory.filter(e => e.seasonId !== seasonId);
      }
    });
    this.saveTeams(teams);

    // 5. Recalcula tudo a partir do histórico restante
    this.recalculateAllFromHistory();
    return true;
  },

  // ── Export / Import de todos os dados (backup completo) ──────────────────

  exportData() {
    // Coleta todas as chaves do localStorage que pertencem ao jogo
    const allKeys = Object.values(STORAGE_KEYS);
    const snapshot = {};
    let totalSize = 0;
    
    allKeys.forEach(key => {
      const raw = localStorage.getItem(key);
      if (raw !== null) {
        totalSize += raw.length;
        try { snapshot[key] = JSON.parse(raw); }
        catch { snapshot[key] = raw; }
      }
    });

    const payload = {
      _meta: {
        version: 2,
        exportedAt: new Date().toISOString(),
        appName: 'Tournament Racer GP',
        totalKeys: Object.keys(snapshot).length,
        totalSizeBytes: totalSize,
        totalSizeKB: (totalSize / 1024).toFixed(2)
      },
      data: snapshot
    };

    const json    = JSON.stringify(payload, null, 2);
    const blob    = new Blob([json], { type: 'application/json' });
    const url     = URL.createObjectURL(blob);
    const anchor  = document.createElement('a');
    const dateStr = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
    const timeStr = new Date().toLocaleTimeString('pt-BR').replace(/:/g, '-');
    anchor.href     = url;
    anchor.download = `tournament-racer-backup-${dateStr}-${timeStr}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    
    console.log(`Backup exportado: ${Object.keys(snapshot).length} chaves, ${(json.length / 1024).toFixed(2)} KB`);
    return { success: true, keys: Object.keys(snapshot).length, sizeKB: (json.length / 1024).toFixed(2) };
  },

  // Backup forçado para antes da migração (valida integridade)
  forceBackup() {
    try {
      const result = this.exportData();
      console.log('Backup forçado concluído com sucesso:', result);
      return result;
    } catch (e) {
      console.error('Erro ao forçar backup:', e);
      throw new Error(`Falha ao criar backup antes da migração: ${e.message}`);
    }
  },

  importData(jsonString) {
    let payload;
    try {
      payload = JSON.parse(jsonString);
    } catch {
      throw new Error('Arquivo inválido — não é um JSON válido.');
    }

    // Aceita tanto o formato com _meta/data quanto um dump direto de chaves
    const snapshot = payload.data ?? payload;

    const validKeys = new Set(Object.values(STORAGE_KEYS));
    const imported  = [];
    const skipped   = [];

    Object.entries(snapshot).forEach(([key, value]) => {
      if (validKeys.has(key)) {
        try {
          // Normaliza SVG paths ao importar tracks
          if (key === STORAGE_KEYS.TRACKS && Array.isArray(value)) {
            value = value.map(track => {
              if (track.svgPath && typeof Tracks !== 'undefined' && Tracks.normalizeSvgPath) {
                return { ...track, svgPath: Tracks.normalizeSvgPath(track.svgPath) };
              }
              return track;
            });
          }
          localStorage.setItem(key, JSON.stringify(value));
          imported.push(key);
        } catch (e) {
          console.error(`Error importing key ${key}:`, e);
          skipped.push(key);
        }
      }
    });

    if (imported.length === 0) {
      throw new Error('Nenhuma chave reconhecida encontrada no arquivo. Verifique se o backup é deste jogo.');
    }

    // Reinicializa o estado em memória a partir dos dados recém importados
    this.recalculateAllFromHistory();
    return { imported: imported.length, skipped: skipped.length };
  }
};
