# ja page initialization
```bash
export LC_ALL=C
cd ~/git/clickhouse-docs
yarn cache clean
yarn install
yarn copy-clickhouse-repo-docs
bash scripts/settings/autogenerate-settings.sh
cp -r docs/en docs/ja
find docs/ja -type f -exec sed -i '' 's|slug: /en/|slug: /ja/|g' {} \;
find docs/ja -type f -exec sed -i '' "s|slug: '/en/|slug: '/ja/|g" {} \;
find docs/ja -type f -exec sed -i '' "s|slug: \"/en/|slug: \"/ja/|g" {} \;
find docs/ja -type f -exec sed -i '' 's|(/docs/en/|(/docs/ja/|g' {} \;
find docs/ja -type f -exec sed -i '' 's|](/en/|](/ja/|g' {} \;
find docs/ja -type f -exec sed -i '' 's|@site/docs/|@site/docs/ja/|g' {} \;
find docs/ja -type f -exec sed -i '' 's|"/docs/en/|"/docs/ja/|g' {} \;
find docs/ja -type f -exec sed -i '' 's|clickhouse.com/docs/en|clickhouse.com/docs/ja|g' {} \;
sed -i '' '1 s/^---$/---\nslug: \/ja/' docs/ja/intro.md
yarn start
```

# docs_translation
```bash
cd ~/git/docs_translation
source venv/bin/activate
cp -r ~/git/clickhouse-docs/docs/ja ~/git/ja_bk
python3 translate.py ~/git/ja_bk ~/git/clickhouse-docs/docs/ja
# python3 translate.py ~/git/ja_bk ~/git/clickhouse-docs/docs/ja --model 'gpt-4o' # for Final Version
rm -f ~/git/clickhouse-docs/docs/ja_bk
```

# remove translated_ header
```bash
find . -type f -name 'translated_*' -exec bash -c 'mv "$0" "${0/translated_/}"' {} \;
```
