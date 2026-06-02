/**
 * BoardAdapter
 * Transforms data from Store (cards, planning intervals, timelines)
 * into the shape expected by Model / dashboard charts.
 *
 * This allows the interactive Board/Planner/Timeline to drive
 * the rich charts (status, types, timelines, basic committed/completed,
 * estimated cards, etc.) without requiring manual JSON edits for those parts.
 *
 * Historical/full metrics (satisfaction, exact capacity, past velocity)
 * still benefit from the editor + intervals.json, but current board state
 * will populate/override dynamic parts.
 *
 * Usage:
 *   import BoardAdapter from './BoardAdapter.js';
 *   const storeData = {
 *     cards: store.getCards(),
 *     intervals: store.getIntervals(),
 *     timelines: store.getTimelines()
 *   };
 *   const finalData = BoardAdapter.toDashboardData(storeData, baseFromJson);
 *   const model = new Model(finalData);
 */
export default class BoardAdapter {
  /**
   * @param {object} storeData - { cards: [], intervals: [], timelines: [] } from Store
   * @param {object} baseData - optional base from dashboard.json + project + intervals (from GetData)
   * @returns {object} data suitable for new Model(data)
   */
  static toDashboardData(storeData = {}, baseData = {}) {
    const { cards = [], intervals: boardIntervals = [], timelines: boardTimelines = [] } = storeData;

    // Start from base (legacy JSONs for historical + config) or sensible defaults
    const data = JSON.parse(JSON.stringify(baseData || {})); // shallow clone for safety

    // Ensure top-level structure
    if (!data.project) data.project = {};
    if (!data.intervals) data.intervals = [];
    if (!data.dashboardName) data.dashboardName = data.dashboardName || 'Board-Driven Dashboard';
    if (!data.teamName) data.teamName = data.teamName || 'Team';
    if (!data.daysInInterval) data.daysInInterval = data.daysInInterval || 10;

    // 1. Derive current project status and types purely from board cards (live!)
    const statusCounts = {
      'In-Progress': 0,
      'Done': 0,
      'Todo': 0,
      'Blocked': 0
    };
    const typeCounts = {};
    let totalEstimated = 0;
    let totalUnestimated = 0;

    cards.forEach(card => {
      const status = card.status || 'backlog';
      if (status === 'inprogress') statusCounts['In-Progress']++;
      else if (status === 'done') statusCounts['Done']++;
      else if (status === 'todo' || status === 'backlog') statusCounts['Todo']++;
      if (card.blocked) statusCounts['Blocked']++;

      const t = card.type || 'Story';
      typeCounts[t] = (typeCounts[t] || 0) + 1;

      if (card.points && card.points > 0) totalEstimated++;
      else totalUnestimated++;
    });

    data.project.cardStatus = statusCounts;
    data.project.cardStatusLabel = data.project.cardStatusLabel || 'Cards';
    data.project.cardTypes = typeCounts;
    data.project.cardTypeLabel = data.project.cardTypeLabel || 'Points';

    // 2. Timelines live from board store (override base)
    if (boardTimelines && boardTimelines.length > 0) {
      data.project.timelines = boardTimelines.map(t => ({
        title: t.name || t.title || 'Untitled Timeline',
        timeline: (t.timeline || []).map(item => ({
          label: item.label || '',
          status: item.status || 'todo',
          days: Number(item.days) || 0,
          start: Number(item.start) || 0
        }))
      }));
    }

    // 3. Intervals: use board planning intervals to drive per-interval charts
    //    Derive committed/completed/estimated from cards assigned to each intervalId.
    //    Fall back to base intervals for historical context if present.
    //    This is the key to "board data drives charts".
    if (boardIntervals && boardIntervals.length > 0) {
      const derivedIntervals = boardIntervals.map((bi, index) => {
        const intervalId = bi.id;
        const assignedCards = cards.filter(c => c.intervalId === intervalId);
        const doneCards = assignedCards.filter(c => c.status === 'done');
        const committedPoints = assignedCards.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
        const completedPoints = doneCards.reduce((sum, c) => sum + (Number(c.points) || 0), 0);
        const estimatedCards = assignedCards.filter(c => Number(c.points) > 0).length;
        const unestimatedCards = assignedCards.filter(c => !c.points || Number(c.points) === 0).length;
        const blockedCards = assignedCards.filter(c => c.blocked).length;

        // Use base interval if exists for label/dates/team size, else derive
        const baseInterval = (data.intervals || []).find(i => (i.label || '').toLowerCase().includes((bi.name || bi.label || '').toLowerCase())) || data.intervals[index] || {};

        return {
          label: bi.name || bi.label || `Interval ${index + 1}`,
          review: baseInterval.review || '',
          dateStart: bi.startDate || baseInterval.dateStart || '',
          dateEnd: bi.endDate || baseInterval.dateEnd || '',
          teamMembersCount: baseInterval.teamMembersCount || 5,
          satisfactionTeam: baseInterval.satisfactionTeam || [],
          satisfactionShareholders: baseInterval.satisfactionShareholders || [],
          pointsCommited: committedPoints,
          pointsCompleted: completedPoints,
          pointsEstimated: Math.max(committedPoints * 1.5, baseInterval.pointsEstimated || 50),
          cardsCommited: assignedCards.length,
          cardsCompleted: doneCards.length,
          cardsEstimated: estimatedCards,
          cardsUnestimated: unestimatedCards,
          cardsBlocked: blockedCards,
          daysTimebox: baseInterval.daysTimebox || [0],
          daysOutHolidays: baseInterval.daysOutHolidays || 0,
          daysOutPlanned: baseInterval.daysOutPlanned || [0],
          daysOutUnplanned: baseInterval.daysOutUnplanned || [0],
          issuesPerInterval: baseInterval.issuesPerInterval || 0,
          notesInterval: baseInterval.notesInterval || ''
        };
      });

      // If we have base historical intervals, keep them + append/override with derived current ones.
      // For simplicity in Phase 0: prefer derived if board intervals exist (user is actively planning)
      data.intervals = derivedIntervals;
    }

    // 4. Ensure other dashboard fields
    if (!data.updatedName && baseData.updatedName) data.updatedName = baseData.updatedName;
    if (!data.updatedDate && baseData.updatedDate) data.updatedDate = baseData.updatedDate;

    // Cards summary for the "Cards" stat (estimated %)
    // Model uses per-interval, but we set a synthetic last interval or rely on derived above.
    // The derived intervals already carry cardsEstimated / Unestimated.

    return data;
  }

  /**
   * Optional helper: export current board state back to the 3-JSON shape
   * (useful for "snapshot" button in future or editor integration).
   */
  static toJsonFiles(storeData = {}) {
    const { cards = [], intervals: boardIntervals = [], timelines: boardTimelines = [] } = storeData;

    // dashboard.json stub
    const dashboard = {
      dashboardName: 'Board Project',
      teamName: 'Team',
      daysInInterval: 10
    };

    // project.json from current cards + timelines
    const statusCounts = { 'In-Progress': 0, Done: 0, Todo: 0, Blocked: 0 };
    const typeCounts = {};
    cards.forEach(c => {
      const s = c.status === 'inprogress' ? 'In-Progress' : c.status === 'done' ? 'Done' : c.status === 'todo' ? 'Todo' : 'Todo';
      statusCounts[s] = (statusCounts[s] || 0) + 1;
      if (c.blocked) statusCounts.Blocked = (statusCounts.Blocked || 0) + 1;
      const t = c.type || 'Story';
      typeCounts[t] = (typeCounts[t] || 0) + 1;
    });

    const project = {
      name: 'Board Project',
      cardTypeLabel: 'Points',
      cardTypes: typeCounts,
      cardStatusLabel: 'Cards',
      cardStatus: statusCounts,
      timelines: boardTimelines.map(t => ({
        title: t.name || t.title || 'Timeline',
        timeline: (t.timeline || []).map(it => ({
          label: it.label || '',
          status: it.status || 'todo',
          days: Number(it.days) || 0,
          start: Number(it.start) || 0
        }))
      }))
    };

    // intervals.json stub derived from board planning intervals + card aggregates
    const intervals = boardIntervals.map((bi, i) => {
      const assigned = cards.filter(c => c.intervalId === bi.id);
      const done = assigned.filter(c => c.status === 'done');
      return {
        label: bi.name || bi.label || `Interval ${i+1}`,
        dateStart: bi.startDate || '',
        dateEnd: bi.endDate || '',
        teamMembersCount: 5,
        satisfactionTeam: [],
        satisfactionShareholders: [],
        pointsCommited: assigned.reduce((s, c) => s + (c.points || 0), 0),
        pointsCompleted: done.reduce((s, c) => s + (c.points || 0), 0),
        pointsEstimated: 0,
        cardsCommited: assigned.length,
        cardsCompleted: done.length,
        cardsEstimated: assigned.filter(c => c.points > 0).length,
        cardsUnestimated: assigned.filter(c => !c.points).length,
        cardsBlocked: assigned.filter(c => c.blocked).length,
        daysTimebox: [0],
        daysOutHolidays: 0,
        daysOutPlanned: [0],
        daysOutUnplanned: [0],
        issuesPerInterval: 0
      };
    });

    return { dashboard, project: { project }, intervals: { intervals } };
  }
}