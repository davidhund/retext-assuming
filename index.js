'use strict';

/**
 * Assuming is a retext plugin:
 *
 * It checks text for unhelpful phrases such as
 * 'just', 'simply' or 'obviously'
 *
 * (Build largely by looking at retext-simplify)
 */

var search = require('nlcst-search');
var toString = require('nlcst-to-string');
var quotation = require('quotation');
var findBefore = require('unist-util-find-before');
var difference = require('lodash/difference');

var URL = 'https://github.com/davidhund/retext-assuming';
var MODULENAME = 'retext-assuming';
var PREFIX = 'Avoid';
var SUFFIX = 'it\'s not helpful';
var FINEPREFIX = 'PASS:';
var FINESUFFIX = 'is probably fine';
var NEGATIVES = ['never', 'not', 'can\'t', 'cannot', 'don\'t', 'couldn\'t', 'shouldn\'t', 'wouldn\'t'];
var QUALIFIERS = ['that', 'very', 'too', 'so', 'quite', 'rather'];

module.exports = dontAssume;

function dontAssume(options) {
	// Options
	var opts = options || {};
	var phrases = opts.phrases || require('./phrases.json');
	var ignore = opts.ignore || [];
	var verbose = opts.verbose || false;

	var list = difference(phrases, ignore);

	return transformer;

	function transformer(tree, file) {
		search(tree, list, handleMatch);

		function handleMatch(match, position, parent, phrase) {
			// Make sure we're not actually meaning the *opposite*
			//   "You [cannot|cant'|don't|etc..] simply assume..." => pass
			var before = findBefore(parent, position, 'WordNode');

			if (before) {
				var beforeMatch = toString(before).toLowerCase();

				if (NEGATIVES.indexOf(beforeMatch) !== -1) {
					if (verbose) {
						var info = file.info([
							FINEPREFIX,
							quotation(beforeMatch + ' ' + toString(match), '“', '”'),
							FINESUFFIX
						].join(' '), {
							start: before.position.start,
							end: before.position.end
						});

						info.ruleId = 'no-' + phrase.replace(/\W+/g, '-');
						info.source = MODULENAME;
						info.url = URL;
					}

					return;
				}

				// Make one more exception for qualifiers:
				//   "It's not [that|very|too|so|quite|rather] simple" => pass
				if (QUALIFIERS.indexOf(beforeMatch) !== -1) {
					var negativeBeforeQualifier = findBefore(parent, before, function (e) {
						// @TODO:
						// try (indexOf(NEGATIVES) !== -1)
						// instead of hardcoded 'not'?
						return toString(e).toLowerCase() === 'not';
					});

					if (negativeBeforeQualifier) {
						if (verbose) {
							var qualifierInfo = file.info([
								FINEPREFIX,
								quotation([
									toString(negativeBeforeQualifier),
									beforeMatch,
									toString(match)
								].join(' '), '“', '”'),
								FINESUFFIX
							].join(' '), {
								start: before.position.start,
								end: before.position.end
							});

							qualifierInfo.ruleId = 'no-' + phrase.replace(/\W+/g, '-');
							qualifierInfo.source = MODULENAME;
							qualifierInfo.url = URL;
						}

						return;
					}
				}
			}

			var value = toString(match);

			var message = file.message([
				PREFIX,
				quotation(value, '“', '”') + ',',
				SUFFIX
			].join(' '),
				{
					start: match[0].position.start,
					end: match[match.length - 1].position.end
				});

			message.ruleId = 'no-' + phrase.replace(/\W+/g, '-');
			message.source = MODULENAME;
			message.url = URL;
		}
	}
}
