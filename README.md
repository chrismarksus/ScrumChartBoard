# ScrumChartBoard

A no database web page that renders charts to visualize data a scrum master would care about. It does this by loading 3 json files into the browser via ajax request.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Prerequisites

You need to be comfortable a text editor so you can edit the json files and markdown. You will also need to be comfortable with path and file management. The project depends on files being located in the predictable way so the webpage knows were to look for the files. Also for the note feature in the project it will help if you know markdown but you can get by with out it.

To contribute to the project you will node.js installed. You will need to how to write unit tests and write in *ES6*.

### Installing

A step by step series of examples that tell you have to get a development env running

Clone the project

```
cd my/projects
git clone https://github.com/chrismarksus/ScrumChartBoard.git
```

Download dependencies

```
npm install && bower install
```

To run dev
```
gulp serve
```
A browser will launch and if it is the first time you will see the no data page. This has a link to the sample data at the end. If you have set up the team folder correctly. Then you will just need to add two get parameter to the url to see your charts. the team and the project values. These will be the same as the name on the folder that storage the data.

```
http://localhost:9000?team=abc&project=sample
```

## Running the tests

```
gulp serve:test
```

### And coding style tests

Right the coding style is a mess, the architecture and design are a mess, basically the project is a mess. So, yeah.

## Deployment

The dist command will create a folder name ```./dist``` in the root directory. You can copy or ftp these files anywhere you want.

```
gulp serve:dist
```

If this is the first time using the project there is a folder that you will need to add to the you project folder and that is the ```teams``` folder.

```
dist or project root
  scripts
  styles
  teams
  template
  favicon.ico
  index.html
  robots.txt
```
In the teams folder will be folders named after your scrum teams. Use web safe names like *myTeamName* or *my_team_name*. No spaces or weird characters.

Inside each of these folders will be one json file *dashboard.json* and a folder named ```/projects```.

The ```dashboard.json``` contain the teams board information. This is not a file you will changing a lot.

```
{
	"dashboardName": "Sample Dashboard",
	"teamName": "Sample Team",
	"updatedName": "Sample person",
	"daysInInterval": 10
}
```

In the project folder there should be a folder with the name of your projects that that team is working or has worked on. Again use web safe names like *myTeamName* or *my_team_name*. No spaces or weird characters.

```
./projects
  ./myProject_1
  ./or_my_project_2
```

Inside each project folder will need to be at a minimum two json files. ```intervals.json``` and ```project.json```.

The ```project.json``` contains the data for the non-team, non-interval (or sprint) data. The status, types of cards, the project timelines. The status and card types can have as many value as you want but it to have a number as a value.

The timelines are optional and you have as many as you want. Just add add more objects to array and follow the format below.

```
{
  "project": {
    "name": "Sample Project",
    "cardTypes": {
      // TYPE HERE
    },
    "cardStatus": {
      // STATUS HERE
    },
    "timelines": [{
      "title": "Timeline 1",
      "timeline": [{
        "label": "Theme group 1",
        "status": "inprogress",
        "days": 30,
        "start": 0
      },{
        "label": "Theme group 2",
        "status": "todo",
        "days": 20,
        "start": 30
      }]
    }]
  }
}

```

The ```intervals.json``` contains the interval *(or Sprint)* relate data. The only values that are optional are *review* and *notesInterval*.

```
{
	"intervals": [{
		"label"                    : "Sprint 1",
    "review"                   : "url/to/review",
		"dateStart"                : "10/12/2016",
		"dateEnd"                  : "10/13/2016",
		"teamMembersCount"         : 5,
		"satisfactionTeam"         : [2, 5],
		"satisfactionShareholders" : [9, 6],
		"pointsCommited"           : 10,
		"pointsCompleted"          : 10,
		"pointsEstimated"          : 50,
		"cardsCommited"            : 4,
		"cardsCompleted"           : 4,
		"cardsEstimated"           : 10,
		"cardsUnestimated"         : 4,
		"cardsBlocked"             : 2,
		"daysTimebox"              : [1],
		"daysOutHolidays"          : 1,
		"daysOutPlanned"           : [2],
		"daysOutUnplanned"         : [1],
		"issuesPerInterval"        : 1,
		"notesInterval"            : "url/to/md"
	}]
}

```

### Interval Key descriptions

##### label
*(String)* - The name or identifier for an interval. This can be what ever you what but it is meant to be a hunam readable value. 

##### dateStart
*(String)* - This is the date that the interval started. It can be in any format but mm/dd/yy or mm/dd/yyyy is that better format. Since this is used for the label on the charts. 

##### dateEnd
*(String)* - This is the date that the interval ended. It can be in any format but mm/dd/yy or mm/dd/yyyy is that better format. Since this is used for the label on the charts.

##### teamMembersCount
*(Number)* - This is the number of people on the team during the interval. This is a repeatative value that doesn't change often but it a person is add or removed from the team you will want to track that in the capacity charts. 

##### satisfactionTeam
*(Number)* - This is like a happiness score but more specific. This is how satisfied the team is with the work they as a team and as individuals during the interval. This is a score from 1-10. 

##### satisfactionShareholders
*(Number)* - This is like the team satisfaction score for the shareholders. How satisfaied are the shareholders with the work that the team did for the interval. Not are they pleased witht he results but with the teams effort. This is a score from 1-10.

##### pointsCompleted
*(Number)* - This is the total point completed during the sprint.

##### pointsCommited
*(Number)* - This is the total point that the team commited to during the sprint. 

##### pointsEstimated
*(Number)* - This is the total estimated points for the whole project at this interval. This is used for the scope line in the burnup chart. 

##### cardsCompleted
*(Number)* - This is total cards completed during the sprint.

##### cardsCommited
*(Number)* - This is the total cards that the team commited to during the sprint. 
 
##### cardsEstimated
*(Number)* - This is the total number of cards that have an estimate.

##### cardsUnestimated
*(Number)* - This is total number of cards that do not have an estimate.

##### cardsBlocked
*(Number)* - This is an open metric an can be used for the number a things that block a cards on the board. But if it stops a card for some reason then you should count it here and add a note to your interval notes. 

##### issuesPerInterval
*(Number)* - Like the *cardsBlocked* value this is open for interpretation. Any issue the team has should be counted and a note add to the iterval notes. 

##### daysTimebox
*(Array)* - This is the number of timeboxes in an interval. These will be subtracted from the capacity to give a predicted velocity. 

##### daysOutHolidays
*(Number)* - This is the number of holidays in an interval. These will be multipled by the team member count then subtracted from the capacity to give a predicted velocity. 

##### daysOutPlanned
*(Array)* - This is known days off.  These will be subtracted from the capacity to give a predicted velocity. Please add notes about vacation and PTO to the interval notes.

##### daysOutUnplanned
*(Number)* - This are unexpected days off (sick days, etc..). These will be subtracted from the capacity to give a predicted velocity. Please add notes about sick days or  to the interval notes. 

##### notesInterval
*(String)* - This is is the url or path to the notes for this interval. These note must be in markdown format.

## Built With

* [Node](https://nodejs.org/en/) - The build framework and back-end dependencies management
* [Bower](https://bower.io/) - Fornt-end dependencies management
* [flotr2](http://www.humblesoftware.com/flotr2/) - Chart library
* [jquery](http://www.dropwizard.io/1.0.2/docs/) - Client library
* [handlebars](http://handlebarsjs.com/) - Template engine
* [skeleton](http://getskeleton.com/) - Grid and css framework
* [markdown-it](https://github.com/markdown-it/markdown-it) - Client side markdown renderer
* [mocha](https://mochajs.org/) - Unit testing framework
* [blanket](http://blanketjs.org/) - Client side code coverage tool
* [gulp](http://gulpjs.com/) - Task manager
* [browser-sync](https://browsersync.io/) - Browser synchronizer
* [generator-webapp](https://github.com/yeoman/generator-webapp) - Yeoman Generator WebApp

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/chrismarksus/b4cbebbe93a7269b69a73af7cc4c22be) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [ScrumChartBoard](https://github.com/chrismarksus/ScrumChartBoard/tags).

## Authors

* **Chris Marks** - *Initial work* - [chrismarksus](https://github.com/chrismarksus)

See also the list of [contributors](https://github.com/chrismarksus/ScrumChartBoard) who participated in this project.

