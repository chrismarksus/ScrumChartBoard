(function () {
  'use strict';

  let colors;
  describe('The Colors object ', () => {
    describe('given a new color array ', () => {
      beforeEach(() => {
        colors = new Colors('dark', [
          '#42f48a',
          '#8fa6f6',
          '#705909',
          '#1435f4',
          '#ebca0b',
          '#ea16aa',
          '#15e955',
          '#b07b29',
          '#4f84d6',
          '#fde42e',
          '#021bd1',
          '#01f19e',
          '#fe0e61']);
      });
      it('should background be pink', function () {
        expect(colors.background()).to.eql('#fe0e61');
      });
      it('should be the same as new colors', function () {
        expect(colors.getTheme()).to.eql([
          '#42f48a',
          '#8fa6f6',
          '#705909',
          '#1435f4',
          '#ebca0b',
          '#ea16aa',
          '#15e955',
          '#b07b29',
          '#4f84d6',
          '#fde42e',
          '#021bd1',
          '#01f19e',
          '#fe0e61']);
      });
    });

    describe('given a dark background', () => {
      beforeEach(() => {
        colors = new Colors('dark');
      });
      it('should have a dark background', function () {
        expect(colors.background()).to.eql('#002b36');
      });
      it('should have a light label for dark background', function () {
        expect(colors.getLabel()).to.eql('#f5f0e3');
      });
      it('should have a theme with a dark background', function () {
        expect(colors.getTheme()).to.eql([
          '#6e8e4f',
          '#4a7c8a',
          '#d97757',
          '#a88b5c',
          '#6fa8b8',
          '#b85c4a',
          '#c4a473',
          '#2d4a5c',
          '#545454',
          '#666666',
          '#cfdde2',
          '#f5f0e3',
          '#002b36'
        ]);
      });
    });

    describe('given a light background', () => {
      beforeEach(() => {
        colors = new Colors();
      });
      it('should have a light background', function () {
        expect(colors.background()).to.eql('#ffffff');
      });
      it('should have a theme with a light background', function () {
        expect(colors.getTheme()).to.eql([
          '#6e8e4f',
          '#4a7c8a',
          '#d97757',
          '#a88b5c',
          '#6fa8b8',
          '#b85c4a',
          '#c4a473',
          '#2d4a5c',
          '#545454',
          '#666666',
          '#cfdde2',
          '#f5f0e3',
          '#ffffff'
        ]);
      });
      it('should have a gray label', function () {
        expect(colors.getLabel()).to.eql('#545454');
      });
      it('should have a purple satisfaction color', function () {
        expect(colors.satisfaction()).to.eql('#a88b5c');
      });
      it('should have a purple satisfaction color 2', function () {
        expect(colors.satisfaction(2)).to.eql(['#2d4a5c', '#a88b5c']);
      });
      it('should have a done color', function () {
        expect(colors.done()).to.eql('#6e8e4f');
      });

      it('should have a todo color', function () {
        expect(colors.todo()).to.eql('#4a7c8a');
      });
      it('should have a inprogress color', function () {
        expect(colors.inprogress()).to.eql('#d97757');
      });
      it('should have a hover color', function () {
        expect(colors.hover()).to.eql('#b85c4a');
      });
      it('should have a grid color', function () {
        expect(colors.grid()).to.eql('#545454');
      });
      it('should have a legend color', function () {
        expect(colors.legend()).to.eql('#666666');
      });
      it('should have a projection array', function () {
        expect(colors.projection()).to.eql(['#d97757', '#6e8e4f', '#cfdde2']);
      });
      it('should have a progress array', function () {
        expect(colors.progress()).to.eql(['#d97757', '#4a7c8a', '#6e8e4f', '#b85c4a']);
      });
      it('should have a progress array in reverse', function () {
        expect(colors.progress(true)).to.eql(['#b85c4a', '#6e8e4f', '#4a7c8a', '#d97757']);
      });
      it('should have a statusToColor of default', function () {
        expect(colors.statusToColor('oFf-tEaM')).to.eql('#6fa8b8');
      });
      it('should have a statusToColor of todo', function () {
        expect(colors.statusToColor('todo')).to.eql('#4a7c8a');
      });
      it('should have a statusToColor of todo', function () {
        expect(colors.statusToColor('Todo')).to.eql('#4a7c8a');
      });
      it('should have a statusToColor of done', function () {
        expect(colors.statusToColor('done')).to.eql('#6e8e4f');
      });
      it('should have a statusToColor of done', function () {
        expect(colors.statusToColor('Done')).to.eql('#6e8e4f');
      });
      it('should have a statusToColor of inprogress', function () {
        expect(colors.statusToColor('inprogress')).to.eql('#d97757');
      });
      it('should have a statusToColor of inprogress', function () {
        expect(colors.statusToColor('in-progress')).to.eql('#d97757');
      });
      it('should have a statusToColor of inprogress', function () {
        expect(colors.statusToColor('In-Progress')).to.eql('#d97757');
      });
    });
  });

})();
