(function () {
  'use strict';

  let charts;
    beforeEach(() => {
      $('#sandbox').append('<div id="charts" style="height:100px;"></div>');
      charts = new Charts('charts');
    });
    afterEach(() => {
      $('#sandbox #charts').remove();
    });


    describe('The Charts note dialog', () => {
      beforeEach(() => {
        $('#sandbox').append(
          '<div id="notesDescription"><div class="content"></div></div>'
        );
      });
      afterEach(() => {
        $('#sandbox #notesDescription').remove();
      });
      it('should add content to the notes dialog', () => {
        charts.setMarkdownContent('<em>notes 1</em>');
        expect($('#notesDescription .content').html()).to.eql('<em>notes 1</em>');
      });
      it('should add content to the notes dialog after successful load', () => {
        charts.processResponse('*notes 1*');
        expect($('#notesDescription .content').html().replace(/(\r\n|\n|\r)/gm,'')).to.eql('<p><em>notes 1</em></p>');
      });
      it('should not add content to the notes dialog when text is empty', () => {
        charts.processResponse('');
        expect($('#notesDescription .content').html()).to.eql('');
      });
      it('should not add content to the notes dialog when text is null', () => {
        charts.processResponse(null);
        expect($('#notesDescription .content').html()).to.eql('');
      });
    });
    describe('The Charts', () => {
      it('should set the config object', () => {
        const conf = { 'hello':'world' };
        charts.setConf(conf);
        expect(charts.getConf()).to.eql(conf);
      });
      it('should set the data object', () => {
        const data = { 'hello':'world' };
        charts.setData(data);
        expect(charts.getData()).to.eql(data);
      });
      it('should set chartRef on render', () => {
        charts.render();
        expect(charts.chartRef).to.not.equal(null);
      });
      it('should destroy previous chart on re-render', () => {
        charts.render();
        let destroyed = false;
        charts.chartRef.destroy = () => { destroyed = true; };
        charts.render();
        expect(destroyed).to.be.true;
      });
      it('should set the labels prop for tick format', () => {
        const labels = ['bob', 'tim', 'sue'];
        charts.setLabels(labels);
        expect(charts.tickFormatLabels(1)).to.eql('tim');
        expect(charts.tickFormatLabels(0)).to.eql('bob');
        expect(charts.tickFormatLabels(2)).to.eql('sue');
      });
      it('should set the notes', () => {
        const notes = ['# note 1', null, '# note 3'];
        charts.setNotes(notes);
        expect(charts.getNotes()).to.eql(notes);
      });
      it('should fetch note when note exists at index', () => {
        const notes = ['note/url/1', null, 'note/url/3'];
        charts.setNotes(notes);
        let result = charts.getNoteMarkdown(0);
        expect(result).to.be.instanceof(Promise);
      });
      it('should return null when note is missing at index', () => {
        const notes = ['note/url/1', null, 'note/url/3'];
        charts.setNotes(notes);
        let result = charts.getNoteMarkdown(1);
        expect(result).to.eql(null);
      });
      it('should add onClick handler when notes are set', () => {
        const notes = ['# note 1', null, '# note 3'];
        charts.setNotes(notes);
        charts.render();
        expect(typeof charts.conf.options.onClick).to.eql('function');
      });
      it('should set the dates prop for tick format', () => {
        const dates = ['11/6', '12/6', '01/6'];
        charts.setDates(dates);
        expect(charts.tickFormatDates(1)).to.eql('12/6');
        expect(charts.tickFormatDates(0)).to.eql('11/6');
        expect(charts.tickFormatDates(2)).to.eql('01/6');
      });
      it('should set the processMarkdown method', () => {
        let data = charts.processMarkdown('# note 1');
        expect(data.replace(/(\r\n|\n|\r)/gm,'')).to.eql('<h1>note 1</h1>');
      });
      it('should set the location hash', () => {
        charts.setHash('#test');
        expect(location.hash).to.eql('#test');
      });
    });

})();
