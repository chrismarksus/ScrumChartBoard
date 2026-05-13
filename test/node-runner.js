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
global.window   = dom.window;
global.document = dom.window.document;
global.location = dom.window.location;

// --- jQuery 2.1 from bower (matches the browser runtime; has .complete() which the source uses) ---
dom.window.eval(
  fs.readFileSync(
    path.join(__dirname, '../bower_components/jquery/dist/jquery.js'), 'utf8'
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

// --- Chart.js stub (canvas charting library — not usable in jsdom) ---
global.Chart = function Chart(el, conf) {
  this.destroy = function() {};
};
global.Chart.register = function() {};

// --- markdown-it (pure-JS UMD build from bower) ---
global.markdownit = require(
  path.join(__dirname, '../bower_components/markdown-it/dist/markdown-it.js')
);

// --- Source files ---
const srcDir   = path.join(__dirname, '../app/scripts');
const srcFiles = [
  'Colors.js',
  'Helper.js',
  'GetData.js',
  'Model.js',
  'charts/Charts.js',
  'charts/Burndown.js',
  'charts/Line.js',
  'charts/Lines.js',
  'charts/Pie.js',
  'charts/Satisfaction.js',
  'charts/Status.js',
  'charts/Timelines.js',
  'charts/TwoBars.js',
  'charts/Types.js',
];

for (const file of srcFiles) {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
  vm.runInThisContext(code, { filename: file });
}

// --- Mock data ---
const dataCode = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
vm.runInThisContext(dataCode, { filename: 'data.js' });

// --- Mocha ---
const Mocha = require('mocha');
const mocha = new Mocha({ reporter: 'spec' });

const specFiles = [
  'spec/Colors.js',
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
