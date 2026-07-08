/**
 * Assuming is a retext plugin:
 *
 * It checks text for unhelpful phrases such as
 * 'just', 'simply' or 'obviously'
 *
 * (Build largely by looking at retext-simplify)
 */

import difference from "lodash.difference";
import { search } from "nlcst-search";
import { toString as nlcstToString } from "nlcst-to-string";
import { quotation } from "quotation";
import { findBefore } from "unist-util-find-before";
import defaultPhrases from "./phrases.json" with { type: "json" };

const URL = "https://github.com/davidhund/retext-assuming";
const MODULENAME = "retext-assuming";
const PREFIX = "Avoid";
const SUFFIX = "it's not helpful";
const FINEPREFIX = "PASS:";
const FINESUFFIX = "is probably fine";
const NEGATIVES = [
	"never",
	"not",
	"can't",
	"cannot",
	"don't",
	"couldn't",
	"shouldn't",
	"wouldn't",
];
const QUALIFIERS = ["that", "very", "too", "so", "quite", "rather"];

export default function dontAssume(options) {
	// Options
	const opts = options || {};
	const phrases = opts.phrases || defaultPhrases;
	const ignore = opts.ignore || [];
	const verbose = opts.verbose || false;

	const list = difference(phrases, ignore);

	return transformer;

	function transformer(tree, file) {
		search(tree, list, handleMatch);

		function handleMatch(match, position, parent, phrase) {
			// Make sure we're not actually meaning the *opposite*
			//   "You [cannot|cant'|don't|etc..] simply assume..." => pass
			const before = findBefore(parent, position, "WordNode");

			if (before) {
				const beforeMatch = nlcstToString(before).toLowerCase();

				if (NEGATIVES.indexOf(beforeMatch) !== -1) {
					if (verbose) {
						const info = file.info(
							[
								FINEPREFIX,
								quotation(`${beforeMatch} ${nlcstToString(match)}`, "“", "”"),
								FINESUFFIX,
							].join(" "),
							{
								start: before.position.start,
								end: before.position.end,
							},
						);

						info.ruleId = `no-${phrase.replace(/\W+/g, "-")}`;
						info.source = MODULENAME;
						info.url = URL;
					}

					return;
				}

				// Make one more exception for qualifiers:
				//   "It's not [that|very|too|so|quite|rather] simple" => pass
				if (QUALIFIERS.indexOf(beforeMatch) !== -1) {
					const negativeBeforeQualifier = findBefore(parent, before, (e) => {
						// @TODO:
						// try (indexOf(NEGATIVES) !== -1)
						// instead of hardcoded 'not'?
						return nlcstToString(e).toLowerCase() === "not";
					});

					if (negativeBeforeQualifier) {
						if (verbose) {
							const qualifierInfo = file.info(
								[
									FINEPREFIX,
									quotation(
										[
											nlcstToString(negativeBeforeQualifier),
											beforeMatch,
											nlcstToString(match),
										].join(" "),
										"“",
										"”",
									),
									FINESUFFIX,
								].join(" "),
								{
									start: before.position.start,
									end: before.position.end,
								},
							);

							qualifierInfo.ruleId = `no-${phrase.replace(/\W+/g, "-")}`;
							qualifierInfo.source = MODULENAME;
							qualifierInfo.url = URL;
						}

						return;
					}
				}
			}

			const value = nlcstToString(match);

			const message = file.message(
				[PREFIX, `${quotation(value, "“", "”")},`, SUFFIX].join(" "),
				{
					start: match[0].position.start,
					end: match[match.length - 1].position.end,
				},
			);

			message.ruleId = `no-${phrase.replace(/\W+/g, "-")}`;
			message.source = MODULENAME;
			message.url = URL;
		}
	}
}
