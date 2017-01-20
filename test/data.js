const mockData = {
  'dashboardName'                : 'TestDashboard',
  'teamName'                     : 'TestTeam',
  'updatedBy'                    : 'Me',
  'updatedDate'                  : 'Tue, 20 Dec 2016 16:28:00',
  'daysInInterval'               : 10,
  'project'                  : {
    'name'           : 'TestProject',
    'intervals'      : 'testIntervals.json',
    'cardTypes'      : {
      'Stories'      : 10,
      'Spikes'       : 10,
      'Improvements' : 10,
      'Testing'      : 10,
      'Issues'       : 10,
      'Defects'      : 10
    },
    cardStatus      : {
      'In-Progress' : 10,
      'Done'        : 10,
      'Todo'        : 10,
      'Blocked'     : 10
    },
    "timelines": [{
      "title": "Timeline 1",
      "timeline": [{
        "label": "Theme group 1",
        "status": "inprogess",
        "days": 30,
        "start": 0
      },{
        "label": "Theme group 2",
        "status": "todo",
        "days": 20,
        "start": 0
      }]
    },{
      "title": "Timeline 2",
      "timeline": [{
        "label": "Theme 1.1",
        "status": "done",
        "days": 10,
        "start": 0
      },{
        "label": "Theme 1.2",
        "status": "inprogess",
        "days": 20,
        "start": 10
      },{
        "label": "Theme 1.3",
        "status": "todo",
        "days": 10,
        "start": 30
      }]
    }]
  },
  'intervals': [{
      'label'                    : 'Sprint 1',
      'dateStart'                : '10/12/2016',
      'dateEnd'                  : '10/13/2016',
      'teamMembersCount'         : 5, // Total members of the team at this interval
      'satisfactionTeam'         : [2,5],  // How satisfied the team with the results of the sprint
      'satisfactionShareholders' : [9,6],  // How satisfied are the share holder with the results of the sprint
      'pointsCommited'           : 10,  // Total points commited to in Sprint planning
      'pointsCompleted'          : 10, // Total points complete in the Sprint
      'cardsCommited'            : 4,  // Total cards commited to in Sprint planning
      'cardsCompleted'           : 4,  // Total cards complete in the Sprint
      'cardsEstimated'           : 10, // total cards in the backlog that ARE estimated.
      'cardsUnestimated'         : 4,  // total cards in the backlog that are NOT estimated.
      'cardsBlocked'             : 2,  // the number of cards that are blocked this interval.
      'daysTimebox'              : [1], // The number of time boxed event in the sprint.
      'daysOutHolidays'          : 1,  // The number of hoildays in the sprint
      'daysOutPlanned'           : [2], // the number days out team members are not work during the sprint.
      'daysOutUnplanned'         : [1], // Unexpected days out during the sprint
      'issuesPerInterval'        : 1,  // These can be internal defects, or problem that the team identified.
      'notesInterval'            : 'url/to/md' // markdown about the sprint
    },{
      'label'                    : 'Sprint 2',
      'review'                   : 'url/to/review2',
      'dateStart'                : '11/12/2016',
      'dateEnd'                  : '11/13/2016',
      'teamMembersCount'         : 5,
      'satisfactionTeam'         : [],
      'satisfactionShareholders' : [],
      'pointsCompleted'          : 5,
      'pointsCommited'           : 7,
      'cardsCompleted'           : 0,
      'cardsCommited'            : 0,
      'cardsEstimated'           : 10,
      'cardsUnestimated'         : 4,
      'cardsBlocked'             : 2,
      'daysTimebox'              : [0],
      'daysOutHolidays'          : 0,
      'daysOutPlanned'           : [0],
      'daysOutUnplanned'         : [0],
      'issuesPerInterval'        : 1,
      'notesInterval'            : 'url/to/md'
    },{
      'label'                    : 'Sprint 3',
      'review'                   : 'url/to/review3',
      'dateStart'                : '12/12/2016',
      'dateEnd'                  : '12/13/2016',
      'teamMembersCount'         : 5,
      'satisfactionTeam'         : [],
      'satisfactionShareholders' : [],
      'pointsCompleted'          : 30,
      'pointsCommited'           : 15,
      'cardsCompleted'           : 7,
      'cardsCommited'            : 5,
      'cardsEstimated'           : 10,
      'cardsUnestimated'         : 4,
      'cardsBlocked'             : 2,
      'daysTimebox'              : [2],
      'daysOutHolidays'          : 2,
      'daysOutPlanned'           : [4],
      'daysOutUnplanned'         : [7],
      'issuesPerInterval'        : 1,
      'notesInterval'            : 'url/to/md'
    }]
  };
