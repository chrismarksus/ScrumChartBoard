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
        charts.processResponse({ 'status': 200, 'responseText':'*notes 1*'})
        expect($('#notesDescription .content').html().replace(/(\r\n|\n|\r)/gm,'')).to.eql('<p><em>notes 1</em></p>');
      });
      it('should add content to the notes dialog after failed load', () => {
        charts.processResponse({ 'status': 404, 'responseText':'<p><em>notes 1</em><p>'})
        expect($('#notesDescription .content').html()).to.eql('');
      });
      it('should add content to the notes dialog after no text', () => {
        charts.processResponse({ 'status': 200 })
        expect($('#notesDescription .content').html()).to.eql('');
      });
    });
    describe('The Charts', () => {
      it('should set the config object', () => {
        const conf = {
          'hello':'world'
        };
        charts.setConf(conf);
        expect(charts.getConf()).to.eql(conf);
      });
      it('should set the data object', () => {
        const data = {
          'hello':'world'
        };
        charts.setData(data);
        expect(charts.getData()).to.eql(data);
      });
      it('should set the data object', () => {
        sinon.spy(Flotr, 'draw');
        const data = {
          'hello':'world'
        };
        const conf = {
          'hello':'world'
        };
        charts.setConf(conf);
        charts.setData(data);
        charts.render();
        const expected = Flotr.draw.getCall(0).args;
        expect(expected[0].id).to.eql('charts');
        expect(expected[1]).to.eql(data);
        expect(expected[2]).to.eql(conf);
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
      it('should set the notes from the server', () => {
        const notes = ['note/url/1', null, 'note/url/3'];
        charts.setNotes(notes);
        charts.render();

        let stub = sinon.stub(charts.chartRef.hit, 'hit');
        stub.onCall(0).returns({ 'index': 0});

        let result = charts.getNoteMarkdown(0);
        expect(result).to.be.an('object');
      });
      it('should set the notes from the server with null', () => {
        const notes = ['note/url/1', null, 'note/url/3'];
        charts.setNotes(notes);
        charts.render();

        let stub = sinon.stub(charts.chartRef.hit, 'hit');
        stub.onCall(0).returns({ 'index': 1});

        let result = charts.getNoteMarkdown(0);
        expect(result).to.eql(null);
      });
      it('should create one listener for notes', () => {
        sinon.spy(Flotr.EventAdapter, 'observe');
        const data = {
          'hello':'world'
        };
        const conf = {
          'hello':'world'
        };
        const notes = ['# note 1', null, '# note 3'];
        charts.setConf(conf);
        charts.setData(data);
        charts.setNotes(notes);
        charts.render();
        charts.setNotes(notes);
        const expected = Flotr.EventAdapter.observe.getCall(0);
        expect(expected.args[0].getAttribute('id')).to.eql('charts');
        expect(expected.args[1]).to.eql('flotr:click');
        expect(expected.args[2].name).to.eql('bound getNoteMarkdown');
      });
      it('should set the dates prop for tick format', () => {
        const dates = ['11/6', '12/6', '01/6'];
        charts.setDates(dates);
        expect(charts.tickFormatDates(1)).to.eql('12/6');
        expect(charts.tickFormatDates(0)).to.eql('11/6');
        expect(charts.tickFormatDates(2)).to.eql('01/6');
      });
      it('should set the processMarkdown method', () => {
        const notes = ['# note 1', null, '# note 3'];
        let data = charts.processMarkdown('# note 1');
        expect(data.replace(/(\r\n|\n|\r)/gm,'')).to.eql('<h1>note 1</h1>');
      });
    });

})();
