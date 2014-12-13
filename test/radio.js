'use strict';

var React = require('react');
var test = require('tape');
var vdom = require('react-vdom');
var t = require('../.');
var Context = require('../lib/protocols/api').Context;
var config = require('../lib/config');
var getReport = require('../lib/util/getReport');
var Radio = require('../lib/protocols/theme').Radio;
var radio = require('../lib/factories').radio;

//
// helpers
//

function getContext(ctx) {

  ctx = t.util.mixin({
    templates: config.templates,
    i18n: config.i18n,
    report: getReport(ctx.type),
    path: ['leaf'],
    auto: 'placeholders',
    label: 'default label'
  }, ctx, true);

  return new Context(ctx);
}

function assertLocals(factory, ctx, opts) {
  var Component = factory(opts, getContext(ctx));
  vdom(React.createElement(Component)); // force render()
}

//
// node tests
//

var Country = t.enums({
  IT: 'Italy',
  US: 'United States',
  FR: 'France'
}, 'Country');

test('radio() factory', function (tape) {

  tape.test('disabled', function (tape) {
    tape.plan(3);

    assertLocals(radio, {type: Country}, {template: function (locals) {
      tape.ok(locals instanceof Radio);
      tape.deepEqual(locals.disabled, null);
    }});

    assertLocals(radio, {type: Country}, {disabled: true, template: function (locals) {
      tape.deepEqual(locals.disabled, true);
    }});
  });

  tape.test('label', function (tape) {
    tape.plan(4);

    // labels as strings
    assertLocals(radio, {type: Country}, {label: 'mylabel', template: function (locals) {
      tape.deepEqual(locals.label, 'mylabel');
    }});

    // labels as JSX
    assertLocals(radio, {type: Country}, {label: React.DOM.i(null, 'JSX label'), template: function (locals) {
      tape.deepEqual(vdom(locals.label), {tag: 'i', attrs: {}, children: 'JSX label'});
    }});

    // should have a default label if ctx.auto = `labels`
    assertLocals(radio, {type: Country, auto: 'labels'}, {template: function (locals) {
      tape.deepEqual(locals.label, 'default label');
    }});

    // should handle optional
    assertLocals(radio, {type: t.maybe(Country), auto: 'labels'}, {template: function (locals) {
      tape.deepEqual(locals.label, 'default label (optional)');
    }});
  });

  tape.test('help', function (tape) {
    tape.plan(2);

    // helps as strings
    assertLocals(radio, {type: Country}, {help: 'my help', template: function (locals) {
      tape.deepEqual(locals.help, 'my help');
    }});

    // helps as JSX
    assertLocals(radio, {type: Country}, {help: React.DOM.i(null, 'JSX help'), template: function (locals) {
      tape.deepEqual(vdom(locals.help), {tag: 'i', attrs: {}, children: 'JSX help'});
    }});
  });

  tape.test('name', function (tape) {
    tape.plan(2);

    // should have a default name
    assertLocals(radio, {type: Country}, {template: function (locals) {
      tape.deepEqual(locals.name, 'leaf');
    }});

    // should handle a custom name
    assertLocals(radio, {type: Country}, {name: 'myname', template: function (locals) {
      tape.deepEqual(locals.name, 'myname');
    }});
  });

  tape.test('options', function (tape) {
    tape.plan(2);

    // should have default options
    assertLocals(radio, {type: t.maybe(Country)}, {template: function (locals) {
      tape.deepEqual(locals.options, [
        {value: 'IT', text: 'Italy', disabled: null},
        {value: 'US', text: 'United States', disabled: null},
        {value: 'FR', text: 'France', disabled: null}
      ]);
    }});

    // should handle custom options
    assertLocals(radio, {type: Country}, {options: [
        {value: 'IT', text: 'Italia'},
        {value: 'US', text: 'Stati Uniti'}
      ], template: function (locals) {
      tape.deepEqual(locals.options, [
        {value: 'IT', text: 'Italia', disabled: null},
        {value: 'US', text: 'Stati Uniti', disabled: null}
      ]);
    }});
  });

  tape.test('order', function (tape) {
    tape.plan(2);

    // should order the options asc
    assertLocals(radio, {type: Country}, {order: 'asc', template: function (locals) {
      tape.deepEqual(locals.options, [
        {value: 'FR', text: 'France', disabled: null},
        {value: 'IT', text: 'Italy', disabled: null},
        {value: 'US', text: 'United States', disabled: null}
      ]);
    }});

    // should order the options desc
    assertLocals(radio, {type: Country}, {order: 'desc', template: function (locals) {
      tape.deepEqual(locals.options, [
        {value: 'US', text: 'United States', disabled: null},
        {value: 'IT', text: 'Italy', disabled: null},
        {value: 'FR', text: 'France', disabled: null}
      ]);
    }});

  });

  tape.test('value', function (tape) {
    tape.plan(2);

    // should receive a value from the context
    assertLocals(radio, {type: Country, value: 'IT'}, {template: function (locals) {
      tape.deepEqual(locals.value, 'IT');
    }});

    // a value specified in opts should override the context one
    assertLocals(radio, {type: Country, value: 'IT'}, {value: 'US', template: function (locals) {
      tape.deepEqual(locals.value, 'US');
    }});
  });

  tape.test('hasError', function (tape) {
    tape.plan(2);

    assertLocals(radio, {type: Country}, {template: function (locals) {
      tape.deepEqual(locals.hasError, false);
    }});
    assertLocals(radio, {type: Country}, {hasError: true, template: function (locals) {
      tape.deepEqual(locals.hasError, true);
    }});

  });

  tape.test('error', function (tape) {
    tape.plan(10);

    assertLocals(radio, {type: Country}, {template: function (locals) {
      tape.deepEqual(locals.hasError, false);
      tape.deepEqual(locals.error, null);
    }});

    assertLocals(radio, {type: Country}, {error: 'my error', template: function (locals) {
      tape.deepEqual(locals.hasError, false);
      tape.deepEqual(locals.error, null);
    }});

    // error as a string
    assertLocals(radio, {type: Country}, {error: 'my error', hasError: true, template: function (locals) {
      tape.deepEqual(locals.hasError, true);
      tape.deepEqual(locals.error, 'my error');
    }});

    // error as a JSX
    assertLocals(radio, {type: Country}, {error: React.DOM.i(null, 'JSX error'), hasError: true, template: function (locals) {
      tape.deepEqual(locals.hasError, true);
      tape.deepEqual(vdom(locals.error), {tag: 'i', attrs: {}, children: 'JSX error'});
    }});

    // error as a function
    var getError = function (value) {
      return 'error: ' + value;
    };
    assertLocals(radio, {type: Country}, {error: getError, hasError: true, value: 'IT', template: function (locals) {
      tape.deepEqual(locals.hasError, true);
      tape.deepEqual(locals.error, 'error: IT');
    }});

  });

  tape.test('template', function (tape) {
    tape.plan(1);

    // should receive a default template form the context
    assertLocals(radio, {type: Country, templates: {radio: function (locals) {
      tape.ok(true);
    }}});

  });

});