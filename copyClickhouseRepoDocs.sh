#! ./bin/bash
echo "Start Cloning"
git clone https://github.com/ClickHouse/ClickHouse.git
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
echo "Start Deleting ClickHouse"
rm -r ClickHouse
echo "Deleting ClickHouse folder completed"
echo "----END----"
