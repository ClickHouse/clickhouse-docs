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

For example, for `jp`

```bash
# osx
LC_ALL=C.UTF-8 find . -type f -exec sed -i '' 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
LC_ALL=C.UTF-8 find . -type f -exec sed -i 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
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

## Known issues

- translations can modify links in rare cases, causing issues.
- text splitting is not perfect for markdown
- Translation may introduce invalid spacing on imports
- JSON files not translated which control tables

# Possible improvements

- Don't split on tables `|`
