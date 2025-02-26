

```bash
# osx
find . -type f -exec sed -i '' 's|@site/docs|@site/i18n/ja/docusaurus-plugin-content-docs/current|g' {} +
# ubuntu
```