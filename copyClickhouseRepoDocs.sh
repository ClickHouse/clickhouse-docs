#! ./bin/bash
echo "Start Cloning"
git clone --depth 1 https://github.com/ClickHouse/ClickHouse.git
echo "Cloning completed"
echo "Start Copying"
cp -r ClickHouse/docs/en/development     docs/en/
cp -r ClickHouse/docs/en/engines         docs/en/
cp -r ClickHouse/docs/en/getting-started docs/en/
cp -r ClickHouse/docs/en/interfaces      docs/en/
cp -r ClickHouse/docs/en/operations      docs/en/
cp -r ClickHouse/docs/en/sql-reference   docs/en/
cp -r ClickHouse/docs/ru                 docs/
cp -r ClickHouse/docs/zh                 docs/
echo "Copying completed"

echo "----Generate Changelog----"
cp docs/en/_placeholders/changelog/_index.md docs/en/whats-new/changelog/index.md
sed "0,/^# 2023 Changelog/d" \
    < ClickHouse/CHANGELOG.md \
    >> docs/en/whats-new/changelog/index.md
echo "Start Deleting ClickHouse"
rm -r ClickHouse
echo "Deleting ClickHouse folder completed"
echo "----END----"
