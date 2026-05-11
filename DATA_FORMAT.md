# Data Format

The app reads three JSON files per team/project from the `teams/` directory.

## Directory structure

```
teams/
  <teamName>/
    dashboard.json
    projects/
      <projectName>/
        project.json
        intervals.json
```

Use web-safe folder names (no spaces or special characters), e.g. `myTeam` or `my_team_name`.

---

## dashboard.json

Top-level team metadata. This file rarely changes.

```json
{
  "dashboardName": "Sample Dashboard",
  "teamName": "Sample Team",
  "updatedName": "Sample person",
  "daysInInterval": 10
}
```

---

## project.json

Non-interval project data: card types, statuses, and optional timelines. Card type and status values must be numbers. You can define as many types and statuses as you need.

```json
{
  "project": {
    "name": "Sample Project",
    "cardTypeLabel": "Points",
    "cardTypes": {
      "Stories": 10,
      "Spikes": 5
    },
    "cardStatusLabel": "Cards",
    "cardStatus": {
      "In-Progress": 10,
      "Done": 10,
      "Todo": 10,
      "Blocked": 2
    },
    "timelines": [
      {
        "title": "Timeline 1",
        "timeline": [
          { "label": "Theme group 1", "status": "inprogress", "days": 30, "start": 0 },
          { "label": "Theme group 2", "status": "todo",       "days": 20, "start": 30 }
        ]
      }
    ]
  }
}
```

`cardTypeLabel`, `cardStatusLabel`, and `timelines` are optional.

---

## intervals.json

Sprint/iteration data. All fields are required except `review` and `notesInterval`.

```json
{
  "intervals": [
    {
      "label":                    "Sprint 1",
      "review":                   "url/to/review",
      "dateStart":                "10/12/2016",
      "dateEnd":                  "10/13/2016",
      "teamMembersCount":         5,
      "satisfactionTeam":         [2, 5],
      "satisfactionShareholders": [9, 6],
      "pointsCommited":           10,
      "pointsCompleted":          10,
      "pointsEstimated":          50,
      "cardsCommited":            4,
      "cardsCompleted":           4,
      "cardsEstimated":           10,
      "cardsUnestimated":         4,
      "cardsBlocked":             2,
      "daysTimebox":              [1],
      "daysOutHolidays":          1,
      "daysOutPlanned":           [2],
      "daysOutUnplanned":         [1],
      "issuesPerInterval":        1,
      "notesInterval":            "url/to/md"
    }
  ]
}
```

### Field reference

| Field | Type | Description |
|---|---|---|
| `label` | String | Human-readable interval name, used as a chart label |
| `review` | String | URL to the sprint review (optional) |
| `dateStart` | String | Interval start date. Use mm/dd/yyyy for best chart display |
| `dateEnd` | String | Interval end date. Use mm/dd/yyyy for best chart display |
| `teamMembersCount` | Number | Number of people on the team during this interval |
| `satisfactionTeam` | Array | Team satisfaction scores (1–10) for the interval |
| `satisfactionShareholders` | Array | Stakeholder satisfaction scores (1–10) for the interval |
| `pointsCompleted` | Number | Story points completed during the sprint |
| `pointsCommited` | Number | Story points the team committed to |
| `pointsEstimated` | Number | Total estimated points for the whole project at this point — used for the scope line in the burnup chart |
| `cardsCompleted` | Number | Cards completed during the sprint |
| `cardsCommited` | Number | Cards the team committed to |
| `cardsEstimated` | Number | Cards that have an estimate |
| `cardsUnestimated` | Number | Cards without an estimate |
| `cardsBlocked` | Number | Count of blockers. Log a note in `notesInterval` for each one |
| `issuesPerInterval` | Number | Any other team issues. Log a note in `notesInterval` for each one |
| `daysTimebox` | Array | Timebox days within the interval, subtracted from capacity for predicted velocity |
| `daysOutHolidays` | Number | Holiday days, multiplied by `teamMembersCount` and subtracted from capacity |
| `daysOutPlanned` | Array | Known planned days off (vacation, PTO). Log details in `notesInterval` |
| `daysOutUnplanned` | Array | Unplanned days off (sick, etc.). Log details in `notesInterval` |
| `notesInterval` | String | URL or path to a Markdown file with notes for this interval (optional) |
