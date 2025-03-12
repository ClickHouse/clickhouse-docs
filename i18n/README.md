# Process to translate docs to a language

## Updating a language

1. Build docs locally to ensure all files exist

```bash
yarn build
```

2. Run translator

Specify the config file, see [./languages/jp.json](./languages/jp.json).

```bash
python3 /opt/clickhouse-docs/scripts/translate/translate.py --input-folder /opt/clickhouse-docs/docs --output-folder /opt/clickhouse-docs/i18n/jp --config ./languages/jp.json
```

3. Replace imports

For example, for `jp`.

```bash
# osx
LC_ALL=C.UTF-8 find ./i18n/jp -type f -exec sed -i '' 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
LC_ALL=C.UTF-8 find ./i18n/jp -type f -exec sed -i 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
```

4. Build

Build and fix issues. Not all issues are detected with a `yarn start` so build! i.e.:

```bash
DOCUSUARUS_LOCALE=jp yarn build
```

### Re-translating files

Changed files will automatically be re-translated if the source has changed (detected through `.hash` with the translation of the source). Removed files in the source will also be removed in the target translation.

To force re-translation just delete the target translated file.


## New language

1. Create translations

```bash
yarn docusaurus write-translations --locale jp
```

2. Build docs locally to ensure all files exist

```bash
yarn build
```

3. Run translator

Specify the config file, see [./languages/jp.json](./languages/jp.json).

```bash
python3 /opt/clickhouse-docs/scripts/translate/translate.py --input-folder /opt/clickhouse-docs/docs --output-folder /opt/clickhouse-docs/i18n/jp --config ./languages/jp.json
```

4. Replace imports

For example, for `jp`

```bash
# osx
LC_ALL=C.UTF-8 find . -type f -exec sed -i '' 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
LC_ALL=C.UTF-8 find . -type f -exec sed -i 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
```

5. Build

Build and fix issues. Not all issues are detected with a `yarn start` so build! i.e.:

```bash
DOCUSUARUS_LOCALE=jp yarn build
```

6. Create configs

Create docusauraus config file

```bash
cp docusaurus.config.js docusaurus.config.jp.js
```

Update the `i18n` in this config file to include the translation e.g.

```
  i18n: {
    defaultLocale: "jp",
    locales: ["jp", "en"],
    path: "i18n",
    localeConfigs: {
      jp: {
        htmlLang: "jp",
        path: "jp",
      },
      en: {
        htmlLang: "en",
        path: "en",
      },
    },
  },
```

Update any english phrases to your target language.

7. Build

Build and fix issues. Not all issues are detected with a `yarn start` so build! i.e.:

```bash
DOCUSUARUS_LOCALE=jp yarn build
```

> Note: translation is incremental unless `--force_overwrite` is passed

7. Add the re-write to vercel.json e.g.

```json
{ "source": "/docs/jp/:path*", "destination": "/:path*" }
```

8. Deploy to Vercel as a dedicated project. Add to the [proxy project](https://github.com/ClickHouse/clickhouse-docs-proxy/).

This allows each language to be deployed independently.

Ensure you only build if the languages folder or the docusaurus config file 
changes e.g.

```text
git diff HEAD^ HEAD --quiet -- ./i18n/jp && git diff HEAD^ HEAD --quiet -- docusaurus.config.jp.js && exit 0 || exit 1
```

Example [here](https://vercel.com/clickhouse/clickhouse-docs-jp/settings/git).

**Note:** Only your last commit is checked, so if you make commits which don't 
touch those folders, you'll need to make a change in the appropriate i18n folder
or the config file for translations to be deployed.

There is a `README.md` file in each `i18n/locale` folder for this purpose. 
Simply change the date in that file and commit the changes to get the translations
to redeploy on vercel.

9. Add the route to the website worker - [example PR](https://github.com/ClickHouse/clickhouse-website-worker/pull/285/files)

## Known issues

- translations can modify links in rare cases, causing issues.
- text splitting is not perfect for markdown - sometime it can't split due to large sections e.g. code blocks and errors. All threads will terminate - user must fix source.
- Translation may introduce invalid spacing on imports
- JSON files not translated which control tables

# Possible improvements

- Don't split on tables `|`
- Custom code to metadata block (all pages need metadata so we can enforce)
- Introduce <!-- translate split--> we can use to identify split
- Specify translate overrides + don't translate
- Dont translate titles on certain pages - formats and functions.
- Linter to check for unclosed ```. Lint checks on translations
