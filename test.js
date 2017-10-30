'use strict';

var test = require('tape');
var retext = require('retext');
var assuming = require('./');

test('Catch all assumptions:', t => {
	t.plan(2);

	retext()
		.use(assuming)
		.process([
			'Just install this tool',
			'Retext-assuming is a simple tool for better documentation',
			'Simply test retext-assuming',
			'Just run it over your text',
			'It\'s easy',
			'You can easily use it',
			'Really trivial, really',
			'Obviously this is a test',
			'It only takes 2 brain cells to understand',
			'Well, actually'
		].join('\n'), function (err, file) {
			t.ifError(err, 'retext processing should not fail (#1)');

			t.deepEqual(
				file.messages.map(String),
				[
					'1:1-1:5: Avoid “Just”, it\'s not helpful',
					'2:22-2:28: Avoid “simple”, it\'s not helpful',
					'3:1-3:7: Avoid “Simply”, it\'s not helpful',
					'4:1-4:5: Avoid “Just”, it\'s not helpful',
					'5:6-5:10: Avoid “easy”, it\'s not helpful',
					'6:9-6:15: Avoid “easily”, it\'s not helpful',
					'7:8-7:15: Avoid “trivial”, it\'s not helpful',
					'8:1-8:10: Avoid “Obviously”, it\'s not helpful',
					'9:4-9:14: Avoid “only takes”, it\'s not helpful',
					'10:7-10:15: Avoid “actually”, it\'s not helpful'
				],
				'should warn about avoiding assumptions'
			);
		});
});

test('Pass inverted assumptions:', t => {
	t.plan(2);

	retext()
		.use(assuming, {verbose: true})
		.process([
			'Don\'t simply assume',
			'It\'s not that simple',
			'It\'s never that simple',
			'One cannot just assume'
		].join('\n'), function (err, file) {
			t.ifError(err, 'retext processing should not fail (#2)');

			t.deepEqual(
				file.messages.map(String),
				[
					'1:1-1:6: PASS: “don\'t simply” is probably fine',
					'2:10-2:14: PASS: “not that simple” is probably fine',
					'3:12-3:16: PASS: “not that simple” is probably fine',
					'4:5-4:11: PASS: “cannot just” is probably fine'
				],
				'should pass inverted assumptions'
			);
		});
});

test('Include phrase: just', t => {
	t.plan(2);

	retext()
		.use(assuming, {phrases: ['just']})
		.process([
			'Just install this tool',
			'Retext-assuming is a simple tool for better documentation'
		].join('\n'), function (err, file) {
			t.ifError(err, 'retext processing should not fail (#3)');

			t.deepEqual(
				file.messages.map(String),
				[
					'1:1-1:5: Avoid “Just”, it\'s not helpful'
				],
				'should only include ‘just’'
			);
		});
});

test('Exclude phrases: simple', t => {
	t.plan(2);

	retext()
		.use(assuming, {ignore: ['simple']})
		.process([
			'Just install this tool',
			'Retext-assuming is a simple tool for better documentation'
		].join('\n'), function (err, file) {
			t.ifError(err, 'retext processing should not fail (#4)');

			t.deepEqual(
				file.messages.map(String),
				[
					'1:1-1:5: Avoid “Just”, it\'s not helpful'
				],
				'should exclude ‘simple’'
			);
		});
});
