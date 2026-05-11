#!/usr/bin/env node
'use strict';

// Set up globals that would normally come from the browser environment
const vm = require('vm');
const fs = require('fs');
const path = require('path');

// Set up chai globals
const chai = require('chai');
global.assert = chai.assert;
global.expect = chai.expect;
global.should = chai.should();

// Set up sinon
const sinon = require('sinon');
global.sinon = sinon;

// Minimal jQuery stub for GetData (only path tests run, not $.getJSON)
global.$ = {
  when: () => ({ done: () => {} }),
  getJSON: () => ({})
};

// Minimal window stub
global.window = { location: { search: '' } };

// Load source files into global scope
const srcDir = path.join(__dirname, '../app/scripts');
const srcFiles = [
  'Colors.js',
  'Helper.js',
  'GetData.js',
  'Model.js',
];

for (const file of srcFiles) {
  const code = fs.readFileSync(path.join(srcDir, file), 'utf8');
  vm.runInThisContext(code, { filename: file });
}

// Load mock data
const dataCode = fs.readFileSync(path.join(__dirname, 'data.js'), 'utf8');
vm.runInThisContext(dataCode, { filename: 'data.js' });

// Now run mocha programmatically
const Mocha = require('mocha');
const mocha = new Mocha({ reporter: 'spec' });

// Add spec files (skip Scrum.js and chart specs that require full browser/DOM)
const specFiles = [
  'spec/Colors.js',
  'spec/Helper.js',
  'spec/GetData.js',
  'spec/Model.js',
];

for (const file of specFiles) {
  const fullPath = path.join(__dirname, file);
  const code = fs.readFileSync(fullPath, 'utf8');
  // Wrap in a module that exposes describe/it/beforeEach/afterEach
  const wrappedCode = `
    const { describe, it, beforeEach, afterEach } = mocha;
    ${code}
  `;
  // Use addFile with a root suite trick: evaluate the IIFE with mocha context
  mocha.suite.emit('pre-require', global, fullPath, mocha);
  vm.runInThisContext(code, { filename: file });
  mocha.suite.emit('require', null, fullPath, mocha);
  mocha.suite.emit('post-require', global, fullPath, mocha);
}

mocha.run((failures) => {
  process.exitCode = failures ? 1 : 0;
});
