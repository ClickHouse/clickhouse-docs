# Process to translate japanese

1. Run translator

```bash
python3 /opt/clickhouse-docs/scripts/translate/translate.py --input-folder /opt/clickhouse-docs/docs --output-folder /opt/clickhouse-docs/i18n/ja --config ./languages/ja.json
```

On completion, replace imports:


```bash
# osx
find . -type f -exec sed -i '' 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
find . -type f -exec sed -i 's|@site/docs|@site/i18n/jp/docusaurus-plugin-content-docs/current|g' {} +
```

Build and fix issues.

> Note: translation is incremental unless `--force_overwrite` is passed

## Known issues

- Deleted files currently not detected (we should track files translated and diff against list in output, cleaning up)
- translations can modify links in rare cases, causing issues.
- text splitting is not perfect for markdown
- Translation may introduce invalid spacing on imports
- JSON files not translated which control tables

# Possible improvements

- Don't split on tables `|`
