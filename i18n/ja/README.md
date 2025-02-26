

# Process to translate japanese

1. Run translator

```bash

python3 /opt/clickhouse-docs/scripts/translate/translate.py --input-folder /opt/clickhouse-docs/docs --output-folder /opt/clickhouse-docs/i18n/ja --config ./languages/ja.json

``` 

On completion replace imports:


```bash
# osx
find . -type f -exec sed -i '' 's|@site/i18n/ja/docusaurus-plugin-content-docs/current|@site/i18n/ja/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
find . -type f -exec sed -i 's|@site/docs|@site/i18n/ja/docusaurus-plugin-content-docs/current|g' {} +
```


Build and fix issues.

## Known issues

- translations can modify links in rare cases, causing issues.
- text splitting is not perfect for markdown
- Translation may introduce invalid spacing on imports


# Possible improvements

- Split on `##` then `###` then `####` - until manageable chunk. Still too big use illma-index splitter.
- Don't split on tables `|`
