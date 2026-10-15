/* ==========================================================================
   RACE SIMULATOR - ACHIEVEMENTS SYSTEM (js/achievements.js)
   Centralized Achievements for Pilots & Teams with local storage persistence,
   progress tracking, dark UI visual styling, and silent race processing.
   ========================================================================== */

const ACHIEVEMENT_RARITIES = {
  COMUM: {
    label: 'COMUM',
    color: '#94a3b8',
    bgColor: 'rgba(148, 163, 184, 0.12)',
    borderColor: '#64748b',
    icon: '⚪'
  },
  INCOMUM: {
    label: 'INCOMUM',
    color: '#10b981',
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#10b981',
    icon: '🟢'
  },
  RARA: {
    label: 'RARA',
    color: '#3b82f6',
    bgColor: 'rgba(59, 130, 246, 0.12)',
    borderColor: '#3b82f6',
    icon: '🔵'
  },
  ÉPICA: {
    label: 'ÉPICA',
    color: '#a855f7',
    bgColor: 'rgba(168, 85, 247, 0.15)',
    borderColor: '#a855f7',
    icon: '🟣'
  },
  LENDÁRIA: {
    label: 'LENDÁRIA',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.18)',
    borderColor: '#f59e0b',
    glow: '0 0 16px rgba(245, 158, 11, 0.35)',
    icon: '🟡'
  },
  MÍSTICA: {
    label: 'MÍSTICA',
    color: '#e879f9',
    bgColor: 'rgba(232, 121, 249, 0.10)',
    borderColor: '#d946ef',
    glow: '0 0 20px rgba(232, 121, 249, 0.40), inset 0 0 12px rgba(232, 121, 249, 0.06)',
    icon: '✨',
    extra: 'border-style: double; border-width: 2px;'
  },
  DIVINA: {
    label: 'DIVINA',
    color: '#fef08a',
    bgColor: 'rgba(250, 204, 21, 0.12)',
    borderColor: '#facc15',
    glow: '0 0 22px rgba(250, 204, 21, 0.32), inset 0 0 14px rgba(250, 204, 21, 0.08)',
    icon: '🌟',
    extra: 'border-style: double; border-width: 3px;'
  }
};

const ACHIEVEMENTS_LIST = [
  // =========================================================================
  // 1. CONQUISTAS DE PILOTOS
  // =========================================================================
  {
    id: 'p_first_win',
    type: 'pilot',
    name: 'PRIMEIRA VITÓRIA',
    description: 'Conquiste sua primeira vitória em uma corrida.',
    category: 'Corridas',
    icon: '🏆',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => {
      const wins = d.stats?.wins || 0;
      if (wins >= 1) return true;
      return h.some(race => race.results?.[0]?.driverId === d.id);
    },
    getProgress: (d, h, s) => {
      const wins = d.stats?.wins || 0;
      return { current: Math.min(wins, 1), target: 1 };
    }
  },
  {
    id: 'p_first_podium',
    type: 'pilot',
    name: 'PRIMEIRO PÓDIO',
    description: 'Conquiste seu primeiro pódio.',
    category: 'Corridas',
    icon: '🥇',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => {
      const podiums = d.stats?.podiums || 0;
      if (podiums >= 1) return true;
      return h.some(race => race.results?.some(r => r.driverId === d.id && r.position <= 3));
    },
    getProgress: (d, h, s) => {
      const podiums = d.stats?.podiums || 0;
      return { current: Math.min(podiums, 1), target: 1 };
    }
  },
  {
    id: 'p_pole_position',
    type: 'pilot',
    name: 'POLE POSITION',
    description: 'Conquiste sua primeira pole position.',
    category: 'Classificação',
    icon: '⚡',
    rarity: 'INCOMUM',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => {
      const poles = d.stats?.poles || 0;
      if (poles >= 1) return true;
      return h.some(race => race.results?.some(r => r.driverId === d.id && r.gridPos === 1));
    },
    getProgress: (d, h, s) => {
      const poles = d.stats?.poles || 0;
      return { current: Math.min(poles, 1), target: 1 };
    }
  },
  {
    id: 'p_hat_trick',
    type: 'pilot',
    name: 'HAT-TRICK',
    description: 'Conquiste 3 vitórias ao longo da carreira.',
    category: 'Corridas',
    icon: '🎩',
    rarity: 'RARA',
    maxProgress: 3,
    unit: 'vitórias',
    check: (d, h, s, tt, td, tm) => (d.stats?.wins || 0) >= 3,
    getProgress: (d, h, s) => {
      const wins = d.stats?.wins || 0;
      return { current: Math.min(wins, 3), target: 3 };
    }
  },
  {
    id: 'p_champion',
    type: 'pilot',
    name: 'CAMPEÃO',
    description: 'Conquiste seu primeiro campeonato.',
    category: 'Campeonatos',
    icon: '👑',
    rarity: 'ÉPICA',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => Achievements.getDriverTitlesCount(d.id, s) >= 1,
    getProgress: (d, h, s) => {
      const titles = Achievements.getDriverTitlesCount(d.id, s);
      return { current: Math.min(titles, 1), target: 1 };
    }
  },
  {
    id: 'p_veteran',
    type: 'pilot',
    name: 'VETERANO',
    description: 'Complete 100 corridas oficiais.',
    category: 'Carreira',
    icon: '🏎️',
    rarity: 'RARA',
    maxProgress: 100,
    unit: 'corridas',
    check: (d, h, s, tt, td, tm) => (d.stats?.races || 0) >= 100,
    getProgress: (d, h, s) => {
      const races = d.stats?.races || 0;
      return { current: Math.min(races, 100), target: 100 };
    }
  },
  {
    id: 'p_climber',
    type: 'pilot',
    name: 'ESCALADOR',
    description: 'Ganhe 10 ou mais posições durante uma corrida.',
    category: 'Desempenho',
    icon: '🚀',
    rarity: 'RARA',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => {
      return h.some(race => {
        const res = race.results?.find(r => r.driverId === d.id);
        return res && res.gridPos && res.position && (res.gridPos - res.position >= 10);
      });
    },
    getProgress: (d, h, s) => {
      let maxGained = 0;
      h.forEach(race => {
        const res = race.results?.find(r => r.driverId === d.id);
        if (res && res.gridPos && res.position) {
          const gained = res.gridPos - res.position;
          if (gained > maxGained) maxGained = gained;
        }
      });
      return { current: Math.min(Math.max(0, maxGained), 10), target: 10 };
    }
  },
  {
    id: 'p_dominant',
    type: 'pilot',
    name: 'DOMINANTE',
    description: 'Vença uma corrida com uma vantagem expressiva sobre o segundo colocado.',
    category: 'Desempenho',
    icon: '💥',
    rarity: 'ÉPICA',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => {
      return h.some(race => {
        if (!race.results || race.results.length < 2) return false;
        const winner = race.results[0];
        const second = race.results[1];
        if (winner.driverId !== d.id) return false;
        const winnerTime = winner.timeMs || winner.totalTimeMs;
        const secondTime = second.timeMs || second.totalTimeMs;
        if (!winnerTime || !secondTime) return false;
        const gap = secondTime - winnerTime;
        return gap >= 5000;
      });
    },
    getProgress: (d, h, s) => {
      let maxGapMs = 0;
      h.forEach(race => {
        if (!race.results || race.results.length < 2) return;
        const winner = race.results[0];
        const second = race.results[1];
        if (winner.driverId !== d.id) return;
        const winnerTime = winner.timeMs || winner.totalTimeMs;
        const secondTime = second.timeMs || second.totalTimeMs;
        if (winnerTime && secondTime && secondTime > winnerTime) {
          const gap = secondTime - winnerTime;
          if (gap > maxGapMs) maxGapMs = gap;
        }
      });
      const gapSec = Math.min(+(maxGapMs / 1000).toFixed(1), 5.0);
      return { current: gapSec, target: 5.0 };
    }
  },
  {
    id: 'p_king_of_lap',
    type: 'pilot',
    name: 'REI DA VOLTA',
    description: 'Registre 10 melhores voltas.',
    category: 'Desempenho',
    icon: '⏱️',
    rarity: 'ÉPICA',
    maxProgress: 10,
    unit: 'melhores voltas',
    check: (d, h, s, tt, td, tm) => {
      let count = 0;
      h.forEach(race => {
        if (race.fastestLap?.driverId === d.id) count++;
      });
      return count >= 10;
    },
    getProgress: (d, h, s) => {
      let count = 0;
      h.forEach(race => {
        if (race.fastestLap?.driverId === d.id) count++;
      });
      return { current: Math.min(count, 10), target: 10 };
    }
  },
  {
    id: 'p_consistent',
    type: 'pilot',
    name: 'CONSISTENTE',
    description: 'Complete 10 corridas consecutivas sem terminar fora do Top 10.',
    category: 'Consistência',
    icon: '🛡️',
    rarity: 'RARA',
    maxProgress: 10,
    unit: 'corridas no Top 10',
    check: (d, h, s, tt, td, tm) => Achievements.getDriverTop10Streak(d.id, h) >= 10,
    getProgress: (d, h, s) => {
      const streak = Achievements.getDriverTop10Streak(d.id, h);
      return { current: Math.min(streak, 10), target: 10 };
    }
  },
  {
    id: 'p_10_wins',
    type: 'pilot',
    name: 'DEZENA DE VITÓRIAS',
    description: 'Conquiste 10 vitórias na carreira.',
    category: 'Corridas',
    icon: '🌟',
    rarity: 'ÉPICA',
    maxProgress: 10,
    unit: 'vitórias',
    check: (d, h, s, tt, td, tm) => (d.stats?.wins || 0) >= 10,
    getProgress: (d, h, s) => {
      const wins = d.stats?.wins || 0;
      return { current: Math.min(wins, 10), target: 10 };
    }
  },

  // =========================================================================
  // 2. CONQUISTAS DE EQUIPES
  // =========================================================================
  {
    id: 't_first_win',
    type: 'team',
    name: 'PRIMEIRA VITÓRIA',
    description: 'Conquiste sua primeira vitória como equipe.',
    category: 'Coletivo',
    icon: '🏎️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(race => {
        const winner = race.results?.[0];
        return winner && (winner.teamId === team.id || teamDriverIds.has(winner.driverId));
      });
    },
    getProgress: (team, h, s, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      const wins = h.filter(race => {
        const winner = race.results?.[0];
        return winner && (winner.teamId === team.id || teamDriverIds.has(winner.driverId));
      }).length;
      return { current: Math.min(wins, 1), target: 1 };
    }
  },
  {
    id: 't_first_champion',
    type: 'team',
    name: 'PRIMEIRO CAMPEONATO',
    description: 'Conquiste seu primeiro campeonato de equipes.',
    category: 'Campeonatos',
    icon: '🏆',
    rarity: 'ÉPICA',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => Achievements.getTeamTitlesCount(team.id, s) >= 1,
    getProgress: (team, h, s, drivers) => {
      const titles = Achievements.getTeamTitlesCount(team.id, s);
      return { current: Math.min(titles, 1), target: 1 };
    }
  },
  {
    id: 't_collective_force',
    type: 'team',
    name: 'FORÇA COLETIVA',
    description: 'Coloque 3 pilotos da mesma equipe no Top 5.',
    category: 'Desempenho Coletivo',
    icon: '👥',
    rarity: 'RARA',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(race => {
        const count = (race.results || []).filter(r =>
          (r.teamId === team.id || teamDriverIds.has(r.driverId)) && r.position <= 5
        ).length;
        return count >= 3;
      });
    },
    getProgress: (team, h, s, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      let maxCount = 0;
      h.forEach(race => {
        const count = (race.results || []).filter(r =>
          (r.teamId === team.id || teamDriverIds.has(r.driverId)) && r.position <= 5
        ).length;
        if (count > maxCount) maxCount = count;
      });
      return { current: Math.min(maxCount, 3), target: 3 };
    }
  },
  {
    id: 't_dominance',
    type: 'team',
    name: 'DOMÍNIO',
    description: 'Coloque 4 pilotos da mesma equipe no Top 10.',
    category: 'Desempenho Coletivo',
    icon: '⚡',
    rarity: 'RARA',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(race => {
        const count = (race.results || []).filter(r =>
          (r.teamId === team.id || teamDriverIds.has(r.driverId)) && r.position <= 10
        ).length;
        return count >= 4;
      });
    },
    getProgress: (team, h, s, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      let maxCount = 0;
      h.forEach(race => {
        const count = (race.results || []).filter(r =>
          (r.teamId === team.id || teamDriverIds.has(r.driverId)) && r.position <= 10
        ).length;
        if (count > maxCount) maxCount = count;
      });
      return { current: Math.min(maxCount, 4), target: 4 };
    }
  },
  {
    id: 't_trinca',
    type: 'team',
    name: 'TRINCA',
    description: 'Conquiste P1, P2 e P3 com pilotos da mesma equipe.',
    category: 'Pódio Triplo',
    icon: '🥇',
    rarity: 'LENDÁRIA',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(race => {
        if (!race.results || race.results.length < 3) return false;
        const p1 = race.results[0];
        const p2 = race.results[1];
        const p3 = race.results[2];
        const p1Belongs = p1.teamId === team.id || teamDriverIds.has(p1.driverId);
        const p2Belongs = p2.teamId === team.id || teamDriverIds.has(p2.driverId);
        const p3Belongs = p3.teamId === team.id || teamDriverIds.has(p3.driverId);
        return p1Belongs && p2Belongs && p3Belongs;
      });
    },
    getProgress: (team, h, s, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      let maxInPodium = 0;
      h.forEach(race => {
        if (!race.results || race.results.length < 3) return;
        let count = 0;
        [race.results[0], race.results[1], race.results[2]].forEach(r => {
          if (r && (r.teamId === team.id || teamDriverIds.has(r.driverId))) count++;
        });
        if (count > maxInPodium) maxInPodium = count;
      });
      return { current: Math.min(maxInPodium, 3), target: 3 };
    }
  },
  {
    id: 't_unbeatable',
    type: 'team',
    name: 'EQUIPE IMBATÍVEL',
    description: 'Vença 5 corridas consecutivas.',
    category: 'Série de Vitórias',
    icon: '🔥',
    rarity: 'ÉPICA',
    maxProgress: 5,
    unit: 'vitórias consecutivas',
    check: (team, h, s, tt, td, tm, drivers) => Achievements.getTeamWinStreak(team.id, h, drivers) >= 5,
    getProgress: (team, h, s, drivers) => {
      const streak = Achievements.getTeamWinStreak(team.id, h, drivers);
      return { current: Math.min(streak, 5), target: 5 };
    }
  },
  {
    id: 't_dynasty',
    type: 'team',
    name: 'DINASTIA',
    description: 'Conquiste 3 campeonatos consecutivos.',
    category: 'Dinastia',
    icon: '👑',
    rarity: 'LENDÁRIA',
    maxProgress: 3,
    unit: 'campeonatos consecutivos',
    check: (team, h, s, tt, td, tm, drivers) => Achievements.getTeamConsecutiveTitles(team.id, s) >= 3,
    getProgress: (team, h, s, drivers) => {
      const streak = Achievements.getTeamConsecutiveTitles(team.id, s);
      return { current: Math.min(streak, 3), target: 3 };
    }
  },
  {
    id: 't_super_team',
    type: 'team',
    name: 'SUPER EQUIPE',
    description: 'Tenha 5 pilotos entre os melhores colocados de uma corrida.',
    category: 'Desempenho Coletivo',
    icon: '⭐',
    rarity: 'ÉPICA',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(race => {
        const count = (race.results || []).filter(r =>
          (r.teamId === team.id || teamDriverIds.has(r.driverId)) && r.position <= 10
        ).length;
        return count >= 5;
      });
    },
    getProgress: (team, h, s, drivers) => {
      const teamDriverIds = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      let maxCount = 0;
      h.forEach(race => {
        const count = (race.results || []).filter(r =>
          (r.teamId === team.id || teamDriverIds.has(r.driverId)) && r.position <= 10
        ).length;
        if (count > maxCount) maxCount = count;
      });
      return { current: Math.min(maxCount, 5), target: 5 };
    }
  },

  // =========================================================================
  // 3. CONQUISTAS GERAIS DE PILOTOS — MARCOS INICIAIS (COMUM)
  // =========================================================================
  {
    id: 'p_first_race',
    type: 'pilot',
    name: 'PRIMEIRO PASSO',
    description: 'Participe da sua primeira corrida oficial.',
    category: 'Carreira',
    icon: '🚦',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => (d.stats?.races || 0) >= 1,
    getProgress: (d) => ({ current: Math.min(d.stats?.races || 0, 1), target: 1 })
  },
  {
    id: 'p_first_top5',
    type: 'pilot',
    name: 'PRIMEIRO TOP 5',
    description: 'Termine entre os 5 primeiros pela primeira vez.',
    category: 'Corridas',
    icon: '🎯',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.results?.some(res => res.driverId === d.id && res.position <= 5)),
    getProgress: (d, h) => {
      const best = h.reduce((b, r) => {
        const res = r.results?.find(res => res.driverId === d.id);
        return res && res.position < b ? res.position : b;
      }, 99);
      return { current: best <= 5 ? 1 : 0, target: 1 };
    }
  },
  {
    id: 'p_first_top10',
    type: 'pilot',
    name: 'PRIMEIRO TOP 10',
    description: 'Termine entre os 10 primeiros pela primeira vez.',
    category: 'Corridas',
    icon: '📊',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.results?.some(res => res.driverId === d.id && res.position <= 10)),
    getProgress: (d, h) => ({
      current: h.some(r => r.results?.some(res => res.driverId === d.id && res.position <= 10)) ? 1 : 0,
      target: 1
    })
  },
  {
    id: 'p_first_points',
    type: 'pilot',
    name: 'PRIMEIROS PONTOS',
    description: 'Marque seus primeiros pontos em uma corrida oficial.',
    category: 'Corridas',
    icon: '✅',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d) => (d.stats?.points || 0) > 0,
    getProgress: (d) => ({ current: Math.min(d.stats?.points || 0, 1), target: 1 })
  },

  // =========================================================================
  // 4. CONQUISTAS GERAIS DE PILOTOS — INTERMEDIÁRIO (INCOMUM)
  // =========================================================================
  {
    id: 'p_5_wins',
    type: 'pilot',
    name: 'CHEGANDO AO TOPO',
    description: 'Conquiste 5 vitórias na carreira.',
    category: 'Corridas',
    icon: '🌠',
    rarity: 'INCOMUM',
    maxProgress: 5,
    unit: 'vitórias',
    check: (d) => (d.stats?.wins || 0) >= 5,
    getProgress: (d) => ({ current: Math.min(d.stats?.wins || 0, 5), target: 5 })
  },
  {
    id: 'p_10_podiums',
    type: 'pilot',
    name: 'COLECIONADOR DE PÓDIOS',
    description: 'Conquiste 10 pódios ao longo da carreira.',
    category: 'Corridas',
    icon: '🥈',
    rarity: 'INCOMUM',
    maxProgress: 10,
    unit: 'pódios',
    check: (d) => (d.stats?.podiums || 0) >= 10,
    getProgress: (d) => ({ current: Math.min(d.stats?.podiums || 0, 10), target: 10 })
  },
  {
    id: 'p_5_fastest_laps',
    type: 'pilot',
    name: 'VELOCISTA',
    description: 'Registre 5 voltas mais rápidas em corridas oficiais.',
    category: 'Desempenho',
    icon: '⚡',
    rarity: 'INCOMUM',
    maxProgress: 5,
    unit: 'voltas rápidas',
    check: (d, h) => {
      let c = 0;
      h.forEach(r => { if (r.fastestLap?.driverId === d.id) c++; });
      return c >= 5;
    },
    getProgress: (d, h) => {
      let c = 0;
      h.forEach(r => { if (r.fastestLap?.driverId === d.id) c++; });
      return { current: Math.min(c, 5), target: 5 };
    }
  },
  {
    id: 'p_25_races',
    type: 'pilot',
    name: 'PRESENÇA CONSTANTE',
    description: 'Participe de 25 corridas oficiais.',
    category: 'Carreira',
    icon: '🏁',
    rarity: 'INCOMUM',
    maxProgress: 25,
    unit: 'corridas',
    check: (d) => (d.stats?.races || 0) >= 25,
    getProgress: (d) => ({ current: Math.min(d.stats?.races || 0, 25), target: 25 })
  },
  {
    id: 'p_10_top10',
    type: 'pilot',
    name: 'PILOTO REGULAR',
    description: 'Consiga 10 resultados no Top 10 ao longo da carreira.',
    category: 'Consistência',
    icon: '📈',
    rarity: 'INCOMUM',
    maxProgress: 10,
    unit: 'Top 10',
    check: (d, h) => {
      const count = h.filter(r => r.results?.some(res => res.driverId === d.id && res.position <= 10)).length;
      return count >= 10;
    },
    getProgress: (d, h) => {
      const count = h.filter(r => r.results?.some(res => res.driverId === d.id && res.position <= 10)).length;
      return { current: Math.min(count, 10), target: 10 };
    }
  },

  // =========================================================================
  // 5. CONQUISTAS GERAIS DE PILOTOS — RARA
  // =========================================================================
  {
    id: 'p_25_podiums',
    type: 'pilot',
    name: 'ESPECIALISTA EM PÓDIOS',
    description: 'Conquiste 25 pódios ao longo da carreira.',
    category: 'Corridas',
    icon: '🎖️',
    rarity: 'RARA',
    maxProgress: 25,
    unit: 'pódios',
    check: (d) => (d.stats?.podiums || 0) >= 25,
    getProgress: (d) => ({ current: Math.min(d.stats?.podiums || 0, 25), target: 25 })
  },
  {
    id: 'p_50_races',
    type: 'pilot',
    name: 'MEIO CENTENÁRIO',
    description: 'Participe de 50 corridas oficiais.',
    category: 'Carreira',
    icon: '🏎️',
    rarity: 'RARA',
    maxProgress: 50,
    unit: 'corridas',
    check: (d) => (d.stats?.races || 0) >= 50,
    getProgress: (d) => ({ current: Math.min(d.stats?.races || 0, 50), target: 50 })
  },

  // =========================================================================
  // 6. CONQUISTAS GERAIS DE PILOTOS — ÉPICA
  // =========================================================================
  {
    id: 'p_top5_streak_10',
    type: 'pilot',
    name: 'INVICTO NO TOP 5',
    description: 'Termine 10 corridas consecutivas no Top 5.',
    category: 'Consistência',
    icon: '🔒',
    rarity: 'ÉPICA',
    maxProgress: 10,
    unit: 'corridas Top 5',
    check: (d, h) => Achievements.getDriverTop5Streak(d.id, h) >= 10,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverTop5Streak(d.id, h), 10), target: 10 })
  },
  {
    id: 'p_50_podiums',
    type: 'pilot',
    name: 'MÁQUINA DE PÓDIOS',
    description: 'Conquiste 50 pódios ao longo da carreira.',
    category: 'Corridas',
    icon: '🏅',
    rarity: 'ÉPICA',
    maxProgress: 50,
    unit: 'pódios',
    check: (d) => (d.stats?.podiums || 0) >= 50,
    getProgress: (d) => ({ current: Math.min(d.stats?.podiums || 0, 50), target: 50 })
  },
  {
    id: 'p_100_top10',
    type: 'pilot',
    name: 'CENTENÁRIO DE TOP 10',
    description: 'Consiga 100 resultados no Top 10 ao longo da carreira.',
    category: 'Consistência',
    icon: '💯',
    rarity: 'ÉPICA',
    maxProgress: 100,
    unit: 'Top 10',
    check: (d, h) => {
      const c = h.filter(r => r.results?.some(res => res.driverId === d.id && res.position <= 10)).length;
      return c >= 100;
    },
    getProgress: (d, h) => {
      const c = h.filter(r => r.results?.some(res => res.driverId === d.id && res.position <= 10)).length;
      return { current: Math.min(c, 100), target: 100 };
    }
  },

  // =========================================================================
  // 7. CONQUISTAS GERAIS DE PILOTOS — LENDÁRIA
  // =========================================================================
  {
    id: 'p_25_wins',
    type: 'pilot',
    name: 'LENDA DAS PISTAS',
    description: 'Conquiste 25 vitórias na carreira.',
    category: 'Corridas',
    icon: '🌟',
    rarity: 'LENDÁRIA',
    maxProgress: 25,
    unit: 'vitórias',
    check: (d) => (d.stats?.wins || 0) >= 25,
    getProgress: (d) => ({ current: Math.min(d.stats?.wins || 0, 25), target: 25 })
  },
  {
    id: 'p_win_streak_5',
    type: 'pilot',
    name: 'DOMÍNIO ABSOLUTO',
    description: 'Vença 5 corridas consecutivas.',
    category: 'Série de Vitórias',
    icon: '🔥',
    rarity: 'LENDÁRIA',
    maxProgress: 5,
    unit: 'vitórias consecutivas',
    check: (d, h) => Achievements.getDriverWinStreak(d.id, h) >= 5,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverWinStreak(d.id, h), 5), target: 5 })
  },

  // =========================================================================
  // 8. CONQUISTAS GERAIS DE PILOTOS — MÍSTICA
  // =========================================================================
  {
    id: 'p_immortal',
    type: 'pilot',
    name: 'IMORTAL',
    description: 'Conquiste 50 vitórias na carreira — um feito reservado aos maiores de todos os tempos.',
    category: 'Corridas',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: 50,
    unit: 'vitórias',
    check: (d) => (d.stats?.wins || 0) >= 50,
    getProgress: (d) => ({ current: Math.min(d.stats?.wins || 0, 50), target: 50 })
  },
  {
    id: 'p_perfection',
    type: 'pilot',
    name: 'PERFEIÇÃO',
    description: 'Termine 15 corridas consecutivas no Top 3 — consistência sobrehumana.',
    category: 'Consistência',
    icon: '💎',
    rarity: 'MÍSTICA',
    maxProgress: 15,
    unit: 'corridas Top 3',
    check: (d, h) => Achievements.getDriverPodiumStreak(d.id, h) >= 15,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverPodiumStreak(d.id, h), 15), target: 15 })
  },
  {
    id: 'p_history_name',
    type: 'pilot',
    name: 'O NOME DA HISTÓRIA',
    description: 'Alcance simultaneamente 30+ vitórias, 80+ pódios, 200+ corridas e 3+ títulos de campeonato.',
    category: 'Carreira',
    icon: '🌌',
    rarity: 'MÍSTICA',
    maxProgress: null,
    check: (d, h, s) =>
      (d.stats?.wins || 0) >= 30 &&
      (d.stats?.podiums || 0) >= 80 &&
      (d.stats?.races || 0) >= 200 &&
      Achievements.getDriverTitlesCount(d.id, s) >= 3,
    getProgress: (d, h, s) => {
      const w = d.stats?.wins || 0;
      const p = d.stats?.podiums || 0;
      const r = d.stats?.races || 0;
      const t = Achievements.getDriverTitlesCount(d.id, s);
      const score = Math.floor((Math.min(w/30,1) + Math.min(p/80,1) + Math.min(r/200,1) + Math.min(t/3,1)) / 4 * 100);
      return { current: score, target: 100 };
    }
  },

  // =========================================================================
  // 9. CONQUISTAS DE CAMPEONATO / SÉRIES — COMUM
  // =========================================================================
  {
    id: 'p_first_season',
    type: 'pilot',
    name: 'PRIMEIRA TEMPORADA',
    description: 'Complete uma temporada oficial participando de pelo menos um GP.',
    category: 'Campeonato',
    icon: '📅',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h, s) => s.some(season =>
      (season.races || []).some(gp => gp.completed) &&
      (season.standings || []).some(st => st.driverId === d.id && st.points >= 0)
    ),
    getProgress: (d, h, s) => ({
      current: s.some(season => (season.races || []).some(gp => gp.completed) && (season.standings || []).some(st => st.driverId === d.id)) ? 1 : 0,
      target: 1
    })
  },

  // =========================================================================
  // 10. CONQUISTAS DE CAMPEONATO / SÉRIES — INCOMUM
  // =========================================================================
  {
    id: 'p_promotion',
    type: 'pilot',
    name: 'SUBINDO DE SÉRIE',
    description: 'Seja promovido para uma série superior ao fim de uma temporada.',
    category: 'Campeonato',
    icon: '⬆️',
    rarity: 'INCOMUM',
    maxProgress: null,
    check: (d, h, s) => {
      const drivers = Storage.getDrivers();
      const driver = drivers.find(dr => dr.id === d.id);
      return (driver?.seasonHistory || []).some(rec => rec.divisionChange === 'promoted');
    },
    getProgress: (d) => {
      const drivers = Storage.getDrivers();
      const driver = drivers.find(dr => dr.id === d.id);
      const c = (driver?.seasonHistory || []).filter(r => r.divisionChange === 'promoted').length;
      return { current: Math.min(c, 1), target: 1 };
    }
  },

  // =========================================================================
  // 11. CONQUISTAS DE CAMPEONATO / SÉRIES — RARA
  // =========================================================================
  {
    id: 'p_bicampeon',
    type: 'pilot',
    name: 'BICAMPEÃO',
    description: 'Conquiste 2 campeonatos ao longo da carreira.',
    category: 'Campeonato',
    icon: '👑',
    rarity: 'RARA',
    maxProgress: 2,
    unit: 'títulos',
    check: (d, h, s) => Achievements.getDriverTitlesCount(d.id, s) >= 2,
    getProgress: (d, h, s) => ({ current: Math.min(Achievements.getDriverTitlesCount(d.id, s), 2), target: 2 })
  },

  // =========================================================================
  // 12. CONQUISTAS DE CAMPEONATO / SÉRIES — ÉPICA
  // =========================================================================
  {
    id: 'p_tricampeon',
    type: 'pilot',
    name: 'TRICAMPEÃO',
    description: 'Conquiste 3 campeonatos ao longo da carreira.',
    category: 'Campeonato',
    icon: '🏆',
    rarity: 'ÉPICA',
    maxProgress: 3,
    unit: 'títulos',
    check: (d, h, s) => Achievements.getDriverTitlesCount(d.id, s) >= 3,
    getProgress: (d, h, s) => ({ current: Math.min(Achievements.getDriverTitlesCount(d.id, s), 3), target: 3 })
  },

  // =========================================================================
  // 13. CONQUISTAS DE CAMPEONATO / SÉRIES — LENDÁRIA
  // =========================================================================
  {
    id: 'p_dynasty_pilot',
    type: 'pilot',
    name: 'DINASTIA',
    description: 'Conquiste 3 campeonatos consecutivos.',
    category: 'Campeonato',
    icon: '🌠',
    rarity: 'LENDÁRIA',
    maxProgress: 3,
    unit: 'títulos consecutivos',
    check: (d, h, s) => Achievements.getDriverConsecutiveTitles(d.id, s) >= 3,
    getProgress: (d, h, s) => ({ current: Math.min(Achievements.getDriverConsecutiveTitles(d.id, s), 3), target: 3 })
  },

  // =========================================================================
  // 14. CONQUISTAS DE CAMPEONATO / SÉRIES — MÍSTICA
  // =========================================================================
  {
    id: 'p_golden_era',
    type: 'pilot',
    name: 'ERA DOURADA',
    description: 'Conquiste 5 campeonatos consecutivos — dominância histórica absoluta.',
    category: 'Campeonato',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: 5,
    unit: 'títulos consecutivos',
    check: (d, h, s) => Achievements.getDriverConsecutiveTitles(d.id, s) >= 5,
    getProgress: (d, h, s) => ({ current: Math.min(Achievements.getDriverConsecutiveTitles(d.id, s), 5), target: 5 })
  },
  {
    id: 'p_emperor_series',
    type: 'pilot',
    name: 'IMPERADOR DAS SÉRIES',
    description: 'Conquiste 6+ títulos no total, incluindo 3+ consecutivos e 50+ pódios.',
    category: 'Campeonato',
    icon: '🌌',
    rarity: 'MÍSTICA',
    maxProgress: null,
    check: (d, h, s) =>
      Achievements.getDriverTitlesCount(d.id, s) >= 6 &&
      Achievements.getDriverConsecutiveTitles(d.id, s) >= 3 &&
      (d.stats?.podiums || 0) >= 50,
    getProgress: (d, h, s) => {
      const t = Achievements.getDriverTitlesCount(d.id, s);
      const ct = Achievements.getDriverConsecutiveTitles(d.id, s);
      const p = d.stats?.podiums || 0;
      const score = Math.floor((Math.min(t/6,1) + Math.min(ct/3,1) + Math.min(p/50,1)) / 3 * 100);
      return { current: score, target: 100 };
    }
  },

  // =========================================================================
  // 15. CONQUISTAS DE TIME-TRIAL — COMUM
  // =========================================================================
  {
    id: 'p_tt_first',
    type: 'pilot',
    name: 'CONTRA O RELÓGIO',
    description: 'Registre seu primeiro tempo em uma sessão de Time-Trial.',
    category: 'Time-Trial',
    icon: '⏱️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h, s, tt) => tt.some(t => t.driverId === d.id),
    getProgress: (d, h, s, tt) => ({ current: tt.some(t => t.driverId === d.id) ? 1 : 0, target: 1 })
  },
  {
    id: 'p_tt_first_record',
    type: 'pilot',
    name: 'PRIMEIRO RECORDE MUNDIAL',
    description: 'Conquiste seu primeiro Recorde Mundial em uma pista de Time-Trial.',
    category: 'Time-Trial',
    icon: '🥇',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h, s, tt) => Achievements.getDriverWorldRecordCount(d.id, tt) >= 1,
    getProgress: (d, h, s, tt) => ({ current: Math.min(Achievements.getDriverWorldRecordCount(d.id, tt), 1), target: 1 })
  },

  // =========================================================================
  // 16. CONQUISTAS DE TIME-TRIAL — INCOMUM
  // =========================================================================
  {
    id: 'p_tt_3_records',
    type: 'pilot',
    name: 'CAÇADOR DE RECORDES',
    description: 'Conquiste 3 Recordes Mundiais em pistas diferentes.',
    category: 'Time-Trial',
    icon: '🎯',
    rarity: 'INCOMUM',
    maxProgress: 3,
    unit: 'recordes',
    check: (d, h, s, tt) => Achievements.getDriverWorldRecordCount(d.id, tt) >= 3,
    getProgress: (d, h, s, tt) => ({ current: Math.min(Achievements.getDriverWorldRecordCount(d.id, tt), 3), target: 3 })
  },

  // =========================================================================
  // 17. CONQUISTAS DE TIME-TRIAL — RARA
  // =========================================================================
  {
    id: 'p_tt_5_records',
    type: 'pilot',
    name: 'COLECIONADOR DE RECORDES',
    description: 'Conquiste Recordes Mundiais em 5 pistas diferentes.',
    category: 'Time-Trial',
    icon: '🏆',
    rarity: 'RARA',
    maxProgress: 5,
    unit: 'recordes',
    check: (d, h, s, tt) => Achievements.getDriverWorldRecordCount(d.id, tt) >= 5,
    getProgress: (d, h, s, tt) => ({ current: Math.min(Achievements.getDriverWorldRecordCount(d.id, tt), 5), target: 5 })
  },
  {
    id: 'p_tt_3_tracks',
    type: 'pilot',
    name: 'VELOCISTA MUNDIAL',
    description: 'Domine o cronômetro em pelo menos 3 pistas diferentes com Recordes Mundiais.',
    category: 'Time-Trial',
    icon: '🌐',
    rarity: 'RARA',
    maxProgress: 3,
    unit: 'pistas',
    check: (d, h, s, tt) => Achievements.getDriverWorldRecordCount(d.id, tt) >= 3,
    getProgress: (d, h, s, tt) => ({ current: Math.min(Achievements.getDriverWorldRecordCount(d.id, tt), 3), target: 3 })
  },

  // =========================================================================
  // 18. CONQUISTAS DE TIME-TRIAL — ÉPICA
  // =========================================================================
  {
    id: 'p_tt_10_records',
    type: 'pilot',
    name: 'SENHOR DO CRONÔMETRO',
    description: 'Domine 10 Recordes Mundiais em pistas diferentes.',
    category: 'Time-Trial',
    icon: '⌚',
    rarity: 'ÉPICA',
    maxProgress: 10,
    unit: 'recordes',
    check: (d, h, s, tt) => Achievements.getDriverWorldRecordCount(d.id, tt) >= 10,
    getProgress: (d, h, s, tt) => ({ current: Math.min(Achievements.getDriverWorldRecordCount(d.id, tt), 10), target: 10 })
  },

  // =========================================================================
  // 19. CONQUISTAS DE TIME-TRIAL — LENDÁRIA
  // =========================================================================
  {
    id: 'p_tt_15_records',
    type: 'pilot',
    name: 'REI DO TIME-TRIAL',
    description: 'Conquiste 15 Recordes Mundiais — dominância total sobre o cronômetro.',
    category: 'Time-Trial',
    icon: '👑',
    rarity: 'LENDÁRIA',
    maxProgress: 15,
    unit: 'recordes',
    check: (d, h, s, tt) => Achievements.getDriverWorldRecordCount(d.id, tt) >= 15,
    getProgress: (d, h, s, tt) => ({ current: Math.min(Achievements.getDriverWorldRecordCount(d.id, tt), 15), target: 15 })
  },

  // =========================================================================
  // 20. CONQUISTAS DE TIME-TRIAL — MÍSTICA
  // =========================================================================
  {
    id: 'p_tt_legend',
    type: 'pilot',
    name: 'LENDA DO CRONÔMETRO',
    description: 'Domine os Recordes Mundiais em 80% ou mais de todas as pistas cadastradas.',
    category: 'Time-Trial',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: null,
    check: (d, h, s, tt) => {
      const totalTracks = Storage.getTracks().length;
      if (totalTracks === 0) return false;
      const dominated = Achievements.getDriverWorldRecordCount(d.id, tt);
      return dominated / totalTracks >= 0.8;
    },
    getProgress: (d, h, s, tt) => {
      const totalTracks = Storage.getTracks().length || 1;
      const dominated = Achievements.getDriverWorldRecordCount(d.id, tt);
      return { current: dominated, target: Math.ceil(totalTracks * 0.8) };
    }
  },

  // =========================================================================
  // 21. CONQUISTAS DE EQUIPE X EQUIPE — COMUM
  // =========================================================================
  {
    id: 'p_duel_first',
    type: 'pilot',
    name: 'PRIMEIRO DUELO',
    description: 'Participe de sua primeira disputa Equipe x Equipe.',
    category: 'Equipe x Equipe',
    icon: '⚔️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.isTeamDuel && r.results?.some(res => res.driverId === d.id)),
    getProgress: (d, h) => ({
      current: h.some(r => r.isTeamDuel && r.results?.some(res => res.driverId === d.id)) ? 1 : 0,
      target: 1
    })
  },
  {
    id: 't_duel_first_win',
    type: 'team',
    name: 'PRIMEIRA VITÓRIA DE EQUIPE',
    description: 'Vença seu primeiro duelo no modo Equipe x Equipe.',
    category: 'Equipe x Equipe',
    icon: '⚔️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (team, h, s, tt, td) => td.some(d => d.winnerTeamId === team.id),
    getProgress: (team, h, s, drivers, td) => ({
      current: (td || []).some(d => d.winnerTeamId === team.id) ? 1 : 0,
      target: 1
    })
  },

  // =========================================================================
  // 22. CONQUISTAS DE EQUIPE X EQUIPE — INCOMUM
  // =========================================================================
  {
    id: 't_duel_5_wins',
    type: 'team',
    name: 'ESPECIALISTA EM DUELO',
    description: 'Conquiste 5 vitórias no modo Equipe x Equipe.',
    category: 'Equipe x Equipe',
    icon: '🛡️',
    rarity: 'INCOMUM',
    maxProgress: 5,
    unit: 'vitórias em duelo',
    check: (team, h, s, tt, td) => (td || []).filter(d => d.winnerTeamId === team.id).length >= 5,
    getProgress: (team, h, s, drivers, td) => ({
      current: Math.min((td || []).filter(d => d.winnerTeamId === team.id).length, 5),
      target: 5
    })
  },

  // =========================================================================
  // 23. CONQUISTAS DE EQUIPE X EQUIPE — RARA
  // =========================================================================
  {
    id: 't_duel_win_streak_3',
    type: 'team',
    name: 'DOMINÂNCIA COLETIVA',
    description: 'Vença 3 duelos consecutivos no modo Equipe x Equipe.',
    category: 'Equipe x Equipe',
    icon: '💪',
    rarity: 'RARA',
    maxProgress: 3,
    unit: 'duelos consecutivos',
    check: (team, h, s, tt, td) => Achievements.getTeamDuelWinStreak(team.id, td || []) >= 3,
    getProgress: (team, h, s, drivers, td) => ({
      current: Math.min(Achievements.getTeamDuelWinStreak(team.id, td || []), 3),
      target: 3
    })
  },
  {
    id: 't_duel_rivalry',
    type: 'team',
    name: 'RIVALIDADE HISTÓRICA',
    description: 'Dispute 5 ou mais confrontos diretos contra a mesma equipe adversária.',
    category: 'Equipe x Equipe',
    icon: '🔥',
    rarity: 'RARA',
    maxProgress: 5,
    unit: 'confrontos vs mesma equipe',
    check: (team, h, s, tt, td) => Achievements.getMaxDuelsVsSameTeam(team.id, td || []) >= 5,
    getProgress: (team, h, s, drivers, td) => ({
      current: Math.min(Achievements.getMaxDuelsVsSameTeam(team.id, td || []), 5),
      target: 5
    })
  },

  // =========================================================================
  // 24. CONQUISTAS DE EQUIPE X EQUIPE — ÉPICA
  // =========================================================================
  {
    id: 't_duel_nemesis_wins',
    type: 'team',
    name: 'CARRASCO',
    description: 'Vença 5 duelos contra a mesma equipe adversária.',
    category: 'Equipe x Equipe',
    icon: '💀',
    rarity: 'ÉPICA',
    maxProgress: 5,
    unit: 'vitórias vs mesma equipe',
    check: (team, h, s, tt, td) => Achievements.getMaxWinsVsSameTeam(team.id, td || []) >= 5,
    getProgress: (team, h, s, drivers, td) => ({
      current: Math.min(Achievements.getMaxWinsVsSameTeam(team.id, td || []), 5),
      target: 5
    })
  },
  {
    id: 't_duel_win_streak_5',
    type: 'team',
    name: 'MURALHA',
    description: 'Vença 5 duelos consecutivos no modo Equipe x Equipe.',
    category: 'Equipe x Equipe',
    icon: '🧱',
    rarity: 'ÉPICA',
    maxProgress: 5,
    unit: 'duelos consecutivos',
    check: (team, h, s, tt, td) => Achievements.getTeamDuelWinStreak(team.id, td || []) >= 5,
    getProgress: (team, h, s, drivers, td) => ({
      current: Math.min(Achievements.getTeamDuelWinStreak(team.id, td || []), 5),
      target: 5
    })
  },

  // =========================================================================
  // 25. CONQUISTAS DE EQUIPE X EQUIPE — LENDÁRIA
  // =========================================================================
  {
    id: 't_duel_domination',
    type: 'team',
    name: 'DOMÍNIO ABSOLUTO',
    description: 'Domine uma rivalidade com 10+ confrontos diretos e taxa de vitória acima de 70%.',
    category: 'Equipe x Equipe',
    icon: '⚡',
    rarity: 'LENDÁRIA',
    maxProgress: null,
    check: (team, h, s, tt, td) => {
      const duels = td || [];
      const teamMap = new Map();
      duels.forEach(d => {
        const opp = d.teamAId === team.id ? d.teamBId : d.teamBId === team.id ? d.teamAId : null;
        if (!opp) return;
        if (!teamMap.has(opp)) teamMap.set(opp, { total: 0, wins: 0 });
        const entry = teamMap.get(opp);
        entry.total++;
        if (d.winnerTeamId === team.id) entry.wins++;
      });
      for (const entry of teamMap.values()) {
        if (entry.total >= 10 && entry.wins / entry.total >= 0.7) return true;
      }
      return false;
    },
    getProgress: (team, h, s, drivers, td) => {
      const duels = td || [];
      const teamMap = new Map();
      duels.forEach(d => {
        const opp = d.teamAId === team.id ? d.teamBId : d.teamBId === team.id ? d.teamAId : null;
        if (!opp) return;
        if (!teamMap.has(opp)) teamMap.set(opp, { total: 0, wins: 0 });
        const entry = teamMap.get(opp);
        entry.total++;
        if (d.winnerTeamId === team.id) entry.wins++;
      });
      let best = 0;
      for (const entry of teamMap.values()) {
        const score = Math.floor((Math.min(entry.total/10,1) + Math.min(entry.wins/(entry.total||1)/0.7,1)) / 2 * 100);
        if (score > best) best = score;
      }
      return { current: best, target: 100 };
    }
  },

  // =========================================================================
  // 26. CONQUISTAS DE EQUIPE X EQUIPE — MÍSTICA
  // =========================================================================
  {
    id: 't_duel_nemesis',
    type: 'team',
    name: 'NÊMESIS',
    description: 'Construa uma rivalidade histórica: 15+ confrontos e 75%+ de aproveitamento contra o mesmo adversário.',
    category: 'Equipe x Equipe',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: null,
    check: (team, h, s, tt, td) => {
      const duels = td || [];
      const teamMap = new Map();
      duels.forEach(d => {
        const opp = d.teamAId === team.id ? d.teamBId : d.teamBId === team.id ? d.teamAId : null;
        if (!opp) return;
        if (!teamMap.has(opp)) teamMap.set(opp, { total: 0, wins: 0 });
        const e = teamMap.get(opp); e.total++; if (d.winnerTeamId === team.id) e.wins++;
      });
      for (const e of teamMap.values()) {
        if (e.total >= 15 && e.wins / e.total >= 0.75) return true;
      }
      return false;
    },
    getProgress: (team, h, s, drivers, td) => {
      const duels = td || [];
      const teamMap = new Map();
      duels.forEach(d => {
        const opp = d.teamAId === team.id ? d.teamBId : d.teamBId === team.id ? d.teamAId : null;
        if (!opp) return;
        if (!teamMap.has(opp)) teamMap.set(opp, { total: 0, wins: 0 });
        const e = teamMap.get(opp); e.total++; if (d.winnerTeamId === team.id) e.wins++;
      });
      let best = 0;
      for (const e of teamMap.values()) {
        const sc = Math.floor((Math.min(e.total/15,1) + Math.min(e.wins/(e.total||1)/0.75,1)) / 2 * 100);
        if (sc > best) best = sc;
      }
      return { current: best, target: 100 };
    }
  },
  {
    id: 't_duel_terror',
    type: 'team',
    name: 'TERROR DO GRID',
    description: 'Vença 10 duelos consecutivos no modo Equipe x Equipe — sequência praticamente imbatível.',
    category: 'Equipe x Equipe',
    icon: '💀',
    rarity: 'MÍSTICA',
    maxProgress: 10,
    unit: 'duelos consecutivos',
    check: (team, h, s, tt, td) => Achievements.getTeamDuelWinStreak(team.id, td || []) >= 10,
    getProgress: (team, h, s, drivers, td) => ({
      current: Math.min(Achievements.getTeamDuelWinStreak(team.id, td || []), 10),
      target: 10
    })
  },

  // =========================================================================
  // 27. CONQUISTAS DO MODO RANQUEADO — COMUM
  // =========================================================================
  {
    id: 'p_ranked_first',
    type: 'pilot',
    name: 'PRIMEIRA RANQUEADA',
    description: 'Jogue sua primeira partida no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '🎖️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.isRanked && r.results?.some(res => res.driverId === d.id)),
    getProgress: (d, h) => ({
      current: h.some(r => r.isRanked && r.results?.some(res => res.driverId === d.id)) ? 1 : 0,
      target: 1
    })
  },
  {
    id: 'p_ranked_first_win',
    type: 'pilot',
    name: 'PRIMEIRA VITÓRIA RANQUEADA',
    description: 'Vença sua primeira partida no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '🥇',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.isRanked && r.results?.[0]?.driverId === d.id),
    getProgress: (d, h) => ({
      current: h.some(r => r.isRanked && r.results?.[0]?.driverId === d.id) ? 1 : 0,
      target: 1
    })
  },

  // =========================================================================
  // 28. CONQUISTAS DO MODO RANQUEADO — INCOMUM
  // =========================================================================
  {
    id: 'p_ranked_10_matches',
    type: 'pilot',
    name: 'COMPETIDOR RANQUEADO',
    description: 'Dispute 10 partidas no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '📊',
    rarity: 'INCOMUM',
    maxProgress: 10,
    unit: 'partidas',
    check: (d, h, s, tt, td, tm, drivers) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.matches || 0) >= 10;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.matches || 0, 10), target: 10 };
    }
  },
  {
    id: 'p_ranked_10_wins',
    type: 'pilot',
    name: 'VITÓRIAS RANQUEADAS',
    description: 'Conquiste 10 vitórias no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '🏆',
    rarity: 'INCOMUM',
    maxProgress: 10,
    unit: 'vitórias ranqueadas',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.wins || 0) >= 10;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.wins || 0, 10), target: 10 };
    }
  },
  {
    id: 'p_ranked_mmr_1500',
    type: 'pilot',
    name: 'ESCALADOR DE MMR',
    description: 'Alcance 1500 pontos de MMR no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '📈',
    rarity: 'INCOMUM',
    maxProgress: 1500,
    unit: 'MMR',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.rating || 1200) >= 1500;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.rating || 1200, 1500), target: 1500 };
    }
  },

  // =========================================================================
  // 29. CONQUISTAS DO MODO RANQUEADO — RARA
  // =========================================================================
  {
    id: 'p_ranked_50_matches',
    type: 'pilot',
    name: 'VETERANO RANQUEADO',
    description: 'Dispute 50 partidas no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '🎯',
    rarity: 'RARA',
    maxProgress: 50,
    unit: 'partidas',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.matches || 0) >= 50;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.matches || 0, 50), target: 50 };
    }
  },
  {
    id: 'p_ranked_25_wins',
    type: 'pilot',
    name: 'ESPECIALISTA RANQUEADO',
    description: 'Conquiste 25 vitórias no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '⭐',
    rarity: 'RARA',
    maxProgress: 25,
    unit: 'vitórias ranqueadas',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.wins || 0) >= 25;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.wins || 0, 25), target: 25 };
    }
  },
  {
    id: 'p_ranked_mmr_2000',
    type: 'pilot',
    name: 'ELITE',
    description: 'Alcance 2000 pontos de MMR no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '💎',
    rarity: 'RARA',
    maxProgress: 2000,
    unit: 'MMR',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.rating || 1200) >= 2000;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.rating || 1200, 2000), target: 2000 };
    }
  },

  // =========================================================================
  // 30. CONQUISTAS DO MODO RANQUEADO — ÉPICA
  // =========================================================================
  {
    id: 'p_ranked_mmr_2700',
    type: 'pilot',
    name: 'MESTRE DO RANQUEADO',
    description: 'Alcance 2700 pontos de MMR — nível de excelência absoluta.',
    category: 'Ranqueado',
    icon: '👑',
    rarity: 'ÉPICA',
    maxProgress: 2700,
    unit: 'MMR',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.rating || 1200) >= 2700;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.rating || 1200, 2700), target: 2700 };
    }
  },
  {
    id: 'p_ranked_100_matches',
    type: 'pilot',
    name: 'CENTURIÃO RANQUEADO',
    description: 'Complete 100 partidas no modo Ranqueado.',
    category: 'Ranqueado',
    icon: '💯',
    rarity: 'ÉPICA',
    maxProgress: 100,
    unit: 'partidas',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.matches || 0) >= 100;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.matches || 0, 100), target: 100 };
    }
  },

  // =========================================================================
  // 31. CONQUISTAS DO MODO RANQUEADO — LENDÁRIA
  // =========================================================================
  {
    id: 'p_ranked_mmr_3500',
    type: 'pilot',
    name: 'LENDA RANQUEADA',
    description: 'Alcance 3500 pontos de MMR — o patamar das verdadeiras lendas.',
    category: 'Ranqueado',
    icon: '🌟',
    rarity: 'LENDÁRIA',
    maxProgress: 3500,
    unit: 'MMR',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.rating || 1200) >= 3500;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.rating || 1200, 3500), target: 3500 };
    }
  },

  // =========================================================================
  // 32. CONQUISTAS DO MODO RANQUEADO — MÍSTICA
  // =========================================================================
  {
    id: 'p_ranked_monster_mmr',
    type: 'pilot',
    name: 'MONSTRO DO MMR',
    description: 'Alcance 4500 pontos de MMR — rating que define uma era.',
    category: 'Ranqueado',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: 4500,
    unit: 'MMR',
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.rating || 1200) >= 4500;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return { current: Math.min(rs?.rating || 1200, 4500), target: 4500 };
    }
  },
  {
    id: 'p_ranked_king',
    type: 'pilot',
    name: 'REI DO RANQUEADO',
    description: 'Alcance simultaneamente 4000+ MMR, 200+ partidas e 100+ vitórias ranqueadas.',
    category: 'Ranqueado',
    icon: '🌌',
    rarity: 'MÍSTICA',
    maxProgress: null,
    check: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id);
      return (rs?.rating || 0) >= 4000 && (rs?.matches || 0) >= 200 && (rs?.wins || 0) >= 100;
    },
    getProgress: (d) => {
      const rs = Storage.getRankedStandings().find(r => r.driverId === d.id) || {};
      const score = Math.floor((Math.min((rs.rating||1200)/4000,1) + Math.min((rs.matches||0)/200,1) + Math.min((rs.wins||0)/100,1)) / 3 * 100);
      return { current: score, target: 100 };
    }
  },

  // =========================================================================
  // 33. CONQUISTAS DE TORNEIOS — COMUM
  // =========================================================================
  {
    id: 'p_tournament_first',
    type: 'pilot',
    name: 'PRIMEIRO TORNEIO',
    description: 'Participe do seu primeiro torneio.',
    category: 'Torneios',
    icon: '🏟️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.isTournament && r.results?.some(res => res.driverId === d.id)),
    getProgress: (d, h) => ({
      current: h.some(r => r.isTournament && r.results?.some(res => res.driverId === d.id)) ? 1 : 0,
      target: 1
    })
  },
  {
    id: 'p_tournament_first_win',
    type: 'pilot',
    name: 'PRIMEIRA VITÓRIA EM TORNEIO',
    description: 'Vença uma partida em um torneio.',
    category: 'Torneios',
    icon: '🥇',
    rarity: 'COMUM',
    maxProgress: null,
    check: (d, h) => h.some(r => r.isTournament && r.results?.[0]?.driverId === d.id),
    getProgress: (d, h) => ({
      current: h.some(r => r.isTournament && r.results?.[0]?.driverId === d.id) ? 1 : 0,
      target: 1
    })
  },
  {
    id: 't_tournament_first',
    type: 'team',
    name: 'PRIMEIRO TORNEIO',
    description: 'Participe do primeiro torneio como equipe.',
    category: 'Torneios',
    icon: '🏟️',
    rarity: 'COMUM',
    maxProgress: null,
    check: (team, h) => h.some(r => r.isTournament && (r.teamAId === team.id || r.teamBId === team.id)),
    getProgress: (team, h) => ({
      current: h.some(r => r.isTournament && (r.teamAId === team.id || r.teamBId === team.id)) ? 1 : 0,
      target: 1
    })
  },

  // =========================================================================
  // 34. CONQUISTAS DE TORNEIOS — INCOMUM
  // =========================================================================
  {
    id: 'p_tournament_5',
    type: 'pilot',
    name: 'COMPETIDOR DE TORNEIOS',
    description: 'Participe de 5 torneios diferentes.',
    category: 'Torneios',
    icon: '📋',
    rarity: 'INCOMUM',
    maxProgress: 5,
    unit: 'torneios',
    check: (d, h) => {
      const ids = new Set(h.filter(r => r.isTournament && r.results?.some(res => res.driverId === d.id)).map(r => r.tournamentId).filter(Boolean));
      return ids.size >= 5;
    },
    getProgress: (d, h) => {
      const ids = new Set(h.filter(r => r.isTournament && r.results?.some(res => res.driverId === d.id)).map(r => r.tournamentId).filter(Boolean));
      return { current: Math.min(ids.size, 5), target: 5 };
    }
  },

  // =========================================================================
  // 35. CONQUISTAS DE TORNEIOS — RARA
  // =========================================================================
  {
    id: 'p_tournament_10',
    type: 'pilot',
    name: 'ESPECIALISTA EM TORNEIOS',
    description: 'Participe de 10 torneios.',
    category: 'Torneios',
    icon: '🎯',
    rarity: 'RARA',
    maxProgress: 10,
    unit: 'torneios',
    check: (d, h) => {
      const ids = new Set(h.filter(r => r.isTournament && r.results?.some(res => res.driverId === d.id)).map(r => r.tournamentId).filter(Boolean));
      return ids.size >= 10;
    },
    getProgress: (d, h) => {
      const ids = new Set(h.filter(r => r.isTournament && r.results?.some(res => res.driverId === d.id)).map(r => r.tournamentId).filter(Boolean));
      return { current: Math.min(ids.size, 10), target: 10 };
    }
  },

  // =========================================================================
  // 36. CONQUISTAS DE TORNEIOS — ÉPICA
  // =========================================================================
  {
    id: 'p_tournament_champion',
    type: 'pilot',
    name: 'CAMPEÃO DE TORNEIO',
    description: 'Vença seu primeiro torneio.',
    category: 'Torneios',
    icon: '🏆',
    rarity: 'ÉPICA',
    maxProgress: null,
    check: (d, h, s, tt, td, tm) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      return tournaments.some(t =>
        (t.status === 'finished' || t.status === 'completed') &&
        t.winnerId === d.id
      );
    },
    getProgress: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length;
      return { current: Math.min(wins, 1), target: 1 };
    }
  },
  {
    id: 't_tournament_champion',
    type: 'team',
    name: 'CAMPEÃO DE TORNEIO',
    description: 'Vença o primeiro torneio como equipe.',
    category: 'Torneios',
    icon: '🏆',
    rarity: 'ÉPICA',
    maxProgress: null,
    check: (team) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      return tournaments.some(t =>
        (t.status === 'finished' || t.status === 'completed') &&
        t.winnerTeamId === team.id
      );
    },
    getProgress: (team) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerTeamId === team.id).length;
      return { current: Math.min(wins, 1), target: 1 };
    }
  },
  {
    id: 'p_tournament_3_titles',
    type: 'pilot',
    name: 'COLECIONADOR DE TÍTULOS',
    description: 'Vença 3 torneios ao longo da carreira.',
    category: 'Torneios',
    icon: '🥇',
    rarity: 'ÉPICA',
    maxProgress: 3,
    unit: 'títulos de torneio',
    check: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length;
      return wins >= 3;
    },
    getProgress: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length;
      return { current: Math.min(wins, 3), target: 3 };
    }
  },

  // =========================================================================
  // 37. CONQUISTAS DE TORNEIOS — LENDÁRIA
  // =========================================================================
  {
    id: 'p_tournament_king',
    type: 'pilot',
    name: 'REI DOS TORNEIOS',
    description: 'Vença 5 torneios ao longo da carreira.',
    category: 'Torneios',
    icon: '👑',
    rarity: 'LENDÁRIA',
    maxProgress: 5,
    unit: 'títulos de torneio',
    check: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      return tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length >= 5;
    },
    getProgress: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length;
      return { current: Math.min(wins, 5), target: 5 };
    }
  },
  {
    id: 't_tournament_king',
    type: 'team',
    name: 'REI DOS TORNEIOS',
    description: 'Vença 5 torneios como equipe.',
    category: 'Torneios',
    icon: '👑',
    rarity: 'LENDÁRIA',
    maxProgress: 5,
    unit: 'títulos de torneio',
    check: (team) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      return tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerTeamId === team.id).length >= 5;
    },
    getProgress: (team) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerTeamId === team.id).length;
      return { current: Math.min(wins, 5), target: 5 };
    }
  },

  // =========================================================================
  // 38. CONQUISTAS DE TORNEIOS — MÍSTICA
  // =========================================================================
  {
    id: 'p_tournament_legend',
    type: 'pilot',
    name: 'LENDA DOS TORNEIOS',
    description: 'Vença 10 torneios — conquista reservada aos maiores competidores da história.',
    category: 'Torneios',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: 10,
    unit: 'títulos de torneio',
    check: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      return tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length >= 10;
    },
    getProgress: (d) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerId === d.id).length;
      return { current: Math.min(wins, 10), target: 10 };
    }
  },
  {
    id: 't_tournament_legend',
    type: 'team',
    name: 'LENDA DOS TORNEIOS',
    description: 'Vença 10 torneios como equipe.',
    category: 'Torneios',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: 10,
    unit: 'títulos de torneio',
    check: (team) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      return tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerTeamId === team.id).length >= 10;
    },
    getProgress: (team) => {
      const tournaments = Storage.get('race_sim_tournaments', []);
      const wins = tournaments.filter(t => (t.status === 'finished' || t.status === 'completed') && t.winnerTeamId === team.id).length;
      return { current: Math.min(wins, 10), target: 10 };
    }
  },

  // =========================================================================
  // 39. CONQUISTAS DE EQUIPES — INCOMUM / RARA / ÉPICA
  // =========================================================================
  {
    id: 't_first_podium',
    type: 'team',
    name: 'PRIMEIRO PÓDIO',
    description: 'Conquiste o primeiro pódio da equipe.',
    category: 'Coletivo',
    icon: '🥈',
    rarity: 'COMUM',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(r => r.results?.some(res => (res.teamId === team.id || ids.has(res.driverId)) && res.position <= 3));
    },
    getProgress: (team, h, s, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return { current: h.some(r => r.results?.some(res => (res.teamId === team.id || ids.has(res.driverId)) && res.position <= 3)) ? 1 : 0, target: 1 };
    }
  },
  {
    id: 't_first_points',
    type: 'team',
    name: 'PRIMEIROS PONTOS',
    description: 'Some os primeiros pontos como equipe.',
    category: 'Coletivo',
    icon: '✅',
    rarity: 'COMUM',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.some(r => r.results?.some(res => (res.teamId === team.id || ids.has(res.driverId)) && (res.points || 0) > 0));
    },
    getProgress: (team, h, s, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return { current: h.some(r => r.results?.some(res => (res.teamId === team.id || ids.has(res.driverId)) && (res.points || 0) > 0)) ? 1 : 0, target: 1 };
    }
  },
  {
    id: 't_5_wins',
    type: 'team',
    name: 'EQUIPE VENCEDORA',
    description: 'Conquiste 5 vitórias como equipe.',
    category: 'Coletivo',
    icon: '🌟',
    rarity: 'INCOMUM',
    maxProgress: 5,
    unit: 'vitórias',
    check: (team, h, s, tt, td, tm, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.filter(r => { const w = r.results?.[0]; return w && (w.teamId === team.id || ids.has(w.driverId)); }).length >= 5;
    },
    getProgress: (team, h, s, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      const c = h.filter(r => { const w = r.results?.[0]; return w && (w.teamId === team.id || ids.has(w.driverId)); }).length;
      return { current: Math.min(c, 5), target: 5 };
    }
  },
  {
    id: 't_10_wins',
    type: 'team',
    name: 'EQUIPE DOMINANTE',
    description: 'Conquiste 10 vitórias como equipe.',
    category: 'Coletivo',
    icon: '💥',
    rarity: 'RARA',
    maxProgress: 10,
    unit: 'vitórias',
    check: (team, h, s, tt, td, tm, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      return h.filter(r => { const w = r.results?.[0]; return w && (w.teamId === team.id || ids.has(w.driverId)); }).length >= 10;
    },
    getProgress: (team, h, s, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      const c = h.filter(r => { const w = r.results?.[0]; return w && (w.teamId === team.id || ids.has(w.driverId)); }).length;
      return { current: Math.min(c, 10), target: 10 };
    }
  },
  {
    id: 't_dynasty_5_consec',
    type: 'team',
    name: 'DINASTIA ÉPICA',
    description: 'Conquiste 5 campeonatos consecutivos como equipe.',
    category: 'Campeonato',
    icon: '🏛️',
    rarity: 'ÉPICA',
    maxProgress: 5,
    unit: 'campeonatos consecutivos',
    check: (team, h, s, tt, td, tm, drivers) => Achievements.getTeamConsecutiveTitles(team.id, s) >= 5,
    getProgress: (team, h, s, drivers) => ({ current: Math.min(Achievements.getTeamConsecutiveTitles(team.id, s), 5), target: 5 })
  },

  // =========================================================================
  // 40. CONQUISTAS DE EQUIPES — MÍSTICA
  // =========================================================================
  {
    id: 't_immortal_team',
    type: 'team',
    name: 'EQUIPE IMORTAL',
    description: 'Conquiste simultaneamente 5+ títulos, 30+ vitórias e 3+ títulos consecutivos.',
    category: 'Coletivo',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: null,
    check: (team, h, s, tt, td, tm, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      const totalWins = h.filter(r => { const w = r.results?.[0]; return w && (w.teamId === team.id || ids.has(w.driverId)); }).length;
      return Achievements.getTeamTitlesCount(team.id, s) >= 5 &&
        totalWins >= 30 &&
        Achievements.getTeamConsecutiveTitles(team.id, s) >= 3;
    },
    getProgress: (team, h, s, drivers) => {
      const ids = new Set(drivers.filter(d => d.teamId === team.id).map(d => d.id));
      const totalWins = h.filter(r => { const w = r.results?.[0]; return w && (w.teamId === team.id || ids.has(w.driverId)); }).length;
      const t = Achievements.getTeamTitlesCount(team.id, s);
      const ct = Achievements.getTeamConsecutiveTitles(team.id, s);
      const score = Math.floor((Math.min(t/5,1) + Math.min(totalWins/30,1) + Math.min(ct/3,1)) / 3 * 100);
      return { current: score, target: 100 };
    }
  },

  // =========================================================================
  // 41. CONQUISTAS DE CONSISTÊNCIA — RARA / ÉPICA / LENDÁRIA / MÍSTICA
  // =========================================================================
  {
    id: 'p_top10_streak_10',
    type: 'pilot',
    name: 'INTOCÁVEL',
    description: 'Complete 10 corridas consecutivas sem terminar fora do Top 10.',
    category: 'Consistência',
    icon: '🛡️',
    rarity: 'RARA',
    maxProgress: 10,
    unit: 'corridas Top 10',
    check: (d, h) => Achievements.getDriverTop10Streak(d.id, h) >= 10,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverTop10Streak(d.id, h), 10), target: 10 })
  },
  {
    id: 'p_top5_streak_5',
    type: 'pilot',
    name: 'TOP 5 CONSTANTE',
    description: 'Termine 5 corridas consecutivas no Top 5.',
    category: 'Consistência',
    icon: '📐',
    rarity: 'RARA',
    maxProgress: 5,
    unit: 'corridas Top 5',
    check: (d, h) => Achievements.getDriverTop5Streak(d.id, h) >= 5,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverTop5Streak(d.id, h), 5), target: 5 })
  },
  {
    id: 'p_podium_streak_5',
    type: 'pilot',
    name: 'PÓDIO CONSTANTE',
    description: 'Conquiste 5 corridas consecutivas no pódio (Top 3).',
    category: 'Consistência',
    icon: '🥇',
    rarity: 'ÉPICA',
    maxProgress: 5,
    unit: 'pódios consecutivos',
    check: (d, h) => Achievements.getDriverPodiumStreak(d.id, h) >= 5,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverPodiumStreak(d.id, h), 5), target: 5 })
  },
  {
    id: 'p_top10_streak_20',
    type: 'pilot',
    name: 'MURALHA',
    description: 'Complete 20 corridas consecutivas sem terminar fora do Top 10.',
    category: 'Consistência',
    icon: '🧱',
    rarity: 'LENDÁRIA',
    maxProgress: 20,
    unit: 'corridas Top 10',
    check: (d, h) => Achievements.getDriverTop10Streak(d.id, h) >= 20,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverTop10Streak(d.id, h), 20), target: 20 })
  },
  {
    id: 'p_top3_streak_20',
    type: 'pilot',
    name: 'IMBATÍVEL NO PÓDIO',
    description: 'Conquiste 20 corridas consecutivas terminando no Top 3 — consistência de outro nível.',
    category: 'Consistência',
    icon: '✨',
    rarity: 'MÍSTICA',
    maxProgress: 20,
    unit: 'pódios consecutivos',
    check: (d, h) => Achievements.getDriverPodiumStreak(d.id, h) >= 20,
    getProgress: (d, h) => ({ current: Math.min(Achievements.getDriverPodiumStreak(d.id, h), 20), target: 20 })
  },

  // =========================================================================
  // 40. CONQUISTAS DIVINAS — feitos que comprovam domínio absoluto
  // =========================================================================
  {
    id: 'p_divine_all_track_wins',
    type: 'pilot',
    name: 'SENHOR DAS PISTAS',
    description: 'Vença pelo menos uma corrida oficial em cada pista disponível.',
    category: 'Corridas',
    icon: '🌟',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h) => Achievements.hasWinsOnEveryTrack(d.id, 'pilot', h)
  },
  {
    id: 'p_divine_track_dominance',
    type: 'pilot',
    name: 'DOMÍNIO ABSOLUTO',
    description: 'Vença em todas as pistas e nunca termine abaixo do Top 3 nelas.',
    category: 'Corridas',
    icon: '👑',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h) => Achievements.hasPodiumOnEveryTrack(d.id, h) &&
      Achievements.hasWinsOnEveryTrack(d.id, 'pilot', h)
  },
  {
    id: 'p_divine_fastest_lap_all_tracks',
    type: 'pilot',
    name: 'VOLTA PERFEITA',
    description: 'Registre a volta mais rápida de corrida em todas as pistas disponíveis.',
    category: 'Corridas',
    icon: '⚡',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h) => Achievements.hasFastestLapOnEveryTrack(d.id, h)
  },
  {
    id: 'p_divine_perfect_championship',
    type: 'pilot',
    name: 'CAMPEONATO PERFEITO',
    description: 'Conquiste um campeonato vencendo todas as corridas da temporada.',
    category: 'Campeonato',
    icon: '🏆',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s) => Achievements.hasPerfectChampionship(d.id, s, h)
  },
  {
    id: 'p_divine_series_emperor',
    type: 'pilot',
    name: 'REI DAS SÉRIES',
    description: 'Conquiste o campeonato em todas as séries disponíveis.',
    category: 'Campeonato',
    icon: '👑',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s) => Achievements.hasTitlesInEveryDivision(d.id, s)
  },
  {
    id: 'p_divine_time_trial_all_tracks',
    type: 'pilot',
    name: 'SENHOR DO CRONÔMETRO',
    description: 'Detenha simultaneamente o melhor tempo de Time-Trial em todas as pistas.',
    category: 'Time-Trial',
    icon: '⏱️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s, tt) => Achievements.hasTimeTrialRecordOnEveryTrack(d.id, tt)
  },
  {
    id: 'p_divine_time_trial_and_race',
    type: 'pilot',
    name: 'CRONÔMETRO PERFEITO',
    description: 'Detenha o melhor tempo de Time-Trial e a volta mais rápida de corrida em todas as pistas.',
    category: 'Time-Trial',
    icon: '⏱️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s, tt) =>
      Achievements.hasTimeTrialRecordOnEveryTrack(d.id, tt) &&
      Achievements.hasFastestLapOnEveryTrack(d.id, h)
  },
  {
    id: 'p_divine_ranked_king',
    type: 'pilot',
    name: 'REI DO RANQUEADO',
    description: 'Alcance a posição #1 no ranking ranqueado com partidas disputadas.',
    category: 'Ranqueado',
    icon: '🎖️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: d => Achievements.isRankedLeader(d.id)
  },
  {
    id: 'p_divine_ranked_mastery',
    type: 'pilot',
    name: 'DOMÍNIO DO MMR',
    description: 'Alcance a faixa mais alta configurada para o Modo Ranqueado.',
    category: 'Ranqueado',
    icon: '💎',
    rarity: 'DIVINA',
    maxProgress: null,
    check: d => Achievements.isAtTopRankedTier(d.id)
  },
  {
    id: 'p_divine_ranked_undefeated',
    type: 'pilot',
    name: 'INVICTO NO RANQUEADO',
    description: 'Conclua uma campanha ranqueada sem nenhuma derrota registrada.',
    category: 'Ranqueado',
    icon: '🛡️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: d => Achievements.hasUndefeatedRankedRecord(d.id)
  },
  {
    id: 'p_divine_tournament_undefeated',
    type: 'pilot',
    name: 'CONQUISTADOR INVICTO',
    description: 'Conquiste um torneio completo sem perder nenhuma partida disputada.',
    category: 'Torneios',
    icon: '🏟️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: d => Achievements.hasUndefeatedTournamentTitle(d.id, 'driver')
  },
  {
    id: 'p_divine_season_consistency',
    type: 'pilot',
    name: 'PERFEIÇÃO',
    description: 'Termine todas as corridas de um campeonato completo no Top 3.',
    category: 'Consistência',
    icon: '🛡️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s) => Achievements.hasPerfectSeasonPodiums(d.id, s, h)
  },
  {
    id: 'p_divine_top5_season',
    type: 'pilot',
    name: 'O INTOCÁVEL',
    description: 'Conclua uma temporada inteira sem terminar abaixo do Top 5.',
    category: 'Consistência',
    icon: '🛡️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s) => Achievements.hasSeasonTopFinishes(d.id, s, h, 5)
  },
  {
    id: 'p_divine_career_perfect',
    type: 'pilot',
    name: 'CARREIRA PERFEITA',
    description: 'Conquiste um campeonato, um torneio, um Recorde Mundial e lidere o Ranqueado.',
    category: 'Carreira',
    icon: '🌌',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (d, h, s, tt) =>
      Achievements.getDriverTitlesCount(d.id, s) > 0 &&
      Achievements.hasTournamentTitle(d.id, 'driver') &&
      Achievements.getDriverWorldRecordCount(d.id, tt) > 0 &&
      Achievements.isRankedLeader(d.id)
  },
  {
    id: 'p_divine_completion',
    type: 'pilot',
    name: '100%',
    description: 'Desbloqueie todas as outras conquistas de piloto, inclusive as Divinas.',
    category: 'Carreira',
    icon: '💯',
    rarity: 'DIVINA',
    maxProgress: null,
    check: d => Achievements.hasCompletedAchievementSet('pilot', d.id, 'p_divine_completion')
  },
  {
    id: 't_divine_all_track_wins',
    type: 'team',
    name: 'DOMÍNIO TOTAL',
    description: 'Vença pelo menos uma corrida oficial em cada pista disponível como equipe.',
    category: 'Equipes',
    icon: '🏁',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (team, h, s, tt, td, teams, drivers) =>
      Achievements.hasWinsOnEveryTrack(team.id, 'team', h, drivers)
  },
  {
    id: 't_divine_all_series',
    type: 'team',
    name: 'IMPÉRIO',
    description: 'Conquiste o campeonato de equipes em todas as séries disponíveis.',
    category: 'Equipes',
    icon: '🏆',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (team, h, s) => Achievements.hasTeamTitlesInEveryDivision(team.id, s)
  },
  {
    id: 't_divine_perfect_season',
    type: 'team',
    name: 'TEMPORADA PERFEITA',
    description: 'Conquiste o campeonato de equipes vencendo todas as corridas da temporada.',
    category: 'Equipes',
    icon: '🏆',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (team, h, s) => Achievements.hasPerfectTeamChampionship(team.id, s, h)
  },
  {
    id: 't_divine_all_rivals',
    type: 'team',
    name: 'SENHORES DO GRID',
    description: 'Derrote todas as outras equipes registradas em confrontos Equipe x Equipe.',
    category: 'Duelos',
    icon: '⚔️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (team, h, s, tt, duels) => Achievements.hasDefeatedEveryTeam(team.id, duels)
  },
  {
    id: 't_divine_undefeated_duels',
    type: 'team',
    name: 'INVICTOS',
    description: 'Enfrente todas as equipes registradas sem sofrer nenhuma derrota.',
    category: 'Duelos',
    icon: '🛡️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (team, h, s, tt, duels) =>
      Achievements.hasDefeatedEveryTeam(team.id, duels) &&
      Achievements.hasNoTeamDuelLosses(team.id, duels)
  },
  {
    id: 't_divine_positive_rivals',
    type: 'team',
    name: 'NÊMESIS ABSOLUTA',
    description: 'Mantenha retrospecto positivo contra todas as equipes que enfrentou.',
    category: 'Duelos',
    icon: '⚔️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: (team, h, s, tt, duels) =>
      Achievements.hasPositiveDuelRecordAgainstEveryTeam(team.id, duels)
  },
  {
    id: 't_divine_tournament_undefeated',
    type: 'team',
    name: 'EQUIPE INVICTA',
    description: 'Conquiste um torneio de equipes completo sem perder nenhuma partida.',
    category: 'Equipes',
    icon: '🏟️',
    rarity: 'DIVINA',
    maxProgress: null,
    check: team => Achievements.hasUndefeatedTournamentTitle(team.id, 'team')
  },
  {
    id: 't_divine_completion',
    type: 'team',
    name: 'IMPÉRIO ABSOLUTO',
    description: 'Desbloqueie todas as outras conquistas disponíveis para a equipe.',
    category: 'Equipes',
    icon: '👑',
    rarity: 'DIVINA',
    maxProgress: null,
    check: team => Achievements.hasCompletedAchievementSet('team', team.id, 't_divine_completion')
  }
];

const Achievements = {
  activeTypeFilter: 'TODAS',     // 'TODAS', 'PILOTOS', 'EQUIPES', 'DESBLOQUEADAS', 'BLOQUEADAS'
  activeRarityFilter: 'TODAS',   // 'TODAS', 'COMUM', 'INCOMUM', 'RARA', 'ÉPICA', 'LENDÁRIA', 'MÍSTICA', 'DIVINA'
  activeCategoryFilter: 'TODAS', // 'TODAS', 'Campeonato', 'Time-Trial', 'Equipe x Equipe', 'Ranqueado', 'Torneios', 'Consistência', 'Corridas', 'Carreira'
  searchQuery: '',
  needsCheck: true,

  init() {
    this.checkAllSilently();
  },

  markDirty() {
    this.needsCheck = true;
  },

  getAchievementsData() {
    return Storage.get('race_sim_achievements', {});
  },

  saveAchievementsData(data) {
    return Storage.set('race_sim_achievements', data);
  },

  getEntityUnlockedMap(type, id) {
    const data = this.getAchievementsData();
    const key = `${type}_${id}`;
    return data[key] || {};
  },

  getOfficialRaceHistory(history) {
    return history.filter(race =>
      !race.isCasual &&
      !race.isTimeTrial &&
      !race.isRanked &&
      !race.isTournament &&
      !race.isTeamDuel &&
      !race.gpId?.startsWith('casual_') &&
      !race.gpId?.startsWith('tt_') &&
      !race.gpId?.startsWith('time_trial') &&
      !race.gpId?.startsWith('ranked_') &&
      !race.gpId?.startsWith('trn_') &&
      !race.gpId?.startsWith('duel_')
    );
  },

  hasWinsOnEveryTrack(entityId, type, history, drivers = []) {
    const tracks = Storage.getTracks();
    if (tracks.length === 0) return false;
    const teamDriverIds = type === 'team'
      ? new Set(drivers.filter(driver => driver.teamId === entityId).map(driver => driver.id))
      : null;
    const races = this.getOfficialRaceHistory(history);

    return tracks.every(track => races.some(race => {
      if (race.trackId !== track.id) return false;
      const winner = race.results?.[0];
      return type === 'pilot'
        ? winner?.driverId === entityId
        : winner?.teamId === entityId || teamDriverIds.has(winner?.driverId);
    }));
  },

  hasPodiumOnEveryTrack(driverId, history) {
    const tracks = Storage.getTracks();
    if (tracks.length === 0) return false;
    const races = this.getOfficialRaceHistory(history);

    return tracks.every(track => {
      const trackRaces = races.filter(race => race.trackId === track.id);
      return trackRaces.length > 0 &&
        trackRaces.every(race => {
          const result = race.results?.find(item => item.driverId === driverId);
          return result && Number.isFinite(result.position) && result.position <= 3;
        });
    });
  },

  hasFastestLapOnEveryTrack(driverId, history) {
    const tracks = Storage.getTracks();
    if (tracks.length === 0) return false;
    const bestByTrack = new Map();

    this.getOfficialRaceHistory(history).forEach(race => {
      if (!race.trackId) return;
      (race.results || []).forEach(result => {
        const lapTime = Number(result.bestLapMs);
        if (!Number.isFinite(lapTime) || lapTime <= 0) return;
        const current = bestByTrack.get(race.trackId);
        if (!current || lapTime < current.time) {
          bestByTrack.set(race.trackId, { driverId: result.driverId, time: lapTime });
        }
      });
    });

    return tracks.every(track => bestByTrack.get(track.id)?.driverId === driverId);
  },

  getCompletedSeasonResults(driverId, season, history) {
    const races = season.races || [];
    if (races.length === 0 || races.some(race => !race.completed)) return null;
    const results = races.map(gp => {
      const race = history.find(item => item.gpId === gp.id);
      const result = race?.results?.find(item => item.driverId === driverId);
      return result && Number.isFinite(result.position) ? result : null;
    });
    return results.every(Boolean) ? results : null;
  },

  hasPerfectChampionship(driverId, seasons, history) {
    return seasons.some(season => {
      const results = this.getCompletedSeasonResults(driverId, season, history);
      const standings = [...(season.standings || [])].sort((a, b) => b.points - a.points);
      return results && standings[0]?.driverId === driverId &&
        results.every(result => result.position === 1);
    });
  },

  hasPerfectSeasonPodiums(driverId, seasons, history) {
    return seasons.some(season => {
      const results = this.getCompletedSeasonResults(driverId, season, history);
      const standings = [...(season.standings || [])].sort((a, b) => b.points - a.points);
      return results && standings[0]?.driverId === driverId &&
        results.every(result => result.position <= 3);
    });
  },

  hasSeasonTopFinishes(driverId, seasons, history, topPosition) {
    return seasons.some(season => {
      const results = this.getCompletedSeasonResults(driverId, season, history);
      return results && results.every(result => result.position <= topPosition);
    });
  },

  hasPerfectTeamChampionship(teamId, seasons, history) {
    return seasons.some(season => {
      const races = season.races || [];
      if (races.length === 0 || races.some(race => !race.completed) ||
        Storage.getConstructorsStandings(season.divisionId)[0]?.teamId !== teamId) return false;
      return races.every(gp => {
        const race = history.find(item => item.gpId === gp.id);
        return race?.results?.[0]?.teamId === teamId;
      });
    });
  },

  hasTitlesInEveryDivision(driverId, seasons) {
    const divisions = Storage.getDivisions();
    return divisions.length > 0 && divisions.every(division =>
      seasons.some(season => {
        if (season.divisionId !== division.id) return false;
        const races = season.races || [];
        if (races.length === 0 || races.some(race => !race.completed)) return false;
        const standings = [...(season.standings || [])].sort((a, b) => b.points - a.points);
        return standings[0]?.driverId === driverId;
      })
    );
  },

  hasTeamTitlesInEveryDivision(teamId, seasons) {
    const divisions = Storage.getDivisions();
    return divisions.length > 0 && divisions.every(division =>
      seasons.some(season => {
        if (season.divisionId !== division.id) return false;
        const races = season.races || [];
        return races.length > 0 &&
          races.every(race => race.completed) &&
          Storage.getConstructorsStandings(division.id)[0]?.teamId === teamId;
      })
    );
  },

  hasTimeTrialRecordOnEveryTrack(driverId, timeTrials) {
    const tracks = Storage.getTracks();
    if (tracks.length === 0) return false;
    return tracks.every(track => {
      const records = timeTrials.filter(record =>
        record.trackId === track.id &&
        Number.isFinite(Number(record.bestLapMs)) &&
        Number(record.bestLapMs) > 0
      );
      if (records.length === 0) return false;
      const best = records.reduce((current, record) =>
        Number(record.bestLapMs) < Number(current.bestLapMs) ? record : current
      );
      return best.driverId === driverId;
    });
  },

  isRankedLeader(driverId) {
    const standings = Storage.getRankedStandings()
      .filter(standing => (standing.matches || 0) > 0)
      .sort((a, b) => b.rating - a.rating);
    return standings[0]?.driverId === driverId;
  },

  isAtTopRankedTier(driverId) {
    const standing = Storage.getRankedStandings().find(item => item.driverId === driverId);
    const highestRank = Storage.getRanks('ranked')
      .reduce((highest, rank) => !highest || rank.minPoints > highest.minPoints ? rank : highest, null);
    return !!standing && !!highestRank &&
      (standing.matches || 0) > 0 &&
      standing.rating >= highestRank.minPoints;
  },

  hasUndefeatedRankedRecord(driverId) {
    const standing = Storage.getRankedStandings().find(item => item.driverId === driverId);
    return !!standing &&
      standing.matches > 0 &&
      standing.wins === standing.matches;
  },

  hasTournamentTitle(entityId, entityType) {
    return Storage.getTournaments().some(tournament =>
      tournament.status === 'finished' &&
      (entityType === 'team' ? tournament.type === 'teams' : tournament.type !== 'teams') &&
      (tournament.championId === entityId || tournament.winnerId === entityId)
    );
  },

  hasUndefeatedTournamentTitle(entityId, entityType) {
    return Storage.getTournaments().some(tournament => {
      if (tournament.status !== 'finished' ||
        (entityType === 'team' ? tournament.type !== 'teams' : tournament.type === 'teams')) return false;
      const championId = tournament.championId || tournament.winnerId;
      const matches = tournament.matches || [];
      if (championId !== entityId || matches.length === 0 ||
        matches.some(match => match.status !== 'completed')) return false;
      const matchesPlayed = matches.filter(match =>
        match.participantAId === entityId || match.participantBId === entityId
      );
      return matchesPlayed.length > 0 &&
        matchesPlayed.every(match => (match.winnerId || match.result?.winnerId) === entityId);
    });
  },

  hasDefeatedEveryTeam(teamId, duels) {
    const otherTeams = Storage.getTeams().filter(team => team.id !== teamId);
    if (otherTeams.length === 0 || duels.length === 0) return false;
    return otherTeams.every(opponentId => duels.some(duel => {
      const facedOpponent =
        (duel.teamAId === teamId && duel.teamBId === opponentId.id) ||
        (duel.teamBId === teamId && duel.teamAId === opponentId.id);
      return facedOpponent && duel.winnerTeamId === teamId;
    }));
  },

  hasNoTeamDuelLosses(teamId, duels) {
    const playedDuels = duels.filter(duel =>
      duel.teamAId === teamId || duel.teamBId === teamId
    );
    return playedDuels.length > 0 &&
      playedDuels.every(duel => duel.winnerTeamId === teamId);
  },

  hasPositiveDuelRecordAgainstEveryTeam(teamId, duels) {
    const opponents = Storage.getTeams().filter(team => team.id !== teamId);
    if (opponents.length === 0 || duels.length === 0) return false;
    return opponents.every(opponent => {
      const headToHead = duels.filter(duel =>
        (duel.teamAId === teamId && duel.teamBId === opponent.id) ||
        (duel.teamBId === teamId && duel.teamAId === opponent.id)
      );
      const wins = headToHead.filter(duel => duel.winnerTeamId === teamId).length;
      const losses = headToHead.filter(duel =>
        duel.winnerTeamId && duel.winnerTeamId !== teamId
      ).length;
      return headToHead.length > 0 && wins > losses;
    });
  },

  hasCompletedAchievementSet(type, entityId, excludedAchievementId) {
    const achievements = ACHIEVEMENTS_LIST.filter(achievement =>
      achievement.type === type && achievement.id !== excludedAchievementId
    );
    const unlocked = this.getEntityUnlockedMap(type, entityId);
    return achievements.length > 0 &&
      achievements.every(achievement => unlocked[achievement.id]?.unlocked);
  },

  // Process all achievements silently in background without popups or race interruptions
  checkAllSilently() {
    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const history = Storage.getHistory();
    const seasons = Storage.getSeasons();
    const timeTrials = Storage.getBestTimeTrials();
    const duels = Storage.getTeamDuels();

    const data = this.getAchievementsData();
    let updated = false;

    // 1. Check Pilot Achievements
    drivers.forEach(driver => {
      const key = `pilot_${driver.id}`;
      if (!data[key]) data[key] = {};
      const entityMap = data[key];

      ACHIEVEMENTS_LIST.filter(a => a.type === 'pilot').forEach(ach => {
        if (entityMap[ach.id]?.unlocked) return;

        try {
          const isUnlocked = ach.check(driver, history, seasons, timeTrials, duels, teams, drivers);
          if (isUnlocked) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR');
            entityMap[ach.id] = {
              unlocked: true,
              unlockedAt: dateStr,
              timestamp: now.getTime(),
              type: 'pilot',
              entityId: driver.id
            };
            updated = true;
          }
        } catch (err) {
          console.error(`Error checking achievement ${ach.id} for driver ${driver.id}:`, err);
        }
      });
    });

    // 2. Check Team Achievements
    teams.forEach(team => {
      const key = `team_${team.id}`;
      if (!data[key]) data[key] = {};
      const entityMap = data[key];

      ACHIEVEMENTS_LIST.filter(a => a.type === 'team').forEach(ach => {
        if (entityMap[ach.id]?.unlocked) return;

        try {
          const isUnlocked = ach.check(team, history, seasons, timeTrials, duels, teams, drivers);
          if (isUnlocked) {
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR');
            entityMap[ach.id] = {
              unlocked: true,
              unlockedAt: dateStr,
              timestamp: now.getTime(),
              type: 'team',
              entityId: team.id
            };
            updated = true;
          }
        } catch (err) {
          console.error(`Error checking achievement ${ach.id} for team ${team.id}:`, err);
        }
      });
    });

    if (updated) {
      this.saveAchievementsData(data);
    }
    this.needsCheck = false;
  },

  // Helper calculations for pilot achievements
  getDriverTitlesCount(driverId, seasons) {
    let titles = 0;
    seasons.forEach(season => {
      const completedGps = (season.races || []).filter(r => r.completed).length;
      const totalGps = season.races?.length || 0;
      if (completedGps === totalGps && totalGps > 0) {
        const sorted = [...(season.standings || [])].sort((a, b) => b.points - a.points);
        if (sorted[0]?.driverId === driverId) titles++;
      }
    });
    return titles;
  },

  getDriverTop10Streak(driverId, history) {
    let currentStreak = 0;
    let maxStreak = 0;
    const driverRaces = [...history].reverse().filter(race => race.results?.some(r => r.driverId === driverId));
    for (const race of driverRaces) {
      const res = race.results?.find(r => r.driverId === driverId);
      if (res && res.position <= 10) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    }
    return maxStreak;
  },

  getDriverTop5Streak(driverId, history) {
    let cur = 0, max = 0;
    const races = [...history].reverse().filter(r => r.results?.some(res => res.driverId === driverId));
    for (const race of races) {
      const res = race.results?.find(r => r.driverId === driverId);
      if (res && res.position <= 5) { cur++; if (cur > max) max = cur; }
      else cur = 0;
    }
    return max;
  },

  getDriverPodiumStreak(driverId, history) {
    let cur = 0, max = 0;
    const races = [...history].reverse().filter(r => r.results?.some(res => res.driverId === driverId));
    for (const race of races) {
      const res = race.results?.find(r => r.driverId === driverId);
      if (res && res.position <= 3) { cur++; if (cur > max) max = cur; }
      else cur = 0;
    }
    return max;
  },

  getDriverWinStreak(driverId, history) {
    let cur = 0, max = 0;
    const races = [...history].reverse().filter(r => r.results?.some(res => res.driverId === driverId));
    for (const race of races) {
      const res = race.results?.find(r => r.driverId === driverId);
      if (res && res.position === 1) { cur++; if (cur > max) max = cur; }
      else cur = 0;
    }
    return max;
  },

  // Returns the number of active World Records the driver holds across all tracks
  getDriverWorldRecordCount(driverId, bestTimeTrials) {
    // bestTimeTrials is already filtered to best-per-driver-per-track
    // Group by track and check if this driver holds the best time
    const byTrack = new Map();
    bestTimeTrials.forEach(t => {
      const key = t.trackId || t.trackName || 'unknown';
      const current = byTrack.get(key);
      if (!current || t.bestLapMs < current.bestLapMs) {
        byTrack.set(key, t);
      }
    });
    let count = 0;
    byTrack.forEach(record => { if (record.driverId === driverId) count++; });
    // Also check race history for world records on each track
    const history = Storage.getHistory();
    const trackBestFromRaces = new Map();
    history.forEach(race => {
      (race.results || []).forEach(res => {
        if (!res.bestLapMs) return;
        const key = race.trackId || race.trackName || 'unknown';
        const cur = trackBestFromRaces.get(key);
        if (!cur || res.bestLapMs < cur.bestLapMs) {
          trackBestFromRaces.set(key, { driverId: res.driverId, bestLapMs: res.bestLapMs });
        }
      });
    });
    // Merge: for each track, the overall record is the min of TT and race
    const allTracks = new Set([...byTrack.keys(), ...trackBestFromRaces.keys()]);
    let finalCount = 0;
    allTracks.forEach(trackKey => {
      const ttBest   = byTrack.get(trackKey);
      const raceBest = trackBestFromRaces.get(trackKey);
      if (ttBest && raceBest) {
        const overallBest = ttBest.bestLapMs <= raceBest.bestLapMs ? ttBest : raceBest;
        if (overallBest.driverId === driverId) finalCount++;
      } else if (ttBest) {
        if (ttBest.driverId === driverId) finalCount++;
      } else if (raceBest) {
        if (raceBest.driverId === driverId) finalCount++;
      }
    });
    return finalCount;
  },

  getDriverConsecutiveTitles(driverId, seasons) {
    let cur = 0, max = 0;
    const finished = seasons
      .filter(s => {
        const done = (s.races || []).filter(r => r.completed).length;
        return done === s.races?.length && s.races.length > 0;
      })
      .sort((a, b) => (a.year || 0) - (b.year || 0));
    for (const season of finished) {
      const sorted = [...(season.standings || [])].sort((a, b) => b.points - a.points);
      if (sorted[0]?.driverId === driverId) { cur++; if (cur > max) max = cur; }
      else cur = 0;
    }
    return max;
  },

  // Helper calculations for team achievements
  getTeamTitlesCount(teamId, seasons) {
    let titles = 0;
    seasons.forEach(season => {
      const completedGps = (season.races || []).filter(r => r.completed).length;
      const totalGps = season.races?.length || 0;
      if (completedGps === totalGps && totalGps > 0) {
        const constructors = Storage.getConstructorsStandings(season.divisionId);
        if (constructors[0]?.teamId === teamId) titles++;
      }
    });
    return titles;
  },

  getTeamWinStreak(teamId, history, drivers) {
    const teamDriverIds = new Set(drivers.filter(d => d.teamId === teamId).map(d => d.id));
    let currentStreak = 0;
    let maxStreak = 0;
    const chronologicalHistory = [...history].reverse();
    for (const race of chronologicalHistory) {
      const winner = race.results?.[0];
      if (winner && (winner.teamId === teamId || teamDriverIds.has(winner.driverId))) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else if (race.results && race.results.length > 0) {
        currentStreak = 0;
      }
    }
    return maxStreak;
  },

  getTeamConsecutiveTitles(teamId, seasons) {
    let currentStreak = 0;
    let maxStreak = 0;
    const finishedSeasons = seasons.filter(s => {
      const completedGps = (s.races || []).filter(r => r.completed).length;
      return completedGps === s.races?.length && s.races.length > 0;
    });

    finishedSeasons.forEach(season => {
      const constructors = Storage.getConstructorsStandings(season.divisionId);
      if (constructors[0]?.teamId === teamId) {
        currentStreak++;
        if (currentStreak > maxStreak) maxStreak = currentStreak;
      } else {
        currentStreak = 0;
      }
    });
    return maxStreak;
  },

  // Duel helpers
  getTeamDuelWinStreak(teamId, duels) {
    const chronological = [...duels].reverse();
    let cur = 0, max = 0;
    for (const duel of chronological) {
      const isParticipant = duel.teamAId === teamId || duel.teamBId === teamId;
      if (!isParticipant) continue;
      if (duel.winnerTeamId === teamId) { cur++; if (cur > max) max = cur; }
      else cur = 0;
    }
    return max;
  },

  getMaxDuelsVsSameTeam(teamId, duels) {
    const oppCount = new Map();
    duels.forEach(d => {
      const opp = d.teamAId === teamId ? d.teamBId : d.teamBId === teamId ? d.teamAId : null;
      if (!opp) return;
      oppCount.set(opp, (oppCount.get(opp) || 0) + 1);
    });
    return Math.max(0, ...oppCount.values());
  },

  getMaxWinsVsSameTeam(teamId, duels) {
    const winsMap = new Map();
    duels.forEach(d => {
      const opp = d.teamAId === teamId ? d.teamBId : d.teamBId === teamId ? d.teamAId : null;
      if (!opp) return;
      if (d.winnerTeamId === teamId) winsMap.set(opp, (winsMap.get(opp) || 0) + 1);
    });
    return Math.max(0, ...winsMap.values());
  },

  // Main Page View Renderer
  render() {
    if (this.needsCheck) this.checkAllSilently();

    const drivers = Storage.getDrivers();
    const teams = Storage.getTeams();
    const achievementsData = this.getAchievementsData();
    const entityNames = new Map([
      ...drivers.map(driver => [`pilot_${driver.id}`, driver.name]),
      ...teams.map(team => [`team_${team.id}`, team.name])
    ]);
    const unlockedAchievements = new Map();

    Object.entries(achievementsData).forEach(([entityKey, entityAchievements]) => {
      const type = entityKey.startsWith('pilot_') ? 'pilot' : entityKey.startsWith('team_') ? 'team' : null;
      if (!type || !entityAchievements) return;

      Object.entries(entityAchievements).forEach(([achievementId, achievementData]) => {
        const achievementKey = `${type}:${achievementId}`;
        if (achievementData?.unlocked && !unlockedAchievements.has(achievementKey)) {
          unlockedAchievements.set(achievementKey, {
            unlockedAt: achievementData.unlockedAt || null,
            entityName: entityNames.get(entityKey) || ''
          });
        }
      });
    });

    // Filter achievements list according to UI selections
    const query = this.searchQuery.trim().toLowerCase();

    const filteredAchievements = ACHIEVEMENTS_LIST.filter(ach => {
      // 1. Type Filter (TODAS, PILOTOS, EQUIPES, DESBLOQUEADAS, BLOQUEADAS)
      if (this.activeTypeFilter === 'PILOTOS' && ach.type !== 'pilot') return false;
      if (this.activeTypeFilter === 'EQUIPES' && ach.type !== 'team') return false;

      const isUnlocked = unlockedAchievements.has(`${ach.type}:${ach.id}`);

      if (this.activeTypeFilter === 'DESBLOQUEADAS' && !isUnlocked) return false;
      if (this.activeTypeFilter === 'BLOQUEADAS' && isUnlocked) return false;

      // 2. Rarity Filter (includes MÍSTICA)
      if (this.activeRarityFilter !== 'TODAS' && ach.rarity !== this.activeRarityFilter) return false;

      // 3. Category Filter
      if (this.activeCategoryFilter !== 'TODAS' && ach.category !== this.activeCategoryFilter) return false;

      // 4. Search Query
      if (query && !`${ach.name} ${ach.description} ${ach.category}`.toLowerCase().includes(query)) return false;

      return true;
    });

    return `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Barra de Busca e Filtros -->
        <div class="glass-panel" style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
          <!-- Campo de Busca por Nome -->
          <div style="display: flex; gap: 10px;">
            <input class="form-input" placeholder="🔍 Pesquisar conquista por nome ou descrição..." value="${Utils.escapeHtml(this.searchQuery)}" oninput="Achievements.setSearchQuery(this.value)" style="flex: 1;">
          </div>

          <!-- Filtros Principais (Categoria / Estado) -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
            <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-right: 4px;">Tipo &amp; Status:</span>
            ${['TODAS', 'PILOTOS', 'EQUIPES', 'DESBLOQUEADAS', 'BLOQUEADAS'].map(f => `
              <button class="btn ${this.activeTypeFilter === f ? 'btn-primary' : 'btn-secondary'} btn-sm" onclick="Achievements.setTypeFilter('${f}')">
                ${f}
              </button>
            `).join('')}
          </div>

          <!-- Filtros por Raridade (inclui MÍSTICA) -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 10px;">
            <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-right: 4px;">Raridade:</span>
            ${['TODAS', 'COMUM', 'INCOMUM', 'RARA', 'ÉPICA', 'LENDÁRIA', 'MÍSTICA', 'DIVINA'].map(r => {
              const rarityObj = ACHIEVEMENT_RARITIES[r];
              const isSelected = this.activeRarityFilter === r;
              const isPremiumRarity = r === 'MÍSTICA' || r === 'DIVINA';
              return `
                <button class="btn btn-sm" style="
                  background: ${isSelected ? (rarityObj?.color || 'var(--accent-cyan)') : 'var(--bg-tertiary)'};
                  color: ${isSelected ? (isPremiumRarity ? '#111' : '#000') : (rarityObj?.color || '#fff')};
                  font-weight: 800;
                  border: ${isPremiumRarity ? '2px solid ' + (rarityObj?.borderColor || '#d946ef') : '1px solid ' + (rarityObj?.borderColor || 'var(--border-color)')};
                  box-shadow: ${isSelected && isPremiumRarity ? rarityObj?.glow || 'none' : 'none'};
                " onclick="Achievements.setRarityFilter('${r}')">
                  ${rarityObj?.icon || ''} ${r}
                </button>
              `;
            }).join('')}
          </div>

          <!-- Filtros por Categoria / Modo -->
          <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap; border-top: 1px dashed rgba(255,255,255,0.08); padding-top: 10px;">
            <span style="font-size: 0.75rem; font-weight: 800; color: var(--text-dim); text-transform: uppercase; margin-right: 4px;">Modo:</span>
            ${['TODAS', 'Corridas', 'Campeonato', 'Time-Trial', 'Equipe x Equipe', 'Duelos', 'Ranqueado', 'Torneios', 'Consistência', 'Carreira', 'Coletivo', 'Equipes'].map(cat => `
              <button class="btn btn-sm ${this.activeCategoryFilter === cat ? 'btn-primary' : 'btn-secondary'}" onclick="Achievements.setCategoryFilter('${cat}')">
                ${{ 'TODAS': '🔍 Todas', 'Corridas': '🏁 Corridas', 'Campeonato': '🏆 Campeonato', 'Time-Trial': '⏱️ Time-Trial', 'Equipe x Equipe': '⚔️ Equipe x Equipe', 'Duelos': '⚔️ Duelos', 'Ranqueado': '🎖️ Ranqueado', 'Torneios': '🏟️ Torneios', 'Consistência': '🛡️ Consistência', 'Carreira': '📅 Carreira', 'Coletivo': '👥 Coletivo', 'Equipes': '🏎️ Equipes' }[cat] || cat}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Grid de Cards de Conquistas -->
        <div class="grid-auto" style="gap: 16px;">
          ${filteredAchievements.map(ach => this.renderCard(ach, unlockedAchievements.get(`${ach.type}:${ach.id}`))).join('')}
          ${filteredAchievements.length === 0 ? `
            <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: var(--text-dim); font-style: italic;">
              Nenhuma conquista encontrada com os filtros selecionados.
            </div>
          ` : ''}
        </div>
      </div>
    `;
  },

  renderCard(ach, achievementData) {
    const rarity = ACHIEVEMENT_RARITIES[ach.rarity] || ACHIEVEMENT_RARITIES.COMUM;
    const isUnlocked = !!achievementData;
    const isPremiumRarity = ach.rarity === 'MÍSTICA' || ach.rarity === 'DIVINA';

    return `
      <div class="glass-panel" style="
        padding: 18px;
        display: flex;
        gap: 14px;
        align-items: flex-start;
        opacity: ${isUnlocked ? '1' : '0.75'};
        border: ${isPremiumRarity ? '2px double ' + rarity.borderColor : '1px solid ' + (isUnlocked ? rarity.borderColor : 'rgba(255,255,255,0.08)')};
        background: ${isUnlocked ? rarity.bgColor : 'var(--bg-card)'};
        box-shadow: ${isUnlocked && rarity.glow ? rarity.glow : 'none'};
        border-radius: var(--radius-md, 12px);
      ">
        <!-- Ícone visual -->
        <div style="
          font-size: 2.2rem;
          width: 52px;
          height: 52px;
          border-radius: 12px;
          background: ${isUnlocked ? rarity.bgColor : 'rgba(255, 255, 255, 0.04)'};
          border: ${isPremiumRarity ? '2px double ' + rarity.borderColor : '1px solid ' + (isUnlocked ? rarity.borderColor : 'rgba(255, 255, 255, 0.1)')};
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        ">
          ${ach.icon || '🏆'}
        </div>

        <!-- Conteúdo do Card -->
        <div style="flex: 1; min-width: 0;">
          <!-- Título + Badges de Tipo e Raridade -->
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 8px; flex-wrap: wrap; margin-bottom: 6px;">
            <strong style="font-size: 1rem; color: ${isUnlocked ? (isPremiumRarity ? rarity.color : '#fff') : 'var(--text-muted)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
              ${Utils.escapeHtml(ach.name)}
            </strong>
            <div style="display: flex; gap: 6px; align-items: center;">
              <span class="badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.08); color: var(--text-dim); font-weight: 800;">
                ${ach.type === 'pilot' ? '👤 PILOTO' : '🏎️ EQUIPE'}
              </span>
              <span class="badge" style="font-size: 0.65rem; background: rgba(255,255,255,0.05); color: var(--text-muted); font-weight: 700;">
                ${Utils.escapeHtml(ach.category)}
              </span>
              <span class="badge" style="
                font-size: 0.65rem;
                background: ${rarity.bgColor};
                color: ${rarity.color};
                border: ${isPremiumRarity ? '2px double ' + rarity.borderColor : '1px solid ' + rarity.borderColor};
                font-weight: 800;
              ">
                ${rarity.icon} ${rarity.label}
              </span>
            </div>
          </div>

          <!-- Descrição -->
          <p style="font-size: 0.82rem; color: var(--text-muted); margin: 0 0 10px 0; line-height: 1.35;">
            "${Utils.escapeHtml(ach.description)}"
          </p>

          <!-- Status & Progresso -->
          ${isUnlocked ? `
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.75rem; color: ${isPremiumRarity ? rarity.color : 'var(--accent-green)'}; font-weight: 700; margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
              <span>✓ DESBLOQUEADA ${achievementData.entityName ? `(${Utils.escapeHtml(achievementData.entityName)})` : ''}</span>
              ${achievementData.unlockedAt ? `<span style="color: var(--accent-cyan); font-family: var(--font-mono);">📅 ${achievementData.unlockedAt}</span>` : ''}
            </div>
          ` : `
            <div style="margin-top: 8px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 8px;">
              <span style="font-size: 0.75rem; color: var(--text-dim);">🔒 BLOQUEADA</span>
            </div>
          `}
        </div>
      </div>
    `;
  },

  // Interactive UI callbacks
  setTypeFilter(type) {
    this.activeTypeFilter = type;
    App.navigateTo('achievements');
  },

  setRarityFilter(rarity) {
    this.activeRarityFilter = rarity;
    App.navigateTo('achievements');
  },

  setCategoryFilter(category) {
    this.activeCategoryFilter = category;
    App.navigateTo('achievements');
  },

  setSearchQuery(query) {
    this.searchQuery = query;
    App.navigateTo('achievements');
  },

  // Component Renderer for integration into Driver & Team Profile Pages
  renderProfileSection(type, entityId) {
    this.checkAllSilently();

    const entityMap = this.getEntityUnlockedMap(type, entityId);
    const applicableAchievements = ACHIEVEMENTS_LIST.filter(a => a.type === type);
    const unlockedList = applicableAchievements.filter(a => entityMap[a.id]?.unlocked);
    const lockedList = applicableAchievements.filter(a => !entityMap[a.id]?.unlocked);

    const unlockedCount = unlockedList.length;
    const totalCount = applicableAchievements.length;
    const pct = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;

    // Count by rarity, including MÍSTICA and DIVINA
    const rarityCounts = {
      COMUM: 0,
      INCOMUM: 0,
      RARA: 0,
      ÉPICA: 0,
      LENDÁRIA: 0,
      MÍSTICA: 0,
      DIVINA: 0
    };

    unlockedList.forEach(ach => {
      if (rarityCounts[ach.rarity] != null) {
        rarityCounts[ach.rarity]++;
      }
    });

    const drivers = Storage.getDrivers();
    const history = Storage.getHistory();
    const seasons = Storage.getSeasons();
    const entity = type === 'pilot' ? drivers.find(d => d.id === entityId) : Storage.getTeams().find(t => t.id === entityId);

    return `
      <section class="profile-panel profile-panel-full" style="margin-top: 20px;">
        <div class="profile-panel-header">
          <div>
            <h3>🏆 Conquistas da Carreira (${type === 'pilot' ? 'Piloto' : 'Equipe'})</h3>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 3px;">
              Progresso e conquistas acumuladas em eventos e campeonatos oficiais.
            </p>
          </div>
          <span class="badge" style="background: var(--accent-gold); color: #000; font-weight: 800; font-size: 0.9rem;">
            🏆 ${unlockedCount} / ${totalCount} Desbloqueadas (${pct}%)
          </span>
        </div>

        <!-- Barra de Progresso Geral -->
        <div class="rank-progress-bar" style="height: 10px; margin-top: 14px; background: rgba(255,255,255,0.06);">
          <div class="rank-progress-fill" style="width: ${pct}%; background: linear-gradient(90deg, var(--accent-gold) 0%, var(--accent-cyan) 100%);"></div>
        </div>

        <!-- Badges de Raridades -->
        <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-top: 16px;">
          ${Object.keys(ACHIEVEMENT_RARITIES).map(r => {
            const rar = ACHIEVEMENT_RARITIES[r];
            const count = rarityCounts[r] || 0;
            const isPremiumRarity = r === 'MÍSTICA' || r === 'DIVINA';
            return `
              <div style="
                background: ${rar.bgColor};
                border: ${isPremiumRarity ? '2px double ' + rar.borderColor : '1px solid ' + rar.borderColor};
                padding: 6px 12px;
                border-radius: 8px;
                font-size: 0.78rem;
                font-weight: bold;
                color: ${rar.color};
                display: flex;
                align-items: center;
                gap: 6px;
                ${isPremiumRarity && count > 0 ? 'box-shadow: ' + rar.glow + ';' : ''}
              ">
                <span>${rar.icon} ${r}</span>
                <span style="background: rgba(0,0,0,0.4); padding: 2px 6px; border-radius: 4px; color: ${count > 0 && isPremiumRarity ? rar.color : '#fff'}; font-weight: ${count > 0 && isPremiumRarity ? '900' : 'normal'};">${count}</span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Lista de Cards da Entidade -->
        <div class="grid-auto" style="gap: 14px; margin-top: 20px;">
          ${applicableAchievements.map(ach => {
            const isUnlocked = !!entityMap[ach.id]?.unlocked;
            const unlockedAt = entityMap[ach.id]?.unlockedAt;
            const rarity = ACHIEVEMENT_RARITIES[ach.rarity] || ACHIEVEMENT_RARITIES.COMUM;
            const isPremiumRarity = ach.rarity === 'MÍSTICA' || ach.rarity === 'DIVINA';

            let progressObj = null;
            if (!isUnlocked && entity && ach.getProgress) {
              progressObj = ach.getProgress(entity, history, seasons, drivers);
            }
            const progressPct = progressObj && progressObj.target > 0
              ? Math.min(100, Math.round((progressObj.current / progressObj.target) * 100))
              : 0;

            return `
              <div class="glass-panel" style="
                padding: 14px;
                display: flex;
                gap: 12px;
                align-items: flex-start;
                opacity: ${isUnlocked ? '1' : '0.7'};
                border: ${isPremiumRarity ? '2px double ' + rarity.borderColor : '1px solid ' + (isUnlocked ? rarity.borderColor : 'rgba(255,255,255,0.08)')};
                background: ${isUnlocked ? rarity.bgColor : 'var(--bg-card)'};
                border-radius: var(--radius-md);
                box-shadow: ${isUnlocked && isPremiumRarity ? rarity.glow : 'none'};
              ">
                <div style="
                  font-size: 1.8rem;
                  width: 44px;
                  height: 44px;
                  border-radius: 10px;
                  background: ${isUnlocked ? rarity.bgColor : 'rgba(255, 255, 255, 0.04)'};
                  border: ${isPremiumRarity ? '2px double ' + rarity.borderColor : '1px solid ' + (isUnlocked ? rarity.borderColor : 'rgba(255, 255, 255, 0.1)')};
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-shrink: 0;
                ">
                  ${ach.icon || '🏆'}
                </div>
                <div style="flex: 1; min-width: 0;">
                  <div style="display: flex; align-items: center; justify-content: space-between; gap: 6px; margin-bottom: 4px;">
                    <strong style="font-size: 0.9rem; color: ${isUnlocked ? (isPremiumRarity ? rarity.color : '#fff') : 'var(--text-muted)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                      ${Utils.escapeHtml(ach.name)}
                    </strong>
                    <span class="badge" style="
                      font-size: 0.62rem;
                      background: ${rarity.bgColor};
                      color: ${rarity.color};
                      border: ${isPremiumRarity ? '2px double ' + rarity.borderColor : '1px solid ' + rarity.borderColor};
                      font-weight: 800;
                    ">
                      ${rarity.icon} ${rarity.label}
                    </span>
                  </div>
                  <p style="font-size: 0.78rem; color: var(--text-dim); margin: 0 0 6px 0; line-height: 1.3;">
                    ${Utils.escapeHtml(ach.description)}
                  </p>
                  <span class="badge" style="font-size: 0.62rem; background: rgba(255,255,255,0.05); color: var(--text-muted); margin-bottom: 6px;">
                    ${Utils.escapeHtml(ach.category)}
                  </span>
                  ${isUnlocked ? `
                    <div style="font-size: 0.72rem; color: ${isPremiumRarity ? rarity.color : 'var(--accent-green)'}; font-weight: bold;">
                      ✓ Desbloqueada ${unlockedAt ? `<span style="color: var(--accent-cyan); font-family: var(--font-mono); font-weight: normal;">• ${unlockedAt}</span>` : ''}
                    </div>
                  ` : `
                    <div>
                      <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-dim); margin-bottom: 2px;">
                        <span>🔒 Bloqueada</span>
                        ${ach.maxProgress && progressObj ? `
                          <span style="font-family: var(--font-mono); color: var(--accent-cyan);">${progressObj.current} / ${progressObj.target} ${ach.unit || ''}</span>
                        ` : ''}
                      </div>
                      ${ach.maxProgress && progressObj ? `
                        <div class="rank-progress-bar" style="height: 5px; background: rgba(255,255,255,0.06);">
                          <div class="rank-progress-fill" style="width: ${progressPct}%; background: ${rarity.color};"></div>
                        </div>
                      ` : ''}
                    </div>
                  `}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </section>
    `;
  }
};
