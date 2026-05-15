#!/usr/bin/env node
'use strict';

const vm   = require('vm');
const fs   = require('fs');
const path = require('path');

// --- DOM environment via jsdom ---
const { JSDOM } = require('jsdom');
const dom = new JSDOM(
  '<!DOCTYPE html><html><body><div id="sandbox"></div></body></html>',
  { url: 'http://localhost', runScripts: 'dangerously' }
);
global.window        = dom.window;
global.document      = dom.window.document;
global.location      = dom.window.location;
global.localStorage  = dom.window.localStorage;

// --- jQuery from npm (loaded into jsdom so DOM tests work) ---
dom.window.eval(
  fs.readFileSync(
    path.join(__dirname, '../node_modules/jquery/dist/jquery.js'), 'utf8'
  )
);
global.$      = dom.window.$;
global.jQuery = dom.window.jQuery;

// --- Chai ---
const chai    = require('chai');
global.assert = chai.assert;
global.expect = chai.expect;
global.should = chai.should();

// --- Sinon ---
const sinon  = require('sinon');
global.sinon = sinon;

// --- Chart.js stub (canvas charting not usable in jsdom) ---
// Pre-populate require cache so source file imports get the stub.
const ChartStub = function Chart(el, conf) { this.destroy = function() {}; };
ChartStub.register    = function() {};
ChartStub.getChart    = function() { return null; };
const chartjsPath = require.resolve('chart.js');
require.cache[chartjsPath] = {
  id: chartjsPath, filename: chartjsPath, loaded: true,
  exports: { Chart: ChartStub, registerables: [] }
};
global.Chart = ChartStub;

// --- @babel/register: transform ESM import/export in source files ---
require('@babel/register')({
  presets: [['@babel/preset-env', { targets: { node: 'current' }, modules: 'commonjs' }]],
  only: [new RegExp(path.join(__dirname, '..', 'app', 'scripts').replace(/\\/g, '\\\\'))],
  configFile: false,
});

// --- Source files (loaded as ES modules via babel-register) ---
const srcDir = path.join(__dirname, '../app/scripts');
global.Colors         = require(path.join(srcDir, 'Colors.js')).default;
global.ThemeSwitcher  = require(path.join(srcDir, 'ThemeSwitcher.js')).default;
global.Helper       = require(path.join(srcDir, 'Helper.js')).default;
global.Templates    = require(path.join(srcDir, 'Templates.js')).default;
global.GetData      = require(path.join(srcDir, 'GetData.js')).default;
global.Model        = require(path.join(srcDir, 'Model.js')).default;
global.Charts       = require(path.join(srcDir, 'charts/Charts.js')).default;
global.Burndown     = require(path.join(srcDir, 'charts/Burndown.js')).default;
global.Line         = require(path.join(srcDir, 'charts/Line.js')).default;
global.Lines        = require(path.join(srcDir, 'charts/Lines.js')).default;
global.Pie          = require(path.join(srcDir, 'charts/Pie.js')).default;
global.Satisfaction = require(path.join(srcDir, 'charts/Satisfaction.js')).default;
global.Status       = require(path.join(srcDir, 'charts/Status.js')).default;
global.Timelines    = require(path.join(srcDir, 'charts/Timelines.js')).default;
global.TwoBars      = require(path.join(srcDir, 'charts/TwoBars.js')).default;
global.Types        = require(path.join(srcDir, 'charts/Types.js')).default;
global.Scrum        = require(path.join(srcDir, 'Scrum.js')).default;

// --- Mock data ---
const dataCode = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
vm.runInThisContext(dataCode, { filename: 'data.js' });

// --- Mocha ---
const Mocha = require('mocha');
const mocha = new Mocha({ reporter: 'spec' });

const specFiles = [
  'spec/Colors.js',
  'spec/ThemeSwitcher.js',
  'spec/Templates.js',
  'spec/Helper.js',
  'spec/GetData.js',
  'spec/Model.js',
  'spec/charts/Charts.js',
  'spec/charts/Burndown.js',
  'spec/charts/Line.js',
  'spec/charts/Lines.js',
  'spec/charts/Pie.js',
  'spec/charts/Satisfaction.js',
  'spec/charts/Status.js',
  'spec/charts/Timelines.js',
  'spec/charts/TwoBars.js',
  'spec/charts/Types.js',
  'spec/Scrum.js',
];

for (const file of specFiles) {
  const fullPath = path.join(__dirname, file);
  const code     = fs.readFileSync(fullPath, 'utf8');
  mocha.suite.emit('pre-require', global, fullPath, mocha);
  vm.runInThisContext(code, { filename: file });
  mocha.suite.emit('require', null, fullPath, mocha);
  mocha.suite.emit('post-require', global, fullPath, mocha);
}

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
