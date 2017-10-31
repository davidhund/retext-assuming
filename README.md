# retext-assuming

[![npm version](https://img.shields.io/npm/v/retext-assuming.svg)](https://npmjs.com/package/retext-assuming)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)
[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](https://raw.githubusercontent.com/davidhund/retext-assuming/master/LICENSE)

Check for unhelpful ‘assuming’ phrases such as 'just', 'simply' or 'obviously' with [**retext**][retext].

Using these phrases in documentation is unhelpful: “simple” is relative to a users’ knowledge and experience. Often it is fine to leave the phrase out completely:

Avoid:
> “Simply run the tests. Just type `npm test`…”

But use:

> “To run the tests type `npm test`…”


## Credits

This plugin is based on the excellent [**retext**][retext] (plugins) by [Wooorm](https://twitter.com/wooorm/).
Not much of this code is original and it probably could be much improved. PR's welcome 🚀


## Installation

Install through [npm][]:

```bash
npm install retext-assuming
```

## Usage

Say we have the following file, `example.txt`:

```text
You can just import an ES6 module.
Everything is simply Javascript.
Obviously you would need NodeJS > 8.
Actually, it's quite easy to use.
```

And our script, `example.js`, looks as follows:

```javascript
var vfile = require('to-vfile');
var report = require('vfile-reporter');
var retext = require('retext');
var dontAssume = require('retext-assuming');

retext()
  .use(dontAssume)
  .process(vfile.readSync('example.txt'), function (err, file) {
    console.error(report(err || file));
  });
```

Should result in:

```text
example.txt
   1:9-1:13  warning  Avoid “just”, it's not helpful       no-just       retext-assuming
  2:15-2:21  warning  Avoid “simply”, it's not helpful     no-simply     retext-assuming
   3:1-3:10  warning  Avoid “Obviously”, it's not helpful  no-obviously  retext-assuming
    4:1-4:9  warning  Avoid “Actually”, it's not helpful   no-actually   retext-assuming
  4:22-4:26  warning  Avoid “easy”, it's not helpful       no-easy       retext-assuming

⚠ 3 warnings
```

## API

### `retext().use(dontAssume[, options])`

Checks for unhelpful phrases such as “just”, “simply” or “obviously” in processed text.

**NOTE** `dontAssume` is the assigned name of our `require`d module. You can name it however you like.

###### `options.phrases`

`Array.<string>` — list of phrases to warn about (defaults to `phrases.json`)

###### `options.ignore`

`Array.<string>` — phrases _not_ to warn about.

###### `options.verbose`

`Boolean` — If `true` includes matches that are _probably fine_ (“You should **not** *simply* assume”)

## Related

*   [`retext-equality`](https://github.com/wooorm/retext-equality)
    — Check possible insensitive, inconsiderate language
*   [`retext-intensify`](https://github.com/wooorm/retext-intensify)
    — Check for weak and mitigating wording
*   [`retext-passive`](https://github.com/wooorm/retext-passive)
    — Check passive voice
*   [`retext-profanities`](https://github.com/wooorm/retext-profanities)
    — Check profane and vulgar wording

## License

[MIT][license] © [David Hund][author]

<!-- Definitions -->

[npm]: https://docs.npmjs.com/cli/install

[license]: LICENSE

[author]: https://valuedstandards.com

[retext]: https://github.com/wooorm/retext
