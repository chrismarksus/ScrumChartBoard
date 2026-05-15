const Templates = {

  dashboardHeader(data) {
    return `<div class="row">
  <div class="twelve columns">
    <h1 class="headline">${data.dashboardName}</h1>
    <h2 class="headline project">${data.projectName}</h2>
    <h5 class="headline team">${data.teamName}</h5>
  </div>
</div>`;
  },

  chartGroupPartial(data) {
    const desc = !data.nodescription
      ? `<a class="description" id="${data.label}Closed" href="#${data.label}Description">i</a>`
      : '';
    const heading = data.title
      ? `<${data.tagname} class="chart title">${data.title} ${desc}</${data.tagname}>`
      : '';
    return `${heading}
<div id="${data.label}" class="chart"></div>`;
  },

  deckLinkPartial(item) {
    const attrs = item.review
      ? `class="button button-primary" href="${item.review}"`
      : `class="button"`;
    const label = item.dateStart
      ? ` ${item.label} (${item.dateStart} - ${item.dateEnd})`
      : item.label;
    return `<a ${attrs} target="_blank">${label}</a>`;
  },

  backlogPartial(data) {
    return `<div class="row">
  <div id="backlog" class="twelve columns download">
    <br>
    <p>Looking for the backlog?<br>
      <a class="button button-primary" href="${data.backlog}" target="_blank">Backlog</a>
    </p>
  </div>
</div>`;
  },

  popupPartial(popup) {
    return `<div id="${popup.label}Description" class="overlay">
  <div class="popup">
    <h2>${popup.title}</h2>
    <a class="close" href="#${popup.label}Closed">&times;</a>
    <div class="content">${popup.content}</div>
  </div>
</div>`;
  },

  updatedPartial(data) {
    return `<div class="row">
  <div class="twelve columns footer">
    <p class="updatedBy">By: ${data.updatedName} Updated: ${data.updatedDate}</p>
  </div>
</div>`;
  },

  velocity(data) {
    return `<div class="textChart">
  <div class="head">
    <h4 class="title">Velocity</h4>
    <h5></h5>
  </div>
  <div class="body">
    <p class="number">${data.totalAverageVelocity}/${data.predictedVelocity}</p>
  </div>
  <div class="foot"><h5>Current / Predicted</h5></div>
</div>`;
  },

  workdays(data) {
    return `<div class="textChart workdays">
  <div class="head">
    <h4 class="title">Person Work Days</h4>
    <h5></h5>
  </div>
  <div class="body">
    <p class="number">${data.totalPersonWorkDays}</p>
  </div>
</div>`;
  },

  capacity(data) {
    return `<div id="capacity" class="textChart capacity">
  <div class="head">
    <h4 class="title">Capacity Days</h4>
  </div>
  <div class="body">
    <p class="number">
      <span>${data.totalPersonWorkDays}</span>/<span>${data.personWorkDays}</span>/<span>${data.timeboxes}</span>
    </p>
  </div>
  <div class="foot">
    <h5>Total / Workdays / Timeboxes</h5>
  </div>
</div>`;
  },

  blockTitleWithCount(data) {
    return `<${data.tagname} class="title">${data.title} (${data.count})
  <a class="description" id="${data.label}Closed" href="#${data.label}Description">i</a>
</${data.tagname}>`;
  },

  estimatedCards(data) {
    return `<div class="textChart cardsestimated">
  <div class="head">
    <h4 class="title">Cards</h4>
  </div>
  <div class="body">
    <p class="number">${data.cardsEstimatedPercentage}%</p>
  </div>
  <div class="foot"><h5>Estimated (${data.cardsEstimated}) / Unestimated (${data.cardsUnestimated})</h5></div>
</div>`;
  },

  main(data) {
    const deckLinks = data.intervals.map(i => Templates.deckLinkPartial(i)).join('\n          ');
    const timelineRows = data.timelines ? `<div class="row">
    <div class="twelve columns">
      <h5 class="chart title">Timelines
        <a class="description" id="timelinesClosed" href="#timelinesDescription">i</a>
      </h5>
      ${data.timelines.map(t => Templates.chartGroupPartial({tagname: 'h6', label: t.label, title: t.title, nodescription: true})).join('\n      ')}
    </div>
  </div>` : '';
    const popups = data.popups ? `<div id="popupContainer">
      ${data.popups.map(p => Templates.popupPartial(p)).join('\n      ')}
    </div>` : '';
    return `<div class="container">

  ${Templates.dashboardHeader(data)}

  <div class="row">
    <div class="twelve columns ">
      <h3 class="chart header title">Interval Reviews</h3>
      <div id="slideDecks" class="slidedecks">
          ${deckLinks}
      </div>
    </div>
  </div>
  <div class="row">
    <div class="twelve columns">
      <h3 class="chart header title">Project</h3>
      ${Templates.chartGroupPartial({tagname: 'h5', label: 'burndown', title: 'Burnup'})}
    </div>
  </div>

  ${timelineRows}

  <div class="row">
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'status', title: 'Status'})}
    </div>
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'cardTypes', title: 'Types'})}
    </div>
  </div>
  <div class="row">
    <div class="twelve columns">
      <h3 class="chart header title">Team</h3>
    </div>
  </div>
  <div class="row">
    <div id="estimatedCards" class="four columns">
      ${Templates.estimatedCards(data)}
    </div>
    <div id="velocity" class="four columns">
      ${Templates.velocity(data)}
    </div>
    <div id="daysCapacity" class="four columns">
      ${Templates.capacity(data)}
    </div>
  </div>
  <div class="row">
    <div class="twelve columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'daysWorked', title: 'Capacity'})}
    </div>
  </div>
  <div class="row">
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'pointsgoals', title: 'Points Interval Goals'})}
    </div>
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'commitedvscompleted', title: 'Points Commited <small>VS</small> Completed'})}
    </div>
  </div>
  <div class="row">
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'cardsgoals', title: 'Cards Interval Goals'})}
    </div>
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'cardscommitedvscompleted', title: 'Cards Commited <small>VS</small> Completed'})}
    </div>
  </div>
  <div class="row">
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'issuesPerInterval', title: 'Issues Per Interval'})}
    </div>
    <div class="six columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'cardsBlocked', title: 'Cards Blocked'})}
    </div>
  </div>
  <div class="row">
    <div class="twelve columns">
      ${Templates.chartGroupPartial({tagname: 'h4', label: 'satisfaction', title: 'Satisfaction'})}
    </div>
  </div>
  ${data.backlog ? Templates.backlogPartial(data) : ''}
  ${data.updatedName ? Templates.updatedPartial(data) : ''}

  ${popups}

  <div id="notesDescription" class="overlay">
    <div class="popup">
      <h3 class="title">Notes</h3>
      <a class="close" href="#notesClosed">&times;</a>
      <div class="content">content here</div>
    </div>
  </div>

</div>`;
  },

  nodata(data) {
    const body = data.links && data.links.length
      ? `<p>But it looks like I found some projects that you looked at before.</p>
        <ul>
          ${data.links.map(l => `<li><a href="./?team=${l.team}&project=${l.project}">Team: ${l.team} Project: ${l.project}</a></li>`).join('\n          ')}
        </ul>`
      : `<p>Either there are missing parameters in the url or the json files are not on the server. Please view the <a href="./?team=abc&project=sample">sample data</a>.</p>`;
    return `<div class="container">
  <div class="row">
    <div class="twelve columns">
      <h1 style="color:#666;">DOH! <small>There is not data available!</small></h1>
      ${body}
    </div>
  </div>
</div>`;
  }

};

export default Templates;
