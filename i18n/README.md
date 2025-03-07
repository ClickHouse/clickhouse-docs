# Process to translate docs to a language

1. Build docs locally to ensure all files exist

```bash
yarn build
```

2. Run translator

Specify the config file, see [./languages/ja.json](./languages/ja.json).

```bash
python3 /opt/clickhouse-docs/scripts/translate/translate.py --input-folder /opt/clickhouse-docs/docs --output-folder /opt/clickhouse-docs/i18n/ja --config ./languages/ja.json
```

3. Replace imports

For example, for `jp`

```bash
# osx
LC_ALL=C.UTF-8 find . -type f -exec sed -i '' 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
LC_ALL=C.UTF-8 find . -type f -exec sed -i 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
```

Build and fix issues.

> Note: translation is incremental unless `--force_overwrite` is passed

For new translations:

4. Add the re-write to vercel.json e.g.

```json
{ "source": "/docs/jp/:path*", "destination": "/:path*" }
```

5. Deploy to Vercel as a dedicated project. Add to the [proxy project](https://github.com/ClickHouse/clickhouse-docs-proxy/).

This allows each language to be deployed independently.


## Known issues

- Deleted files currently not detected (we should track files translated and diff against list in output, cleaning up)
- translations can modify links in rare cases, causing issues.
- text splitting is not perfect for markdown
- Translation may introduce invalid spacing on imports
- JSON files not translated which control tables

# Possible improvements

- Don't split on tables `|`
